const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { currentContext } = require('./regression.cjs');
const root = path.resolve(__dirname, '..');
const hash = body => crypto.createHash('sha256').update(body).digest('hex');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/offline-assets.json'), 'utf8'));
function walk(directory) {
    return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]);
}
const physical = new Set([...walk('images'), ...walk('sounds')]);
const context = currentContext();
const basic = vm.runInContext('Object.entries(ITEMS_DATABASE).flatMap(([categoryId, items]) => items.map(item => getBasicImagePath({ ...item, categoryId })))', context);
for (const url of basic) assert.ok(physical.has(url), `Case-sensitive basic image path: ${url}`);
assert.equal(context.getBasicImagePath({ customImgPath: 'images/01 subject/1.png' }), 'images/01 subject/1.webp');
assert.equal(context.getBasicImagePath({ customImgPath: 'data:image/png;base64,abcd' }), 'data:image/png;base64,abcd');
for (const entry of catalog.assets) {
    assert.ok(physical.has(entry.url), `Case-sensitive catalog path: ${entry.url}`);
    const body = fs.readFileSync(path.join(root, entry.url));
    assert.equal(body.length, entry.bytes);
    assert.equal(hash(body), entry.revision);
    if (entry.url.endsWith('.webp')) assert.equal(body.subarray(8, 12).toString(), 'WEBP');
    if (entry.url.endsWith('.m4a')) assert.equal(body.subarray(4, 8).toString(), 'ftyp');
}
assert.equal(catalog.totalBytes, catalog.assets.reduce((sum, entry) => sum + entry.bytes, 0));
assert.equal(catalog.assets.length, [...physical].filter(url => /\.(webp|png|m4a)$/.test(url)).length);
const release = vm.createContext({ self: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'assets/pwa-release.js'), 'utf8'), release);
for (const file of release.self.SENB_RELEASE.shell) {
    assert.ok(fs.existsSync(path.join(root, file)), file);
    assert.equal(release.self.SENB_RELEASE.integrity[file], `sha256-${crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('base64')}`, `Rebuild PWA after changing ${file}`);
}
assert.ok(!release.self.SENB_RELEASE.shell.some(url => url.endsWith('.m4a')), 'Installation must not bulk-download sounds');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
assert.equal(manifest.scope, './'); assert.equal(manifest.display, 'standalone');
for (const icon of manifest.icons) assert.ok(fs.existsSync(path.join(root, icon.src)));

class MemoryCache {
    constructor() { this.entries = new Map(); }
    async keys() { return [...this.entries.keys()].map(url => new Request(url)); }
    async match(key) { return this.entries.get(String(key))?.clone(); }
    async put(key, response) { this.entries.set(String(key), response.clone()); }
}
const stores = new Map();
let requests = 0, corrupt = false;
const base = 'https://example.com/tools/senb/';
const fixtures = Array.from({ length: 6 }, (_, index) => Buffer.from(`recording-${index}`));
const sample = { assets: fixtures.map((body, index) => ({ url: `sounds/test/${index}.m4a`, bytes: body.length, revision: hash(body) })), totalBytes: fixtures.reduce((sum, body) => sum + body.length, 0) };
Object.assign(context, {
    URL, Request, Response, Headers, DOMException, AbortController, crypto: crypto.webcrypto,
    caches: { async open(name) { if (!stores.has(name)) stores.set(name, new MemoryCache()); return stores.get(name); } },
    async fetch(url, options) {
        requests++;
        const index = Number(new URL(url).pathname.split('/').at(-1).split('.')[0]);
        return new Response(corrupt ? 'HTML error page' : fixtures[index], { headers: { 'Content-Type': 'audio/mp4' } });
    }
});
vm.runInContext(fs.readFileSync(path.join(root, 'assets/offline-store.js'), 'utf8'), context);
const offline = context.SENBOffline;
(async () => {
    assert.equal(offline.download, undefined, 'The bulk-download API is removed');
    assert.equal(offline.inspect, undefined, 'Download progress inspection is removed');
    const media = await context.caches.open(offline.names(base).media);
    const entry = sample.assets[0];
    await offline.fetchAndStore(entry, media, base);
    assert.equal(requests, 1, 'On-demand caching requests only the displayed media');
    assert.equal((await media.keys()).length, 1);
    assert.equal(await (await media.match(offline.key(entry, base))).text(), fixtures[0].toString());
    const updated = { ...entry, revision: 'changed' };
    assert.equal(await media.match(offline.key(updated, base)), undefined, 'Changed revisions cannot reuse stale media');
    corrupt = true;
    await assert.rejects(offline.fetchAndStore(sample.assets[1], media, base), /File changed/);
    assert.equal((await media.keys()).length, 1, 'HTML/error responses must never enter the media cache');
    const complete = () => new Response('0123456789', { headers: { 'Content-Type': 'audio/mp4' } });
    for (const [range, expected, status] of [['bytes=0-3', '0123', 206], ['bytes=7-', '789', 206], ['bytes=-2', '89', 206], ['bytes=8-50', '89', 206], ['bytes=20-', '', 416], ['bytes=3-1', '', 416], ['bytes=-0', '', 416], ['bytes=0-2,5-6', '', 416]]) {
        const response = await offline.rangeResponse(new Request(base + 'test.m4a', { headers: { Range: range } }), complete());
        assert.equal(response.status, status, range); assert.equal(await response.text(), expected, range);
    }
    console.log(`PASS: ${basic.length} basic image paths and ${catalog.assets.length} converted files match case-sensitive folders and SHA-256 revisions; installation scope/icons, on-demand caching, changed-file detection, corrupt-response rejection, and audio byte ranges.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
