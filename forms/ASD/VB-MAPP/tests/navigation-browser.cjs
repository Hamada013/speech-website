const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.VBMAPP_PLAYWRIGHT||'playwright');const root=path.resolve(__dirname,'../../../..');
const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/\/$/,'/index.html'));fs.readFile(f,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
const PAGES=['case','milestones','eesa','barriers','transitions','tasks','reference','report'];
const current=page=>page.evaluate(()=>document.querySelector('nav [aria-current]')?.dataset.page);
server.listen(0,'127.0.0.1',async()=>{let browser;try{
 const engine=process.env.VBMAPP_ENGINE==='webkit'?webkit:chromium;browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 const base=`http://127.0.0.1:${server.address().port}/forms/ASD/VB-MAPP/`;
 await page.goto(base);await page.locator('#accountName').fill('Navigation QA');await page.locator('#accountForm button').click();await page.waitForFunction(()=>window.VBApp?.snapshot().child.name==='Navigation QA');
 // Compact header, name visible, no dead follow-up control or duplicate report button.
 for(const [w,h] of [[390,844],[320,640],[844,390],[1440,900]]){await page.setViewportSize({width:w,height:h});assert.ok(await page.locator('.app-header').evaluate(n=>n.getBoundingClientRect().height)<=70,`header ${w}x${h}`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`width ${w}`);}
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.locator('#headerChild').textContent(),'Navigation QA');assert.equal(await page.locator('[data-followup-current]').count(),0);assert.equal(await page.locator('.app-header [data-page]').count(),0);assert.equal(await page.locator('#backToForms').getAttribute('href'),'../index.html');
 // No sideways page overflow on any section, size or language.
 // WebKit rate-limits history calls, and this sweep makes about 100 of them, so they are paused here.
 await page.evaluate(()=>{history.pushState=history.replaceState=()=>{};});
 for(const lang of ['ar','en']){if((await page.evaluate(()=>VBApp.snapshot().lang))!==lang)await page.locator('#language').click();
  for(const [w,h] of [[1440,900],[1100,700],[768,1024],[390,844],[320,640],[844,390]]){await page.setViewportSize({width:w,height:h});
   for(const name of PAGES){await page.locator(`nav [data-page=${name}]`).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${lang} ${name} ${w}x${h}`);}
  }}
 await page.locator('#language').click();await page.setViewportSize({width:390,height:844});await page.locator('nav [data-page=case]').click();
 await page.evaluate(()=>{delete history.pushState;delete history.replaceState;});await page.waitForTimeout(engine===webkit?11000:0);
 // Item numbers read correctly in Arabic: the digit comes first, on the right.
 await page.locator('nav [data-page=milestones]').click();await page.locator('[data-view=cards]').click();
 assert.equal(await page.locator('.protocol-task-text bdi').first().evaluate(n=>{const t=n.firstChild,x=k=>{const r=document.createRange();r.setStart(t,k);r.setEnd(t,k+1);return r.getBoundingClientRect().left;};return x(0)>x(1);}),true,'Arabic number order');await page.locator('[data-view=grid]').click();
 // Every section is reachable from the single menu, which stays on screen.
 for(const name of PAGES){await page.locator(`nav [data-page=${name}]`).click();assert.equal(await current(page),name);assert.equal(await page.evaluate(()=>history.state?.vbPage),name);assert.equal(new URL(page.url()).hash,'');assert.equal(await page.evaluate(()=>scrollY),0,`${name} opens at the top`);
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.waitForTimeout(100);
  const box=await page.locator('nav [aria-current]').evaluate(n=>{const r=n.getBoundingClientRect();return{top:r.top,left:r.left,right:r.right};});assert.ok(box.top>=0&&box.top<=70,`${name} menu stays on screen`);assert.ok(box.left>=0&&box.right<=390,`${name} tab visible`);}
 // Back, forward and reload keep the place inside the app.
 await page.goBack();assert.equal(await current(page),'reference');await page.goBack();assert.equal(await current(page),'tasks');await page.goForward();assert.equal(await current(page),'reference');
 // Playwright WebKit crashes on a reload after pushState when the page has already reloaded, even on a blank page.
 if(engine===chromium){await page.reload();await page.waitForFunction(()=>window.VBApp);}
 assert.equal(await current(page),'reference');assert.equal(await page.evaluate(()=>history.state?.vbPage),'reference');
 // Whole-cell targets on phones, including the far edge away from the current column.
 const hits=(selector,target,edge,y=.5)=>page.locator(selector).first().evaluate((node,{target,edge,y})=>{const box=node.getBoundingClientRect();return Boolean(document.elementFromPoint(box.left+(edge==='left'?3:box.width-3),box.top+box.height*y)?.closest(target));},{target,edge,y});
 await page.locator('nav [data-page=milestones]').click();await page.locator('.protocol-master [data-edit]').first().scrollIntoViewIfNeeded();
 assert.ok(await page.locator('.master-visits').first().evaluate(n=>n.getBoundingClientRect().width)>=44);
 for(const edge of ['left','right'])assert.equal(await hits('.master-visits','[data-edit]',edge),true,`master cell ${edge}`);
 await page.locator('nav [data-page=eesa]').click();await page.locator('.eesa-four .four-scores').first().scrollIntoViewIfNeeded();assert.ok(await page.locator('.eesa-four [data-eesa-edit]').first().evaluate(n=>n.getBoundingClientRect().height)>=44);
 for(const edge of ['left','right'])assert.equal(await hits('.eesa-four .four-scores','[data-eesa-edit]',edge),true,`EESA table ${edge}`);
 await page.locator('nav [data-page=barriers]').click();await page.locator('.barrier-plot').first().scrollIntoViewIfNeeded();for(const edge of ['left','right'])assert.equal(await hits('.barrier-plot','[data-barrier-edit]',edge,.3),true,`barrier chart ${edge}`);
 // Previous / next inside the scoring dialog never change scores on their own.
 await page.locator('nav [data-page=milestones]').click();const scores=await page.evaluate(()=>JSON.stringify(VBApp.snapshot().scores));
 await page.locator('.protocol-master [data-edit="m1-1"]').click();assert.match(await page.locator('#itemCounter').textContent(),/^\d+ \/ 170$/);
 await page.locator('[data-item-step="1"]').click();const second=await page.locator('#itemBody [data-card-id]').getAttribute('data-card-id');assert.notEqual(second,'m1-1');await page.locator('[data-item-step="-1"]').click();assert.equal(await page.locator('#itemBody [data-card-id]').getAttribute('data-card-id'),'m1-1');
 await page.locator('[data-item-step="1"]').click();assert.equal(await page.evaluate(()=>JSON.stringify(VBApp.snapshot().scores)),scores);await page.locator('#itemBody [data-score="1"]').click();assert.equal(await page.evaluate(id=>VBApp.snapshot().scores.milestones[id],second),1);
 await page.locator('[data-close=itemDialog]').click();assert.equal(await page.evaluate(()=>document.activeElement?.dataset.edit),second);
 // A browser refusing a history call must not stop a section from opening.
 await page.evaluate(()=>{history.pushState=()=>{throw new DOMException('rate limited','SecurityError');};});await page.locator('nav [data-page=eesa]').click();assert.equal(await current(page),'eesa');await page.evaluate(()=>{delete history.pushState;});await page.locator('nav [data-page=milestones]').click();
 // Back closes an open scoring dialog rather than leaving it over another section.
 await page.locator('nav [data-page=barriers]').click();await page.locator('.barrier-open').first().click();await page.goBack();await page.waitForFunction(()=>!document.querySelector('#itemDialog[open]'));assert.equal(await current(page),'milestones');
 // Focus stays on a control that redraws the page.
 await page.locator('[data-view=cards]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement?.dataset.view),'cards');
 await page.locator('[data-level="2"]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement?.dataset.level),'2');
 // English covers the account controls too.
 await page.locator('#language').click();assert.equal(await page.locator('#accounts').getAttribute('aria-label'),'Child accounts');await page.locator('#accounts').click();assert.equal(await page.locator('#parent-gate').getAttribute('dir'),'ltr');assert.match(await page.locator('#parent-gate-help').textContent(),/Solve/);await page.locator('.parent-gate-close').click();await page.locator('#language').click();
 // A completed profile has no menu to choose from, and its route stays on the report.
 await page.locator('nav [data-page=report]').click();await page.locator('[data-assessment-action=finish]').click();await page.locator('[data-confirm-assessment]').click();await page.waitForFunction(()=>VBApp.snapshot().completedAt);assert.equal(await page.locator('#navigation').isVisible(),false);assert.equal(await page.evaluate(()=>history.state?.vbPage),'report');
 // Playwright WebKit crashes on a second reload after pushState, even on a blank page, so only Chrome repeats it.
 if(engine===chromium){await page.reload();await page.waitForFunction(()=>window.VBApp);assert.equal(await current(page),'report');}

 assert.deepEqual(errors,[]);console.log('PASS: compact header, sticky single menu, opening at top, back/forward/reload, whole-cell touch targets, previous/next without score changes, focus retention, English account controls and completed-profile routing.');
}catch(e){console.error(e);process.exitCode=1;}finally{if(browser)await browser.close();server.close();}});
