const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.VBMAPP_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../../../..'),out='/private/tmp/vbmapp-work';
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
let requests=[],port;
const server=http.createServer(async(req,res)=>{const url=decodeURIComponent(req.url.split('?')[0]);requests.push(url);const file=path.resolve(root,'.'+(url.endsWith('/')?url+'index.html':url));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{const bytes=await fs.promises.readFile(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(bytes);}catch{res.writeHead(404).end();}});
const rpc=page=>page.evaluate(()=>new Promise(resolve=>{const ch=new MessageChannel();ch.port1.onmessage=e=>resolve(e.data);navigator.serviceWorker.controller.postMessage({type:'VBMAPP_STATUS'},[ch.port2]);}));
const snapshot=page=>page.evaluate(()=>VBApp.snapshot());
async function run(name,engine){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{channel:'chrome'}:{})}),context=await browser.newContext({viewport:{width:1024,height:900},hasTouch:true}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto(`http://127.0.0.1:${port}/forms/ASD/VB-MAPP/`);await page.waitForFunction(()=>window.VBApp&&window.VBPDF&&navigator.serviceWorker.controller);
 assert.equal((await rpc(page)).ready,true);
 await page.locator('[data-install]').click();await page.locator('#installDialog').waitFor({state:'visible'});assert.match(await page.locator('[data-install-status]').textContent(),/دون اتصال/);await page.locator('[data-install-close]').click();
 await page.evaluate(()=>{const e=new Event('beforeinstallprompt',{cancelable:true});e.prompt=async()=>{window.promptCalled=true;};e.userChoice=Promise.resolve({outcome:'accepted'});dispatchEvent(e);});
 await page.locator('[data-install]').click();await page.waitForFunction(()=>window.promptCalled);assert.match(await page.locator('[data-install-help]').textContent(),/تم تثبيت/);await page.locator('[data-install-close]').click();
 await page.locator('[data-bind=child][data-key=name]').fill('حالة تجريبية');await page.locator('[data-bind=child][data-key=dob]').fill('2022-01-10');await page.locator('[data-bind=child][data-key=tester]').fill('QA clinician');
 await page.locator('nav [data-page=milestones]').click();assert.equal(await page.locator('[data-edit]').count(),170);
 // Every formerly gated card, and every Level 2/3 task, must offer real scoring.
 const ids=await page.evaluate(()=>VBModel.allMilestones(VB_DATA).filter(i=>i.level>=2).map(i=>i.id));
 if(process.env.VBMAPP_REPORT_ONLY==='1'){
  const seeded=await page.evaluate(()=>{const s=VBApp.snapshot();for(const item of VBModel.allMilestones(VB_DATA).filter(i=>i.level>=2))VBModel.setScore(s,'milestones',item,1);return JSON.stringify(s);});
  await page.locator('nav [data-page=case]').click();page.once('dialog',dialog=>dialog.accept());
  await page.locator('#importFile').setInputFiles({name:'report-fixture.json',mimeType:'application/json',buffer:Buffer.from(seeded)});
  await page.waitForFunction(()=>VBModel.stats(VBApp.snapshot(),VBModel.allMilestones(VB_DATA),'milestones').assessed===125);
  await page.locator('nav [data-page=milestones]').click();
 }else for(const id of ids){
  await page.locator(`[data-edit="${id}"]`).click();
  assert.equal(await page.locator('#itemBody [data-guidance-field]').count(),3,id);
  const controls=page.locator('#itemBody [data-score]');assert.ok(await controls.count()>=2);
  assert.equal(await controls.evaluateAll(nodes=>nodes.every(n=>!n.disabled)),true,id);
  assert.equal(await page.locator('#itemBody [data-scoring-setup]').count(),0,id);
  await page.locator('#itemBody [data-score="1"]').click();
  assert.equal((await snapshot(page)).scores.milestones[id],1,id);
  await page.locator('[data-close=itemDialog]').click();
 }
 await page.locator('[data-edit="i2-8"]').click();await page.locator('#itemBody [data-score="0.5"]').click();await page.locator('[data-close=itemDialog]').click();
 await page.locator('[data-edit="i2-10"]').click();assert.equal(await page.locator('#itemBody [data-score="0.5"]').count(),0);await page.locator('#itemBody [data-score="0"]').click();await page.locator('[data-close=itemDialog]').click();
 await page.reload();await page.waitForFunction(()=>window.VBApp);assert.equal((await snapshot(page)).scores.milestones['i2-8'],.5);assert.equal((await snapshot(page)).scores.milestones['i2-10'],0);
 await page.locator('nav [data-page=report]').click();
 for(const type of ['barriers','transitions','eesa','tasks'])await page.locator(`[data-scope=${type}]`).uncheck();
 assert.equal(await page.locator('#reportPreview .milestone-sheet').count(),1);
 assert.equal(await page.locator('#reportPreview .report-block').count(),1);
 // A follow-up sheet includes previous strips yet keeps all grids in one page.
 // Check ordinary and follow-up page geometry, both report languages.
 for(const lang of ['ar','en']){
   await page.locator(`[data-report-lang=${lang}]`).click();
   const info=await page.evaluate(()=>{
     const s=VBApp.snapshot(),r=VBReport.make(s,VB_DATA),layout=VBPDF.paginate(r,s),first=layout.pages[0],body=first.querySelector('.pdf-body');
     const result={pages:layout.pages.length,levels:first.querySelectorAll('[data-milestone-level]').length,cells:first.querySelectorAll('.milestone-grid td').length,overflow:body.scrollHeight>body.clientHeight+1};layout.stage.remove();return result;
   });
   assert.deepEqual(info,{pages:1,levels:3,cells:170,overflow:false});
   const pending=page.waitForEvent('download');await page.locator('[data-pdf]').click();const download=await pending;const filename=path.join(out,`${name}-${lang}.pdf`);await download.saveAs(filename);
   const content=fs.readFileSync(filename);
   const restored=await page.evaluate(async bytes=>{const file=new File([new Uint8Array(bytes)],'previous.pdf',{type:'application/pdf'});const parsed=await VBImport.read(file,VB_DATA);return {exact:parsed.exact,name:parsed.state.child.name,scores:parsed.state.scores.milestones};},[...content]);
   assert.equal(restored.exact,true);assert.equal(restored.scores['i2-8'],.5);assert.equal(restored.scores['i2-10'],0);
   assert.equal(restored.name,'حالة تجريبية');
   if(name==='chromium')await page.pdf({path:path.join(out,`browser-print-${lang}.pdf`),format:'A4',preferCSSPageSize:true,printBackground:true});
 }
 // Follow-up comparisons and A4 layout with reference strips.
 for(const lang of ['ar','en']){
 const followup=await page.evaluate(lang=>{
   const before=VBApp.snapshot(),next=VBModel.startFollowup(before);next.reportLang=lang;window.qaFollowup=next;
   for(const item of VBModel.allMilestones(VB_DATA))VBModel.setScore(next,'milestones',item,VBModel.halfAllowed(item)&&item.milestone%3===0?.5:1);
   const layout=VBPDF.paginate(VBReport.make(next,VB_DATA),next),first=layout.pages[0];
   const result={pages:layout.pages.length,levels:first.querySelectorAll('[data-milestone-level]').length,strips:first.querySelectorAll('.grid-before').length,height:first.querySelector('.pdf-body').scrollHeight};layout.stage.remove();return result;
 },lang);
 assert.equal(followup.pages,1);assert.equal(followup.levels,3);assert.equal(followup.strips,170);assert.ok(followup.height<=1011);
 const followDownload=page.waitForEvent('download');
 await page.evaluate(()=>VBPDF.export(VBReport.make(qaFollowup,VB_DATA),qaFollowup,'followup.pdf'));
 await (await followDownload).saveAs(path.join(out,`${name}-followup-${lang}.pdf`));
 }
 // Long entered notes paginate without separating or clipping the master grid.
 await page.locator('[data-bind=state][data-key=clinical]').fill('ملاحظة تجريبية عن الاستقلال والمشاركة. '.repeat(160));
 await page.locator('#reportDetails').check();
 const long=await page.evaluate(()=>{const s=VBApp.snapshot(),l=VBPDF.paginate(VBReport.make(s,VB_DATA),s);const v={pages:l.pages.length,first:l.pages[0].querySelectorAll('[data-milestone-level]').length,overflow:l.pages.some(p=>p.querySelector('.pdf-body').scrollHeight>1011)};l.stage.remove();return v;});
 assert.ok(long.pages>1);assert.equal(long.first,3);assert.equal(long.overflow,false);
 await page.setViewportSize({width:390,height:844});await page.locator('nav [data-page=milestones]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:path.join(out,`${name}-phone.png`),fullPage:true});
 // Real offline loading, scoring, report generation and cache isolation.
 await page.evaluate(async()=>{const c=await caches.open('unrelated-vbmapp-qa');await c.put('/other-data',new Response('keep'));});
 if(name==='chromium')await context.setOffline(true);
 await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
 await page.reload();await page.waitForFunction(()=>window.VBApp&&window.VBPDF);
 await page.locator('nav [data-page=milestones]').click();await page.locator('[data-edit="l2-9"]').click();await page.locator('#itemBody [data-score="0.5"]').click();assert.equal((await snapshot(page)).scores.milestones['l2-9'],.5);
 await page.locator('[data-close=itemDialog]').click();await page.locator('nav [data-page=report]').click();await page.locator('#reportDetails').uncheck();await page.locator('[data-bind=state][data-key=clinical]').fill('');
 const offlineDownload=page.waitForEvent('download');await page.locator('[data-pdf]').click();await (await offlineDownload).saveAs(path.join(out,`${name}-offline.pdf`));
 const offlineBytes=fs.readFileSync(path.join(out,`${name}-offline.pdf`));
 const offlineImported=await page.evaluate(async bytes=>{const parsed=await VBImport.read(new File([new Uint8Array(bytes)],'offline.pdf',{type:'application/pdf'}),VB_DATA);return {exact:parsed.exact,score:parsed.state.scores.milestones['l2-9']};},[...offlineBytes]);
 assert.deepEqual(offlineImported,{exact:true,score:.5});
 assert.equal(await page.evaluate(async()=>!!(await(await caches.open('unrelated-vbmapp-qa')).match('/other-data'))),true);
 // Existing cases keep compatible scores; a corrected item is directly re-scoreable.
 const legacy=await page.evaluate(()=>{const s=VBModel.blank();s.child.name='Legacy QA';s.scores.milestones={'m1-1':1,'l2-9':.5};s.comments['l2-9']='Saved observation';s.customCriteria['l2-9']={text:'Earlier description',scoring:'Earlier criterion'};return JSON.stringify(s);});
 await page.locator('nav [data-page=case]').click();page.once('dialog',dialog=>dialog.accept());
 await page.locator('#importFile').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(legacy)});
 await page.waitForFunction(()=>VBApp.snapshot().child.name==='Legacy QA');
 const legacyStats=await page.evaluate(()=>VBModel.stats(VBApp.snapshot(),VBModel.allMilestones(VB_DATA),'milestones'));assert.equal(legacyStats.assessed,1);assert.equal(legacyStats.pending,1);
 await page.locator('nav [data-page=milestones]').click();await page.locator('[data-edit="l2-9"]').click();
 assert.equal(await page.locator('#itemBody [data-score]').evaluateAll(nodes=>nodes.every(n=>!n.disabled)),true);
 assert.equal(await page.locator('#itemBody [data-pending-score="l2-9"]').count(),1);
 await page.locator('#itemBody [data-score="0.5"]').click();
 const reviewed=await snapshot(page);assert.equal(reviewed.scores.milestones['m1-1'],1);assert.equal(reviewed.comments['l2-9'],'Saved observation');assert.equal(reviewed.customCriteria['l2-9'].scoring,'Earlier criterion');assert.ok(reviewed.scoreReviews['l2-9']);
 assert.deepEqual(errors,[]);
 console.log(`${name}: ${process.env.VBMAPP_REPORT_ONLY==='1'?'report regression':'all 125 Level 2/3 cards scored'}, persistence, shortcut flow, one-page Arabic/English and follow-up grids, PDF data import, long reports, phone layout and real offline PDF export passed.`);
 }catch(error){await page.screenshot({path:path.join(out,`${name}-failure.png`),fullPage:true}).catch(()=>{});throw error;}
 finally{if(!server.listening)await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));if(name==='chromium')await context.setOffline(false);await context.close();await browser.close();}
}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));port=server.address().port;try{if(process.env.VBMAPP_ENGINE!=='webkit')await run('chromium',chromium);if(process.env.VBMAPP_ENGINE!=='chromium')await run('webkit',webkit);}finally{server.close();server.closeAllConnections();}})().catch(error=>{console.error(error);process.exitCode=1;});
