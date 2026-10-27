// Synthetic responses exercise UI timing; a separate offline check reads all real media.
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require('../../../../tools/VSS/voc/node_modules/playwright');
const M=require('../assets/model.js');let server,browser;
(async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'ling-ui-'));
 server=spawn(process.execPath,[path.resolve(__dirname,'../../../speech/articulation/scripts/research-server.mjs')],{env:{...process.env,RESEARCH_PORT:'0',RESEARCH_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
 const origin=await new Promise((resolve,reject)=>{server.stdout.on('data',v=>{const m=String(v).match(/http:\/\/127\.0\.0\.1:\d+/);if(m)resolve(m[0]);});server.stderr.on('data',v=>process.stderr.write(v));server.once('error',reject);server.once('exit',code=>reject(Error('Collector exit '+code)));});
 browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(60000);
 await page.addInitScript(()=>{window.Audio=class{load(){}pause(){}play(){setTimeout(()=>this.onended?.(),20);return Promise.resolve();}};});
 const url=origin+'/forms/Hearing/ling_test/';await page.goto(url);await page.locator('#child-name').fill('Synthetic Ling');await page.locator('#name-form button').click();
 await page.screenshot({path:'/private/tmp/ling-home.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.getByRole('button',{name:'المسار التلقائي',exact:true}).click();await page.locator('#setup-form button').click();
 async function respond(wrongAt=-1){let last='';for(let i=0;i<100;i++){
  await page.waitForFunction(()=>{const d=JSON.parse(localStorage.getItem('ling-professional-children-v1')),c=d.children.find(c=>c.id===d.active),s=c.sessions.at(-1);return !!document.querySelector('.sound:not(:disabled)')||s.ended&&s.mode==='assessment';});
  const state=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('ling-professional-children-v1')),c=d.children.find(c=>c.id===d.active);return c.sessions.at(-1);});
  if(state.ended&&state.mode==='assessment')break;
  const key=state.id+':'+state.trials.length;assert.notEqual(key,last);last=key;
  const target=state.active.target,response=state.mode==='assessment'&&state.trials.length===wrongAt?state.active.choices.find(x=>x!==target):target;
  if(state.mode==='assessment'){assert.equal(await page.locator('.sound').count(),6);if(state.trials.length===0){for(const viewport of [{width:320,height:568},{width:844,height:390},{width:390,height:844}]){await page.setViewportSize(viewport);assert(await page.locator('#choices').evaluate(n=>{const r=n.getBoundingClientRect();return r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;}),'All choices fit the viewport');}await page.screenshot({path:'/private/tmp/ling-test.png'});}}
  await page.locator(`[data-sound="${response}"]`).click();
  await page.waitForFunction(key=>{const d=JSON.parse(localStorage.getItem('ling-professional-children-v1')),s=d.children.find(c=>c.id===d.active).sessions.at(-1);return s.id+':'+s.trials.length!==key;},key);
 }}
 await respond(3);await page.getByRole('heading',{name:'نتائج الاختبار',exact:true}).waitFor();
 let data=await page.evaluate(()=>JSON.parse(localStorage.getItem('ling-professional-children-v1'))),c=data.children[0];assert.deepEqual(c.sessions.map(s=>s.mode),['introduction','practice','assessment']);assert.equal(c.sessions[0].trials.length,6);assert.equal(c.sessions[1].trials.length,12);assert(M.eligible(c.sessions[2]));assert.equal(c.sessions[2].trials.filter(t=>t.target===t.response).length,11);assert.equal(c.sessions[0].trials.every(t=>t.assisted),true);
 await page.screenshot({path:'/private/tmp/ling-report.png'});
 // Gate is only for account/research controls, never a child activity.
 async function gate(){await page.locator('#parent-gate').waitFor();const parts=await page.locator('.parent-gate-equation').innerText(),numbers=parts.match(/\d+/g).map(Number);const answer=parts.includes('−')||parts.includes('-')?numbers[0]-numbers[1]:numbers[0]+numbers[1];await page.locator('.parent-gate-choices button').filter({hasText:new RegExp('^'+answer+'$')}).click();}
 await page.getByRole('button',{name:'تصدير التقرير إلى ملف البحث',exact:true}).click();await gate();await page.waitForFunction(()=>document.getElementById('share-status')?.textContent.includes('تم تحديث ملف Excel المحلي'));
 const dataset=JSON.parse(await fs.readFile(path.join(dir,'ling/dataset.json'),'utf8'));assert.equal(dataset.length,1);assert(!JSON.stringify(dataset).includes('Synthetic Ling'));assert((await fs.stat(path.join(dir,'ling/ling-research.xlsx'))).size>6000);
 const workbook=await fetch(origin+'/api/ling/workbook');assert.equal(workbook.status,200);assert.equal(Buffer.from(await workbook.arrayBuffer()).subarray(0,2).toString(),'PK');
 await page.locator('#close-modal').click();await page.getByRole('button',{name:'مسح بيانات ملف بحث لينغ',exact:true}).click();await gate();await page.getByRole('button',{name:'إلغاء',exact:true}).click();assert.equal(JSON.parse(await fs.readFile(path.join(dir,'ling/dataset.json'),'utf8')).length,1);
 await page.getByRole('button',{name:'مسح بيانات ملف بحث لينغ',exact:true}).click();await gate();await page.getByRole('button',{name:'تأكيد',exact:true}).click();await page.locator('#modal').waitFor({state:'hidden'});assert.deepEqual(JSON.parse(await fs.readFile(path.join(dir,'ling/dataset.json'),'utf8')),[]);assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('ling-professional-children-v1')))).children[0].sessions.length,3);
 // Reset endpoint is scoped, requires an exact app confirmation and an allowed origin.
 const reset=(app,confirm,originHeader=origin)=>fetch(origin+'/api/'+app+'/reset',{method:'POST',headers:{Origin:originHeader,'Content-Type':'application/json'},body:JSON.stringify({confirm})});
 assert.equal((await reset('ling','aphasia')).status,400);assert.equal((await reset('ling','ling','https://unrelated.example')).status,403);
 await page.locator('#home').click();await page.getByRole('button',{name:'اختبار الأصوات الستة',exact:true}).click();await page.locator('#setup-form button').click();await page.locator('.sound:not(:disabled)').first().waitFor();await page.getByRole('button',{name:'إعادة الصوت',exact:true}).click();await page.locator('.sound:not(:disabled)').first().waitFor();await page.reload();await page.getByRole('button',{name:'متابعة الجلسة المحفوظة'}).click();await page.getByRole('button',{name:'إعادة الصوت',exact:true}).click();await respond();await page.getByRole('heading',{name:'نتائج الاختبار',exact:true}).waitFor();
 data=await page.evaluate(()=>JSON.parse(localStorage.getItem('ling-professional-children-v1')));assert.equal(M.classify(data.children[0].sessions.at(-1)),'practice');assert(data.children[0].sessions.at(-1).trials[0].assisted);
 await page.locator('#download').click();await page.waitForFunction(()=>document.getElementById('download-percent')?.textContent==='100٪');await page.locator('#close-modal').click();await page.waitForFunction(()=>navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'المسار التلقائي',exact:true}).waitFor();
 const sizes=await page.evaluate(async()=>{const release=await (await caches.open((await caches.keys()).find(k=>k.startsWith('ling-')))).keys();return Promise.all(['1','12','13','24','27','28'].map(async id=>(await (await fetch('sounds/'+id+'.m4a')).arrayBuffer()).byteLength));});assert(sizes.every(n=>n>1000));const durations=await page.evaluate(()=>Promise.all(['1','12','13','24','27','28'].map(id=>new Promise((resolve,reject)=>{const a=document.createElement('audio');a.preload='metadata';a.onloadedmetadata=()=>resolve(a.duration);a.onerror=reject;a.src='sounds/'+id+'.m4a';}))));assert(durations.every(n=>Number.isFinite(n)&&n>0));
 assert.deepEqual(errors,[]);await context.close();console.log('PASS Ling browser: automatic preparation/practice/test, real eligibility, assistance/reload recovery, anonymized XLSX export, confirmed scoped reset, mobile layout and complete offline media.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server?.kill();});
