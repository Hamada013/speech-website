const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium,webkit} = require(process.env.SURVEY_PLAYWRIGHT || 'playwright');
const repo = path.resolve(__dirname,'../../..'), root = path.resolve(__dirname,'..');
const mime={'.js':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.png':'image/png','.webp':'image/webp','.m4a':'audio/mp4','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost').pathname;
 const filename=path.resolve(repo,'.'+decodeURIComponent(url.endsWith('/')?url+'index.html':url));
 if(!filename.startsWith(repo+path.sep)){res.writeHead(403).end();return;}
 try{const body=await fs.promises.readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'text/plain','Cache-Control':'no-store'}).end(body);}catch{res.writeHead(404).end();}
});
const visible=(page,id)=>page.locator(id).waitFor({state:'visible'});
async function run(engine,name,origin){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{channel:'chrome'}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(origin+'/forms/vocabulary-survey/');
  await page.waitForFunction(()=>!document.querySelector('[data-start]').disabled&&!!navigator.serviceWorker.controller);
  if(name==='chromium' && process.env.SURVEY_SCREENSHOTS==='1'){
   fs.mkdirSync(path.join(root,'screenshots'),{recursive:true});
   await page.screenshot({path:path.join(root,'screenshots/home-wide.png')});
   await page.setViewportSize({width:390,height:844});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.screenshot({path:path.join(root,'screenshots/home-mobile.png')});
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#active-profile').click();await visible(page,'#profiles-view');
  const profile=page.locator('#profile-form');
  await profile.locator('[name=childId]').fill('QA-ONE');await profile.locator('[name=childName]').fill('طفل تجريبي');await profile.locator('[name=birthDate]').fill('2022-01-10');
  await profile.locator('[type=submit]').click();await visible(page,'#dashboard-view');
  await page.locator('[data-start=receptive]').click();await visible(page,'#setup-view');
  assert.equal(await page.locator('#setup-form [name=childName]').inputValue(),'طفل تجريبي');
  assert.equal(await page.locator('#setup-form [name=childId]').isEditable(),false);
  assert.deepEqual(await page.locator('[name=sampling] option').evaluateAll(options=>options.map(o=>o.value)),['50']);
  await page.locator('[name=scope]').selectOption('A',{force:true});
  await page.waitForFunction(()=>document.querySelector('#plan-summary').textContent.startsWith('50 كلمة'));
  const dropdown=page.locator('.styled-dropdown').filter({has:page.locator('[name=scope]')}).locator('[role=combobox]');
  await dropdown.focus();await dropdown.press('End');await dropdown.press('Enter');
  assert.equal(await page.locator('[name=scope]').inputValue(),'D');
  await page.locator('[name=scope]').selectOption('A',{force:true});
  await page.waitForFunction(()=>!document.querySelector('#begin-test').disabled);
  await page.locator('#begin-test').click();await visible(page,'#trial-view');
  await page.locator('#pause-test').click();await visible(page,'#paused-view');
  await page.reload();await page.waitForFunction(()=>!document.querySelector('[data-start]').disabled);
  assert.match(await page.locator('#active-profile').textContent(),/طفل تجريبي/);
  await page.locator('nav [data-route=history]').click();await visible(page,'#history-view');
  assert.equal(await page.locator('#draft-card').isVisible(),true);
  await page.locator('nav [data-route=dashboard]').click();
  await page.locator('[data-start=expressive]').click();await visible(page,'#setup-view');
  assert.equal(await page.locator('#setup-form [name=birthDate]').inputValue(),'2022-01-10');
  assert.deepEqual(await page.locator('[name=sampling] option').evaluateAll(options=>options.map(o=>o.value)),['50','100']);
  await page.locator('[name=sampling]').selectOption('100',{force:true});
  await page.waitForFunction(()=>document.querySelector('#plan-summary').textContent.startsWith('400 كلمة'));
  await page.locator('nav [data-route=dashboard]').click();await page.locator('#active-profile').click();await visible(page,'#profiles-view');
  await page.getByRole('button',{name:'تعديل حساب طفل تجريبي'}).click();
  await profile.locator('[name=childName]').fill('الاسم المعدّل');await profile.locator('[type=submit]').click();await visible(page,'#dashboard-view');
  const oldName=await page.evaluate(async()=>{const{getSessions}=await import('./storage.js');return(await getSessions())[0].metadata.childName;});
  assert.equal(oldName,'طفل تجريبي','Editing a profile preserves historical metadata');
  await page.locator('#active-profile').click();await visible(page,'#profiles-view');
  await page.locator('#new-profile').click();await profile.locator('[name=childId]').fill('QA-TWO');await profile.locator('[name=childName]').fill('طفل ثان');await profile.locator('[type=submit]').click();await visible(page,'#dashboard-view');
  await page.locator('nav [data-route=history]').click();await visible(page,'#history-view');
  assert.equal(await page.locator('#draft-card').isVisible(),false);assert.equal(await page.locator('.session-row').count(),0);
  await page.evaluate(async()=>{
   const{saveSession,saveSetting}=await import('./storage.js'),{createIndex,buildChecklist}=await import('./validation.js');
   const data=await(await fetch('data/vocabulary.json')).json(), index=createIndex(data.items), check=await buildChecklist(index,'receptive','A','50');
   function fixture(id,childId,date,correct){
    const records=check.plan.map((entry,i)=>{const item=index.byId.get(entry.id),options=index.matrix(item.id),outcome=i<correct?'target':'semantic',selected=options.find(o=>o.role===outcome);return{targetId:item.id,label:item.label,itemRevision:item.revision,folder:item.folder,cohort:entry.cohort,outcome,selectedId:selected.id,selectedLabel:index.byId.get(selected.id).label,latencyMs:1000,audioPlays:1,audioPlayed:true,options};});
    return{schemaVersion:1,id,mode:'receptive',scope:'A',sampling:'50',audioMode:'spoken-prompt',status:'complete',metadata:{childId,childName:'طفل تجريبي',birthDate:'2022-01-10',assessmentDate:date,languages:'العربية / اللهجة السورية',examiner:'QA',notes:''},startedAt:date+'T10:00:00Z',updatedAt:date+'T11:00:00Z',finishedAt:date+'T11:00:00Z',dataVersion:data.version,configVersion:'cohorts-2',...check,missingMediaCount:0,records};
   }
   await saveSession(fixture('qa-old','QA-ONE','2026-10-01',30));await saveSession(fixture('qa-current','QA-ONE','2026-11-02',40));await saveSession(fixture('qa-peer','QA-TWO','2026-11-01',20));await saveSession(fixture('qa-peer-older','QA-TWO','2026-10-15',10));await saveSetting('active-child','qa-one');
  });
  await page.reload();await page.waitForFunction(()=>!document.querySelector('[data-start]').disabled);
  await page.locator('nav [data-route=history]').click();await visible(page,'#history-view');
  await page.locator('.session-row').first().getByRole('button',{name:'فتح التقرير'}).click();await visible(page,'#report-view');
  assert.match(await page.locator('#panel-summary').textContent(),/80.0%/);
  await page.locator('[data-report-tab=progress]').click();assert.equal(await page.locator('.trend-chart').isVisible(),true);assert.match(await page.locator('.trend-summary').textContent(),/\+20.0/);
  await page.locator('[data-report-tab=peers]').click();assert.match(await page.locator('#panel-peers').textContent(),/40.0%/);assert.match(await page.locator('#panel-peers .metric-grid').textContent(),/1/);
  await page.locator('[data-report-tab=peers]').press('End');assert.equal(await page.locator('#panel-words').isVisible(),true);
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('#panel-summary').isVisible(),true);assert.equal(await page.locator('#panel-progress').isVisible(),true);assert.equal(await page.locator('#panel-peers').isVisible(),true);await page.emulateMedia({media:'screen'});
  for(const width of [390,768,1440]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
  await page.locator('[data-report-tab=progress]').click();await page.screenshot({path:`/private/tmp/survey-${name}-progress.png`,fullPage:true});
  // Real shell offline reopening: media download is covered by browser.cjs.
  if(name==='chromium'){
   await context.setOffline(true);await page.reload();await page.waitForFunction(()=>!document.querySelector('[data-start]').disabled);assert.match(await page.locator('#active-profile').textContent(),/الاسم المعدّل/);await context.setOffline(false);
  }
  assert.deepEqual(errors,[]);
  console.log(`${name}: profiles, shared/editable identity, historical snapshots, isolation, 50/100 setup, dropdown keys, progress, peer comparisons, print and responsive/offline shell passed.`);
 }catch(error){await page.screenshot({path:`/private/tmp/survey-${name}-profiles-failure.png`,fullPage:true});throw error;}finally{await context.close();await browser.close();}
}
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));try{const origin=`http://127.0.0.1:${server.address().port}`;if(process.env.SURVEY_ENGINE!=='webkit')await run(chromium,'chromium',origin);if(process.env.SURVEY_ENGINE!=='chromium')await run(webkit,'webkit',origin);}finally{server.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
