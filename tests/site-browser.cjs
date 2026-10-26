'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.SITE_PLAYWRIGHT||'playwright'),pages=require('../scripts/site-pages.cjs'),root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://local').pathname;if(!pathname.startsWith('/speech-website/')){res.writeHead(404).end();return;}let file=path.resolve(root,decodeURIComponent(pathname.slice('/speech-website/'.length))||'index.html');if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));});
let browser;
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const engine=process.env.SITE_ENGINE||'chromium';browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage(),base=`http://127.0.0.1:${server.address().port}/speech-website/`,errors=[],bad=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url());});
 for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:320,height:568},{width:667,height:375}]){
  await page.setViewportSize(viewport);
  for(const entry of pages){
   await page.goto(base+entry.path);await page.locator('h1').waitFor();
   assert.equal(await page.locator('h1').textContent(),entry.title);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${entry.path} overflows at ${viewport.width}`);
   assert(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),`${entry.path} scrolls at ${viewport.width}×${viewport.height}`);
   assert.equal(await page.locator('.hero-logo').evaluate(img=>img.complete&&img.naturalWidth>0),true);
   await page.locator('#language-toggle').click();assert.equal(await page.locator('html').getAttribute('dir'),'rtl');assert.equal(await page.locator('h1').textContent(),entry.ar);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${entry.path} RTL overflows at ${viewport.width}`);
   assert(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),`${entry.path} RTL scrolls at ${viewport.width}×${viewport.height}`);
   for(const card of await page.locator('[data-card]:visible').all()){const fits=await card.evaluate(el=>{const box=el.getBoundingClientRect(),copy=el.querySelector('.card-copy').getBoundingClientRect();return box.height>=60&&copy.bottom<=box.bottom-5;});assert(fits,`${entry.path} clips a card at ${viewport.width}×${viewport.height}`);}
   const reachable=new Set();do{for(const card of await page.locator('[data-card]:visible').all()){const info=await card.evaluate(el=>{const r=el.getBoundingClientRect(),c=el.querySelector('.card-copy').getBoundingClientRect();return {title:el.querySelector('h2').textContent,fits:r.height>=60&&c.bottom<=r.bottom-5,height:r.height};});if(!info.fits)await page.screenshot({path:'/tmp/speech-site-clipped.png'});assert(info.fits,`${entry.path} clips ${info.title} on page ${await page.locator('#page-status').textContent()} at ${viewport.width}×${viewport.height}; height ${info.height}`);reachable.add(info.title);}if(await page.locator('#next-page').isDisabled())break;await page.locator('#next-page').click();}while(true);assert.equal(reachable.size,entry.sections.reduce((n,s)=>n+s.cards.length,0),entry.path+' exposes every card through pagination');
   await page.locator('#language-toggle').click();
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'index.html');
 await page.locator('#menu-toggle').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');await page.waitForFunction(()=>document.querySelector('#navigation-drawer').getBoundingClientRect().left===0);assert.equal(await page.locator('#site-navigation a[aria-current="page"]').count(),1);await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#navigation-drawer').open);assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
 await page.locator('#language-toggle').click();await page.locator('#menu-toggle').click();await page.waitForFunction(()=>Math.abs(document.querySelector('#navigation-drawer').getBoundingClientRect().right-innerWidth)<1);await page.locator('#drawer-close').click();await page.waitForFunction(()=>!document.querySelector('#navigation-drawer').open);await page.locator('#language-toggle').click();
 await page.locator('[data-open-dialog="about"]').click();await page.locator('#about-dialog[open]').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('#about-dialog').evaluate(el=>el.open),false);
 await page.locator('.directory-card[href="forms.html"]').click();await page.waitForURL('**/forms.html');
 await page.locator('#directory-search').fill('zz-unmatched');assert.equal(await page.locator('#no-results').isVisible(),true);await page.locator('#directory-search').fill('السمع');assert.equal(await page.locator('[data-card]:visible').count(),1);await page.locator('#directory-search').fill('');
 await page.locator('#language-toggle').click();await page.goto(base+'tools/tools.html');assert.equal(await page.locator('html').getAttribute('lang'),'ar');await page.locator('#language-toggle').click();
 await page.locator('#directory-search').fill('memory');assert.equal(await page.locator('[data-card]:visible').count(),2);await page.locator('#directory-search').fill('');
 for(const [name,file,width] of [['home','index.html',1440],['home-mobile','index.html',390],['forms','forms.html',1440],['tools','tools/tools.html',1440],['resources','resources.html',1440],['language-ar','forms/language/index.html?lang=ar',390]]){await page.setViewportSize({width,height:width===390?844:1000});await page.goto(base+file);await page.screenshot({path:`/tmp/speech-site-${engine}-${name}.png`,fullPage:true});}
 for(const lang of ['en','ar']){await page.goto(base+'forms/language/index.html?lang='+lang);await page.locator('#menu-toggle').click();await page.waitForFunction(()=>document.querySelector('#navigation-drawer').classList.contains('is-open'));await page.screenshot({path:`/tmp/speech-site-${engine}-drawer-${lang}.png`});}
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
 const motion=await browser.newContext({reducedMotion:'no-preference',serviceWorkers:'block',viewport:{width:390,height:844}}),animated=await motion.newPage();await animated.goto(base+'index.html');assert.equal(await animated.locator('.hero-logo').evaluate(el=>getComputedStyle(el).animationName),'logo-arrive');await animated.locator('#menu-toggle').click();await animated.waitForFunction(()=>document.querySelector('#navigation-drawer').classList.contains('is-open'));assert.notEqual(await animated.locator('#navigation-drawer').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');await animated.locator('#drawer-close').click();await animated.waitForFunction(()=>!document.querySelector('#navigation-drawer').open);await motion.close();
 await context.close();console.log(`PASS ${engine}: all 12 fixed-screen pages and all paginated cards in English/Arabic at four viewports; left/right drawer, launch animation, reduced motion, dialogs, direct Forms access and search.`);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
