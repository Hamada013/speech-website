'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.SITE_PLAYWRIGHT||'playwright'),pages=require('../scripts/site-pages.cjs'),root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://local').pathname;if(!pathname.startsWith('/speech-website/')){res.writeHead(404).end();return;}let file=path.resolve(root,decodeURIComponent(pathname.slice('/speech-website/'.length))||'index.html');if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));});
let browser;
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const engine=process.env.SITE_ENGINE||'chromium';browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage(),base=`http://127.0.0.1:${server.address().port}/speech-website/`,errors=[],bad=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url());});
 for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:667,height:375}]){
  await page.setViewportSize(viewport);
  for(const entry of pages){
   await page.goto(base+entry.path);await page.locator('h1').waitFor();
   assert.equal(await page.locator('h1').textContent(),entry.title);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${entry.path} overflows at ${viewport.width}`);
   assert.equal(await page.locator('.hero-logo').evaluate(img=>img.complete&&img.naturalWidth>0),true);
   await page.locator('#language-toggle').click();assert.equal(await page.locator('html').getAttribute('dir'),'rtl');assert.equal(await page.locator('h1').textContent(),entry.ar);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${entry.path} RTL overflows at ${viewport.width}`);
   await page.locator('#language-toggle').click();
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'index.html');
 await page.locator('#menu-toggle').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
 await page.locator('[data-open-dialog="about"]').click();await page.locator('#about-dialog[open]').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('#about-dialog').evaluate(el=>el.open),false);
 await page.locator('.directory-card[href="forms.html"]').click();await page.waitForURL('**/forms.html');
 await page.locator('#directory-search').fill('zz-unmatched');assert.equal(await page.locator('#no-results').isVisible(),true);await page.locator('#directory-search').fill('السمع');assert.equal(await page.locator('[data-card]:visible').count(),1);await page.locator('#directory-search').fill('');
 await page.locator('#language-toggle').click();await page.goto(base+'tools/tools.html');assert.equal(await page.locator('html').getAttribute('lang'),'ar');await page.locator('#language-toggle').click();
 await page.locator('#directory-search').fill('memory');assert.equal(await page.locator('[data-card]:visible').count(),2);await page.locator('#directory-search').fill('');
 for(const [name,file,width] of [['home','index.html',1440],['home-mobile','index.html',390],['forms','forms.html',1440],['tools','tools/tools.html',1440],['resources','resources.html',1440],['language-ar','forms/language/index.html?lang=ar',390]]){await page.setViewportSize({width,height:width===390?844:1000});await page.goto(base+file);await page.screenshot({path:`/tmp/speech-site-${engine}-${name}.png`,fullPage:true});}
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
 await context.close();console.log(`PASS ${engine}: all 12 pages at desktop, mobile and short landscape in English/Arabic; mobile navigation, dialogs, direct Forms navigation, persistent language, bilingual search, nested hosting and no failed assets.`);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
