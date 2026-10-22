// Production worker/client with small real catalogs, or the entire media bank.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.APP_PLAYWRIGHT||'../voc/node_modules/playwright');
const root=path.resolve(__dirname,'..'),prefix='/speech-website/tools/VSS/';
const context={self:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/pwa-release.js'),'utf8'),context);
const release=JSON.parse(JSON.stringify(context.self.VSS_RELEASE));
const full=!!process.env.APP_FULL_CATALOG;
if(!full)release.media=['voc','senb','taffaha'].flatMap(module=>['.webp','.m4a'].flatMap(ext=>release.media.filter(a=>a.module===module&&a.url.endsWith(ext)).slice(0,3)));
release.version='vss-initial';
const overrides=new Map(),types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.m4a':'audio/mp4'};
let releaseGate,openGate,failShell=true,port,browser,testingOffline=false;
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!pathname.startsWith(prefix))return res.writeHead(404).end();
  let file=pathname.slice(prefix.length)||'index.html';if(file.endsWith('/'))file+='index.html';
  if(file.split('/').includes('..'))return res.writeHead(403).end();
  if(file==='voc/assets/navigation/taffaha.webp'){
   if(releaseGate)await releaseGate;
   if(failShell){failShell=false;return res.writeHead(503).end();}
  }
  const body=file==='assets/pwa-release.js'?Buffer.from('self.VSS_RELEASE='+JSON.stringify(release)+';'):overrides.get(file)||await fs.promises.readFile(path.join(root,file));
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404).end();}
});
async function offline(ctx,value){
 testingOffline=value;
 if(process.env.APP_ENGINE!=='webkit')return ctx.setOffline(value);
 if(value&&server.listening)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
 else if(!value&&!server.listening)await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
}
const controls={voc:['[data-open-download]','[data-offline-dialog]','[data-offline-status]'],senb:['#pwaDownloadToggle','#offlinePanel','#offlineStatus'],taffaha:['#open-offline','#offline-dialog','#download-status']};
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));port=server.address().port;
 const base=`http://127.0.0.1:${port}${prefix}`,engine=process.env.APP_ENGINE==='webkit'?webkit:chromium;
 browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await ctx.addInitScript(()=>{
  if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'vss-qa',children:[{id:'vss-qa',name:'اختبار VSS',words:{'1_1':{custom:'preserve'}},sessions:[],senb:{sessions:[]},taffaha:{attempts:[]}}]}));
 });
 await ctx.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
 await ctx.route('https://fonts.gstatic.com/**',route=>route.abort());
 let page=await ctx.newPage();page.setDefaultTimeout(60000);const errors=[];page.on('pageerror',e=>{
  // WebKit reports a caught worker-registration network failure as a page error
  // when this test deliberately stops the origin. Offline rendering still runs.
  if(testingOffline&&process.env.APP_ENGINE==='webkit'&&/\/sw\.js due to access control checks\.$/.test(e.message))return;
  errors.push(e.message);
 });
 releaseGate=new Promise(resolve=>openGate=resolve);
 try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!window.SuiteWelcome?.pending);
  assert.equal(await page.title(),'VSS — كلمات وجمل ومقاطع');
  for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Home fits the viewport');
   assert.equal(await page.locator('.vss-activities a').count(),3);
  }
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(200);
  await page.screenshot({path:`/private/tmp/vss-home-${process.env.APP_ENGINE||'chrome'}.png`,fullPage:true});
  // An early click waits for the whole suite shell. A failed shell can retry.
  await page.locator('[data-open-download]').click();await page.locator('[data-offline-download]').click();
  await page.locator('[data-offline-download][aria-busy=true]').waitFor();
  openGate();releaseGate=null;
  await page.locator('[data-offline-error]:visible').waitFor();
  await page.waitForFunction(()=>!document.querySelector('[data-offline-download]').disabled);
  await page.locator('[data-offline-download]').click();
  await page.waitForFunction(()=>document.querySelector('[data-offline-status]').textContent==='100%',{},{timeout:full?300000:60000});
  assert.equal(await page.locator('[data-offline-error]:visible').count(),0);
  await page.keyboard.press('Escape');
  const registration=await page.evaluate(async()=>{const registrations=await navigator.serviceWorker.getRegistrations();return registrations.map(r=>({scope:r.scope,worker:r.active?.scriptURL}));});
  assert.deepEqual(registration,[{scope:base,worker:base+'sw.js'}]);
  for(const module of ['voc','senb','taffaha']){
   await page.goto(base+module+'/index.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.AppNavigation&&window.VSSOffline&&!window.SuiteWelcome?.pending);
   assert.equal(await page.evaluate(()=>document.querySelector('link[rel=manifest]').href),base+'manifest.webmanifest');
   assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'sw.js');
   const [toggle,,status]=controls[module];await page.locator(toggle).click();
   await page.waitForFunction(selector=>document.querySelector(selector).textContent==='100%',status);
   await page.keyboard.press('Escape');
   const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('voc-children-v1')));
   assert.equal(stored.active,'vss-qa');assert.equal(stored.children[0].words['1_1'].custom,'preserve');
  }
  // The real 1-2-3 picker stays in this window and inside the installed scope.
  await page.locator('[data-suite-apps]:visible').click();await page.locator('[data-suite-app=voc]').click();
  await page.waitForURL(base+'voc/index.html');assert.equal(ctx.pages().length,1);
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'sw.js');
  await offline(ctx,true);
  for(const route of ['index.html','voc/index.html','voc/games.html','voc/matching.html','voc/memory.html','voc/rapid.html','voc/test.html','voc/report.html','senb/index.html','taffaha/index.html']){
   const response=await page.goto(base+route+'?offline=1',{waitUntil:'domcontentloaded'});assert.equal(response.status(),200,route);
  }
  // Each module's real audio remains available, including Safari byte ranges.
  for(const module of ['voc','senb','taffaha']){
   const asset=release.media.find(a=>a.module===module&&a.url.endsWith('.m4a'));
   const result=await page.evaluate(async url=>{const r=await fetch(url,{headers:{Range:'bytes=0-31'}});return {status:r.status,bytes:[...new Uint8Array(await r.arrayBuffer())],range:r.headers.get('Content-Range')};},base+asset.url);
   assert.equal(result.status,206);assert.deepEqual(result.bytes,[...fs.readFileSync(path.join(root,asset.url)).subarray(0,32)]);assert.match(result.range,/^bytes 0-31\//);
  }
  await offline(ctx,false);
  // One update replaces the full suite and reloads all open module windows.
  await page.goto(base+'voc/index.html',{waitUntil:'domcontentloaded'});
  const second=await ctx.newPage();second.setDefaultTimeout(60000);await second.goto(base+'senb/index.html',{waitUntil:'domcontentloaded'});
  await second.waitForFunction(()=>window.AppUpdates&&window.VSSOffline);
  const before=await page.evaluate(async()=>VSSOffline.send('VSS_STATUS'));
  const changed='assets/home.css',body=Buffer.concat([fs.readFileSync(path.join(root,changed)),Buffer.from('\n/* VSS update fixture */\n')]);
  overrides.set(changed,body);release.integrity[changed]='sha256-'+crypto.createHash('sha256').update(body).digest('base64');release.version='vss-updated';
  // Also publish replacement audio so a media-only revision participates in updates.
  const clip=release.media.find(a=>a.module==='taffaha'&&a.url.endsWith('.m4a'));
  const replacement=fs.readFileSync(path.join(root,release.media.find(a=>a.module==='taffaha'&&a.url.endsWith('.m4a')&&a.url!==clip.url).url));
  overrides.set(clip.url,replacement);clip.bytes=replacement.length;clip.revision=crypto.createHash('sha256').update(replacement).digest('hex');
  await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update();});
  await page.locator('#app-update-dialog[open]').waitFor();await page.locator('[data-update-later]').click();
  assert.equal((await page.evaluate(async()=>VSSOffline.send('VSS_STATUS'))).version,before.version,'Later keeps the complete previous release');
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#app-update-dialog[open]').waitFor();
  const oneReload=page.waitForEvent('domcontentloaded'),twoReload=second.waitForEvent('domcontentloaded');
  await page.locator('[data-update-accept]').click();await Promise.all([oneReload,twoReload]);
  await page.waitForFunction(async()=>window.VSSOffline&&(await VSSOffline.send('VSS_STATUS')).version==='vss-updated');
  await second.waitForFunction(async()=>window.VSSOffline&&(await VSSOffline.send('VSS_STATUS')).version==='vss-updated');
  const next=await page.evaluate(async()=>VSSOffline.send('VSS_STATUS'));assert.equal(next.done,next.total-1,'Only the changed media needs downloading again');
  await page.locator('[data-open-download]').click();await page.locator('[data-offline-download]').click();await page.waitForFunction(()=>document.querySelector('[data-offline-status]').textContent==='100%');
  assert.deepEqual(await page.evaluate(async url=>[...new Uint8Array(await(await fetch(url)).arrayBuffer())],base+clip.url),[...replacement]);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('voc-children-v1')).children[0].words['1_1'].custom),'preserve');
  assert.deepEqual(errors,[]);
  await second.close();await ctx.close();
  // First use of VSS still creates the shared child account through the welcome.
  const fresh=await browser.newContext({reducedMotion:'reduce',serviceWorkers:'block'}),first=await fresh.newPage();
  await first.goto(base,{waitUntil:'domcontentloaded'});await first.locator('#suite-welcome form:not([hidden])').waitFor();
  await first.locator('#suite-welcome-name').fill('نور');await first.locator('#suite-welcome button[type=submit]').click();
  await first.waitForFunction(()=>!window.SuiteWelcome.pending);await first.locator('a[href="voc/index.html"]').click();
  await first.waitForFunction(()=>window.VocProgress?.active()?.name==='نور');assert.equal(await first.locator('#suite-welcome[open]').count(),0);
  await fresh.close();
  console.log(`PASS: VSS home, first child, early download/failure/retry, one worker, three shared downloads (${release.media.length} files), same-window switching, offline activities/audio ranges, deferred/atomic updates in two windows, changed-media reuse and saved progress.`);
 }finally{openGate?.();await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
