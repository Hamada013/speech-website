const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.APP_PLAYWRIGHT||path.resolve(__dirname,'../voc/node_modules/playwright'));
const root=path.resolve(__dirname,'../..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.json':'application/json','.m4a':'audio/mp4'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(error,body)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const engine=process.env.APP_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch({headless:true,...(engine===chromium?{channel:'chrome'}:{})});let page;
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await context.addInitScript(()=>{
   if(!localStorage.getItem('voc-children-v1'))localStorage.setItem('voc-children-v1',JSON.stringify({schema:1,active:'ali',children:[{id:'ali',name:'علي',role:'child',apps:{voc:true,senb:true,taffaha:true},words:{},sessions:[],senb:{sessions:[]},taffaha:{attempts:[]}}]}));
   window.clips=[];HTMLMediaElement.prototype.play=function(){clips.push(this.src);clearTimeout(this.qaTimer);this.qaTimer=setTimeout(()=>this.dispatchEvent(new Event('ended')),20);return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){clearTimeout(this.qaTimer);};
  });
  page=await context.newPage();page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/,route=>route.abort());const origin=`http://127.0.0.1:${server.address().port}/tools/`;
  const gear=()=>page.locator('[data-suite-settings]:visible');
  const tool=async selector=>{if(!await page.locator(selector).isVisible())await gear().click();await page.locator(selector).click();};
  for(const app of ['voc','senb','taffaha']){
   await page.goto(origin+app+'/index.html');
   if(app==='taffaha')await page.waitForFunction(()=>window.TaffahaReports);
   assert.equal(await gear().count(),0,'Settings are workplace-only');
   if(app==='voc')await page.evaluate(()=>app.switchView('workplace'));
   else await page.locator(app==='senb'?'#homeWorkplaceBtn':'#start-practice').click();
   await gear().waitFor();
   const target=page.locator(app==='voc'?'#btn-clear':app==='senb'?'#advancedModeBtn':'#toggle-rhythm');
   assert.equal(await target.isVisible(),false,app+' starts with controls tucked away');
   await gear().click();assert.equal(await target.isVisible(),true);assert.equal(await gear().getAttribute('aria-expanded'),'true');
   await page.screenshot({path:`/private/tmp/${app}-workplace-settings.png`,animations:'disabled'});
   await gear().click();assert.equal(await target.isVisible(),false);
   await gear().click();await page.keyboard.press('Escape');assert.equal(await target.isVisible(),false);assert.ok(await gear().evaluate(el=>el===document.activeElement));
   for(const [width,height]of [[320,568],[844,390]]){
    await page.setViewportSize({width,height});await gear().click();
    assert.ok(await page.locator('#suite-workplace-settings').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}),app+' settings fit');
    await gear().click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   }
   await page.setViewportSize({width:390,height:844});
   await page.locator('[data-suite-menu]:visible').click();await page.locator('#suite-activity-menu button').first().click();
   assert.equal(await gear().count(),0);assert.equal(await page.locator('#suite-workplace-settings').isVisible(),false);
   assert.equal(await page.locator(app==='taffaha'?'#open-profile':app==='senb'?'[data-senb-child-profile]':'#home-view [data-child-profile]').isVisible(),true,'Home controls are restored');
  }
  await page.goto(origin+'senb/index.html');await page.locator('#homeWorkplaceBtn').click();
  assert.equal(await page.evaluate(()=>state.featuredAdvancedCard.title),'ولد ياكل');
  await tool('#splitWorkplaceBtn');await page.locator('#splitRotateDialog[open]').waitFor();
  assert.equal(await page.locator('#second-featuredTitle').textContent(),'بنت تاكل');
  assert.equal(await page.locator('#second-slotsRow1 .slot-card').count(),2);
  await page.setViewportSize({width:844,height:390});await page.locator('#splitRotateDialog[open]').waitFor({state:'hidden'});
  const positions=await page.locator('.sentence-workplace').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top};}));
  assert.ok(positions[0].left>=positions[1].right,'Two workplaces sit side by side in RTL');assert.equal(positions[0].top,positions[1].top);
  await page.screenshot({path:'/private/tmp/senb-split-landscape.png',animations:'disabled'});
  await page.locator('#second-nextAdvancedSentence').click();
  assert.equal(await page.locator('#featuredTitle').textContent(),'ولد ياكل');assert.equal(await page.locator('#second-featuredTitle').textContent(),'بابا يسوق');
  await page.getByRole('button',{name:'اختيار الجملة الثانية',exact:true}).click();
  await page.locator('#advancedModal').getByRole('button',{name:'بنت تاكل',exact:true}).click();
  assert.equal(await page.evaluate(()=>activeWorkplace),1);
  await page.locator('[data-workplace="1"] .slot-cover-toggle').first().click();
  assert.equal(await page.locator('[data-workplace="1"] .slot-cover-toggle').first().getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('[data-workplace="0"] .slot-cover-toggle').first().getAttribute('aria-pressed'),'false');
  // Speech uses the selected board's own grammatical context and stops on switching.
  await page.evaluate(()=>clips=[]);await page.locator('#second-slot-1-1').click();await page.waitForFunction(()=>!workplaceWordsPlaying);
  const girlAudio=await page.evaluate(()=>({actual:clips,expected:getSlotAudioSegments(state.row1Slots[1],1,1).map(segment=>new URL(segment.path,location.href).href)}));assert.deepEqual(girlAudio.actual,girlAudio.expected);
  await page.evaluate(()=>clips=[]);await page.locator('#slot-1-1').click();await page.waitForFunction(()=>!workplaceWordsPlaying);
  const boyAudio=await page.evaluate(()=>({actual:clips,expected:getSlotAudioSegments(state.row1Slots[1],1,1).map(segment=>new URL(segment.path,location.href).href)}));assert.deepEqual(boyAudio.actual,boyAudio.expected);assert.notDeepEqual(boyAudio.actual,girlAudio.actual);
  await page.locator('#second-slot-1-0').click();await tool('#clearBoardBtn');await gear().click();await page.locator('#second-slot-1-0').click({force:true});
  assert.ok(await page.evaluate(()=>SenbSplit.snapshot().boards[0].row1Slots[0]));assert.equal(await page.evaluate(()=>SenbSplit.snapshot().boards[1].row1Slots[0]),null);
  await page.getByRole('button',{name:'اختيار الجملة الثانية',exact:true}).click();await page.locator('#advancedModal').getByRole('button',{name:'بنت تاكل',exact:true}).click();
  // Toolbar settings affect both boards without selecting either one first.
  await page.locator('#second-nextAdvancedSentence').click();
  await tool('#workplaceMetronomeBtn');
  await tool('#circlesToggleBtn');
  await tool('#advancedModeBtn');
  for(const board of await page.evaluate(()=>SenbSplit.snapshot().boards)) {
   assert.equal(board.showMetronome,true);assert.equal(board.showColoredCircles,false);assert.equal(board.isAdvancedMode,false);
  }
  for(const prefix of ['', 'second-']) {
   assert.equal(await page.locator('#'+prefix+'advancedCardContainer').isVisible(),false);
   assert.equal(await page.locator('#'+prefix+'workplaceMetronomeFrame').isVisible(),true);
  }
  if(await page.locator('#suite-workplace-settings').isVisible())await gear().click();
  const centeredCards=async()=>{
   for(const prefix of ['', 'second-']) {
    const offset=await page.locator('#'+prefix+'workplaceWordFrame').evaluate(frame=>{
     const r=frame.getBoundingClientRect(),card=frame.querySelector('.slot-card').getBoundingClientRect();
     return Math.abs((card.top-r.top)-(r.bottom-card.bottom));
    });
    assert.ok(offset<1,'Cards have equal space above and below when captions are hidden');
   }
  };
  await centeredCards();
  await tool('#templateToggleBtn');await page.locator('#templateDropdown button').filter({hasText:/^3$/}).click();
  assert.deepEqual(await page.evaluate(()=>SenbSplit.snapshot().boards.map(board=>board.slotCount)),[3,3]);
  await tool('#templateToggleBtn');await page.locator('#templateDropdown button').filter({hasText:/^2$/}).click();
  await tool('#advancedModeBtn');
  if(await page.locator('#suite-workplace-settings').isVisible())await gear().click();
  // Each outer frame plays picture, words in RTL order, then one beat per word.
  for(const index of [0,1]) {
   await page.evaluate(()=>clips=[]);
   await page.locator(`[data-workplace="${index}"]`).click({position:{x:4,y:80}});
   await page.waitForFunction(()=>state.isPlayingSequence);
   await page.waitForFunction(()=>!state.isPlayingSequence);
   const played=await page.evaluate(()=>({actual:clips,expected:[new URL(state.featuredAdvancedCard.soundPath,location.href).href,...state.row1Slots.slice(0,state.slotCount).flatMap((slot,index)=>slot?getSlotAudioSegments(slot,1,index).map(segment=>new URL(segment.path,location.href).href):[]),...state.row1Slots.slice(0,state.slotCount).filter(Boolean).map(()=>getMetronomeAudioPath())]}));
   assert.deepEqual(played.actual,played.expected);
   assert.equal(await page.locator('[aria-busy="true"]').count(),0);
  }
  await page.evaluate(()=>clips=[]);await tool('#sequencePlayBtn');
  await page.waitForFunction(()=>activeWorkplace===1 && !state.isPlayingSequence);
  assert.equal(await page.evaluate(()=>clips.filter(src=>src.includes('/sounds/advanced/')).length),2,'Toolbar playback includes both sentences');
  if(await page.locator('#suite-workplace-settings').isVisible())await gear().click();
  // Keyboard activation also plays the whole sentence; changing boards cancels it.
  await page.getByRole('button',{name:'تشغيل الجملة الأولى كاملة',exact:true}).focus();
  await page.keyboard.press('Enter');await page.waitForFunction(()=>state.isPlayingSequence);
  await page.locator('#second-nextAdvancedSentence').click();
  assert.equal(await page.evaluate(()=>state.isPlayingSequence),false);
  await page.waitForTimeout(550);assert.equal(await page.locator('[aria-busy="true"]').count(),0);
  await page.locator('#second-previousAdvancedSentence').click();
  // Delete mode is shared too, while each deletion only changes its own sentence.
  await tool('#clearBoardBtn');
  if(await page.locator('#suite-workplace-settings').isVisible())await gear().click();
  assert.equal(await page.locator('.workplace-delete-card').count(),6);
  await page.locator('#slot-1-1').click({force:true});await page.locator('#second-slot-1-1').click({force:true});
  assert.deepEqual(await page.evaluate(()=>SenbSplit.snapshot().boards.map(board=>board.row1Slots[1])),[null,null]);
  await tool('#sequencePlayBtn');
  await page.waitForFunction(()=>activeWorkplace===1 && !state.isPlayingSequence);
  assert.equal(await page.locator('.workplace-delete-card').count(),0);
  await page.evaluate(()=>{SenbSplit.activate(0);loadAdvancedSentence(getAdvancedItemData('2',1,1));renderWorkplace();SenbSplit.activate(1);loadAdvancedSentence(getAdvancedItemData('2',1,3));renderWorkplace();});
  await tool('#workplaceMetronomeBtn');
  await tool('#splitWorkplaceBtn');assert.equal(await page.locator('[data-workplace="1"]').isVisible(),false);assert.equal(await page.locator('#featuredCard img').getAttribute('alt'),'ولد ياكل');
  await tool('#splitWorkplaceBtn');assert.equal(await page.locator('#second-featuredCard img').getAttribute('alt'),'بابا يسوق','Collapsing preserves the second sentence');
  await page.reload();await page.locator('#homeWorkplaceBtn').click();assert.ok(await page.locator('[data-workplace="1"]').isVisible());assert.equal(await page.locator('#second-featuredCard img').getAttribute('alt'),'بابا يسوق');
  const duplicates=await page.locator('[id]').evaluateAll(nodes=>nodes.map(n=>n.id).filter((id,i,ids)=>ids.indexOf(id)!==i));assert.deepEqual(duplicates,[]);
  await page.setViewportSize({width:390,height:844});await page.locator('#splitRotateDialog[open]').waitFor();await page.locator('#splitRotateDialog button').click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await centeredCards();
  await page.screenshot({path:'/private/tmp/senb-split-portrait.png',animations:'disabled'});
  await page.setViewportSize({width:1366,height:900});await centeredCards();
  await page.reload();await page.locator('#homeWorkplaceBtn').click();await centeredCards();
  await page.screenshot({path:'/private/tmp/senb-split-desktop.png',animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  // Child changes never inherit the other child's two sentences.
  await page.evaluate(()=>SenbProgress.signIn('سارة'));await page.reload();await page.locator('#homeWorkplaceBtn').click();assert.equal(await page.evaluate(()=>SenbSplit.enabled()),false);assert.equal(await page.locator('#featuredTitle').textContent(),'ولد ياكل');
  await tool('#splitWorkplaceBtn');await page.locator('#splitRotateDialog button').click();assert.equal(await page.locator('#second-featuredTitle').textContent(),'بنت تاكل');
  assert.deepEqual(errors,[]);await context.close();console.log('PASS: three-app settings toggles and home restoration; independent SENB sentences, grammar/audio, picker, deletion, covers, persistence, child isolation and rotation handling.');
 }catch(error){await page?.screenshot({path:'/private/tmp/workplace-controls-error.png',fullPage:true}).catch(()=>{});throw error;}
 finally{await browser.close();await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
