const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.SENB_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const prefix = '/tools/senb/';
const overrides = new Map(), requests = [];
let originPort;
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.m4a': 'audio/mp4', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/outside.html') { res.end('<html><body>Another app</body></html>'); return; }
    const relative = pathname.slice(prefix.length) || 'index.html';
    const file = path.resolve(root, relative);
    if (!pathname.startsWith(prefix) || !file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    requests.push({ relative });
    const override = overrides.get(relative);
    const body = override?.body || fs.readFileSync(file);
    const headers = { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
    if (override?.status) { res.writeHead(override.status, headers); res.end(body); return; }
    const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
        const start = Number(range[1]), end = Math.min(range[2] ? Number(range[2]) : body.length - 1, body.length - 1);
        if (start > end) { res.writeHead(416); res.end(); return; }
        res.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${body.length}` });
        res.end(body.subarray(start, end + 1));
    } else { res.writeHead(200, { ...headers, 'Content-Length': body.length }); res.end(body); }
});
const originalCatalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/offline-assets.json'), 'utf8'));
const releaseVM = vm.createContext({ self: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'assets/pwa-release.js'), 'utf8'), releaseVM);
const originalRelease = JSON.parse(JSON.stringify(releaseVM.self.SENB_RELEASE));
const sha = body => crypto.createHash('sha256').update(body).digest('hex');
async function setOffline(context, name, offline) {
    // Playwright WebKit's offline flag rejects SW responses (upstream #42775).
    // Stop the real origin in both engines; Chromium also uses its offline flag.
    if (name === 'chromium') await context.setOffline(offline);
    if (offline && server.listening) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    else if (!offline && !server.listening) await new Promise(resolve => server.listen(originPort, '127.0.0.1', resolve));
}
function releaseOverride(version) {
    const release = { ...originalRelease, version, integrity: {} };
    for (const file of release.shell) release.integrity[file] = `sha256-${crypto.createHash('sha256').update(overrides.get(file)?.body || fs.readFileSync(path.join(root, file))).digest('base64')}`;
    overrides.set('assets/pwa-release.js', { body: Buffer.from(`self.SENB_RELEASE = ${JSON.stringify(release)};`) });
}
async function waitReady(page) {
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 30000 });
}
async function savedCount(page) {
    return page.evaluate(async () => {
        const prefix = `senb:${encodeURIComponent(new URL('./', document.baseURI).pathname)}:`;
        const media = await caches.open(`${prefix}media:v1`);
        return (await media.keys()).length;
    });
}
async function run(browserType, name) {
    overrides.clear(); requests.length = 0;
    const options = { headless: true };
    const chrome = process.env.SENB_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (name === 'chromium' && fs.existsSync(chrome)) options.executablePath = chrome;
    const browser = await browserType.launch(options);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, serviceWorkers: 'allow' });
    try {
        await context.route('https://**', route => route.abort());
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => {
            // WebKit reports Response.error() as a page error when we deliberately
            // request an uncached URL with the origin stopped.
            // These expected network failures are separately asserted below.
            if (name === 'webkit' && error.message === 'Response served by service worker is an error') return;
            errors.push(error.message);
        });
        const url = `http://127.0.0.1:${server.address().port}${prefix}index.html`;
        await page.goto(url, { waitUntil: 'load' });
        await waitReady(page);
        assert.ok((await savedCount(page)) < 5, 'Startup must not download the media library');
        assert.equal(requests.filter(request => request.relative.endsWith('.m4a')).length, 0);
        await page.evaluate(async () => { const cache = await caches.open('another-app-cache'); await cache.put('/outside-data', new Response('preserve')); });
        assert.equal(await page.locator('.app-header #pwaInstallBtn svg').count(), 1);
        assert.equal(await page.locator('#pwaDownloadToggle, #offlinePanel, #offlineBadge').count(), 0);
        assert.equal(await page.evaluate(() => typeof SENBOffline), 'undefined', 'The page has no media-download API');
        await page.locator('#homeTasksBtn').click();
        await page.locator('[data-folder="5"]').click();
        await page.locator('[data-subgroup="8"]').click();
        await page.locator('#startActivityBtn').click();
        await page.locator('#activityAdvancedCard').tap();
        await page.waitForFunction(() => playbackAudio.currentTime > 0, null, { timeout: 15000 });
        assert.equal(await page.evaluate(() => playbackAudio.error), null);
        await page.locator('#activityHomeBtn').click();
        // A viewed sentence is cached on demand; no manual library download.
        await page.waitForFunction(async () => {
            const prefix = `senb:${encodeURIComponent(new URL('./', document.baseURI).pathname)}:`;
            const cache = await caches.open(`${prefix}media:v1`);
            return (await cache.keys()).some(request => request.url.includes('sounds/advanced/5/8/1.m4a'));
        });
        const cachedCount = await savedCount(page);
        assert.ok(cachedCount > 0 && cachedCount < 30, 'Viewing one sentence must not fetch the full library');
        await page.reload({ waitUntil: 'load' });
        await waitReady(page);
        assert.equal(await savedCount(page), cachedCount, 'Viewed media survives reload');
        await setOffline(context, name, true);
        if (process.env.SENB_PWA_DEBUG) console.log(name, 'offline navigation diagnostic', await page.evaluate(async () => {
            const names = await caches.keys();
            const response = await fetch('index.html');
            return { controller: navigator.serviceWorker.controller?.state, names, status: response.status, bytes: (await response.text()).length, scope: (await navigator.serviceWorker.getRegistration()).scope };
        }));
        await page.reload({ waitUntil: 'load' });
        await waitReady(page);
        assert.equal(await page.evaluate(async () => { try { await fetch('/uncached-network-probe'); return true; } catch { return false; } }), false, 'The network must actually be unavailable');
        await page.locator('#homeTasksBtn').click();
        await page.locator('[data-folder="5"]').click();
        await page.locator('[data-subgroup="8"]').click();
        await page.locator('#startActivityBtn').click();
        await page.locator('#activityAdvancedCard').tap();
        await page.waitForFunction(() => playbackAudio.currentTime > 0, null, { timeout: 15000 });
        assert.equal(await page.evaluate(() => playbackAudio.error), null, 'Real cached M4A must decode offline');
        const ranges = await page.evaluate(async () => {
            const values = [];
            for (const range of ['bytes=0-99', 'bytes=-12', 'bytes=99999999-']) {
                const response = await fetch('sounds/advanced/5/8/1.m4a', { headers: { Range: range } });
                values.push({ status: response.status, bytes: (await response.arrayBuffer()).byteLength, contentRange: response.headers.get('Content-Range') });
            }
            return values;
        });
        assert.deepEqual(ranges.map(result => [result.status, result.bytes]), [[206, 100], [206, 12], [416, 0]]);
        await page.locator('#activityHomeBtn').click();
        await setOffline(context, name, false);
        // Simulate an atomic deployment in memory, without changing project files.
        const updated = JSON.parse(JSON.stringify(originalCatalog));
        const changed = updated.assets.find(entry => entry.url === 'sounds/advanced/5/8/1.m4a');
        const changedBody = Buffer.concat([fs.readFileSync(path.join(root, changed.url)), Buffer.alloc(8)]);
        changed.bytes = changedBody.length; changed.revision = sha(changedBody);
        updated.totalBytes += 8; updated.version = 'test-media-update';
        overrides.set(changed.url, { body: changedBody });
        overrides.set('assets/offline-assets.json', { body: Buffer.from(JSON.stringify(updated)) });
        overrides.set('assets/pwa.css', { body: Buffer.concat([fs.readFileSync(path.join(root, 'assets/pwa.css')), Buffer.from('\n/* test release */')]) });
        releaseOverride(`test-update-${name}`);
        await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration()).update(); });
        await page.locator('#pwaUpdateBtn').waitFor({ state: 'visible', timeout: 30000 });
        assert.equal(await savedCount(page), cachedCount, 'Waiting update must not replace the current catalog or media');
        await Promise.all([page.waitForEvent('load'), page.locator('#pwaUpdateBtn').click()]);
        await waitReady(page);
        assert.equal(await savedCount(page), cachedCount - 1, 'An update only removes the obsolete cached revision');
        const beforeFetch = requests.filter(request => request.relative === changed.url).length;
        const changedHash = await page.evaluate(async url => {
            const response = await fetch(url);
            const digest = await crypto.subtle.digest('SHA-256', await response.arrayBuffer());
            return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
        }, changed.url);
        assert.equal(changedHash, changed.revision);
        assert.equal(requests.filter(request => request.relative === changed.url).length - beforeFetch, 1, 'Changed media refreshes only when requested');
        assert.equal(await savedCount(page), cachedCount);
        // A failed next release must preserve the complete, working release.
        releaseOverride(`test-broken-${name}`);
        overrides.set('assets/pwa.css', { body: Buffer.from('unavailable'), status: 503 });
        await page.evaluate(async () => {
            window.failedUpdateFinished = false;
            const registration = await navigator.serviceWorker.getRegistration();
            registration.addEventListener('updatefound', () => {
                const worker = registration.installing;
                worker.addEventListener('statechange', () => { if (worker.state === 'redundant') window.failedUpdateFinished = true; });
            });
            await registration.update().catch(() => {});
        });
        await page.waitForFunction(() => window.failedUpdateFinished, null, { timeout: 30000 });
        assert.equal(await page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting)), false);
        assert.equal(await page.evaluate(async () => (await caches.keys()).includes('another-app-cache')), true);
        await setOffline(context, name, true);
        await page.reload({ waitUntil: 'load' });
        await waitReady(page);
        assert.equal(await savedCount(page), cachedCount);
        const outside = await context.newPage();
        await setOffline(context, name, false);
        await outside.goto(`http://127.0.0.1:${server.address().port}/outside.html`);
        assert.equal(await outside.evaluate(() => navigator.serviceWorker.controller), null, 'SENB must not control other apps');
        assert.deepEqual(errors, []);
        console.log(`PASS ${name}: header installation, removed bulk download, on-demand media cache/reload, real offline M4A playback/ranges, safe updates, one-file refresh, failed-release rollback, and other-app isolation`);
    } finally { await setOffline(context, name, false); await context.close(); await browser.close(); overrides.clear(); }
}
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    originPort = server.address().port;
    try {
        if (process.env.SENB_PWA_ENGINE !== 'webkit') await run(chromium, 'chromium');
        if (process.env.SENB_SKIP_WEBKIT !== '1' && process.env.SENB_PWA_ENGINE !== 'chromium') await run(webkit, 'webkit');
    }
    finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
