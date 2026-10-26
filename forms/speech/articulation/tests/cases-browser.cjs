// Real browser coverage: cases, history, comparison, responsive workplace and PDF.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.ARTICULATION_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),prefix='/forms/speech/articulation/';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),relative=decodeURIComponent(url.pathname).slice(prefix.length)||'index.html',file=path.resolve(root,relative);if(!url.pathname.startsWith(prefix)||!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(fs.readFileSync(file));});
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const engine=process.env.APP_ENGINE||'chromium',type=engine==='webkit'?webkit:chromium;
 browser=await type.launch({headless:true,...(engine==='chromium'&&fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce',serviceWorkers:'allow'});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 const url=`http://127.0.0.1:${server.address().port}${prefix}`;
 await page.addLocatorHandler(page.locator('#cloudDialog[open]'),()=>page.locator('#skipCloud').click());
 await page.goto(url);await page.locator('#welcomeLaunch').waitFor({state:'hidden'});
 assert(await page.locator('#home').isVisible());assert.equal(await page.locator('#exportText').count(),0);
 await page.locator('#homeAccounts').click();await page.locator('#caseName').fill('ليان <طفلة>');await page.locator('#createChildButton').click();
 const child1=await page.evaluate(()=>cases.activeChild);
 await page.locator('[data-date="dob"][data-part="day"]').fill('15');await page.locator('[data-date="dob"][data-part="month"]').fill('3');await page.locator('[data-date="dob"][data-part="year"]').fill('2020');
 await page.evaluate(()=>{state.meta.assessment={day:'1',month:'9',year:'2026'};save();});
 await page.locator('[data-page="screen"]').first().click();
 await page.locator('[data-score="correct"]').click();
 await page.locator('#nextPicture').click();await page.locator('[data-score="substitution"]').click();await page.locator('[data-phoneme="0"]').click();
 await page.locator('[data-note]').click();await page.locator('#trialNoteEditor [data-prop="note"]').fill('ملاحظة محفوظة');await page.locator('[data-close="trialNoteDialog"]').click();
 await page.reload();await page.locator('#welcomeLaunch').waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>selectedProbe),1);assert.equal(await page.evaluate(()=>state.trials['s1-0'].status),'correct');assert.equal(await page.evaluate(()=>state.trials['s1-1'].note),'ملاحظة محفوظة');
 await page.locator('#continueAssessment').click();await page.locator('#workplaceHelp').click();assert.equal(await page.locator('.workplace-legend svg').count(),22);await page.locator('[data-close="workplaceInfo"]').click();
 await page.locator('#toggleWorkplace').click();assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('workplace-focused')),false);await page.locator('#toggleWorkplace').click();
 for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390},{width:768,height:1024},{width:1280,height:800}]){
  await page.setViewportSize(viewport);await page.waitForFunction(()=>Math.abs(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-height'))-innerHeight)<2);
  const fit=await page.evaluate(()=>{const stage=document.querySelector('.workplace-stage').getBoundingClientRect(),image=document.querySelector('.picture-frame').getBoundingClientRect(),controls=[...document.querySelectorAll('.workplace button')].filter(b=>!b.hidden&&b.getClientRects().length).map(b=>{const r=b.getBoundingClientRect();return r.width>=43&&r.height>=43&&r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1;});return {overflow:document.documentElement.scrollWidth>innerWidth,controls:controls.every(Boolean),image:image.height>50&&image.bottom<=stage.bottom+1};});
  assert.equal(fit.overflow,false,engine+JSON.stringify(viewport));assert(fit.controls,'Controls fit '+JSON.stringify(viewport));assert(fit.image,'Image fits '+JSON.stringify(viewport));
 }
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:`/tmp/articulation-workplace-${engine}.png`});
 await page.locator('.workplace [data-page="home"]').click();
 await page.locator('#homeNewAssessment').click();await page.locator('#confirmReset').click();
 assert.equal(await page.evaluate(()=>activeChild().assessments.length),2);assert.equal(await page.evaluate(()=>Object.keys(state.trials).length),0);assert.equal(await page.locator('#childName').inputValue(),'ليان <طفلة>');
 await page.locator('[data-page="screen"]').first().click();await page.locator('[data-score="omission"]').click();await page.locator('#nextPicture').click();await page.locator('[data-score="correct"]').click();
 // A changed elicitation mode must be excluded from the paired change score.
 await page.locator('[data-setting="mode"][data-value="imitation"]').click();
 await page.locator('.workplace [data-page="home"]').click();await page.locator('#homeReports').click();
 assert.equal(await page.locator('#reportHistory button').count(),2);assert.equal(await page.locator('#reportPreview .assessment-table tbody tr').count(),84);
 const currentId=await page.evaluate(()=>cases.activeAssessment);
 await page.locator('#reportHistory button').last().click();assert.match(await page.locator('#reportPreview').textContent(),/ملاحظة محفوظة/);assert.equal(await page.evaluate(()=>cases.activeAssessment),currentId);assert.equal(await page.evaluate(()=>state.trials['s1-0'].status),'omission');
 await page.locator('#compareButton').click();await page.locator('[data-compare-choice]').first().click();await page.locator('[data-compare-choice]').last().click();await page.locator('#confirmCompare').click();
 assert.equal(await page.locator('.comparison-table tbody tr').count(),84);assert.equal(await page.locator('.comparison-document .stat strong').first().textContent(),'1');
 assert.match(await page.locator('.comparison-key').textContent(),/2026-09-01/);assert(await page.locator('.bar.old').count()>0);assert(await page.locator('.bar.new').count()>0);
 assert.equal(await page.evaluate(()=>cases.activeAssessment),currentId);
 await page.evaluate(()=>{window.print=()=>{window.printCalled=true;};});await page.locator('#exportPdf').click();assert(await page.evaluate(()=>window.printCalled));assert.equal(await page.locator('#printArea .comparison-table tbody tr').count(),84);
 if(engine==='chromium'){await page.pdf({path:'/tmp/articulation-comparison.pdf',format:'A4',printBackground:true,preferCSSPageSize:true});}
 await page.locator('#homeReports').click();
 await page.locator('.report-language [role="combobox"]').click();await page.getByRole('option',{name:'English',exact:true}).click();
 assert.match(await page.locator('#reportPreview').textContent(),/Speech Sound Assessment Report/);assert.equal(await page.locator('#reportPreview .assessment-table tbody tr').count(),84);
 await page.locator('#exportPdf').click();
 if(engine==='chromium'){await page.pdf({path:'/tmp/articulation-individual.pdf',format:'A4',printBackground:true,preferCSSPageSize:true});}

 await page.locator('#accountsButton').click();await page.locator('#caseName').fill('آدم');await page.locator('#createChildButton').click();
 assert.equal(await page.evaluate(()=>Object.keys(state.trials).length),0);const child2=await page.evaluate(()=>cases.activeChild);
 await page.locator('#homeButton').click();await page.locator('#accountsButton').click();await page.locator(`[data-child="${child1}"]`).click();assert.equal(await page.evaluate(()=>state.trials['s1-0'].status),'omission');
 await page.locator('#accountsButton').click();await page.locator(`[data-delete-child="${child2}"]`).click();await page.locator('[data-close="deleteChildDialog"]').click();assert.equal(await page.evaluate(()=>cases.children.length),2);
 await page.locator(`[data-delete-child="${child2}"]`).click();await page.locator('#confirmDeleteChild').click();assert.equal(await page.evaluate(()=>cases.children.length),1);assert.equal(await page.evaluate(()=>activeChild().assessments.length),2);await page.locator('[data-close="accountsDialog"]').click();
 // A failed device write must block switching; the working assessment stays available.
 assert.equal(await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota');};const ok=createChild('تعذر');Storage.prototype.setItem=original;return ok;}),false);assert.equal(await page.evaluate(()=>cases.activeChild),child1);assert.match(await page.locator('#message').textContent(),/تعذر/);
 await page.evaluate(()=>saveCase());
 // Real second-tab deletion cannot be undone by a stale tab saving.
 const other=await context.newPage();await other.goto(url);await other.evaluate(()=>deleteChild(cases.activeChild));await page.waitForFunction(()=>!cases.activeChild);assert.equal(await page.evaluate(()=>saveCase()),false);assert.equal(await page.evaluate(()=>readCases().children.length),0);await other.close();
 await page.reload();await page.locator('#welcomeLaunch').waitFor({state:'hidden'});await page.screenshot({path:`/tmp/articulation-home-${engine}.png`});
 const migrated=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'});
 await migrated.addInitScript(()=>{if(!sessionStorage.getItem('migration-fixture')){localStorage.setItem('aghanem-arabic-articulation-v1',JSON.stringify({version:1,state:{meta:{childName:'حالة سابقة'},trials:{'s4-0':{status:'substitution',actual:'t'}},patterns:[],recommendations:[]}}));sessionStorage.setItem('migration-fixture','1');}});
 const legacy=await migrated.newPage();await legacy.goto(url);assert.equal(await legacy.evaluate(()=>activeChild().name),'حالة سابقة');assert.equal(await legacy.evaluate(()=>state.trials['s4-0'].status),'substitution');assert.equal(await legacy.evaluate(()=>state.trials['s4-0'].targetIPA),'');assert.equal(await legacy.evaluate(()=>localStorage.getItem(KEY)),null);await legacy.reload();assert.equal(await legacy.evaluate(()=>cases.children.length),1);await migrated.close();
 assert.deepEqual(errors,[]);console.log(`PASS ${engine}: child isolation, autosave/reload, dated history, matched comparisons, all 84 records, bilingual PDF, legacy migration, confirmation, quota failure, cross-tab deletion and five viewport sizes.`);
 await context.close();
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();server.closeAllConnections();});
