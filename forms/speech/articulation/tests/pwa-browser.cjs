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
    await page.addLocatorHandler(page.locator('#cloudDialog[open]'),()=>page.locator('#skipCloud').click());
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
    await page.locator('#welcomeLaunch').waitFor({state:'hidden'});
    await page.locator('#homeAccounts').click();await page.locator('#caseName').fill('حالة دون إنترنت');await page.locator('#createChildButton').click();
    await page.locator('[data-page="screen"]').first().click();
    await page.locator('[data-score="correct"]').click();
    await page.locator('.workplace [data-page="home"]').click();
    await page.locator('#downloadButton').click();
    await page.locator('#downloadStart').click();await page.waitForFunction(()=>document.getElementById('downloadProgress').value===100);
    if (name==='webkit'){await page.locator('#pwaInstall').click();assert.match(await page.locator('#pwaInstallHelp').textContent(),/iPhone.*Share/);}
    await page.evaluate(()=>{const event=new Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>{window.installPromptCalled=true;};event.userChoice=Promise.resolve({outcome:'dismissed'});window.dispatchEvent(event);});
    await page.locator('#pwaInstall').click();assert.equal(await page.evaluate(()=>window.installPromptCalled),true);
    await page.locator('[data-close="downloadDialog"]').click();
    await offline(context,name,true);
    await page.reload({waitUntil:'load'});await ready(page);await page.locator('#welcomeLaunch').waitFor({state:'hidden'});
    assert.equal(await page.evaluate(()=>state.trials['s1-0'].status),'correct','Autosave restored offline');
    const offlineFiles=await page.evaluate(async files=>{const results=[];for(const file of files)results.push((await fetch(file)).ok);return results;},original.shell);
    assert.ok(offlineFiles.every(Boolean),'Every shipped file works offline');
    await page.locator('#continueAssessment').click();
    const pictures=await page.evaluate(async()=>{for(let i=0;i<allProbes.length;i++){selectPicture(i);const image=document.querySelector('#trials .picture-frame img');await image.decode();if(!image.naturalWidth||image.hidden)throw Error('Broken picture '+allProbes[i].image);}selectPicture(0);return allProbes.length;});
    assert.equal(pictures,84);
    await page.locator('.workplace [data-page="home"]').click();
    const cold=await context.newPage();await cold.goto(base+'?source=home-screen');await ready(cold);assert.equal(await cold.evaluate(()=>state.trials['s1-0'].status),'correct','Offline cold launch retains child progress');await cold.close();
    await offline(context,name,false);
    const newCSS = Buffer.concat([fs.readFileSync(path.join(root, 'assets/styles.css')), Buffer.from('\n/* verified test update */')]);
    overrides.set('assets/styles.css', { body: newCSS });
    release(`test-update-${name}`);
    await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration()).update(); });
    await page.waitForFunction(()=>!document.getElementById('pwaUpdate').hidden,null,{timeout:20000});
    assert.equal(await page.evaluate(async version => (await caches.keys()).some(key => key.endsWith(version)), original.version), true, 'Waiting update retains the active release');
    // A failed device save blocks activation; successful autosave permits it.
    await page.locator('#downloadButton').click();
    await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota');};});
    await page.locator('#pwaUpdate').click();assert(await page.locator('#pwaError').isVisible());assert.equal(await page.evaluate(()=>state.trials['s1-0'].status),'correct');
    await page.evaluate(()=>{Storage.prototype.setItem=window.originalSetItem;});
    await Promise.all([page.waitForEvent('load'),page.locator('#pwaUpdate').click()]);
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
    console.log(`PASS ${name}: nested-path installation, manifest, icons, all assets/69 WebPs/84 probes offline, device cases and cold launch, download progress, install prompt/help, save-failure update guard, safe updates, failed-release rollback and other-app isolation`);
  } finally { await offline(context, name, false); await context.close(); await browser?.close(); if (profile) fs.rmSync(profile, { recursive: true, force: true }); overrides.clear(); }
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); port = server.address().port;
  try { if (!process.env.ARTICULATION_ONLY_WEBKIT) await run(chromium, 'chromium'); if (!process.env.ARTICULATION_SKIP_WEBKIT) await run(webkit, 'webkit'); }
  catch (error) { console.error(error); process.exitCode = 1; }
  finally { server.close(); server.closeAllConnections(); }
})();
