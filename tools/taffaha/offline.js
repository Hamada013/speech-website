const $=id=>document.getElementById(id);
let registration,downloading=false,promptEvent;
export function rpc(type,extra={}){
 return new Promise((resolve,reject)=>{
  const worker=navigator.serviceWorker?.controller||registration?.active;if(!worker)return reject(Error('التطبيق غير جاهز للتنزيل. انتظر قليلًا أو أعد فتحه.'));
  const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('انقطع التنزيل. أبقِ التطبيق مفتوحًا واستكمله مجددًا.'));},55000);
  channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();e.data.ok?resolve(e.data.result):reject(Error(e.data.error));};
  worker.postMessage({type,...extra},[channel.port2]);
 });
}
function render(result){
 const {count=0,total=0,bytes=0}=result.groups.taffaha||{};
 $('download-progress').max=total||1;$('download-progress').value=count;
 $('download-status').textContent=total&&count===total?'جاهز للاستخدام دون اتصال ✔':`${count} من ${total} ملف محفوظ على الجهاز · ${(bytes/1e6).toFixed(1)} MB${downloading?' — احتفظ بالتطبيق مفتوحًا حتى يكتمل التنزيل.':''}`;
 return total>0&&count===total;
}
export async function refreshOffline(){try{render(await rpc('STATUS'));}catch(e){$('download-status').textContent=e.message;}}
export async function initOffline(){
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;});
 $('install').onclick=async()=>{if(promptEvent){await promptEvent.prompt();await promptEvent.userChoice;promptEvent=null;}else {$('install-help').hidden=false;$('install-help').textContent=matchMedia('(display-mode: standalone)').matches?'التطبيق مفتوح من الشاشة الرئيسية.':'على iPhone: مشاركة ← إضافة إلى الشاشة الرئيسية. على Android: قائمة المتصفح ← تثبيت التطبيق.';}};
 $('download').onclick=async()=>{
  if(downloading)return;
  downloading=true;$('download').disabled=true;$('apply-update').disabled=true;
  navigator.storage?.persist?.().catch(()=>{});
  try{
   let result=await rpc('STATUS'),done=render(result);
   const saved=r=>r.groups.taffaha?.count||0;
   while(!done){
    const next=await rpc('BATCH');done=render(next);
    // Some restricted browser profiles silently discard Cache Storage writes.
    // Do not retry the same files forever or claim they are available offline.
    if(!done&&saved(next)<=saved(result))throw Error('لم يتمكن المتصفح من حفظ ملفات التنزيل. افتح التطبيق في المتصفح العادي وتحقق من مساحة الجهاز.');
    result=next;
   }
  }
  catch(e){$('download-status').textContent=e.message;}
  finally{downloading=false;$('download').disabled=false;$('apply-update').disabled=false;}
 };
 if(!isSecureContext||!('serviceWorker'in navigator)){$('download-status').textContent='التنزيل دون إنترنت يحتاج HTTPS أو localhost ومتصفحًا يدعم تطبيقات الويب.';$('download').disabled=true;return;}
 try{
  let controlled=!!navigator.serviceWorker.controller,reloading=false,lastCheck=0;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
   // Reload existing windows together to keep new code and media in sync.
   if(controlled&&!reloading){reloading=true;location.reload();return;}
   controlled=true;refreshOffline();
  });
  registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  const showUpdate=()=>{if(registration.waiting)$('update-notice').hidden=false;};
  const watch=worker=>worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate();});
  registration.addEventListener('updatefound',()=>watch(registration.installing));
  watch(registration.installing);showUpdate();
  $('apply-update').onclick=()=>{
   if(!registration.waiting||downloading)return;
   $('apply-update').disabled=true;registration.waiting.postMessage({type:'SKIP_WAITING'});
  };
  const checkUpdate=()=>{
   if(document.hidden||!navigator.onLine||Date.now()-lastCheck<60000)return;
   lastCheck=Date.now();registration.update().then(showUpdate).catch(()=>{});
  };
  window.addEventListener('online',checkUpdate);
  document.addEventListener('visibilitychange',checkUpdate);
  setInterval(checkUpdate,5*60*1000);checkUpdate();
  await navigator.serviceWorker.ready;await refreshOffline();
 }catch(e){$('download-status').textContent='لم يكتمل تجهيز التطبيق دون اتصال. تحقق من الاتصال ثم أعد فتحه.';}
}
