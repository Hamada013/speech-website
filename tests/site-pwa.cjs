'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),vm=require('node:vm');
const {chromium,webkit}=require(process.env.SITE_PLAYWRIGHT||'playwright'),pages=require('../scripts/site-pages.cjs'),root=path.resolve(__dirname,'..'),release={self:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/site/pwa-release.js'),'utf8'),release);
let mode='initial',browser;
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://local');if(!url.pathname.startsWith('/speech-website/')){res.writeHead(404).end();return;}const file=path.resolve(root,decodeURIComponent(url.pathname.slice('/speech-website/'.length))||'index.html');if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}let body=fs.readFileSync(file);if(file.endsWith('/sw.js'))body+='\n// Test release '+mode;if(file.endsWith('/pwa-release.js')&&mode!=='initial')body+=`\nself.SPEECH_SITE_RELEASE.version += '-${mode}';`+(mode==='broken'?`self.SPEECH_SITE_RELEASE.integrity['assets/site/app.css']='invalid';`:'');res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);});
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const engine=process.env.SITE_ENGINE||'chromium';browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 const context=await browser.newContext({serviceWorkers:'allow',reducedMotion:'reduce',viewport:{width:390,height:844}}),page=await context.newPage(),base=`http://127.0.0.1:${server.address().port}/speech-website/`;
 await page.goto(base+'index.html');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));assert.equal(manifest.display,'standalone');assert.equal(new URL(manifest.start_url,base+'manifest.webmanifest').href,base+'index.html');
 const count=await page.evaluate(async()=>{const names=await caches.keys(),cache=await caches.open(names.find(n=>n.startsWith('speech-site-shell-')));return(await cache.keys()).length;});assert.equal(count,release.self.SPEECH_SITE_RELEASE.shell.length);
 await page.evaluate(()=>caches.open('unrelated-app-cache').then(c=>c.put(new Request(location.origin+'/unrelated-entry'),new Response('keep'))));
 const update=()=>page.evaluate(async()=>{const registration=await navigator.serviceWorker.getRegistration();const result=new Promise(resolve=>registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker.addEventListener('statechange',()=>{if(['activated','redundant'].includes(worker.state))resolve(worker.state);});},{once:true}));await registration.update();return result;});
 mode='updated';assert.equal(await update(),'activated');await page.reload();
 assert(await page.evaluate(async()=>(await caches.keys()).includes('unrelated-app-cache')),'Root worker preserves app caches');
 mode='broken';assert.equal(await update(),'redundant');assert(!(await page.evaluate(()=>caches.keys())).some(name=>name.endsWith('-broken')),'Incomplete release is discarded');
 if(process.env.SITE_DEBUG)console.log(await page.evaluate(async()=>({controller:navigator.serviceWorker.controller?.state,caches:await Promise.all((await caches.keys()).map(async name=>({name,entries:(await(await caches.open(name)).keys()).length})))})));
 // WebKit's emulated offline flag rejects even literal worker responses:
 // https://github.com/microsoft/playwright/issues/42775
 // Stop the origin instead, so every successful page must come from the worker.
 if(engine==='webkit')await new Promise((resolve,reject)=>{server.close(error=>error?reject(error):resolve());server.closeAllConnections();});else await context.setOffline(true);
 for(const entry of pages){await page.goto(base+entry.path+'?lang=ar');await page.locator('h1').waitFor();assert.equal(await page.locator('h1').textContent(),entry.ar);assert(await page.locator('.hero-logo').evaluate(el=>el.complete&&el.naturalWidth>0));assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).overflow),'hidden');}
 await page.goto(base);assert.equal(await page.locator('h1').textContent(),'أحمد غانم');
 assert.equal(await page.evaluate(async()=>{try{await fetch(new URL('forms/speech/articulation/index.html',location.href));return false;}catch{return true;}}),true,'Root cache does not take over or cache subapp pages');
 await context.close();console.log(`PASS ${engine}: installable manifest, complete verified cache, successful update, failed-update recovery, all 12 directories offline with Arabic query strings, and independent app caches/routes.`);
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server.listening)server.close();});
