const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.VBMAPP_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../../../..');
const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/\/$/,'/index.html'));fs.readFile(f,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
server.listen(0,'127.0.0.1',async()=>{
 const engine=process.env.VBMAPP_ENGINE==='webkit'?webkit:chromium;let browser;
 try{
 browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 await page.goto(`http://127.0.0.1:${server.address().port}/forms/ASD/VB-MAPP/`);
 await page.locator('#accountDialog').waitFor();await page.locator('#accountName').fill('Transition QA');await page.locator('#accountForm button').click();await page.waitForFunction(()=>window.VBApp?.snapshot().child.name==='Transition QA');
 await page.locator('nav [data-page=transitions]').click();assert.equal(await page.locator('.transition-grid .barrier-chart').count(),18);
 assert.equal(await page.locator('.transition-grid .barrier-column.current span').count(),90);
 await page.locator('[data-transition-notes]').click();assert.equal(await page.locator('#barrierNotesBody section').count(),7);await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement?.hasAttribute('data-transition-notes'));
 for(let n=1;n<=18;n++){
  await page.locator(`.barrier-open[data-barrier-edit="tr-${n}"]`).click();assert.ok(await page.locator('#itemBody .transition-guidance p').count());
  assert.equal(await page.locator('#itemBody [data-score="0"]').count(),0);assert.equal(await page.locator('#itemBody [data-score="0.5"]').count(),0);
  assert.equal(await page.locator('#itemBody [data-transition-score]').count(),5);assert.equal(await page.locator('#itemBody .transition-verify').count(),0);
  if(n>2)await page.locator(`#itemBody [data-score="${1+n%5}"]`).click();else assert.equal(await page.locator('#itemBody .score-controls').count(),0);await page.locator('[data-close=itemDialog]').click();
 }
 assert.equal(await page.evaluate(()=>Object.keys(VBApp.snapshot().scores.transitions).length),16);
 await page.locator('[data-transition-view=cards]').click();assert.equal(await page.locator('.transition-task').count(),18);
 await page.locator('[data-card-id="tr-3"] [data-clear-score]').click();assert.equal(await page.evaluate(()=>Object.hasOwn(VBApp.snapshot().scores.transitions,'tr-3')),false);
 await page.locator('#language').click();assert.equal(await page.locator('html').getAttribute('dir'),'ltr');
 await page.locator('[data-transition-notes]').click();assert.match(await page.locator('#barrierNotesBody').textContent(),/IEP team/);await page.screenshot({path:'/tmp/vbmapp-transition-notes.png'});await page.locator('#barrierNotesClose').click();
 await page.screenshot({path:'/tmp/vbmapp-transition-tasks.png',fullPage:true});
 await page.reload();await page.locator('nav [data-page=transitions]').click();assert.equal(await page.evaluate(()=>Object.keys(VBApp.snapshot().scores.transitions).length),15);
 await page.locator('nav [data-page=report]').click();await page.locator('[data-assessment-action=finish]').click();await page.locator('[data-confirm-assessment]').click();await page.locator('[data-assessment-action=new]').click();await page.locator('[data-confirm-assessment]').click();await page.locator('nav [data-page=transitions]').click();assert.equal(await page.locator('.barrier-visit-key').count(),0);assert.equal(await page.evaluate(()=>Object.keys(VBApp.snapshot().scores.transitions).length),0);
 await page.locator('.barrier-open[data-barrier-edit="tr-4"]').click();assert.ok(await page.locator('#itemBody .previous-result').count());await page.locator('#itemBody [data-score="5"]').click();await page.locator('[data-close=itemDialog]').click();
 assert.equal(await page.locator('.barrier-chart').nth(3).locator('.barrier-column').nth(0).locator('.filled').count(),5);assert.equal(await page.locator('.barrier-chart').nth(3).locator('.current .filled').count(),5);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/tmp/vbmapp-transition-phone.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});await page.locator('#language').click();await page.screenshot({path:'/tmp/vbmapp-transition-desktop.png',fullPage:true});
 // Shared grid changes must preserve the four-level Barriers chart.
 await page.locator('nav [data-page=barriers]').click();assert.equal(await page.locator('.barrier-chart').count(),24);assert.equal(await page.locator('.barrier-column.current span').count(),96);
 assert.deepEqual(errors,[]);console.log('PASS: 18 transitions, notes/focus, 1–5 scoring, protocol verification, clearing, persistence, bilingual display, follow-up, responsive layout and barriers regression.');
 }catch(e){console.error(e);process.exitCode=1;}finally{if(browser)await browser.close();server.close();}
});
