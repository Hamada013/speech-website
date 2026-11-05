const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.ASD_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../../..'),overrides=new Map();let online=true;
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+pathname);if(!online){res.writeHead(503).end();return;}if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}const override=overrides.get(file);fs.readFile(file,(error,data)=>{if(error&&!override){res.writeHead(404).end();return;}res.writeHead(override?.status||200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(override?.body||data);});});
function readRelease(folder){const context={self:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'forms/ASD',folder,'assets/pwa-release.js'),'utf8'),context);return JSON.parse(JSON.stringify(context.self.ASSESSMENT_RELEASE));}
function release(folder,version){const appRoot=path.join(root,'forms/ASD',folder),next={...readRelease(folder),version,integrity:{}};for(const file of next.shell){const full=path.resolve(appRoot,file);next.integrity[file]=crypto.createHash('sha256').update(overrides.get(full)?.body||fs.readFileSync(full)).digest('hex');}overrides.set(path.join(appRoot,'assets/pwa-release.js'),{body:Buffer.from('self.ASSESSMENT_RELEASE = '+JSON.stringify(next)+';')});}
const visible=(p,s)=>p.locator(s).waitFor({state:'visible'});
async function run(engine,name){const browser=await engine.launch(name==='chromium'?{channel:'chrome'}:{});try{const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage();page.setDefaultTimeout(12000);for(const folder of ['BALF','M-CHAT']){
 const appRoot=path.join(root,'forms/ASD',folder),url=`http://127.0.0.1:${server.address().port}/forms/ASD/${folder}/index.html`;
 await page.goto(url);await visible(page,'#new-button');await page.waitForFunction(async()=>Boolean((await navigator.serviceWorker.getRegistration())?.active));await page.reload();await visible(page,'#new-button');await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await page.locator('#new-button').click();await page.locator('#child-name').fill('QA saved child');
 const key=folder==='BALF'?'asd-blaf-records-v1':'asd-mchat-records-v1',before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
 const entry=path.join(appRoot,'assets/app.js'),marker=`QA-update-${name}-${folder}`;
 // A failed device save exists before a genuine waiting-worker update offer.
 await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('QA full');};});await page.locator('input[name=clinician]').fill('QA unsaved');
 overrides.set(entry,{body:Buffer.concat([fs.readFileSync(entry),Buffer.from('\n/* '+marker+' */')])});release(folder,'update-'+name);
 await page.evaluate(()=>navigator.serviceWorker.getRegistration().then(r=>r.update()));await page.waitForFunction(async()=>Boolean((await navigator.serviceWorker.getRegistration())?.waiting));await visible(page,'#update-dialog');
 await page.locator('#update-now').click();assert.equal(await page.locator('#update-dialog').isVisible(),true,'An unsaved form blocks update activation');await page.locator('#update-later').click();
 await page.evaluate(()=>{Storage.prototype.setItem=window.originalSet;});await page.locator('#retry-save').click();
 assert.equal(await page.evaluate(async marker=>(await fetch('assets/app.js').then(r=>r.text())).includes(marker),marker),false,'Deferring preserves active cached JS');
 online=false;await page.reload();await visible(page,'#new-button');if(await page.locator('#update-dialog').isVisible())await page.locator('#update-later').click();await page.locator('#resume-button').click();assert.equal(await page.locator('#child-name').inputValue(),'QA saved child');online=true;
 await page.reload();await visible(page,'#update-dialog');const reloaded=page.waitForEvent('load');await page.locator('#update-now').click();await reloaded;await visible(page,'#new-button');
 await page.waitForFunction(async marker=>(await fetch('assets/app.js').then(r=>r.text())).includes(marker),marker);
 const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.equal(after.sessions.length,before.sessions.length);assert.equal(after.sessions[0].meta.child,'QA saved child');
 // Fail a distinct subsequent release; the previous complete release must remain usable.
 release(folder,'failed-'+name);overrides.set(path.join(appRoot,'assets/icons/icon-192.png'),{status:500,body:Buffer.from('QA broken')});
 await page.evaluate(async()=>{window.failedUpdate=false;const r=await navigator.serviceWorker.getRegistration();r.addEventListener('updatefound',()=>{const worker=r.installing;worker.addEventListener('statechange',()=>{if(worker.state==='redundant')window.failedUpdate=true;});});await r.update();});
 await page.waitForFunction(()=>window.failedUpdate,null,{timeout:25000});assert.equal(await page.evaluate(async()=>Boolean((await navigator.serviceWorker.getRegistration()).waiting)),false);
 online=false;await page.reload();await visible(page,'#new-button');assert.equal(await page.evaluate(async marker=>(await fetch('assets/app.js').then(r=>r.text())).includes(marker),marker),true);online=true;
 overrides.clear();console.log(`PASS ${name} ${folder}: update deferral, explicit activation, saved-record retention, failed-release rollback and verified cached runtime`);
 }await context.close();}finally{online=true;overrides.clear();await browser.close();}}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await run(chromium,'chromium');if(!process.env.ASD_SKIP_WEBKIT)await run(webkit,'webkit');}finally{server.close();server.closeAllConnections();}})().catch(e=>{console.error(e);process.exitCode=1;});
