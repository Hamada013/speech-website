const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.VBMAPP_PLAYWRIGHT||'playwright');const root=path.resolve(__dirname,'../../../..');
const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/\/$/,'/index.html'));fs.readFile(f,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
server.listen(0,'127.0.0.1',async()=>{let browser;try{
 const engine=process.env.VBMAPP_ENGINE==='webkit'?webkit:chromium;browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 await page.goto(`http://127.0.0.1:${server.address().port}/forms/ASD/VB-MAPP/`);await page.locator('#accountDialog').waitFor();await page.locator('#accountName').fill('Task Analysis QA');await page.locator('#accountForm button').click();await page.waitForFunction(()=>VBApp?.snapshot().child.name==='Task Analysis QA');
 await page.evaluate(()=>{
  let s=VBModel.blank();s.child.name='Task Analysis QA';s.child.dob='2023-04-12';s.child.tester='QA';s.lang='en';
  for(let v=0;v<4;v++){
   s.date=`2026-10-${26+v}`;
   VBModel.setScore(s,'tasks',VB_DATA.tasks[0],v%2);
   VBModel.setScore(s,'milestones',VBModel.allMilestones(VB_DATA).find(i=>i.id==='m1-1'),.5);
   if(v<3)s=VBModel.startFollowup(s,`2026-10-${27+v}`);
  }
  VBAccounts.save(VBAccounts.active().id,s);window.dispatchEvent(new StorageEvent('storage',{key:VBAccounts.KEY}));
 });
 await page.waitForFunction(()=>VBApp.snapshot().history.length===3);
 async function fits(){assert.equal(await page.locator('.analysis-sheet').evaluate(n=>[n,...n.querySelectorAll('table,.protocol-key-scroll')].every(e=>e.scrollWidth<=e.clientWidth+1)),true,'entire Task Analysis fits without internal horizontal scrolling');}
 const history=await page.evaluate(()=>JSON.stringify(VBApp.snapshot().history));
 await page.locator('nav [data-page=tasks]').click();assert.match(await page.locator('nav [data-page=tasks]').textContent(),/Task Analysis/);
 assert.equal(await page.locator('.analysis-chart [data-analysis-item]').count(),164);
 assert.equal(await page.locator('.analysis-chart [data-task-edit]').count(),119);
 assert.equal(await page.locator('.analysis-chart-mark').count(),656);
 assert.equal(await page.locator('.analysis-chart .visit-current').count(),164);
 assert.equal(await page.locator('.analysis-chart tbody').count(),5);
 assert.deepEqual(await page.locator('.analysis-chart tbody').evaluateAll(nodes=>nodes.map(n=>n.dataset.analysisBand)),['5','4','3','2','1']);
 assert.deepEqual(await page.locator('.analysis-chart th').allTextContents(),['Mand1234','Tact1234','Listener Responding1234','VP/MTS1234','Independent Play1234','Social Behavior1234','Motor Imitation1234','Echoic1234','Spontaneous Vocal1234']);
 assert.deepEqual(await page.locator('.analysis-chart tbody').first().locator('td').first().locator('[data-analysis-item]').evaluateAll(nodes=>nodes.map(n=>n.textContent.split('\n')[0].match(/5-[a-zM]/)[0])),['5-M','5-e','5-d','5-c','5-b','5-a']);
 assert.equal(await page.locator('.protocol-key tbody tr').count(),4);await fits();
 assert.equal(await page.locator('[data-analysis-item="m1-1"] .visit-current').evaluate(n=>n.style.getPropertyValue('--score-fill')),'50%');
 await page.locator('.analysis-chart th').first().scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/vbmapp-task-analysis-grid.png'});
 await page.locator('.analysis-chart [data-task-edit="ta-m1-1a"]').click();await page.locator('#itemBody [data-score="0"]').click();assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.tasks['ta-m1-1a']),0);
 await page.locator('#note-ta-m1-1a').evaluate(n=>n.closest('details').open=true);await page.locator('#note-ta-m1-1a').fill('Observed without prompts');
 await page.locator('[data-close=itemDialog]').click();assert.equal(await page.locator('[data-analysis-item="ta-m1-1a"] .visit-current').textContent(),'0');
 await page.locator('.analysis-chart [data-task-edit="ta-m1-1a"]').click();await page.locator('#itemBody [data-clear-score]').click();await page.locator('[data-close=itemDialog]').click();assert.equal(await page.locator('[data-analysis-item="ta-m1-1a"] .visit-current').textContent(),'—');
 for(const [level,count,domains,top] of [[2,326,12,'10'],[3,420,13,'15'],[1,164,9,'5']]){await page.locator(`[data-analysis-level="${level}"]`).click();assert.equal(await page.locator('.analysis-chart [data-analysis-item]').count(),count);assert.equal(await page.locator('.analysis-chart th').count(),domains);assert.equal(await page.locator('.analysis-chart tbody').first().getAttribute('data-analysis-band'),top);}
 await page.locator('#analysisSearch').fill('ta-m1-1a');assert.equal(await page.locator('.analysis-chart [data-analysis-item]').count(),2);await page.locator('#analysisSearch').fill('');
 await page.locator('[data-analysis-category=Mand]').click();assert.equal(await page.locator('.analysis-chart [data-analysis-item]').count(),28);await page.locator('[data-analysis-category=all]').click();
 await page.locator('[data-analysis-view=cards]').click();assert.equal(await page.locator('.protocol-task-row').count(),164);
 await page.locator('#analysisSearch').fill('ta-m1-1a');assert.equal(await page.locator('.protocol-task-row').count(),2);await page.locator('#analysisSearch').fill('');
 await page.locator('[data-analysis-category=Mand]').click();assert.equal(await page.locator('.protocol-task-row').count(),28);
 await page.locator('[data-analysis-item="m1-1"] .protocol-task-text').click();await page.locator('#itemBody [data-score="1"]').click();await page.locator('[data-close=itemDialog]').click();assert.equal(await page.locator('[data-analysis-item="m1-1"] .visit-current').textContent(),'1');assert.equal(await page.evaluate(()=>Object.keys(VBApp.snapshot().scores.tasks).length),0);
 await page.locator('[data-analysis-item="ta-m1-1a"] .protocol-task-text').click();await page.locator('#itemBody [data-score="1"]').click();await page.locator('[data-close=itemDialog]').click();assert.equal(await page.locator('[data-analysis-item="ta-m1-1a"] .visit-current').evaluate(n=>n.style.getPropertyValue('--score-fill')),'100%');
 assert.equal(await page.evaluate(()=>VBApp.snapshot().comments['ta-m1-1a']),'Observed without prompts');
 for(const [level,count]of [[2,326],[3,420]]){await page.locator(`[data-analysis-level="${level}"]`).click();assert.equal(await page.locator('.protocol-task-row').count(),count);}
 await page.locator('[data-analysis-category=Writing]').click();assert.equal(await page.locator('.protocol-task-row').count(),29);
 await page.screenshot({path:'/tmp/vbmapp-task-analysis-writing.png',fullPage:true});
 await page.locator('[data-analysis-notes]').click();assert.match(await page.locator('#barrierNotesBody').textContent(),/740/);await page.locator('#barrierNotesClose').click();
 await page.locator('#language').click();assert.equal(await page.locator('nav [data-page=tasks]').textContent(),'تحليل المهام');assert.match(await page.locator('.protocol-task-text').first().textContent(),/[\u0600-\u06ff]/);
 await page.locator('.protocol-task-text[data-task-edit]').first().click();assert.match(await page.locator('#itemBody details').first().textContent(),/English|الإنجليزي/);await page.locator('[data-close=itemDialog]').click();
 await page.setViewportSize({width:390,height:844});await fits();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#analysisContent').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/vbmapp-task-analysis-phone-tasks.png'});
 await page.locator('[data-analysis-view=grid]').click();await page.locator('[data-analysis-category=all]').click();await fits();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('.analysis-chart th').first().scrollIntoViewIfNeeded();assert.equal(await page.locator('.analysis-chart-scroll').evaluate(n=>n.scrollWidth>n.clientWidth),true);await page.screenshot({path:'/tmp/vbmapp-task-analysis-phone-grid.png'});
 assert.equal(await page.evaluate(()=>JSON.stringify(VBApp.snapshot().history)),history);
 await page.reload();await page.waitForFunction(()=>VBApp.snapshot().child.name==='Task Analysis QA');assert.equal(await page.evaluate(()=>VBApp.snapshot().scores.tasks['ta-m1-1a']),1);assert.equal(await page.evaluate(()=>VBApp.snapshot().comments['ta-m1-1a']),'Observed without prompts');assert.deepEqual(errors,[]);
 console.log('PASS: all levels and views, four assessment columns, separate scoring, live milestone links, search, source text, notes, saving, immutable history, Arabic phone layouts.');
 }catch(e){console.error(e);process.exitCode=1;}finally{if(browser)await browser.close();server.close();}});
