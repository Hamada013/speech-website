// Small real-media catalogs keep these lifecycle checks fast. Shell hashes,
// worker installation, downloads, and release activation use production code.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const vm = require('node:vm'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.APP_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '../..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.m4a': 'audio/mp4' };
const configurations = {
    voc: { global: 'VOC_RELEASE', toggle: '[data-open-download]', dialog: '[data-offline-dialog]', download: '[data-offline-download]', status: '[data-offline-status]' },
    senb: { global: 'SENB_RELEASE', toggle: '#pwaDownloadToggle', dialog: '#offlinePanel', download: '#offlineDownloadBtn', status: '#offlineStatus' },
    taffaha: { global: 'TAFFAHA_RELEASE', toggle: '#open-offline', dialog: '#offline-dialog', download: '#download', status: '#download-status' }
};
const sha = body => crypto.createHash('sha256').update(body).digest('hex');
const releases = {}, overrides = new Map(), startupGates = new Map(), failedShells = new Set();
// Safari reports uncached startup image requests as page errors when a fixture
// deliberately omits most of SENB's media. Use its real complete catalog.
const fullCatalog = !!process.env.APP_FULL_CATALOG || process.env.APP_ENGINE === 'webkit';
let originPort;
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
    // Check committed hashes before the simulated releases below recalculate them.
    const actual = JSON.parse(JSON.stringify(release)); integrity(app, actual);
    assert.deepEqual(release.integrity, actual.integrity, `${app}: rebuild the production shell manifest`);
    const sample = entries => [...entries.filter(entry => entry.url.endsWith('.webp')).slice(0, 3), ...entries.filter(entry => entry.url.endsWith('.m4a')).slice(0, 3)];
    if (!fullCatalog && app === 'voc') release.media = release.media.map((group, index) => index ? [] : sample(group));
    else if (!fullCatalog && app === 'taffaha') release.media = sample(release.media);
    else if (!fullCatalog && app === 'senb') {
        const catalog = JSON.parse(read(app, 'assets/offline-assets.json'));
        catalog.assets = sample(catalog.assets);
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
        // Only shell installation requests this file before opening an app picker.
        if (file === 'assets/navigation/taffaha.webp') {
            const gate = startupGates.get(app); if (gate) await gate;
            if (failedShells.delete(app)) return response.writeHead(503).end();
        }
        const body = file === 'assets/pwa-release.js'
            ? Buffer.from(`self.${configurations[app].global}=${JSON.stringify(releases[app])};`)
            : read(app, file);
        response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        response.end(body);
    } catch { response.writeHead(404).end(); }
});
async function setOffline(context, offline) {
    if (process.env.APP_ENGINE !== 'webkit') return context.setOffline(offline);
    // Match the app-specific Safari checks: stop the real origin. Playwright's
    // WebKit offline emulation can reject responses served by a working worker.
    if (offline && server.listening) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    else if (!offline && !server.listening) await new Promise(resolve => server.listen(originPort, '127.0.0.1', resolve));
}
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    originPort = server.address().port;
    let browser;
    try {
        const engine = process.env.APP_ENGINE === 'webkit' ? webkit : chromium;
        browser = await engine.launch({ headless: true, ...(engine === chromium ? { channel: 'chrome' } : {}) });
        for (const [app, config] of Object.entries(configurations)) {
            const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
            await context.addInitScript(() => {
                if (!localStorage.getItem('voc-children-v1')) localStorage.setItem('voc-children-v1', JSON.stringify({ schema: 1, active: 'offline-qa', children: [{ id: 'offline-qa', name: 'اختبار التنزيل', words: {}, workspace: null, plan: null, sessions: [] }] }));
            });
            await context.route('https://**', route => route.abort());
            // Use the offline font fallback without leaving a stylesheet request pending.
            await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
            const page = await context.newPage(), errors = [];
            const failedRequests=[];let phase='startup';
            page.on('requestfailed',request=>{if(request.url().startsWith('http://127.0.0.1:'))failedRequests.push({url:request.url(),error:request.failure()?.errorText});});
            page.on('pageerror', error => { errors.push(error.message); console.error(app,phase,error.stack); });
            const url = `http://127.0.0.1:${server.address().port}/tools/${app}/`;
            let releaseStartup;
            startupGates.set(app, new Promise(resolve => { releaseStartup = resolve; }));
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            assert.equal(await page.locator('.app-update-dialog[open]').count(), 0, 'First installation must not offer an update');
            // An early tap must queue the download while the first shell installs.
            await page.locator('[data-logo-download]').click();
            assert.equal(await page.locator(`${config.dialog} button`).count(), 1);
            assert.equal(await page.locator(config.download).textContent(), 'تنزيل');
            assert.equal(await page.locator(`${config.dialog} progress`).getAttribute('max'), '100');
            assert.match(await page.locator(config.status).textContent(), /^\d+%$/);
            assert.equal(await page.locator('#pwaInstallBtn, [data-install-confirm], #offlinePauseBtn, #offlineCloseBtn').count(), 0);
            await page.locator(config.download).click();
            assert.equal(await page.locator(config.download).getAttribute('aria-busy'), 'true');
            assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), false, 'Download starts before the first worker is ready');
            releaseStartup(); startupGates.delete(app);
            await page.waitForFunction(selector => document.querySelector(selector).textContent === '100%', config.status, { timeout: fullCatalog ? 180000 : 30000 });
            await page.waitForFunction(() => !!navigator.serviceWorker.controller);
            await page.screenshot({ path: `/tmp/${app}-simple-download.png` });
            await page.keyboard.press('Escape');
            // Reopen the cached shell without contacting the origin.
            phase='offline reopening';
            await setOffline(context, true);
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.locator(config.toggle).click();
            await page.waitForFunction(selector => document.querySelector(selector).textContent === '100%', config.status);
            await page.keyboard.press('Escape');
            await setOffline(context, false);
            phase='code update';
            const release = releases[app];
            const css = app === 'taffaha' ? 'styles.css' : 'assets/home.css';
            overrides.set(`${app}/${css}`, Buffer.concat([read(app, css), Buffer.from('\n/* Simulated published release. */\n')]));
            release.version = `controls-${app}-updated`;
            integrity(app, release);
            // Reopening the app must discover a published change automatically.
            await page.reload({ waitUntil: 'domcontentloaded' });
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
            await page.keyboard.press('Escape');
            await second.close();
            await page.bringToFront();
            // A media-only publication also needs a popup and a new revision.
            phase='media update';
            const catalog = app === 'senb' ? JSON.parse(read(app, 'assets/offline-assets.json')) : null;
            const media = app === 'voc' ? release.media.flat() : app === 'taffaha' ? release.media : catalog.assets;
            const changed = media.find(entry => entry.url.endsWith('.m4a'));
            const replacement = media.find(entry => entry.url.endsWith('.m4a') && entry.url !== changed.url && entry.revision !== changed.revision);
            assert(replacement, 'The test needs two different real recordings');
            const body = read(app, replacement.url);
            overrides.set(`${app}/${changed.url}`, body);
            changed.revision = sha(body); changed.bytes = body.length;
            if (catalog) {
                catalog.version = `controls-${app}-media`;
                catalog.totalBytes = catalog.assets.reduce((sum, entry) => sum + entry.bytes, 0);
                overrides.set(`${app}/assets/offline-assets.json`, Buffer.from(JSON.stringify(catalog)));
            }
            release.version = `controls-${app}-media`;
            integrity(app, release);
            // Foreground/online checks discover changes while an app stays open.
            await page.evaluate(() => { const now = Date.now.bind(Date); Date.now = () => now() + 120000; window.dispatchEvent(new Event('online')); });
            await page.locator('.app-update-dialog').waitFor({ state: 'visible' });
            await Promise.all([page.waitForEvent('load'), page.locator('[data-update-accept]').click()]);
            await page.locator(config.toggle).click();
            // VOC can resume its saved download automatically after activation.
            await page.evaluate(selector => { const button = document.querySelector(selector); if (!button.disabled) button.click(); }, config.download);
            try { await page.waitForFunction(selector => document.querySelector(selector).textContent === '100%', config.status); }
            catch (error) {
                console.error(app, 'media update state:', await page.evaluate(async ({status, download}) => {
                    const worker=navigator.serviceWorker.controller,channel=new MessageChannel();
                    const response=await Promise.race([new Promise(resolve=>{channel.port1.onmessage=event=>resolve(event.data);worker.postMessage({type:'VOC_STATUS'},[channel.port2]);}),new Promise(resolve=>setTimeout(()=>resolve('worker timeout'),2000))]);channel.port1.close();
                    const registration=await navigator.serviceWorker.getRegistration();
                    return {percent:document.querySelector(status).textContent,disabled:document.querySelector(download).disabled,visible:!document.hidden,online:navigator.onLine,workerState:worker.state,activeState:registration.active?.state,ownsActive:registration.active===worker,response,errors:[...document.querySelectorAll('[role=alert]:not([hidden])')].map(node=>node.textContent)};
                }, config));
                throw error;
            }
            const digest = await page.evaluate(async url => {
                const bytes = await (await fetch(url)).arrayBuffer();
                return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
            }, changed.url);
            assert.equal(digest, changed.revision, 'The changed recording is saved and served, rather than its old revision');
            if(errors.length)console.error(app,'failed requests:',failedRequests.slice(-12));
            assert.deepEqual(errors, []);
            await context.close();
            if (!fullCatalog) {
                // A failed first install must leave a working retry in the same tab.
                failedShells.add(app);
                const retryContext = await browser.newContext();
                await retryContext.addInitScript(() => localStorage.setItem('voc-children-v1', JSON.stringify({ schema: 1, active: 'retry', children: [{ id: 'retry', name: 'اختبار المحاولة', words: {}, sessions: [] }] })));
                await retryContext.route('https://**', route => route.abort());
                const retry = await retryContext.newPage();
                await retry.goto(url, { waitUntil: 'domcontentloaded' });
                await retry.locator('[data-logo-download]').click();
                await retry.locator(`${config.dialog} [role=alert]:visible`).waitFor();
                await retry.locator(config.download).click();
                await retry.waitForFunction(selector => document.querySelector(selector).textContent === '100%', config.status, { timeout: 30000 });
                assert.equal(await retry.locator(`${config.dialog} [role=alert]`).isVisible(), false);
                await retryContext.close();
            }
            console.log(`PASS ${app}: early logo download, ${fullCatalog ? 'complete production catalog' : 'failed-install retry'}, 100%, offline reopen, automatic code/media update popups, deferral, multi-window activation and refreshed recording.`);
        }
    } finally {
        await browser?.close();
        await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
