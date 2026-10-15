const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.TAFFAHA_PLAYWRIGHT||'playwright'),engine=process.env.TAFFAHA_ENGINE||'chromium';
const root=path.resolve(__dirname,'../../..'),out='/private/tmp/taffaha-qa',userData=fs.mkdtempSync('/private/tmp/taffaha-persistent-');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.m4a':'audio/mp4'};
let server,base,context;
async function start(){server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname.includes('missing-slow'))await new Promise(r=>setTimeout(r,250));const file=path.resolve(root,'.'+decodeURIComponent(url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();const data=await fs.promises.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(data);}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}/tools/taffaha/`;}
async function stop(){if(server?.listening)await new Promise(r=>server.close(r));}
async function launch(){
 // Playwright WebKit 1.56.1's persistent profile silently discards Cache API
 // writes on this workstation, even in a minimal unrelated page. Use its
 // regular context for offline tests; persistence.cjs isolates real IDB restart.
 if(engine==='webkit'){
  const browser=await webkit.launch({headless:true}),ctx=await browser.newContext({viewport:{width:390,height:844}});
  ctx.on('close',()=>browser.close().catch(()=>{}));return ctx;
 }
 return chromium.launchPersistentContext(userData,{headless:true,viewport:{width:390,height:844},executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',permissions:['microphone'],args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
}
async function rpc(p,type,extra={}){return p.evaluate(async({type,extra})=>(await import('./offline.js')).rpc(type,extra),{type,extra});}
async function choose(p,word){await p.locator('#open-library').click();await p.locator(`#category-filters button[data-count="${word.syllables.length}"]`).click();await p.getByRole('button',{name:word.label,exact:true}).click();await p.waitForFunction(()=>!document.getElementById('word-image').dataset.loading&&document.getElementById('word-image').complete);assert.equal(await p.locator('#word-label').innerText(),word.label);}
async function record(p,n=0,repeatButton=false){
 try{await p.locator('.record-button').nth(n).click();await p.waitForFunction(()=>!document.getElementById('recording-bar').hidden&&!document.getElementById('finish-recording').disabled,null,{timeout:10000});await p.waitForTimeout(engine==='webkit'?1800:850);await p.locator(repeatButton?`.record-button[data-index="${n}"]`:'#finish-recording').click();await p.waitForFunction(()=>document.getElementById('recording-bar').hidden,null,{timeout:12000});assert.match(await p.locator('#status').innerText(),/تم الحفظ/);}
 catch(e){await p.screenshot({path:out+'/'+engine+'-record-error.png',fullPage:true});throw Error(e.message+'; '+await p.locator('#status').innerText());}
}
(async()=>{
 await start();try{
  context=await launch();let p=context.pages()[0]||await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base);await p.waitForFunction(()=>document.querySelectorAll('.syllable-circle').length===3);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  if(engine==='webkit')await p.evaluate(()=>{let input;navigator.mediaDevices.getUserMedia=async()=>{if(!input){const context=new AudioContext(),oscillator=context.createOscillator(),destination=context.createMediaStreamDestination(),mute=context.createGain();mute.gain.value=0;oscillator.connect(destination);oscillator.connect(mute);mute.connect(context.destination);oscillator.start();input={context,destination};}input.context.resume().catch(()=>{});return input.destination.stream.clone();};});

  assert.equal(await p.locator('.syllable-tools:visible').count(),0);assert.equal(await p.locator('#toggle-recording').getAttribute('aria-pressed'),'false');assert.equal(await p.locator('#settings-dialog,#open-settings').count(),0);assert.equal(await p.locator('.syllable-tools button').count(),3);
  for(const id of ['original','previous','next','random']){assert.equal(await p.locator('#'+id).innerText(),'');assert.equal(await p.locator('#'+id+' svg').count(),1);}
  assert.match(await p.locator('footer').innerText(),/SPEECH AND LANGUAGE PATHOLOGY\nAhmad Ghanem\nLatakia - Syria\nslp.ahmadghanem@gmail.com/);
  const words=JSON.parse(fs.readFileSync(path.join(root,'tools/taffaha/assets/words.json'))).words;
  for(const word of words){await choose(p,word);const src=await p.locator('#word-image').getAttribute('src');assert.ok(new URL(src).pathname.endsWith('/voc/'+word.image.path),word.label);assert.equal(new URL(src).searchParams.get('v'),word.image.revision);assert.equal(await p.locator('.syllable-circle').count(),word.syllables.length);}
  // A delayed, failing previous request cannot replace the current picture.
  await p.evaluate(async()=>{const{loadImage}=await import('./assetsManager.js'),img=document.getElementById('word-image');loadImage(img,{library:'voc',path:'images/missing-slow.webp'},'old');loadImage(img,{library:'voc',path:'images/6/1.webp'},'تفاحة');});await p.waitForTimeout(450);assert.ok((await p.locator('#word-image').getAttribute('src')).endsWith('/images/6/1.webp'));
  const apple=words.find(w=>w.label==='تفاحة');await choose(p,apple);await p.screenshot({path:out+'/'+engine+'-mobile.png',fullPage:true});
  // Device voice is only the fallback. Once saved, a circle bypasses it.
  await p.evaluate(async()=>{const{AudioEngine}=await import('./audio.js');window.spoken=[];AudioEngine.prototype.speak=function(text){window.spoken.push(text);return Promise.resolve();};});
  await p.locator('.syllable-circle').first().click();await p.waitForFunction(()=>window.spoken.length===1);
  await p.locator('#toggle-recording').click();assert.equal(await p.locator('.record-button:visible').count(),3);await record(p,0,true);
  await p.locator('.syllable-circle').first().click();await p.waitForFunction(()=>!document.querySelector('.lit'));assert.equal(await p.evaluate(()=>window.spoken.length),1,'Saved recording overrides device voice');
  await record(p,1);await record(p,2);
  await p.evaluate(()=>{window.highlightOrder=[];new MutationObserver(changes=>{for(const c of changes)if(c.target.classList.contains('lit'))window.highlightOrder.push(Number(c.target.dataset.index));}).observe(document.getElementById('syllables'),{subtree:true,attributes:true,attributeFilter:['class']});});
  await p.locator('#sequence').click();await p.waitForFunction(()=>document.getElementById('sequence').getAttribute('aria-busy')==='false');assert.deepEqual(await p.evaluate(()=>window.highlightOrder),[0,1,2]);assert.equal(await p.evaluate(()=>window.spoken.length),1);
  await p.evaluate(()=>{window.MediaRecorder=undefined;});await record(p,0);const types=await p.evaluate(async()=>{const s=await import('./storage.js');return(await s.listRecordings()).map(r=>r.mime);});assert.ok(types.includes('audio/wav'));
  // Old model takes remain accessible with the same database and stable IDs.
  await p.evaluate(async()=>{const s=await import('./storage.js'),records=await s.listRecordings(),take=await s.getRecording(records[0].id);await s.putRecording({...take,id:s.recordingID('voc-6-3','مو','model'),wordID:'voc-6-3',segment:'مو',kind:'model',label:'موزة',created:1});});
  const banana=words.find(w=>w.label==='موزة');
  await choose(p,apple);await p.locator('#toggle-recording').click();assert.equal(await p.locator('.record-button:visible').count(),0);await p.locator('#toggle-recording').click();
  await p.evaluate(()=>{window.oldMic=navigator.mediaDevices.getUserMedia;navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};});await p.locator('.record-button').first().click();await p.waitForFunction(()=>document.getElementById('status').textContent.includes('لم يُسمح'));assert.ok(await p.locator('#next').isEnabled());await p.evaluate(()=>{navigator.mediaDevices.getUserMedia=window.oldMic;});
  // Every category remains usable at the narrowest tested phone width.
  await p.setViewportSize({width:320,height:740});for(const n of [1,2,3,4,5]){await choose(p,words.find(w=>w.syllables.length===n));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const ys=await p.locator('.syllable-circle').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().y));assert.ok(ys.every(y=>y===ys[0]),'Syllable group '+n+' fits in one row');}await p.setViewportSize({width:390,height:844});await choose(p,apple);
  console.log(engine+': 25 reviewed mappings, groups 1–5, hidden recording controls, recorded-circle playback, RTL sequence, legacy takes and WAV fallback passed');
  await p.evaluate(()=>caches.open('ihki-preserve-sentinel').then(c=>c.put('/sentinel',new Response('ok'))));await p.locator('#open-offline').click();await p.waitForFunction(()=>document.querySelectorAll('#download-libraries input').length===3);await p.locator('input[value=voc]').uncheck();await p.locator('input[value=senb]').uncheck();await p.locator('#download').click();await p.waitForFunction(()=>!document.getElementById('download').disabled,null,{timeout:75000});const downloadText=await p.locator('#download-status').innerText();if(!downloadText.includes('جاهز'))throw Error('Library download failed: '+downloadText);await p.locator('#offline-dialog [data-close]').click();await p.locator('#original').click();await p.waitForFunction(()=>!document.querySelector('.is-playing'));
  const legacy=await context.newPage();await legacy.addInitScript(()=>{HTMLDialogElement.prototype.showModal=undefined;HTMLDialogElement.prototype.close=undefined;});await legacy.goto(base);await legacy.locator('#open-offline').click();assert.equal(await legacy.locator('.legacy-dialog[open]').count(),1);await legacy.keyboard.press('Escape');await legacy.close();
  await stop();
  // Chrome restarts its full browser offline. WebKit reopens its page offline
  // in the working Cache API context; its full IDB restart is checked separately.
  if(engine==='webkit'){await p.close();p=await context.newPage();}
  else{await context.close();context=null;context=await launch();p=context.pages()[0]||await context.newPage();}
  p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.waitForFunction(()=>document.querySelectorAll('.syllable-circle.has-recording').length===3);assert.equal(await p.locator('.record-button:visible').count(),0);await p.waitForFunction(()=>!document.getElementById('word-image').dataset.loading);assert.ok((await p.locator('#word-image').getAttribute('src')).includes('/voc/images/6/1.webp'));
  await p.locator('.syllable-circle').first().click();await p.waitForFunction(()=>!document.querySelector('.lit'));await p.locator('#sequence').click();await p.waitForFunction(()=>document.getElementById('sequence').getAttribute('aria-busy')==='false');assert.equal(await p.locator('#status').innerText(),'');
  await choose(p,banana);assert.ok(await p.locator('.syllable-circle').first().evaluate(b=>b.classList.contains('has-recording')));await p.locator('.syllable-circle').first().click();await p.waitForFunction(()=>!document.querySelector('.lit'));await choose(p,apple);
  const range=await p.evaluate(async()=>{const r=await fetch('../arabicsounds/sounds/1.m4a',{headers:{Range:'bytes=0-31'}});return[r.status,(await r.arrayBuffer()).byteLength];});assert.deepEqual(range,[206,32]);await rpc(p,'CLEAR');assert.ok(await p.evaluate(()=>caches.has('ihki-preserve-sentinel')));assert.equal(await p.evaluate(async()=>(await(await import('./storage.js')).listRecordings()).length),4);await p.locator('.syllable-circle').first().click();await p.waitForFunction(()=>!document.querySelector('.lit'));
  await p.setViewportSize({width:1280,height:900});await p.screenshot({path:out+'/'+engine+'-desktop.png',fullPage:true});assert.deepEqual(errors,[]);console.log(engine+': '+(engine==='webkit'?'offline page reopening':'full offline browser restart')+' retained saved syllables; shell/playback, byte ranges and cache isolation passed');
 }finally{await context?.close();await stop();}
})().catch(e=>{console.error(e);console.error('Persistent test profile:',userData);process.exitCode=1;});
