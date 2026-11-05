const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.VBMAPP_PLAYWRIGHT||'playwright');const root=path.resolve(__dirname,'../../../..');
const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/\/$/,'/index.html'));fs.readFile(f,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
server.listen(0,'127.0.0.1',async()=>{let browser;try{
 const engine=process.env.VBMAPP_ENGINE==='webkit'?webkit:chromium;browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 await page.goto(`http://127.0.0.1:${server.address().port}/forms/ASD/VB-MAPP/`);await page.locator('#accountDialog').waitFor();await page.locator('#accountName').fill('Form Style QA');await page.locator('#accountForm button').click();await page.waitForFunction(()=>VBApp?.snapshot().child.name==='Form Style QA');
 await page.evaluate(()=>{
  let s=VBModel.normalize(VBApp.snapshot());s.child.name='Form Style QA';s.child.dob='2023-04-12';s.child.tester='QA Assessor';s.lang='en';
  for(let visit=0;visit<4;visit++){
   s.date=`2026-10-${26+visit}`;
   for(const [i,item]of VBModel.allMilestones(VB_DATA).entries()) VBModel.setScore(s,'milestones',item,(i+visit)%7===0?0:(i+visit)%3===0&&VBModel.halfAllowed(item)?.5:1);
   for(const [i,item]of VB_DATA.eesa.entries())VBModel.setScore(s,'eesa',item,(i+visit)%3===0?0:1);
   for(const [i,item]of VB_DATA.barriers.entries())VBModel.setScore(s,'barriers',item,(i+visit)%5);
   s.customCriteria['tr-6']={text:'Synthetic description',scoring:'Synthetic verified protocol criteria'};
   for(const [i,item]of VB_DATA.transitions.entries())VBModel.setScore(s,'transitions',item,1+(i+visit)%5);
   if(visit<3)s=VBModel.startFollowup(s,`2026-10-${27+visit}`);
  }
  VBAccounts.save(VBAccounts.active().id,s);
  window.dispatchEvent(new StorageEvent('storage',{key:VBAccounts.KEY}));
 });
 await page.waitForFunction(()=>window.VBApp?.snapshot().history.length===3);await page.locator('nav [data-page=milestones]').click();
 assert.equal(await page.locator('.protocol-master [data-edit]').count(),170);assert.equal(await page.locator('.master-mark').count(),680);assert.equal(await page.locator('.master-mark.current').count(),170);assert.equal(await page.locator('.master-mark:not(.current) button,.master-mark:not(.current)[data-edit]').count(),0);assert.equal(await page.locator('.master-mark.current').first().evaluate(n=>getComputedStyle(n).boxShadow),'none');assert.equal(await page.locator('.protocol-key tbody tr').count(),4);
 await page.screenshot({path:'/tmp/vbmapp-style-master.png',fullPage:true});
 const hist=await page.evaluate(()=>JSON.stringify(VBApp.snapshot().history));
 await page.locator('.protocol-master [data-edit="m1-1"]').click();await page.locator('#itemBody [data-score="0"]').click();await page.locator('[data-close=itemDialog]').click();assert.equal(await page.evaluate(()=>JSON.stringify(VBApp.snapshot().history)),hist);
 await page.locator('[data-view=cards]').click();assert.equal(await page.locator('.protocol-domain').count(),9);assert.equal(await page.locator('.protocol-task-row').count(),45);assert.equal(await page.locator('.protocol-task-row .four-scores td').count(),180);
 await page.screenshot({path:'/tmp/vbmapp-style-milestone-tasks.png',fullPage:true});
 await page.locator('#taskSearch').fill('m1-1');assert.equal(await page.locator('.protocol-task-row').count(),1);await page.locator('#taskSearch').fill('');
 await page.locator('.protocol-task-text[data-edit="m1-1"]').click();await page.locator('#itemBody [data-score="1"]').click();await page.locator('[data-close=itemDialog]').click();assert.equal(await page.locator('[data-form-item="m1-1"] .visit-current').textContent(),'1');
 await page.locator('nav [data-page=eesa]').click();assert.equal(await page.locator('.eesa-form-item').count(),100);assert.equal(await page.locator('.eesa-form-item .score-controls').count(),0);assert.equal(await page.locator('.eesa-form-group').count(),5);assert.equal(await page.locator('.eesa-form-item .four-scores td').count(),400);
 const first=await page.evaluate(()=>VB_DATA.eesa[0].id);await page.locator(`.eesa-four [data-eesa-edit="${first}"]`).click();await page.locator('#itemBody [data-score="0.5"]').click();await page.locator('[data-close=itemDialog]').click();assert.equal(await page.locator(`[data-card-id="${first}"] .visit-current`).textContent(),'0.5');
 await page.locator(`.eesa-four [data-eesa-edit="${first}"]`).click();await page.locator('#itemBody [data-score="1"]').click();await page.locator('[data-close=itemDialog]').click();assert.equal(await page.evaluate(id=>VBApp.snapshot().scores.eesa[id],first),1);
 await page.screenshot({path:'/tmp/vbmapp-style-eesa.png',fullPage:true});
 for(const type of ['barriers','transitions']){
  await page.locator(`nav [data-page=${type}]`).click();await page.locator(`[data-${type==='barriers'?'barrier':'transition'}-view=cards]`).click();
  const id=type==='barriers'?'bar-1':'tr-3',value=type==='barriers'?2:4;
  assert.equal(await page.locator('.protocol-assessment-item').count(),type==='barriers'?24:18);assert.equal(await page.locator('.protocol-meta .age-visits span').count(),4);assert.equal(await page.locator('.protocol-key tbody tr').count(),4);if(type==='transitions'){assert.equal(await page.locator('[data-transition-score]').count(),90);assert.equal(await page.locator('.transition-verify').count(),0);assert.equal(await page.locator('[data-card-id="tr-1"] .score-controls,[data-card-id="tr-2"] .score-controls').count(),0);assert.equal(await page.evaluate(()=>VBModel.hasScore(VBApp.snapshot(),'transitions',VB_DATA.transitions[0])),true);}
  await page.locator(`[data-card-id="${id}"] [data-score="${value}"]`).click();assert.equal(await page.locator(`[data-card-id="${id}"] .visit-current`).textContent(),String(value));
  assert.equal(await page.locator(`[data-card-id="${id}"] .visit-current`).evaluate(n=>n.style.getPropertyValue('--score-fill')),type==='barriers'?'50%':'80%');
  assert.match(await page.locator(`[data-card-id="${id}"] .visit-current`).evaluate(n=>getComputedStyle(n).backgroundImage),/linear-gradient/);
  await page.screenshot({path:`/tmp/vbmapp-style-${type}.png`,fullPage:true});
  await page.locator('.protocol-heading h2').scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/vbmapp-style-detail-${type}.png`});
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#language').click();
 for(const type of ['milestones','eesa','barriers','transitions']){
  await page.locator(`nav [data-page=${type}]`).click();
  if(type==='milestones')await page.locator('[data-view=grid]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${type} phone width`);
  await page.screenshot({path:`/tmp/vbmapp-style-phone-${type}.png`,fullPage:true});
 }
 assert.equal(await page.evaluate(()=>JSON.stringify(VBApp.snapshot().history)),hist);assert.deepEqual(errors,[]);
 console.log('PASS: four-visit milestone grid and task groups, compact EESA and linked scoring, barrier/transition strips, immutable historical visits, bilingual phone layouts.');
 }catch(e){console.error(e);process.exitCode=1;}finally{if(browser)await browser.close();server.close();}});
