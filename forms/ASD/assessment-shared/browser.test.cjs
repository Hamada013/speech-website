const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.ASD_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../../..');
let network=true;
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/outside.html'){res.setHeader('Content-Type','text/html');return res.end('<h1>Other app</h1>');}const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}if(!network){res.writeHead(503).end();return;}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(b);});});
const visible=(p,s)=>p.locator(s).waitFor({state:'visible'});
async function layout(page,label){const issues=await page.evaluate(()=>{const errors=[];if(document.documentElement.scrollWidth>innerWidth+1)errors.push('horizontal overflow');for(const el of document.querySelectorAll('button')){if(!el.getClientRects().length||el.closest('[inert]'))continue;const r=el.getBoundingClientRect();if(r.width<43||r.height<43)errors.push('small '+(el.getAttribute('aria-label')||el.textContent));if(!el.getAttribute('aria-label')&&!el.title&&!el.textContent.trim())errors.push('unnamed button');if(r.left<-1||r.right>innerWidth+1)errors.push('clipped button');}return errors;});assert.deepEqual(issues,[],label);}
async function chooseAnswer(page,value){
 const target=page.locator(`[data-answer="${value}"]`);
 if(await page.locator('body').evaluate(el=>el.classList.contains('assessment-app'))){
  await page.waitForTimeout(40);
  const delta=await target.evaluate(el=>{const pages=[...document.querySelectorAll('.option-page')];return pages.indexOf(el.parentElement)-pages.findIndex(p=>p.classList.contains('is-current'));});
  for(let i=0;i<Math.abs(delta);i++)await page.locator(delta>0?'#options-next':'#options-previous').click();
 }
 await target.click();
}
async function beginRecord(page){
 await page.locator('#begin-button').click();
 if(await page.locator('#meta-screen').isVisible())await page.locator('#begin-button').click();
}
async function run(engine,name){
 const browser=await engine.launch(name==='chromium'?{channel:'chrome'}:{});
 try{const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',req=>{if(!req.url().startsWith('http://127.0.0.1:')&&!req.url().startsWith('blob:'))external.push(req.url());});page.setDefaultTimeout(10000);
 const origin=`http://127.0.0.1:${server.address().port}`;
 for(const folder of ['BALF','M-CHAT']){
  const isM=folder==='M-CHAT',kind=isM?'mchat':'blaf',url=`${origin}/forms/ASD/${folder}/index.html`,count=isM?23:12;
  await page.goto(url);await visible(page,'#new-button');assert.equal(await page.locator('html').getAttribute('lang'),'ar');assert.equal(await page.locator('.activity-card').count(),4);
  for(const [width,height]of [[320,568],[390,844],[667,375],[768,1024],[1024,768],[1180,820]]){await page.setViewportSize({width,height});await layout(page,`${name} ${folder} home ${width}`);}
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:`/private/tmp/asd-${folder}-${name}-home.png`,fullPage:true});
  await page.locator('#information-button').click();await visible(page,'#info-dialog');await page.keyboard.press('Escape');assert.equal(await page.locator('#info-dialog').isVisible(),false);
  await page.locator('#new-button').click();
  if(isM){await page.locator('#meta-next').click();await page.locator('#begin-button').click();assert.equal(await page.locator('#child-name').isVisible(),true);}
  {
   for(const [width,height]of [[320,568],[390,844],[667,375],[1024,768]]){
    await page.setViewportSize({width,height});
    assert.equal(await page.locator('#meta-screen').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,`${folder} details fit ${width}x${height}`);
   }
   await page.setViewportSize({width:390,height:844});
   await page.locator('#meta-notes-button').click();await page.locator('textarea[name=notes]').fill('Saved general observation');await page.locator('#close-meta-notes').click();
  }
  await page.locator('#child-name').fill('QA Child');await page.locator('input[name=clinician]').fill('QA Observer');await page.locator('#assessment-date').fill('2026-01-15');await beginRecord(page);await visible(page,'#question-title');await page.locator('#question-report').click();await visible(page,'#report-screen');
  assert.match(await page.locator('#report-screen').textContent(),isM?/غير مكتمل/:/لم تُسجّل درجات/);assert.equal(await page.locator('.bar-value').count(),isM?3:12);
  if(!isM){
   assert.deepEqual(await page.locator('.bar-value').allTextContents(),Array(12).fill('—'));
   assert.doesNotMatch(await page.locator('#report-screen').textContent(),/ما سُجّل في كل بند|What was recorded/);
   await page.waitForFunction(()=>document.querySelectorAll('.report-page').length>1);
   const pages=await page.locator('.report-page').count();
   for(let i=1;i<pages;i++)await page.locator('#report-next').click();
   assert.equal(await page.locator('#report-next').isDisabled(),true);
   assert.match(await page.locator('#report-page-status').innerText(),new RegExp(`${pages} / ${pages}`));
   await page.locator('#report-previous').click();
   for(const [width,height]of [[320,568],[390,844],[667,375],[1024,768]]){
    await page.setViewportSize({width,height});
    await page.waitForTimeout(60);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),true,'BLAF fixed report shell');
   }
   await page.setViewportSize({width:390,height:844});
  }
  await page.locator('#edit-button').click();await page.locator('#birth-date').fill('2024-05-15');
  if(isM){await page.locator('#meta-next').click();
   for(const [width,height]of [[320,568],[390,844],[667,375],[1024,768]]){
    await page.setViewportSize({width,height});
    assert.equal(await page.locator('#meta-screen').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,`M-CHAT eligibility fits ${width}x${height}`);
   }
   await page.setViewportSize({width:390,height:844});await page.locator('[data-respondent=parent]').click();await page.locator('input[name=official]').check();}
  await beginRecord(page);
  for(let i=0;i<count;i++){
   if(i===5){await page.reload();await visible(page,'#resume-button');await page.locator('#resume-button').click();assert.match(await page.locator('.question-index').innerText(),new RegExp(`6 / ${count}`));}
   const value=isM?([11,18,20,22].includes(i+1)?'no':i<3?'no':'yes'):String(i%5+1);
   await chooseAnswer(page,value);if(i===0)await page.locator('#item-note').fill('<script>window.injected=true</script> QA observation');
   if(i===2)for(const [width,height]of [[320,568],[390,844],[667,375],[768,1024],[1024,768]]){await page.setViewportSize({width,height});await layout(page,`${name} ${folder} question ${width}`);{await page.waitForTimeout(60);await page.screenshot({path:`/private/tmp/asd-${folder}-question-${name}-${width}.png`});assert.equal(await page.locator('#question-screen').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,`${folder} question fits viewport ${width}x${height}: ${await page.locator('#question-screen').evaluate(el=>JSON.stringify({height:el.clientHeight,scroll:el.scrollHeight,children:[...el.children].map(c=>({height:c.clientHeight,scroll:c.scrollHeight}))}))}`);} }
   await page.locator('#next-button').click();
  }
  await visible(page,'#report-screen');
  const reportText=await page.locator('#report-screen').textContent();assert.doesNotMatch(reportText,/ما سُجّل في كل بند|What was recorded/);if(isM){assert.doesNotMatch(reportText,/© 1999|نسخة بيانات التطبيق|App data revision|صياغة التطبيق تكييف محلي|scoring-2/);assert.equal(await page.locator('.risk-band').count(),3);assert.equal(await page.locator('.risk-current').count(),1);assert.equal(await page.locator('.risk-current').getAttribute('class'),'risk-band risk-followup risk-current');}assert.equal(await page.evaluate(()=>window.injected),undefined);assert.match(reportText,/<script>/);assert.match(reportText,new RegExp(`${count} / ${count}`));
  if(isM){assert.match(await page.locator('#report-meaning').textContent(),/٣–٧/);assert.equal(await page.locator('.bar-value').first().innerText(),'3');}else{assert.doesNotMatch(reportText,/إنجاز كلي|Overall Achievement/);assert.deepEqual(await page.locator('.bar-value').allTextContents(),Array.from({length:12},(_,i)=>(i%5+1)+' / 5'));}
  for(const [width,height]of [[320,568],[390,844],[667,375],[768,1024],[1024,768]]){await page.setViewportSize({width,height});await layout(page,`${name} ${folder} report ${width}`);
   await page.waitForTimeout(60);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),true,`${folder} fixed report shell`);
   if(isM){
    const total=await page.locator('.report-page').count();
    for(let i=0;i<total;i++){
     const current=page.locator('.report-page.is-current');if(await current.evaluate(el=>el.scrollHeight>el.clientHeight+1))await page.screenshot({path:'/private/tmp/mchat-report-overflow.png'});
     assert.equal(await current.evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,`${name} M-CHAT report page ${i+1}/${total} fits ${width}x${height}: ${await current.evaluate(el=>JSON.stringify({height:el.clientHeight,scroll:el.scrollHeight,container:el.parentElement.clientHeight,layout:[...el.parentElement.parentElement.children].map(c=>({cls:c.className,h:c.clientHeight,y:c.getBoundingClientRect().y,mt:getComputedStyle(c).marginTop,flex:getComputedStyle(c).flex})),text:el.textContent}))}`);
     if(i<total-1)await page.locator('#report-next').click();
    }
   }
  }
  await page.setViewportSize({width:768,height:1024});await page.screenshot({path:`/private/tmp/asd-${folder}-${name}-report.png`,fullPage:true});
  const downloadEvent=page.waitForEvent('download');await page.locator('#text-button').click();const download=await downloadEvent;assert.match(download.suggestedFilename(),/\.txt$/);
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('.app-header').isVisible(),false);assert.equal(await page.locator('.bar-track').first().isVisible(),true);{assert.equal(await page.locator('.report .sources').isVisible(),false);assert.equal(await page.locator('.report-detail:visible').count(),1);}
  if(name==='chromium')await page.pdf({path:`/private/tmp/asd-${folder}-report.pdf`,format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});
  await page.locator('#language-button').click();assert.equal(await page.locator('html').getAttribute('dir'),'ltr');await layout(page,`${name} ${folder} English report`);await page.locator('#language-button').click();
  await page.locator('#edit-button').click();await beginRecord(page);
  await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('QA quota','QuotaExceededError');};});
  await chooseAnswer(page,isM?'yes':'5');await visible(page,'#error');const before=await page.locator('.question-index').innerText();await page.locator('#next-button').click();assert.equal(await page.locator('.question-index').innerText(),before);await page.evaluate(()=>{Storage.prototype.setItem=window.originalSet;});await page.locator('#retry-save').click();assert.equal(await page.locator('#error').isVisible(),false);
  await page.locator('#question-report').click();await page.locator('#home-button').click();await page.locator('#history-button').click();assert.equal(await page.locator('.history-row').count(),1);await page.keyboard.press('Escape');
  await page.waitForFunction(async()=>{const r=await navigator.serviceWorker.getRegistration();return !!r?.active&&r.scope===new URL('./',location.href).href;});
  await page.reload();await visible(page,'#new-button');await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL===new URL('sw.js',location.href).href);
  const manifest=await page.evaluate(async()=>fetch('manifest.webmanifest').then(r=>r.json()));assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'./');assert.equal(manifest.icons.length,3);
  const dimensions=await page.evaluate(async icons=>{const out=[];for(const item of icons){const image=new Image();image.src=item.src;await image.decode();out.push([image.naturalWidth,image.naturalHeight]);}return out;},manifest.icons);
  assert.deepEqual(dimensions,[[192,192],[512,512],[512,512]]);
  if(name==='chromium'){const cdp=await context.newCDPSession(page);assert.deepEqual((await cdp.send('Page.getAppManifest')).errors,[]);await cdp.detach();}
  await page.locator('#download-button').click();await page.waitForFunction(()=>document.querySelector('#offline-status').textContent.includes('جاهز'));await page.keyboard.press('Escape');
  await page.evaluate(async()=>{await caches.open('unrelated-app-cache');});network=false;
  await page.reload();await visible(page,'#new-button');await page.locator('#resume-button').click();await visible(page,'#report-screen');assert.equal(await page.locator('.bar-row').count(),isM?3:12);
  const cold=await context.newPage();await cold.goto(url+'?launch=installed');await visible(cold,'#new-button');await cold.close();network=true;
  assert.ok((await page.evaluate(()=>caches.keys())).includes('unrelated-app-cache'));
  console.log(`PASS ${name} ${folder}: six phone/iPad layouts, Arabic/English, complete/partial reports, exact bars, reload/history, storage retry, escaped notes, print/PDF, manifest and offline cold launch`);
 }
 const riskContext=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),riskPage=await riskContext.newPage();
 await riskPage.goto(origin+'/forms/ASD/M-CHAT/index.html');await visible(riskPage,'#new-button');
 for(const [score,band,guard]of [[0,'low'],[2,'low'],[3,'followup'],[7,'followup'],[8,'high'],[23,'high'],[8,null,'official'],[8,null,'age'],[8,null,'parent'],[8,null,'missing']]){
  await riskPage.evaluate(async({score,guard})=>{
   const {newSession}=await import('../assessment-shared/model.mjs'),s=newSession('mchat');
   s.meta={...s.meta,child:'Risk boundary QA',dob:'2024-03-01',date:'2026-01-01',respondent:'parent',official:true};
   for(let id=1;id<=23;id++)s.answers[id]=[11,18,20,22].includes(id)?'no':'yes';
   for(let id=1;id<=score;id++)s.answers[id]=s.answers[id]==='yes'?'no':'yes';
   if(guard==='official')s.meta.official=false;if(guard==='age')s.meta.dob='2020-01-01';if(guard==='parent')s.meta.respondent='other';if(guard==='missing')delete s.answers[1];
   s.status=guard==='missing'?'partial':'complete';localStorage.setItem('asd-mchat-records-v1',JSON.stringify({version:1,active:s.id,sessions:[s]}));localStorage.setItem('asd-mchat-language','ar');
  },{score,guard});
  await riskPage.reload();await visible(riskPage,'#resume-button');await riskPage.locator('#resume-button').click();await visible(riskPage,'#report-page-status');
  assert.equal(await riskPage.locator('.risk-current').count(),band?1:0,`${name} risk ${score}, guard ${guard||'eligible'}`);
  if(band)assert.match(await riskPage.locator('.risk-current').getAttribute('class'),new RegExp(`risk-${band}`));
  assert.equal(await riskPage.locator('#report-screen .sources').count(),0);
  assert.equal(await riskPage.locator('.risk-next-step,.risk-diagnosis').count(),0);
  assert.equal(await riskPage.locator('.risk-referral').getAttribute('data-referral'),band==='high'?'recommended':band==='followup'?'followup':band==='low'?'monitor':'review');
  if(score===3&&!guard){
   while(!await riskPage.locator('.risk-current').isVisible())await riskPage.locator('#report-next').click();
   await riskPage.screenshot({path:`/private/tmp/mchat-${name}-risk-summary.png`});
   await riskPage.emulateMedia({media:'print'});assert.equal(await riskPage.locator('.risk-band:visible').count(),3);
   if(name==='chromium')await riskPage.pdf({path:'/private/tmp/mchat-risk-ar.pdf',format:'A4',printBackground:true});
   await riskPage.emulateMedia({media:'screen'});
   await riskPage.locator('#language-button').click();
   await riskPage.emulateMedia({media:'print'});
   if(name==='chromium')await riskPage.pdf({path:'/private/tmp/mchat-risk-en.pdf',format:'A4',printBackground:true});
   await riskPage.emulateMedia({media:'screen'});
  }
 }
 await riskContext.close();
 const outside=await context.newPage();await outside.goto(origin+'/outside.html');assert.equal(await outside.evaluate(()=>navigator.serviceWorker.controller),null);await outside.close();
 const bad=await context.newPage();await bad.addInitScript(()=>localStorage.setItem('asd-blaf-records-v1','{invalid'));await bad.goto(origin+'/forms/ASD/BALF/index.html');await visible(bad,'#error');await bad.locator('#new-button').click();assert.equal(await bad.evaluate(()=>localStorage.getItem('asd-blaf-records-v1')),'{invalid');await bad.close();
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await context.close();
 }finally{network=true;await browser.close();}
}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await run(chromium,'chromium');if(!process.env.ASD_SKIP_WEBKIT)await run(webkit,'webkit');}finally{server.close();server.closeAllConnections();}})().catch(e=>{console.error(e);process.exitCode=1;});
