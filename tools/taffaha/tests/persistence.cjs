// Focused restart/storage check without a simulated microphone's live audio
// graph. Native recording/codec tests remain in browser.cjs.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.TAFFAHA_PLAYWRIGHT||'playwright'),engine=process.env.TAFFAHA_ENGINE||'chromium',offlineWebkit=engine==='webkit'&&process.env.TAFFAHA_WEBKIT_OFFLINE==='1';
const root=path.resolve(__dirname,'../../..'),profile=fs.mkdtempSync('/private/tmp/taffaha-storage-');
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.m4a':'audio/mp4'};
let server,context;
async function launch(){
 if(offlineWebkit){const browser=await webkit.launch({headless:true}),ctx=await browser.newContext({viewport:{width:390,height:844}});ctx.on('close',()=>browser.close().catch(()=>{}));return ctx;}
 return(engine==='webkit'?webkit:chromium).launchPersistentContext(profile,{headless:true,viewport:{width:390,height:844},...(engine==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
}
async function rpc(p,type,extra={}){return p.evaluate(async({type,extra})=>(await import('./offline.js')).rpc(type,extra),{type,extra});}
(async()=>{
 server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost'),f=path.resolve(root,'.'+decodeURIComponent(u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname));if(!f.startsWith(root+path.sep))return res.writeHead(403).end();res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'}).end(await fs.promises.readFile(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/tools/taffaha/`;
 try{
  context=await launch();let p=context.pages()[0]||await context.newPage();await p.goto(base);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await p.evaluate(async()=>{
   const storage=await import('./storage.js'),rate=16000,count=8000,buffer=new ArrayBuffer(44+count*2),v=new DataView(buffer),text=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};text(0,'RIFF');v.setUint32(4,36+count*2,true);text(8,'WAVE');text(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,count*2,true);for(let i=0;i<count;i++)v.setInt16(44+i*2,Math.sin(2*Math.PI*220*i/rate)*3000,true);const blob=new Blob([buffer],{type:'audio/wav'});
   for(const segment of ['تُفْ','فا','حة'])await storage.putRecording({id:storage.recordingID('voc-6-1',segment,'child'),wordID:'voc-6-1',segment,kind:'child',label:'تفاحة',created:Date.now(),duration:500,blob});
  });await p.reload();await p.waitForFunction(()=>document.querySelectorAll('.syllable-circle.has-recording').length===3);
  await p.locator('#open-offline').click();await p.waitForFunction(()=>document.querySelectorAll('#download-libraries input').length===3);await p.locator('input[value=voc]').uncheck();await p.locator('input[value=senb]').uncheck();await p.locator('#download').click();
  try{await p.waitForFunction(()=>!document.getElementById('download').disabled,null,{timeout:75000});}catch(e){throw Error('Download wait: '+await p.locator('#download-status').innerText());}
  const status=await p.locator('#download-status').innerText();
  if(engine==='webkit'&&!offlineWebkit){
   // This Playwright persistent WebKit profile discards Cache API writes. The
   // main browser test uses a regular WebKit context for actual offline checks.
   // Here prove the app reports that storage failure and IDB survives restart.
   assert.match(status,/لم يتمكن المتصفح من حفظ/);
   await context.close();context=null;context=await launch();p=context.pages()[0]||await context.newPage();await p.goto(base);
   await p.waitForFunction(()=>document.querySelectorAll('.syllable-circle.has-recording').length===3);
   assert.equal(await p.locator('.record-button:visible').count(),0);
   await p.locator('#sequence').click();await p.waitForFunction(()=>document.getElementById('sequence').getAttribute('aria-busy')==='false');assert.equal(await p.locator('#status').innerText(),'');
   await rpc(p,'CLEAR');assert.equal(await p.evaluate(async()=>(await(await import('./storage.js')).listRecordings()).length),3);
   console.log('webkit: full browser restart retained and played saved recordings; failed cache storage reports an error; clearing downloads preserved recordings');return;
  }
  if(!status.includes('جاهز'))throw Error('Download result: '+status);
  console.log(engine+': complete library download passed without microphone simulation');
  await p.locator('#offline-dialog [data-close]').click();await p.locator('#original').click();await p.waitForFunction(()=>!document.querySelector('.is-playing'));
  await new Promise(r=>server.close(r));
  if(offlineWebkit){await p.close();p=await context.newPage();}else{await context.close();context=null;context=await launch();p=context.pages()[0]||await context.newPage();}
  await p.goto(base);await p.waitForFunction(()=>document.querySelectorAll('.syllable-circle.has-recording').length===3);assert.equal(await p.locator('.record-button:visible').count(),0);await p.locator('#sequence').click();await p.waitForFunction(()=>document.getElementById('sequence').getAttribute('aria-busy')==='false');assert.equal(await p.locator('#status').innerText(),'');
  const r=await p.evaluate(async()=>{const r=await fetch('../arabicsounds/sounds/1.m4a',{headers:{Range:'bytes=0-31'}});return[r.status,(await r.arrayBuffer()).byteLength];});assert.deepEqual(r,[206,32]);await rpc(p,'CLEAR');assert.equal(await p.evaluate(async()=>(await(await import('./storage.js')).listRecordings()).length),3);
  console.log(engine+': '+(offlineWebkit?'offline page reopening':'full offline browser restart')+' retained recordings and played them from circles/sequence; clearing downloads preserved takes');
 }finally{await context?.close();if(server.listening)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);console.error('Persistent profile:',profile);process.exitCode=1;});
