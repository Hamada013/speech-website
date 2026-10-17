// Serve Taffaha alone; simulate deployed releases without modifying repo files.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require(process.env.TAFFAHA_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),ctx={self:{}},sha=b=>crypto.createHash('sha256').update(b).digest('hex');
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/pwa-release.js'),'utf8'),ctx);
let release=ctx.self.TAFFAHA_RELEASE,overrides=new Map(),offline=false,server,browser;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.m4a':'audio/mp4'};
const requests=[],errors=[];
async function rpc(page,type){return page.evaluate(async type=>(await import('./offline.js')).rpc(type),type);}
function publish(file,body){
 overrides.set(file,body);release=JSON.parse(JSON.stringify(release));
 if(release.integrity[file])release.integrity[file]=sha(body);
 else{const asset=release.media.find(a=>a.url===file);asset.revision=sha(body);asset.bytes=body.length;}
 release.version=sha(JSON.stringify(release));
}
(async()=>{
 server=http.createServer(async(req,res)=>{
  try{
   if(offline)return res.destroy();
   const url=new URL(req.url,'http://localhost');requests.push(url.pathname);
   if(!url.pathname.startsWith('/standalone/'))return res.writeHead(404).end();
   const file=decodeURIComponent(url.pathname.slice('/standalone/'.length))||'index.html',target=path.resolve(root,file);
   if(!target.startsWith(root+path.sep))return res.writeHead(403).end();
   const body=file==='assets/pwa-release.js'?Buffer.from('self.TAFFAHA_RELEASE='+JSON.stringify(release)+';'):overrides.get(file)||await fs.promises.readFile(target);
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(body);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}/standalone/`;
 try{
  browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.locator('#open-offline').click();assert.equal(await page.locator('#offline-dialog button').count(),2);
  await page.locator('#install').click();assert.ok(await page.locator('#install-help').isVisible());
  await page.locator('#download').click();await page.waitForFunction(()=>!document.getElementById('download').disabled,null,{timeout:90000});
  const before=await rpc(page,'STATUS');assert.equal(before.groups.taffaha.count,360);assert.deepEqual(Object.keys(before.groups),['taffaha']);
  await page.keyboard.press('Escape');assert.ok(await page.locator('#offline-dialog').isHidden());
  await page.evaluate(()=>caches.open('other-app-sentinel').then(c=>c.put('/sentinel',new Response('ok'))));
  publish('styles.css',Buffer.concat([fs.readFileSync(path.join(root,'styles.css')),Buffer.from('\n/* Simulated deployed style change. */\n')]));
  // The foreground/online listener asks the worker to check the deployed URL.
  await page.evaluate(()=>{const original=Date.now;Date.now=()=>original()+120000;window.dispatchEvent(new Event('online'));});
  await page.locator('#update-notice').waitFor({state:'visible'});
  assert.ok(await page.locator('#offline-dialog').isHidden(),'Update notice appears outside download popup');
  await page.reload();await page.locator('#update-notice').waitFor({state:'visible'});
  // A second open window also reloads when the waiting worker activates.
  const second=await context.newPage();await second.goto(base);await second.locator('#update-notice').waitFor({state:'visible'});
  await Promise.all([page.waitForEvent('load'),second.waitForEvent('load'),page.locator('#apply-update').click()]);
  await page.waitForFunction(()=>document.getElementById('start-practice').disabled===false);
  const after=await rpc(page,'STATUS');assert.equal(after.version,release.version);assert.equal(after.groups.taffaha.count,360,'Unchanged downloads survive update');
  assert.ok(await page.locator('#update-notice').isHidden());
  assert.ok(await page.evaluate(()=>caches.has('other-app-sentinel')));
  assert.equal(await page.evaluate(async()=>(await caches.keys()).filter(n=>n.includes('shell:')).length),1);
  await second.close();
  // Asset-only publication must also trigger an update; changed bytes are fetched again.
  const changed='assets/sounds/2/1.m4a',replacement=fs.readFileSync(path.join(root,'assets/sounds/2/2.m4a'));
  publish(changed,replacement);
  await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update();});
  await page.locator('#update-notice').waitFor({state:'visible'});
  await Promise.all([page.waitForEvent('load'),page.locator('#apply-update').click()]);
  await page.waitForFunction(()=>document.getElementById('start-practice').disabled===false);
  const updated=await rpc(page,'STATUS');assert.equal(updated.version,release.version);assert.equal(updated.groups.taffaha.count,359);
  await page.locator('#open-offline').click();await page.locator('#download').click();await page.waitForFunction(()=>!document.getElementById('download').disabled);
  assert.equal((await rpc(page,'STATUS')).groups.taffaha.count,360);
  const digest=await page.evaluate(async url=>{const bytes=await(await fetch(url)).arrayBuffer();return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');},changed);
  assert.equal(digest,sha(replacement));
  assert.ok(requests.every(url=>url.startsWith('/standalone/')||url==='/favicon.ico'),'No source app requests');
  offline=true;await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.locator('#open-offline').click();await page.waitForFunction(()=>document.getElementById('download-status').textContent.includes('جاهز'));
  await page.keyboard.press('Escape');await page.locator('#start-practice').click();await page.waitForFunction(()=>!document.getElementById('word-image').dataset.loading&&document.getElementById('word-image').src.includes('/standalone/assets/images/'));
  assert.ok((await page.locator('#word-image').getAttribute('src')).includes('/standalone/assets/images/'));
  assert.deepEqual(errors,[]);
  console.log('PASS: standalone hosting, exact two-button popup, 360 local downloads, offline reopening, waiting-update recovery, multi-window reload, shell/media update notices and cache preservation.');
 }finally{await browser?.close();await new Promise(r=>{server.close(r);server.closeAllConnections();});}
})().catch(e=>{console.error(e);process.exitCode=1;});
