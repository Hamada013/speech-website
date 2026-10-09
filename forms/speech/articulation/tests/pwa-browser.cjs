const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const os = require('node:os');
const { chromium, webkit } = require(process.env.ARTICULATION_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const prefix = '/speech-website/forms/speech/articulation/';
const overrides = new Map();
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/outside.html') { res.setHeader('Content-Type', 'text/html'); res.end('<html><body>Another app</body></html>'); return; }
  const relative = pathname.slice(prefix.length) || 'index.html';
  const file = path.resolve(root, relative);
  if (!pathname.startsWith(prefix) || !file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  const override = overrides.get(relative);
  res.writeHead(override?.status || 200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(override?.body || fs.readFileSync(file));
});
const releaseVM = vm.createContext({ self: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'assets/pwa-release.js'), 'utf8'), releaseVM);
const original = JSON.parse(JSON.stringify(releaseVM.self.ARTICULATION_RELEASE));
function release(version) {
  const next = { ...original, version, integrity: {} };
  for (const file of next.shell) next.integrity[file] = 'sha256-' + crypto.createHash('sha256').update(overrides.get(file)?.body || fs.readFileSync(path.join(root, file))).digest('base64');
  overrides.set('assets/pwa-release.js', { body: Buffer.from('self.ARTICULATION_RELEASE = ' + JSON.stringify(next) + ';') });
}
let port;
async function offline(context, name, value) {
  // WebKit's emulated offline mode can reject cached worker responses. Stop the
  // origin in both engines to verify real network loss without that limitation.
  if (name === 'chromium') await context.setOffline(value);
  if (value && server.listening) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
  if (!value && !server.listening) await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
}
async function ready(page) {
  await page.waitForFunction(() => navigator.serviceWorker.controller && document.getElementById('pwaStatus')?.textContent.match(/جاهز|Ready/), null, { timeout: 20000 });
}
const click = (page, name) => page.getByRole('button', { name, exact: true }).click();
async function run(type, name) {
  overrides.clear();
  const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const profile = name === 'chromium' ? fs.mkdtempSync(path.join(os.tmpdir(), 'articulation-pwa-')) : null;
  const options = { headless: true, ...(name === 'chromium' && fs.existsSync(chrome) ? { executablePath: chrome } : {}) };
  const contextOptions = { viewport: { width: 320, height: 740 }, hasTouch: true, serviceWorkers: 'allow', reducedMotion: 'reduce' };
  // Playwright's macOS WebKit persistent profiles discard CacheStorage bodies.
  // Use its normal context, as in the site's existing WebKit offline tests.
  const browser = name === 'webkit' ? await type.launch(options) : null;
  const context = browser ? await browser.newContext(contextOptions) : await type.launchPersistentContext(profile, { ...options, ...contextOptions });
  try {
    const page = await context.newPage(); page.setDefaultTimeout(10000);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const base = `http://127.0.0.1:${port}` + encodeURI(prefix);
    await page.goto(base + 'index.html');
    await ready(page);
    const manifest = await page.evaluate(async () => {
      const href = document.querySelector('link[rel=manifest]').href;
      return { href, json: await (await fetch(href)).json() };
    });
    assert.equal(manifest.json.display, 'standalone');
    assert.equal(new URL(manifest.json.scope, manifest.href).href, base);
    assert.equal(new URL(manifest.json.start_url, manifest.href).href, base + 'index.html');
    const icons = await page.evaluate(async icons => {
      const result = [];
      for (const icon of icons) { const image = new Image(); image.src = icon.src; await image.decode(); result.push([image.naturalWidth, image.naturalHeight]); }
      return result;
    }, manifest.json.icons);
    assert.deepEqual(icons, [[192, 192], [512, 512], [512, 512]]);
    const registration = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return { scope: reg.scope, script: reg.active.scriptURL };
    });
    assert.equal(registration.scope, base);
    assert.equal(registration.script, base + 'sw.js');
    if (name === 'chromium') {
      const cdp = await context.newCDPSession(page);
      const manifestResult = await cdp.send('Page.getAppManifest');
      assert.deepEqual(manifestResult.errors, []);
      const installability = await cdp.send('Page.getInstallabilityErrors');
      assert.deepEqual(installability.installabilityErrors, [], 'Chromium installability requirements');
      await cdp.detach();
    }
    await page.evaluate(async () => {
      await (await caches.open('another-app-cache')).put('/outside-data', new Response('preserve'));
      await (await caches.open('arabic-articulation:another-scope:shell:old')).put('/other-articulation-data', new Response('preserve'));
    });
    await page.locator('#pwaPanel').evaluate(node => { node.open = true; });
    if (name === 'webkit') {
      await page.locator('#pwaInstall').click();
      assert.match(await page.locator('#pwaInstallHelp').textContent(), /iPhone.*Share/);
    }
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt', { cancelable: true });
      event.prompt = async () => { window.installPromptCalled = true; };
      event.userChoice = Promise.resolve({ outcome: 'dismissed' });
      window.dispatchEvent(event);
    });
    await page.locator('#pwaInstall').click();
    assert.equal(await page.evaluate(() => window.installPromptCalled), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (process.env.ARTICULATION_PWA_DEBUG) console.log(name, 'cache before offline', await page.evaluate(async () => { const names = await caches.keys(); const entries = {}; for (const key of names) entries[key] = (await (await caches.open(key)).keys()).map(request => request.url); return { entries, controller: navigator.serviceWorker.controller?.scriptURL }; }));
    await offline(context, name, true);
    if (process.env.ARTICULATION_PWA_DEBUG) console.log(name, 'offline entry', await page.evaluate(async () => { const key = new URL('index.html', document.baseURI).href; const entries = []; for (const name of await caches.keys()) entries.push([name, Boolean(await (await caches.open(name)).match(key))]); return { key, entries, fetch: await fetch(key).then(response => response.status).catch(error => error.message) }; }));
    await page.reload({ waitUntil: 'load' }); await ready(page);
    assert.equal(await page.evaluate(async () => { try { await fetch('/network-probe'); return true; } catch { return false; } }), false);
    const offlineFiles = await page.evaluate(async files => {
      const result = [];
      for (const file of files) { const response = await fetch(file); result.push(response.ok); }
      return result;
    }, original.shell);
    assert.ok(offlineFiles.every(Boolean), 'Every shipped asset must work offline');
    // All 84 probes must resolve their mapped picture with the network unavailable.
    await page.locator('[data-page="screen"]').first().click();
    const pictures = await page.evaluate(async () => {
      for (let i = 0; i < allProbes.length; i++) {
        selectPicture(i);
        const image = document.querySelector('#trials .picture-frame img');
        await image.decode();
        if (!image.naturalWidth || image.hidden) throw new Error('Broken picture ' + allProbes[i].image);
      }
      selectPicture(0); return allProbes.length;
    });
    assert.equal(pictures, 84);
    for (const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390},{width:768,height:1024},{width:1280,height:800}]) {
      await page.setViewportSize(viewport);
      const layout = await page.evaluate(() => {
        const rect = document.querySelector('#trials .picture-frame').getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth > innerWidth, square: Math.abs(rect.width-rect.height)<2, arrow: document.querySelector('#nextPicture').getBoundingClientRect().height };
      });
      assert.equal(layout.overflow, false, name + ' overflow at ' + viewport.width);
      assert.ok(layout.square, 'Square picture canvas'); assert.ok(layout.arrow>=44, 'Touch navigation');
    }
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:`/private/tmp/articulation-screen-${name}.png`, fullPage:true});
    await page.locator('[data-picture]').tap();
    await page.locator('#childPicture img').evaluate(image => image.decode());
    assert.equal(await page.locator('#childPicture .word').count(), 0);
    await page.locator('#closePicture').click();
    await page.locator('[data-score="correct"]').click();
    assert.equal(await page.evaluate(() => state.trials['s1-0'].status), 'correct');
    await page.locator('#nextPicture').click();
    await page.locator('[data-score="substitution"]').click();
    await page.locator('#closeSound').click();
    assert.equal(await page.evaluate(() => state.trials['s1-1']?.status), undefined);
    await page.locator('[data-score="substitution"]').click();
    await page.locator('[data-phoneme="0"]').click();
    assert.equal(await page.evaluate(() => state.trials['s1-1'].status), 'substitution');
    await page.locator('#reportButton').click();
    const arabicDownload = page.waitForEvent('download'); await page.locator('#exportText').click();
    const arabic = await arabicDownload;
    assert.match(fs.readFileSync(await arabic.path(), 'utf8'), /تقرير/);
    await page.locator('.report-language [role=combobox]').click();
    await page.getByRole('option', {name:'English', exact:true}).click();
    assert.equal(await page.locator('#reportLanguage').inputValue(), 'en');
    // Actual touch events exercise the phone selection path as well as mouse click.
    await page.locator('.report-language [role=combobox]').tap();
    await page.getByRole('option', {name:'العربية', exact:true}).tap();
    assert.equal(await page.locator('#reportLanguage').inputValue(), 'ar');
    await page.locator('.report-language [role=combobox]').tap();
    await page.getByRole('option', {name:'English', exact:true}).tap();
    assert.match(await page.locator('#reportPreview').textContent(), /Arabic Speech Sound Screening Report/);
    const englishDownload = page.waitForEvent('download'); await page.locator('#exportText').click();
    const english = await englishDownload;
    assert.match(fs.readFileSync(await english.path(), 'utf8'), /Arabic Speech Sound Screening Report/);
    await page.screenshot({path:`/private/tmp/articulation-report-${name}.png`,fullPage:true});
    await page.locator('#closeReport').click();
    await page.locator('#remember').check();
    await page.reload({waitUntil:'load'}); await ready(page);
    assert.equal(await page.evaluate(() => state.trials['s1-0'].status), 'correct', 'Offline draft restore');
    await page.locator('#remember').uncheck();
    assert.equal(await page.evaluate(() => localStorage.getItem(KEY)), null);
    // Launch the installed-app entry point in a new tab without a live origin.
    const cold = await context.newPage();
    await cold.goto(base + '?source=home-screen'); await ready(cold);
    assert.equal(await cold.evaluate(() => Object.keys(state.trials).length), 0, 'Drafts remain opt-in');
    await cold.locator('[data-page="screen"]').first().click();
    await cold.locator('#trials img').evaluate(image => image.decode());
    await cold.close();
    await offline(context, name, false);
    const newCSS = Buffer.concat([fs.readFileSync(path.join(root, 'assets/styles.css')), Buffer.from('\n/* verified test update */')]);
    overrides.set('assets/styles.css', { body: newCSS });
    release(`test-update-${name}`);
    await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration()).update(); });
    await page.locator('#pwaUpdate').waitFor({ state: 'visible', timeout: 20000 });
    assert.equal(await page.evaluate(async version => (await caches.keys()).some(key => key.endsWith(version)), original.version), true, 'Waiting update retains the active release');
    // An update cannot reload an unsaved assessment without explicit consent.
    assert.equal(await page.evaluate(() => state.trials['s1-0'].status), 'correct');
    await page.locator('#pwaUpdate').click();
    await page.locator('#pwaUpdateDialog').waitFor({state:'visible'});
    await page.locator('#pwaCancelUpdate').click();
    assert.equal(await page.evaluate(() => state.trials['s1-0'].status), 'correct');
    await page.locator('#remember').check();
    await Promise.all([page.waitForEvent('load'), page.locator('#pwaUpdate').click()]);
    await ready(page);
    assert.equal(await page.evaluate(async version => (await caches.keys()).some(key => key.endsWith(version)), original.version), false);
    assert.ok(await page.evaluate(async () => (await fetch('assets/styles.css').then(response => response.text())).includes('verified test update')));
    assert.equal(await page.evaluate(() => state.trials['s1-0'].status), 'correct', 'Saved case survives update');
    release(`broken-${name}`);
    overrides.set('assets/styles.css', { status: 503, body: Buffer.from('unavailable') });
    await page.evaluate(async () => {
      window.failedUpdate = false;
      const registration = await navigator.serviceWorker.getRegistration();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker.addEventListener('statechange', () => { if (worker.state === 'redundant') window.failedUpdate = true; });
      });
      await registration.update().catch(() => {});
    });
    await page.waitForFunction(() => window.failedUpdate, null, { timeout: 20000 });
    assert.equal(await page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting)), false);
    await offline(context, name, true);
    await page.reload({ waitUntil: 'load' }); await ready(page);
    assert.ok(await page.evaluate(async () => (await fetch('assets/styles.css').then(response => response.text())).includes('verified test update')), 'Failed deployment must preserve the working offline release');
    const cachesRemaining = await page.evaluate(() => caches.keys());
    assert.ok(cachesRemaining.includes('another-app-cache'));
    assert.ok(cachesRemaining.includes('arabic-articulation:another-scope:shell:old'));
    await offline(context, name, false);
    const outside = await context.newPage(); await outside.goto(`http://127.0.0.1:${port}/outside.html`);
    assert.equal(await outside.evaluate(() => navigator.serviceWorker.controller), null);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `/private/tmp/articulation-pwa-${name}.png`, fullPage: true });
    console.log(`PASS ${name}: nested-path installation, icons, all 69 WebPs/84 probes offline, phone/tablet layout, scoring, bilingual TXT, drafts and cold launch, install help, unsaved-case update guard, safe updates, failed-release rollback and other-app isolation`);
  } finally { await offline(context, name, false); await context.close(); await browser?.close(); if (profile) fs.rmSync(profile, { recursive: true, force: true }); overrides.clear(); }
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); port = server.address().port;
  try { if (!process.env.ARTICULATION_ONLY_WEBKIT) await run(chromium, 'chromium'); if (!process.env.ARTICULATION_SKIP_WEBKIT) await run(webkit, 'webkit'); }
  catch (error) { console.error(error); process.exitCode = 1; }
  finally { server.close(); server.closeAllConnections(); }
})();
