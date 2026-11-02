const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.VBMAPP_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../../../..'),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const missing=[];
const server=http.createServer((req,res)=>{let pathname=new URL(req.url,'http://localhost').pathname;if(pathname.endsWith('/'))pathname+='index.html';const file=path.resolve(root,'.'+decodeURIComponent(pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(error,data)=>{if(error){missing.push(pathname);return res.writeHead(404).end();}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 const engine=process.env.VBMAPP_ENGINE==='webkit'?webkit:chromium;browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 const context=await browser.newContext({viewport:{width:1024,height:768}}),errors=[];let page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(15000);
 await page.goto(`http://127.0.0.1:${server.address().port}/forms/ASD/VB-MAPP/`);await page.locator('#accountDialog').waitFor();await page.locator('#accountName').fill('طفل الصور');await page.locator('#accountForm button').click();await page.waitForFunction(()=>window.VBApp?.snapshot().child.name==='طفل الصور');
 const scores=await page.evaluate(()=>VBApp.snapshot().scores);
 await page.locator('nav [data-page=milestones]').click();
 async function open(id){await page.locator(`[data-edit="${id}"]`).click();await page.locator(`#itemBody [data-stimulus="${id}"]`).click();await page.locator('#imageDialog[open]').waitFor();await page.waitForFunction(()=>[...document.querySelectorAll('#imageBody img')].every(i=>i.complete&&i.naturalWidth>0));}
 async function close(){await page.locator('[data-close=imageDialog]').click();await page.locator('[data-close=itemDialog]').click();}
 for(const [id,type,count]of [['t1-2','single',1],['l1-5','array',4],['l2-6','array',6],['vp2-8','matching',6],['vp2-9','matching',10],['t3-14','scene',0],['l3-11','array',6],['r3-14','name',0],['ma3-15','matching',5]]){
  await open(id);assert.equal(await page.locator('#imageBody [data-board-type]').getAttribute('data-board-type'),type);
  if(count)assert.equal(await page.locator('#imageBody .stimulus-array>.stimulus-picture').count(),count);
  if(id==='r3-14')assert.equal(await page.locator('#imageBody .stimulus-symbol').textContent(),'طفل الصور');
  for(const viewport of [{width:390,height:844},{width:844,height:390},{width:320,height:568}]){
   await page.setViewportSize(viewport);await page.waitForTimeout(70);
   const bounds=await page.locator('#imageDialog').boundingBox();assert.ok(bounds.x>=-1&&bounds.y>=-1&&bounds.x+bounds.width<=viewport.width+1&&bounds.y+bounds.height<=viewport.height+1,id+' dialog fits');
   const overflow=await page.locator('#imageBody .stimulus-picture,#imageBody>div>img').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect(),b=document.querySelector('#imageBody').getBoundingClientRect();return r.width<12||r.height<12||r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1;}).length);if(overflow){await page.screenshot({path:'/private/tmp/vbmapp-overflow.png'});console.log(await page.locator('#imageBody').evaluate(n=>({body:n.getBoundingClientRect().toJSON(),pictures:[...n.querySelectorAll('.stimulus-picture')].map(e=>e.getBoundingClientRect().toJSON())})));}assert.equal(overflow,0,id+' pictures fit');
  }
  if(id==='l2-6'){const widths=await page.locator('#imageBody .stimulus-picture').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));assert.ok(Math.max(...widths)>70,'Selection pictures use available space');}
  if(id==='l2-6'||id==='t3-14')await page.screenshot({path:`/private/tmp/vbmapp-${id}-${process.env.VBMAPP_ENGINE||'chromium'}.png`});
  if(id!=='r3-14'){await page.locator('[data-image-step="1"]').click();await page.waitForFunction(()=>document.querySelector('#stimulusCounter').textContent.startsWith('2 /'));assert.match(await page.locator('#stimulusCounter').textContent(),/^2 \/ /);await page.keyboard.press('ArrowLeft');await page.waitForFunction(()=>document.querySelector('#stimulusCounter').textContent.startsWith('1 /'));assert.equal(await page.locator('[data-image-step="-1"]').isDisabled(),true);}
  await close();
 }
 assert.deepEqual(await page.evaluate(()=>VBApp.snapshot().scores),scores,'Viewing pictures never awards scores');
 await page.waitForFunction(()=>navigator.serviceWorker.controller);
 await page.waitForFunction(async()=>{const channel=new MessageChannel();return await new Promise(resolve=>{channel.port1.onmessage=e=>resolve(e.data.ready);navigator.serviceWorker.controller.postMessage({type:'VBMAPP_STATUS'},[channel.port2]);});});
 if(engine===webkit){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}else await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.VBApp);await page.locator('nav [data-page=milestones]').click();await open('t3-14');assert.equal(await page.locator('#imageBody img').count(),1);await close();await open('l2-6');assert.equal(await page.locator('#imageBody img').count(),6);
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('PASS: cartoon scenes, single/multiple pictures, matching samples, shapes, child name, navigation, three viewports, unchanged scores and offline image loading.');
}finally{await browser?.close();server.closeAllConnections();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.closeAllConnections();server.close();});
