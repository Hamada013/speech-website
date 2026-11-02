const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.VBMAPP_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../../../..');
const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/\/$/,'/index.html'));fs.readFile(f,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
server.listen(0,'127.0.0.1',async()=>{
 const engine=process.env.VBMAPP_ENGINE==='webkit'?webkit:chromium;
 let browser;
 try{
 browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 await page.goto(`http://127.0.0.1:${server.address().port}/forms/ASD/VB-MAPP/`);
 await page.locator('#accountDialog').waitFor();await page.locator('#accountName').fill('Barriers QA');await page.locator('#accountForm button').click();await page.waitForFunction(()=>window.VBApp?.snapshot().child.name==='Barriers QA');
 await page.locator('nav [data-page=barriers]').click();assert.equal(await page.locator('.barrier-chart').count(),24);
 await page.locator('[data-barrier-notes]').click();assert.equal(await page.locator('#barrierNotesBody section').count(),7);await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement?.hasAttribute('data-barrier-notes'));
 for(let n=1;n<=24;n++){
  await page.locator(`.barrier-open[data-barrier-edit="bar-${n}"]`).click();assert.equal(await page.locator('#itemBody .barrier-criteria li').count(),5);
  assert.equal(await page.locator('#itemBody [data-score="0.5"]').count(),0);
  await page.locator(`#itemBody [data-score="${n%5}"]`).click();await page.locator('[data-close=itemDialog]').click();
 }
 assert.equal(await page.evaluate(()=>Object.keys(VBApp.snapshot().scores.barriers).length),24);
 assert.equal(await page.locator('.barrier-chart').nth(4).locator('.current .filled').count(),0);
 assert.equal(await page.locator('.barrier-chart').nth(4).locator('.barrier-result').first().textContent(),'0');
 await page.locator('[data-barrier-view=cards]').click();assert.equal(await page.locator('.barrier-task').count(),24);
 await page.locator('[data-card-id="bar-5"] [data-clear-score]').click();assert.equal(await page.evaluate(()=>Object.hasOwn(VBApp.snapshot().scores.barriers,'bar-5')),false);
 await page.locator('#language').click();assert.equal(await page.locator('html').getAttribute('dir'),'ltr');
 await page.locator('[data-barrier-notes]').click();assert.match(await page.locator('#barrierNotesBody').textContent(),/Lower is better/);await page.locator('#barrierNotesClose').click();
 await page.reload();await page.locator('nav [data-page=barriers]').click();assert.equal(await page.evaluate(()=>Object.keys(VBApp.snapshot().scores.barriers).length),23);
 await page.locator('nav [data-page=case]').click();await page.locator('[data-followup-current]').click();await page.locator('nav [data-page=barriers]').click();assert.equal(await page.locator('.barrier-visit-key').count(),0);assert.equal(await page.evaluate(()=>Object.keys(VBApp.snapshot().scores.barriers).length),0);
 await page.locator('.barrier-open[data-barrier-edit="bar-1"]').click();assert.match(await page.locator('#itemBody .previous-result').textContent(),/1/);await page.locator('#itemBody [data-score="0"]').click();await page.locator('[data-close=itemDialog]').click();
 assert.equal(await page.locator('.barrier-chart').first().locator('.barrier-column').nth(0).locator('.filled').count(),1);assert.equal(await page.locator('.barrier-chart').first().locator('.current .filled').count(),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/tmp/vbmapp-barriers-phone.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.locator('#language').click();await page.screenshot({path:'/tmp/vbmapp-barriers-desktop.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: 24 barriers, notes/focus, 0–4 scoring, clearing, persistence, bilingual display, follow-up grid and phone width.');
 }catch(e){console.error(e);process.exitCode=1;}finally{if(browser)await browser.close();server.close();}
});
