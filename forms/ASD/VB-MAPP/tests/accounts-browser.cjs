const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.VBMAPP_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../../../..'),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{const file=path.join(root,req.url.split('?')[0].replace(/\/$/,'/index.html'));fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);});});
async function gate(page){await page.locator('#accounts').click();const d=page.locator('#parent-gate');await d.waitFor();const left=Number(await d.locator('[data-left]').textContent()),right=Number(await d.locator('[data-right]').textContent()),op=await d.locator('[data-operation]').textContent();await d.getByRole('button',{name:String(op==='+'?left+right:left-right),exact:true}).click();await page.locator('#accountDialog').waitFor();}
async function add(page,name){await page.locator('#accountName').fill(name);await page.locator('#accountForm button').click();await page.waitForFunction(name=>window.VBApp?.snapshot().child.name===name,name);}
async function scoreEesa(page,id,value){await page.locator(`.eesa-four [data-eesa-edit="${id}"]`).click();await page.locator(`#itemBody [data-score="${value}"]`).click();await page.locator('[data-close=itemDialog]').click();}
async function run(){
 const engine=process.env.VBMAPP_ENGINE==='webkit'?webkit:chromium,browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})}),context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
 // Playwright WebKit crashes on a second reload after pushState, even on a blank page. navigation-browser.cjs covers Back/Forward.
 if(engine===webkit)await page.addInitScript(()=>{history.pushState=history.replaceState;});

 page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(15000);
 page.on('pageerror',e=>errors.push(e.message));const url=`http://127.0.0.1:${server.address().port}/forms/ASD/VB-MAPP/`;
 try{
 console.log('First launch');await page.goto(url);await page.locator('#accountDialog').waitFor();assert.equal(await page.locator('#accountList [data-account-id=hamada]').count(),0);await add(page,'طفل أول');
 assert.equal(await page.locator('#importFile,[data-new-case],[data-export-data]').count(),0);
 await page.locator('[data-bind=child][data-key=tester]').fill('Saved assessor');
 await page.locator('nav [data-page=milestones]').click();
 for(const domain of ['m1','t1','l1','vp1','p1','s1','i1','v1','e1'])for(let n=1;n<=5;n++){
  await page.locator(`[data-edit="${domain}-${n}"]`).click();
  assert.equal(await page.locator('#itemBody [data-guidance-field]').count(),5);
  if(domain==='l1')assert.equal(await page.locator('#itemBody [data-score="0.5"]').count(),n===2?0:1);
  for(const field of ['objective','materials','examples','application','scoring'])assert.ok((await page.locator(`#itemBody [data-guidance-field=${field}] p`).textContent()).trim());
  await page.locator('[data-close=itemDialog]').click();
 }
 for(const id of ['m2-6','m2-7','m2-8','m2-9','m2-10','t2-6','t2-7','t2-8','t2-9','t2-10','l2-6','l2-7','l2-8','l2-9','l2-10','vp2-6','vp2-7','vp2-8','vp2-9','vp2-10','p2-6','p2-7','p2-8','p2-9','p2-10','s2-6','s2-7','s2-8','s2-9','s2-10','i2-6','i2-7','i2-8','i2-9','i2-10','e2-6','e2-7','e2-8','e2-9','e2-10','lr2-6','lr2-7','lr2-8','lr2-9','lr2-10','iv2-6','iv2-7','iv2-8','iv2-9','iv2-10','cl2-6','cl2-7','cl2-8','cl2-9','cl2-10','li2-6','li2-7','li2-8','li2-9','li2-10','m3-11','m3-12','m3-13','m3-14','m3-15','t3-11','t3-12','t3-13','t3-14','t3-15','l3-11','l3-12','l3-13','l3-14','l3-15','vp3-11','vp3-12','vp3-13','vp3-14','vp3-15','p3-11','p3-12','p3-13','s3-14','s3-15','s3-12','s3-13','r3-11','r3-12','r3-13','r3-14','r3-15','w3-11','w3-12','w3-13','w3-14','w3-15','lr3-11','lr3-12','lr3-13','lr3-14','lr3-15']){
  await page.locator(`[data-edit="${id}"]`).click();
  assert.equal(await page.locator('#itemBody [data-guidance-field]').count(),5);
  assert.equal(await page.locator('#itemBody [data-score="0.5"]').count(),['i2-10','iv2-7','r3-14'].includes(id)?0:1);
  for(const field of ['objective','materials','examples','application','scoring'])assert.ok((await page.locator(`#itemBody [data-guidance-field=${field}] p`).textContent()).trim());
  await page.locator('[data-close=itemDialog]').click();
 }
 await page.locator('[data-edit="m1-1"]').click();await page.locator('#itemBody [data-score="1"]').click();await page.locator('[data-close=itemDialog]').click();
 // Score real EESA controls and verify automatic values, overrides and reset.
 await page.locator('nav [data-page=eesa]').click();
 const eesaIds=await page.evaluate(()=>VB_DATA.eesa.filter(i=>i.group===1).slice(0,3).map(i=>i.id));
 await scoreEesa(page,eesaIds[0],1);
 assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e1-1']),.5);
 assert.equal(await page.locator('[data-eesa-group-summary]').textContent(),'1');
 await page.locator('nav [data-page=milestones]').click();await page.locator('[data-edit="e1-1"]').click();
 await page.locator('#itemBody [data-score="0"]').click();await page.locator('[data-close=itemDialog]').click();
 await page.locator('nav [data-page=eesa]').click();await scoreEesa(page,eesaIds[1],1);
 assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e1-1']),0);
 await page.reload();await page.waitForFunction(()=>window.VBApp);assert.equal(await page.evaluate(()=>VBApp.snapshot().echoicModes['e1-1']),'manual');
 await page.locator('nav [data-page=milestones]').click();await page.locator('[data-edit="e1-1"]').click();
 assert.equal(await page.locator('#itemBody [data-echoic-auto],#itemBody .echoic-link').count(),0);await page.locator('#itemBody [data-score="1"]').click();assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e1-1']),1);
 await page.locator('#itemBody [data-clear-score]').click();await page.locator('[data-close=itemDialog]').click();
 await page.locator('nav [data-page=eesa]').click();await scoreEesa(page,eesaIds[2],1);
 assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e1-1']),undefined);
 assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e1-2']),.5);
 await page.locator('nav [data-page=milestones]').click();await page.locator('[data-edit="e1-1"]').click();await page.locator('#itemBody [data-score="1"]').click();await page.locator('[data-close=itemDialog]').click();
 // Extend real EESA scoring through both Level II group conditions.
 await page.locator('nav [data-page=eesa]').click();
 for(const [group,count] of [[1,25],[2,30],[3,25],[4,10]]){
  await page.locator(`[data-group="${group}"]`).click();
  const ids=await page.evaluate(({group,count})=>VB_DATA.eesa.filter(i=>i.group===group).slice(0,count).map(i=>i.id),{group,count});
  for(let index=0;index<ids.length;index++){
   await scoreEesa(page,ids[index],1);
   if(group===2&&index===14)assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e2-6']),.5);
   if(group===2&&index===24)assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e2-6']),1);
   if(group===4&&index===8)assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e2-10']),undefined);
  }
 }
 assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e2-10']),1);
 await page.locator('nav [data-page=milestones]').click();await page.locator('[data-edit="e2-10"]').click();await page.locator('#itemBody [data-score="0"]').click();await page.locator('[data-close=itemDialog]').click();
 await page.reload();await page.waitForFunction(()=>window.VBApp);assert.equal(await page.evaluate(()=>VBApp.snapshot().echoicModes['e2-10']),'manual');
 await page.locator('nav [data-page=eesa]').click();await page.locator('[data-group="4"]').click();
 const lastGroup4=await page.evaluate(()=>VB_DATA.eesa.filter(i=>i.group===4).at(-1).id);
 await scoreEesa(page,lastGroup4,0);assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e2-10']),0);
 await page.locator('nav [data-page=milestones]').click();await page.locator('[data-edit="e2-10"]').click();await page.locator('#itemBody [data-score="1"]').click();assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e2-10']),1);await page.locator('[data-close=itemDialog]').click();
 await page.locator('nav [data-page=eesa]').click();await page.locator('[data-group="4"]').click();await scoreEesa(page,lastGroup4,1);assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['e2-10']),1);
 console.log('Second account');await gate(page);await add(page,'طفل ثان');assert.equal(Object.keys(await page.evaluate(()=>VBApp.snapshot().scores.milestones)).length,0);
 await gate(page);assert.equal(await page.locator('.suite-delete').count(),0);await page.locator('.suite-account-select',{hasText:'طفل أول'}).click();await page.waitForFunction(()=>window.VBApp?.snapshot().child.name==='طفل أول');
 assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.milestones['m1-1']),1);assert.equal(await page.evaluate(()=>VBApp.snapshot().child.tester),'Saved assessor');
 await page.locator('nav [data-page=report]').click();await page.locator('[data-assessment-action=finish]').click();await page.locator('[data-confirm-assessment]').click();await page.locator('[data-assessment-action=new]').click();await page.locator('[data-confirm-assessment]').click();assert.equal(await page.evaluate(()=>VBApp.snapshot().history.length),1);await page.reload();await page.waitForFunction(()=>window.VBApp);assert.equal(await page.evaluate(()=>VBApp.snapshot().history.length),1);
 await page.locator('nav [data-page=report]').click();assert.equal(await page.locator('#reportPreview .milestone-sheet').count(),1);
 console.log('Admin');await gate(page);await add(page,'Hamada');await gate(page);assert.equal(await page.locator('.suite-delete').count(),2);assert.equal(await page.locator('[data-account-id=hamada] .suite-delete').count(),0);
 await page.locator('.suite-account-sort').click();await page.getByRole('option',{name:'حسب الأبجدية'}).click();assert.equal(await page.locator('.suite-account-sort').getAttribute('aria-expanded'),'false');
 await page.screenshot({path:'/private/tmp/vbmapp-accounts.png'});
 await page.getByRole('button',{name:'حذف حساب طفل ثان',exact:true}).click();await page.locator('#confirmDeleteAccount').click();assert.equal(await page.locator('.suite-delete').count(),1);await page.locator('#closeAccounts').click();
 console.log('Worker readiness');await page.waitForFunction(()=>navigator.serviceWorker.controller);await page.evaluate(()=>new Promise(resolve=>{const ch=new MessageChannel();ch.port1.onmessage=e=>{if(e.data.ready)resolve();};navigator.serviceWorker.controller.postMessage({type:'VBMAPP_STATUS'},[ch.port2]);}));
 console.log('Offline');if(engine===chromium)await context.setOffline(true);await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});await page.reload();await page.waitForFunction(()=>window.VBApp);assert.equal(await page.evaluate(()=>VBApp.snapshot().child.name),'Hamada');await gate(page);await page.locator('.suite-account-select',{hasText:'طفل أول'}).click();await page.waitForFunction(()=>window.VBApp?.snapshot().child.name==='طفل أول');assert.equal(await page.evaluate(()=>VBApp.snapshot().history.length),1);
 await page.locator('nav [data-page=report]').click();assert.equal(await page.locator('#reportPreview .milestone-sheet').count(),1);
 const download=page.waitForEvent('download');await page.locator('[data-pdf]').click();assert.match((await download).suggestedFilename(),/\.pdf$/);assert.deepEqual(errors,[]);
 console.log('PASS: child switching, follow-up, reports/PDF, protected admin, parent gate, sort, deletion, phone layout and offline accounts.');
 }finally{await browser.close();}
}
server.listen(0,'127.0.0.1',()=>run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close()));
