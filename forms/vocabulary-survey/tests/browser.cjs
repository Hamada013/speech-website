// Synthetic QA records only. Test the real browser, IndexedDB, service worker,
// audio decoder, JSON/CSV files and print layout without a backend.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require(process.env.SURVEY_PLAYWRIGHT || 'playwright');
const repo = path.resolve(__dirname, '../../..');
const appRoot = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(appRoot, 'data/vocabulary.json')));
const byId = new Map(data.items.map(item => [item.id, item]));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.png': 'image/png', '.webp': 'image/webp', '.m4a': 'audio/mp4', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };
let port, requests = [], mediaActive = 0, mediaMax = 0, pdfBuffer;
const server = http.createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/qa/report.pdf') { response.writeHead(200, { 'Content-Type': 'application/pdf' }); response.end(pdfBuffer); return; }
    if (pathname === '/qa/renderer.html') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(`<html><body><script type="module">import * as pdfjs from '/forms/ASD/VB-MAPP/assets/vendor/pdf.mjs'; pdfjs.GlobalWorkerOptions.workerSrc='/forms/ASD/VB-MAPP/assets/vendor/pdf.worker.mjs'; window.pdfdoc=await pdfjs.getDocument({url:'/qa/report.pdf'}).promise; window.renderPDFPage=async function(n){ document.body.replaceChildren(); const page=await pdfdoc.getPage(n); const viewport=page.getViewport({scale:1.5}); const canvas=document.createElement('canvas'); canvas.width=viewport.width; canvas.height=viewport.height; document.body.append(canvas); await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise; return (await page.getTextContent()).items.map(i=>i.str).join(' ');};</script></body></html>`);
        return;
    }
    const filename = path.resolve(repo, `.${pathname.endsWith('/') ? pathname + 'index.html' : pathname}`);
    if (!filename.startsWith(repo + path.sep)) { response.writeHead(403).end(); return; }
    const isMedia = /\/tools\/voc\/(images|sounds)\/\d+\//.test(pathname);
    requests.push(pathname);
    if (isMedia) {
        mediaActive++; mediaMax = Math.max(mediaMax, mediaActive);
        response.on('close', () => { mediaActive--; });
    }
    try {
        const body = await fs.promises.readFile(filename);
        response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'text/plain', 'Content-Length': body.length, 'Cache-Control': 'no-store' }); response.end(body);
    } catch { response.writeHead(404).end(); }
});
const rpc = (page, type) => page.evaluate(type => new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => reject(new Error('Worker response timeout')), 45000);
    channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data); };
    navigator.serviceWorker.controller.postMessage({ type }, [channel.port2]);
}), type);
const sessions = page => page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('slp-vocabulary-assessment-v1', 1);
    request.onsuccess = () => { const db = request.result, read = db.transaction('sessions').objectStore('sessions').getAll(); read.onsuccess = () => { db.close(); resolve(read.result); }; };
    request.onerror = () => reject(request.error);
}));
async function draft(page) { return (await sessions(page)).filter(s => s.status === 'draft').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]; }
async function offline(context, name, value) {
    // WebKit offline emulation rejects SW responses; stop the actual origin.
    if (name === 'chromium') await context.setOffline(value);
    if (value && server.listening) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    if (!value && !server.listening) await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
}
async function readyForResponse(page, mode) {
    await page.locator('#trial-view').waitFor({ state: 'visible' });
    const selector = mode === 'receptive' ? '#workspace button' : '[data-grade]';
    // Playback must come from a real user gesture when autoplay is blocked.
    for (let i = 0; i < 60; i++) {
        if (await page.locator(selector).first().isEnabled()) return;
        if ((await page.locator('#audio-status').textContent()).startsWith('Tap Play')) await page.locator('#replay-audio').click();
        await page.waitForTimeout(100);
    }
    throw new Error(`Responses never enabled: ${await page.locator('#audio-status').textContent()}`);
}
async function setup(page, mode, condition = 'modeled') {
    await page.locator(`[data-start="${mode}"]`).click();
    await page.locator('[name=childId]').fill('QA-SYNTHETIC');
    await page.locator('[name=childName]').fill('Synthetic example');
    await page.locator('[name=birthDate]').fill('2022-01-10');
    await page.locator('[name=scope]').selectOption('A');
    await page.locator('[name=sampling]').selectOption('5');
    if (mode === 'expressive') await page.locator('[name=audioMode]').selectOption(condition);
    await page.waitForFunction(() => document.getElementById('plan-summary').textContent.startsWith('5 planned'));
    await page.locator('#begin-test').click();
    await readyForResponse(page, mode);
}
async function respond(page, mode, outcome) {
    await readyForResponse(page, mode);
    const current = await draft(page), count = current.records.length;
    if (mode === 'receptive') {
        const position = current.current.options.findIndex(option => option.role === outcome);
        assert.notEqual(position, -1);
        await page.locator('#workspace button').nth(position).click();
    } else await page.locator(`[data-grade="${outcome}"]`).click();
    await page.waitForFunction(count => Number(document.getElementById('trial-progress').value) > count || !document.getElementById('report-view').hidden, count);
}
async function run(name, engine, origin) {
    requests = []; mediaMax = 0;
    const browser = await engine.launch({ headless: true, ...(name === 'chromium' ? { channel: 'chrome' } : {}) });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, hasTouch: true });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
        await page.goto(`${origin}/forms/vocabulary-survey/`);
        await page.waitForFunction(() => !!navigator.serviceWorker.controller);
        await page.waitForFunction(() => !document.querySelector('[data-start]').disabled);
        assert.equal(requests.filter(p => /\/voc\/(images|sounds)\/\d+\//.test(p)).length, 0, 'No automatic media preload');
        assert.match(await page.locator('#bank-count').textContent(), /979/);
        assert.equal((await rpc(page, 'SURVEY_STATUS')).ready, false);
        await page.screenshot({ path: `/private/tmp/survey-${name}-desktop.png`, fullPage: true });
        await page.setViewportSize({ width: 390, height: 844 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await page.screenshot({ path: `/private/tmp/survey-${name}-phone.png`, fullPage: true });
        await setup(page, 'receptive');
        assert.equal(await page.locator('#workspace .picture-card').count(), 4);
        await page.screenshot({ path: `/private/tmp/survey-${name}-trial.png`, fullPage: true });
        for (const outcome of ['target', 'semantic', 'phonological', 'unrelated', 'target']) await respond(page, 'receptive', outcome);
        await page.locator('#report-view').waitFor({ state: 'visible' });
        let current = (await sessions(page)).find(s => s.mode === 'receptive' && s.status === 'complete');
        assert.equal(current.records.length, 5);
        assert.deepEqual(current.records.map(r => r.outcome), ['target', 'semantic', 'phonological', 'unrelated', 'target']);
        assert.match(await page.locator('.metric-grid').textContent(), /40\.0%/);
        const jsonDownload = page.waitForEvent('download'); await page.locator('#export-json').click();
        const json = await jsonDownload; await json.saveAs(`/private/tmp/survey-${name}-session.json`);
        assert.equal(JSON.parse(fs.readFileSync(`/private/tmp/survey-${name}-session.json`)).session.records.length, 5);
        const csvDownload = page.waitForEvent('download'); await page.locator('#export-csv').click();
        const csv = await csvDownload; await csv.saveAs(`/private/tmp/survey-${name}-session.csv`);
        assert.ok(fs.readFileSync(`/private/tmp/survey-${name}-session.csv`, 'utf8').includes('semantic'));
        const previous = structuredClone(current); previous.id = 'qa-previous'; previous.metadata.assessmentDate = '2026-09-01';
        previous.records[1].outcome = 'target'; previous.records[1].selectedId = previous.records[1].targetId; previous.records[1].selectedLabel = previous.records[1].label;
        await page.locator('#baseline-import').setInputFiles({ name: 'baseline.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ session: previous })) });
        await page.waitForFunction(() => document.querySelector('#report-content').textContent.includes('-20.0 pp'));
        assert.equal(await page.locator('.bar-previous').count(), 1, 'Only the assessed cohort has a historical baseline');
        await page.screenshot({ path: `/private/tmp/survey-${name}-report.png`, fullPage: true });
        await page.evaluate(() => { window.print = () => { window.printCalled = true; dispatchEvent(new Event('afterprint')); }; });
        await page.locator('#print-report').click();
        await page.waitForFunction(() => window.printCalled);
        if (name === 'chromium') {
            pdfBuffer = await page.pdf({ path: '/private/tmp/survey-clinical-qa.pdf', printBackground: true, preferCSSPageSize: true });
            const renderer = await context.newPage();
            renderer.on('pageerror', error => console.error('PDF renderer:', error.message));
            renderer.on('console', event => { if (event.type() === 'error') console.error('PDF renderer console:', event.text()); });
            await renderer.goto(`${origin}/qa/renderer.html`);
            await renderer.waitForFunction(() => !!window.pdfdoc);
            const count = await renderer.evaluate(() => pdfdoc.numPages);
            assert.ok(count >= 2);
            for (let n = 1; n <= count; n++) {
                const text = await renderer.evaluate(n => renderPDFPage(n), n);
                assert.ok(text.trim());
                await renderer.locator('canvas').screenshot({ path: `/private/tmp/survey-print-page-${n}.png` });
            }
            await renderer.close();
        }
        await page.locator('nav [data-route=dashboard]').click();
        await setup(page, 'expressive', 'unprompted');
        assert.equal(await page.locator('#workspace .picture-card').count(), 1);
        await respond(page, 'expressive', 'notMastered');
        await readyForResponse(page, 'expressive');
        await page.locator('#replay-audio').click();
        await page.waitForFunction(() => document.getElementById('word-audio').currentTime > 0);
        await page.locator('#pause-test').click();
        await page.reload();
        await page.locator('#resume-draft').click();
        await readyForResponse(page, 'expressive');
        assert.match(await page.locator('#trial-count').textContent(), /Item 2 of 5/);
        for (const outcome of ['learning', 'mastered', 'mastered', 'notMastered']) await respond(page, 'expressive', outcome);
        const expressive = (await sessions(page)).find(s => s.mode === 'expressive' && s.status === 'complete');
        assert.equal(expressive.records.filter(r => r.audioPlayed).length, 1, 'The manually modeled trial retains its prompt condition across reload');
        assert.match(await page.locator('.metric-grid').textContent(), /50\.0%/);
        // CSV import round-trip, malformed history and clinician item overrides.
        await page.locator('nav [data-route=history]').click();
        await page.locator('#history-import').setInputFiles(`/private/tmp/survey-${name}-session.csv`);
        await page.waitForFunction(() => document.getElementById('message').textContent.includes('Session imported'));
        await page.locator('#history-import').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":"world"}') });
        await page.waitForFunction(() => document.getElementById('message').classList.contains('error'));
        await page.locator('nav [data-route=validation]').click();
        await page.locator('#bank-search').fill('1-1');
        const review = page.locator('.review-row').first();
        await review.locator('select').nth(0).selectOption('D'); await review.getByRole('button', { name: 'Save', exact: true }).click();
        await page.waitForFunction(() => document.getElementById('message').textContent.includes('Assignment saved'));
        console.log(`${name}: both test engines, audio, resume, scoring, imports, deltas, review and print checks passed`);
        if (process.env.SURVEY_SMOKE === '1') { assert.equal(errors.length, 0, errors.join('\n')); return; }

        await page.locator('nav [data-route=dashboard]').click();
        await page.evaluate(async () => { const other = await caches.open('another-app-qa'); await other.put('/unrelated-data', new Response('preserve')); });
        mediaMax = 0;
        await page.locator('[data-offline-download]').click();
        const monitor = setInterval(async () => { try { console.log(`${name}: ${await page.locator('[data-offline-status]').textContent()}`); } catch {} }, 30000);
        try { await page.waitForFunction(() => document.querySelector('[data-offline-card]').dataset.state === 'ready', null, { timeout: 240000 }); }
        finally { clearInterval(monitor); }
        const status = await rpc(page, 'SURVEY_STATUS');
        assert.equal(status.done, 1975); assert.equal(status.ready, true); assert.equal(mediaMax, 1);
        assert.equal(await page.evaluate(async () => !!(await (await caches.open('another-app-qa')).match('/unrelated-data'))), true);
        await offline(context, name, true);
        await page.reload();
        await page.waitForFunction(() => !document.querySelector('[data-start]').disabled);
        await page.waitForFunction(() => document.querySelector('[data-offline-card]').dataset.state === 'ready');
        await setup(page, 'expressive', 'modeled');
        await page.waitForFunction(() => document.getElementById('word-audio').currentTime > 0);
        await respond(page, 'expressive', 'mastered');
        await page.locator('#pause-test').click(); await page.locator('#finish-partial').click();
        await page.locator('#report-view').waitFor({ state: 'visible' });
        assert.match(await page.locator('#report-content').textContent(), /partial session/);
        const range = await page.evaluate(async () => {
            const response = await fetch('../../tools/voc/sounds/1/1.m4a', { headers: { Range: 'bytes=0-99' } });
            return { status: response.status, length: (await response.arrayBuffer()).byteLength };
        });
        assert.deepEqual(range, { status: 206, length: 100 });
        await offline(context, name, false);
        assert.equal(errors.length, 0, errors.join('\n'));
        console.log(`${name}: all 1975 shared media cached sequentially; real offline assessment, M4A playback/ranges, persisted reports and cache isolation passed`);
    } catch (error) {
        console.error(name, 'UI:', await page.locator('#message').textContent().catch(() => 'unavailable'));
        await page.screenshot({ path: `/private/tmp/survey-${name}-failure.png`, fullPage: true }).catch(() => {});
        throw error;
    } finally { await offline(context, name, false); await context.close(); await browser.close(); }
}
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); port = server.address().port;
    try {
        const origin = `http://127.0.0.1:${port}`;
        if (process.env.SURVEY_ENGINE !== 'webkit') await run('chromium', chromium, origin);
        if (process.env.SURVEY_ENGINE !== 'chromium') await run('webkit', webkit, origin);
    } finally { server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
