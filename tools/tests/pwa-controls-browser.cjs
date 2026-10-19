// Small real-media catalogs keep these lifecycle checks fast. Shell hashes,
// worker installation, downloads, and release activation use production code.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const vm = require('node:vm'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { chromium } = require(process.env.APP_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '../..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.m4a': 'audio/mp4' };
const configurations = {
    voc: { global: 'VOC_RELEASE', toggle: '[data-open-download]', dialog: '[data-offline-dialog]', download: '[data-offline-download]', status: '[data-offline-status]' },
    senb: { global: 'SENB_RELEASE', toggle: '#pwaDownloadToggle', dialog: '#offlinePanel', download: '#offlineDownloadBtn', status: '#offlineStatus' },
    taffaha: { global: 'TAFFAHA_RELEASE', toggle: '#open-offline', dialog: '#offline-dialog', download: '#download', status: '#download-status' }
};
const sha = body => crypto.createHash('sha256').update(body).digest('hex');
const releases = {}, overrides = new Map();
function read(app, file) { return overrides.get(`${app}/${file}`) || fs.readFileSync(path.join(root, 'tools', app, file)); }
function integrity(app, release) {
    for (const file of release.shell) {
        const body = read(app, file);
        release.integrity[file] = app === 'taffaha' ? sha(body) : 'sha256-' + crypto.createHash('sha256').update(body).digest('base64');
    }
}
for (const [app, config] of Object.entries(configurations)) {
    const context = { self: {} };
    vm.runInNewContext(read(app, 'assets/pwa-release.js').toString(), context);
    const release = JSON.parse(JSON.stringify(context.self[config.global]));
    if (app === 'voc') release.media = release.media.map((group, index) => index ? [] : group.slice(0, 6));
    else if (app === 'taffaha') release.media = release.media.slice(0, 6);
    else {
        const catalog = JSON.parse(read(app, 'assets/offline-assets.json'));
        catalog.assets = catalog.assets.slice(0, 6);
        catalog.totalBytes = catalog.assets.reduce((sum, entry) => sum + entry.bytes, 0);
        overrides.set(`${app}/assets/offline-assets.json`, Buffer.from(JSON.stringify(catalog)));
    }
    release.version = `controls-${app}-initial`;
    integrity(app, release);
    releases[app] = release;
}
const server = http.createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const match = pathname.match(/^\/tools\/(voc|senb|taffaha)\/(.*)$/);
        if (!match || match[2].split('/').includes('..')) return response.writeHead(404).end();
        const [, app, relative] = match, file = relative || 'index.html';
        const body = file === 'assets/pwa-release.js'
            ? Buffer.from(`self.${configurations[app].global}=${JSON.stringify(releases[app])};`)
            : read(app, file);
        response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        response.end(body);
    } catch { response.writeHead(404).end(); }
});
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    let browser;
    try {
        browser = await chromium.launch({ headless: true, channel: 'chrome' });
        for (const [app, config] of Object.entries(configurations)) {
            const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
            await context.addInitScript(() => {
                if (!localStorage.getItem('voc-children-v1')) localStorage.setItem('voc-children-v1', JSON.stringify({ schema: 1, active: 'offline-qa', children: [{ id: 'offline-qa', name: 'اختبار التنزيل', words: {}, workspace: null, plan: null, sessions: [] }] }));
            });
            await context.route('https://**', route => route.abort());
            // Use the offline font fallback without leaving a stylesheet request pending.
            await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
            const page = await context.newPage(), errors = [];
            page.on('pageerror', error => errors.push(error.message));
            const url = `http://127.0.0.1:${server.address().port}/tools/${app}/`;
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await page.waitForFunction(() => !!navigator.serviceWorker.controller);
            await page.waitForTimeout(500);
            assert.equal(await page.locator('.app-update-dialog[open]').count(), 0, 'First installation must not offer an update');
            await page.locator(config.toggle).click();
            assert.equal(await page.locator(`${config.dialog} button`).count(), 1);
            assert.equal(await page.locator(config.download).textContent(), 'تنزيل');
            assert.equal(await page.locator(`${config.dialog} progress`).getAttribute('max'), '100');
            assert.match(await page.locator(config.status).textContent(), /^\d+%$/);
            assert.equal(await page.locator('#pwaInstallBtn, [data-install-confirm], #offlinePauseBtn, #offlineCloseBtn').count(), 0);
            await page.locator(config.download).click();
            await page.waitForFunction(selector => document.querySelector(selector).textContent === '100%', config.status, { timeout: 30000 });
            await page.screenshot({ path: `/tmp/${app}-simple-download.png` });
            await page.keyboard.press('Escape');
            // Reopen the cached shell without contacting the origin.
            await context.setOffline(true);
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.locator(config.toggle).click();
            await page.waitForFunction(selector => document.querySelector(selector).textContent === '100%', config.status);
            await page.keyboard.press('Escape');
            await context.setOffline(false);
            const release = releases[app];
            const css = app === 'taffaha' ? 'styles.css' : 'assets/home.css';
            overrides.set(`${app}/${css}`, Buffer.concat([read(app, css), Buffer.from('\n/* Simulated published release. */\n')]));
            release.version = `controls-${app}-updated`;
            integrity(app, release);
            await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
            await page.locator('.app-update-dialog').waitFor({ state: 'visible' });
            await page.screenshot({ path: `/tmp/${app}-update-prompt.png` });
            const currentController = await page.evaluate(() => navigator.serviceWorker.controller.state);
            await page.locator('[data-update-later]').click();
            assert.equal(await page.evaluate(() => navigator.serviceWorker.controller.state), currentController);
            assert(await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting));
            assert(await page.locator('.app-update-dialog').isHidden());
            // Deferred updates are offered again when opening the app.
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.locator('.app-update-dialog').waitFor({ state: 'visible' });
            const second = await context.newPage();
            await second.goto(url, { waitUntil: 'domcontentloaded' });
            await second.locator('.app-update-dialog').waitFor({ state: 'visible' });
            await Promise.all([page.waitForEvent('load'), second.waitForEvent('load'), page.locator('[data-update-accept]').click()]);
            await page.locator(config.toggle).waitFor();
            assert(await page.locator('.app-update-dialog').isHidden());
            assert.equal(await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting), false);
            await page.locator(config.toggle).click();
            await page.waitForFunction(selector => document.querySelector(selector).textContent === '100%', config.status);
            assert.deepEqual(errors, []);
            await context.close();
            console.log(`PASS ${app}: one download action, 100%, offline reopen, defer/reopen update, accepted update reloads both windows and preserves downloads.`);
        }
    } finally {
        await browser?.close();
        await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
