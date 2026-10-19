// Real-browser tests of interruption, deduplication, integrity, and offline audio.
const assert = require('node:assert/strict');
const { solveParentGate } = require('../../tests/solve-parent-gate.cjs');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require(process.env.VOC_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml',
    '.m4a': 'audio/mp4', '.woff2': 'font/woff2', '.txt': 'text/plain' };
let failNextMedia = false;
let mediaRequests = 0;
let activeMedia = 0;
let maxActiveMedia = 0;
let originPort;
const server = http.createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith('/tools/voc/')) { response.writeHead(404).end(); return; }
    const relative = pathname.slice('/tools/voc/'.length) || 'index.html';
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    const media = /^(images|sounds)\/\d+\//.test(relative);
    if (media) {
        mediaRequests++;
        activeMedia++;
        maxActiveMedia = Math.max(maxActiveMedia, activeMedia);
        response.on('close', () => { activeMedia--; });
        // Ensure simultaneous client commands overlap while a batch is running.
        await new Promise(resolve => setTimeout(resolve, 5));
        if (failNextMedia) { failNextMedia = false; response.writeHead(404).end('Missing'); return; }
    }
    try {
        const body = await fs.promises.readFile(filename);
        response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream',
            'Cache-Control': 'no-cache', 'Content-Length': body.length });
        response.end(body);
    } catch { response.writeHead(404).end(); }
});

async function setOffline(context, name, offline) {
    // Playwright's WebKit offline emulation rejects worker responses (upstream
    // #42775). Stop the real origin instead, exercising a genuine network loss.
    if (name === 'chromium') await context.setOffline(offline);
    if (offline && server.listening) {
        await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    } else if (!offline && !server.listening) {
        await new Promise(resolve => server.listen(originPort, '127.0.0.1', resolve));
    }
}

function rpc(page, type) {
    return page.evaluate(type => new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        const timer = setTimeout(() => reject(new Error('Worker message timeout')), 45000);
        channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data); };
        navigator.serviceWorker.controller.postMessage({ type }, [channel.port2]);
    }), type);
}

async function openDownloads(page) {
    if (!await page.locator('[data-offline-dialog]').evaluate(dialog => dialog.open)) await page.locator('[data-open-download]').click();
}
async function testBrowser(name, engine, origin) {
    mediaRequests = 0;
    maxActiveMedia = 0;
    const browser = await engine.launch({ headless: true,
        ...(name === 'chromium' && process.env.VOC_USE_CHROME ? { channel: 'chrome' } : {}) });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await context.addInitScript(() => { if (!localStorage.getItem('voc-children-v1')) localStorage.setItem('voc-children-v1', JSON.stringify({schema:1,active:'qa',children:[{id:'qa',name:'طفل الاختبار',words:{},workspace:null,plan:null}]})); });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
        await page.goto(`${origin}/tools/voc/index.html`);
        await page.waitForFunction(() => !!navigator.serviceWorker.controller);
        await page.waitForFunction(() => !document.querySelector('[data-offline-download]').disabled);
        assert.equal(mediaRequests, 0, 'Install/startup must never preload media');
        assert.equal(await page.locator('#home-view').isVisible(), true);
        assert.equal(await page.locator('[data-offline-card]').isVisible(), false, 'No offline card on the home screen');
        await openDownloads(page);
        assert.equal(await page.locator('[data-offline-dialog] button').count(), 1);
        assert.equal(await page.locator('[data-offline-download]').textContent(), 'تنزيل');
        await page.keyboard.press('Escape');
        const initial = await rpc(page, 'VOC_STATUS');
        assert.equal(initial.done, 0);
        assert.equal(initial.ready, false);
        console.log(`${name}: shell-only install, ${initial.total} assets; checking failed downloads`);

        failNextMedia = true;
        await rpc(page, 'VOC_START');
        const failed = await rpc(page, 'VOC_BATCH');
        assert.equal(failed.error, 'network');
        assert.equal((await rpc(page, 'VOC_STATUS')).done, 0, '404 cannot count as saved');
        const first = await rpc(page, 'VOC_BATCH');
        assert.equal(first.done, 3);
        const before = mediaRequests;
        const [a, b] = await Promise.all([rpc(page, 'VOC_BATCH'), rpc(page, 'VOC_BATCH')]);
        assert.equal(a.done, b.done);
        assert.equal(mediaRequests - before, 3, 'Duplicate commands must share a batch');
        await rpc(page, 'VOC_PAUSE');
        const paused = await rpc(page, 'VOC_STATUS');
        assert.equal(paused.wanted, false);

        if (name === 'chromium') {
            // Inject a real Cache API quota exception in the worker, then restore it.
            const sw = context.serviceWorkers()[0];
            await sw.evaluate(() => {
                self.originalPut = Cache.prototype.put;
                Cache.prototype.put = function(key, response) {
                    if (String(key).includes('?voc-rev=')) return Promise.reject(new DOMException('Disk full', 'QuotaExceededError'));
                    return self.originalPut.call(this, key, response);
                };
            });
            await rpc(page, 'VOC_START');
            assert.equal((await rpc(page, 'VOC_BATCH')).error, 'storage');
            assert.equal((await rpc(page, 'VOC_STATUS')).wanted, false);
            await sw.evaluate(() => { Cache.prototype.put = self.originalPut; });
        }

        // The real button starts the pump; a worker-level interruption survives reload.
        await openDownloads(page);
        await page.locator('[data-offline-download]').click();
        await page.waitForFunction(saved => Number(document.querySelector('progress').value) > saved, Math.floor(paused.done / initial.total * 100));
        await rpc(page, 'VOC_PAUSE');
        await page.waitForFunction(() => document.querySelector('[data-offline-card]').dataset.state === 'idle');
        await page.waitForTimeout(300);
        const saved = (await rpc(page, 'VOC_STATUS')).done;
        await page.reload();
        await page.waitForFunction(() => !!navigator.serviceWorker.controller);
        assert.equal((await rpc(page, 'VOC_STATUS')).wanted, false);
        assert.equal((await rpc(page, 'VOC_STATUS')).done, saved);
        await page.screenshot({ path: `/private/tmp/voc-${name}-phone.png`, fullPage: true });

        // Start, interrupt by navigation, and let the next page resume from cache.
        await openDownloads(page);
        await page.locator('[data-offline-download]').click();
        await page.waitForFunction(() => document.querySelector('[data-offline-card]').dataset.state === 'downloading');
        await page.goto(`${origin}/tools/voc/games.html`);
        await page.goto(`${origin}/tools/voc/index.html`);
        console.log(`${name}: pause, reload, quota/network recovery and navigation resume passed; downloading all content`);
        const monitor = setInterval(async () => {
            try { console.log(`${name}: ${await page.locator('[data-offline-status]').textContent()}`); } catch {}
        }, 30000);
        try {
            await page.waitForFunction(() => document.querySelector('[data-offline-card]').dataset.state === 'ready', null, { timeout: 600000 });
        } finally { clearInterval(monitor); }
        const completed = await rpc(page, 'VOC_STATUS');
        assert.equal(completed.done, completed.total);
        assert.equal(completed.ready, true);
        assert.equal(completed.wanted, false);
        assert.equal(maxActiveMedia, 1, 'Downloads must be sequential');

        await setOffline(context, name, true);
        await page.reload();
        await page.waitForFunction(() => document.querySelector('[data-offline-card]').dataset.state === 'ready');
        for (const route of ['games.html', 'matching.html', 'memory.html', 'rapid.html', 'test.html', '']) {
            await page.goto(`${origin}/tools/voc/${route}?offline-test=1`);
            assert.ok(await page.title());
            assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).fontFamily.includes('Cairo')), true);
        }
        const mediaResult = await page.evaluate(async () => {
            const image = await fetch('images/1/1.webp');
            const full = await fetch('sounds/1/1.m4a');
            const fullSize = (await full.arrayBuffer()).byteLength;
            const part = await fetch('sounds/1/1.m4a', { headers: { Range: 'bytes=0-99' } });
            const suffix = await fetch('sounds/1/1.m4a', { headers: { Range: 'bytes=-10' } });
            const invalid = await fetch('sounds/1/1.m4a', { headers: { Range: `bytes=${fullSize}-` } });
            return { image: image.status, part: part.status, bytes: (await part.arrayBuffer()).byteLength,
                range: part.headers.get('Content-Range'), suffix: (await suffix.arrayBuffer()).byteLength, invalid: invalid.status };
        });
        assert.equal(mediaResult.image, 200);
        assert.equal(mediaResult.part, 206);
        assert.equal(mediaResult.bytes, 100);
        assert.match(mediaResult.range, /^bytes 0-99\//);
        assert.equal(mediaResult.suffix, 10);
        assert.equal(mediaResult.invalid, 416);

        // A fresh offline page must also load the local PDF library and save an admin report.
        await page.locator('[data-child-profile]:visible').click();
        await solveParentGate(page);
        await page.locator('#saved-children button').filter({ hasText: 'Hamada' }).click();
        await page.waitForFunction(() => window.VocProgress?.isAdmin());
        await page.locator('[data-child-profile]:visible').click();
        await solveParentGate(page);
        await page.locator('[data-report-child="qa"]').click();
        const reportPage = page; await reportPage.locator('#voc-activity-report[open]').waitFor();
        const pdfDownload = reportPage.waitForEvent('download');
        await reportPage.locator('#report-download').click();
        const report = await pdfDownload;
        assert.ok((await report.suggestedFilename()).endsWith('.pdf'));
        assert.equal(await reportPage.locator('#report-error').isHidden(), true);
        await reportPage.locator('#report-close').click();
        console.log(`${name}: admin report popup downloads a PDF while offline`);

        // Verify actual media decoding/playback, beyond HTTP/cache assertions.
        await page.evaluate(() => {
            const button = document.createElement('button');
            button.id = 'audio-test'; button.textContent = 'Play test audio'; document.body.append(button);
            button.onclick = () => {
                window.testAudio = new Audio('sounds/1/1.m4a');
                window.testAudio.play().then(() => { window.audioStarted = true; }).catch(error => { window.audioError = error.message; });
            };
        });
        await page.locator('#audio-test').click();
        await page.waitForFunction(() => window.audioStarted && window.testAudio.currentTime > 0, null, { timeout: 15000 });
        assert.equal(errors.length, 0, errors.join('\n'));

        // Removing one cached file must revoke Ready and only re-fetch that file.
        await page.evaluate(async () => {
            const cache = await caches.open('voc-media-v1');
            const keys = await cache.keys();
            await cache.delete(keys[0]);
        });
        assert.equal((await rpc(page, 'VOC_STATUS')).ready, false);
        await setOffline(context, name, false);
        const requestsBeforeRepair = mediaRequests;
        await rpc(page, 'VOC_START');
        assert.equal((await rpc(page, 'VOC_BATCH')).ready, true);
        assert.equal(mediaRequests - requestsBeforeRepair, 1);
        console.log(`${name}: all ${completed.total} assets verified; offline pages, M4A playback, ranges and eviction repair passed`);
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.goto(`${origin}/tools/voc/index.html`);
        await page.screenshot({ path: `/private/tmp/voc-${name}-tablet.png`, fullPage: true });
    } catch (error) {
        console.error(error);
        try {
            console.error(`${name} failure state:`, await page.locator('[data-offline-status]').textContent({ timeout: 1000 }));
            console.error(`${name} worker status:`, await rpc(page, 'VOC_STATUS'));
        } catch {}
        throw error;
    } finally { await setOffline(context, name, false); await context.close(); await browser.close(); }
}

(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    originPort = server.address().port;
    const origin = `http://127.0.0.1:${originPort}`;
    try {
        if (process.env.VOC_ENGINE !== 'webkit') await testBrowser('chromium', chromium, origin);
        if (process.env.VOC_ENGINE !== 'chromium') await testBrowser('webkit', webkit, origin);
    } finally { server.close(); server.closeAllConnections(); server.unref(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
