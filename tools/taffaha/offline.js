import './assets/updates.js';
const $=id=>document.getElementById(id);
let registration,downloading=false;
export function rpc(type,extra={}){
 return new Promise((resolve,reject)=>{
  const worker=navigator.serviceWorker?.controller||registration?.active;if(!worker)return reject(Error('التطبيق غير جاهز للتنزيل. انتظر قليلًا أو أعد فتحه.'));
  const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('انقطع التنزيل. أبقِ التطبيق مفتوحًا واستكمله مجددًا.'));},55000);
  channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();e.data.ok?resolve(e.data.result):reject(Error(e.data.error));};
  worker.postMessage({type,...extra},[channel.port2]);
 });
}
function render(result){
 const {count=0,total=0}=result.groups.taffaha||{};
 const percent=total?Math.min(100,Math.floor(count/total*100)):0;
 $('download-progress').value=percent;
 $('download-status').textContent=`${percent}%`;
 $('download-error').hidden=true;
 return total>0&&count===total;
}
function showError(message){$('download-error').textContent=message;$('download-error').hidden=false;}
export async function refreshOffline(){try{render(await rpc('STATUS'));}catch(e){showError(e.message);}}
export async function initOffline(){
 window.addEventListener('beforeinstallprompt',e=>e.preventDefault());
 $('download').onclick=async()=>{
  if(downloading)return;
  downloading=true;$('download').disabled=true;window.AppUpdates.setBusy(true);
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
  catch(e){showError(e.message);}
  finally{downloading=false;$('download').disabled=false;window.AppUpdates.setBusy(false);}
 };
 if(!isSecureContext||!('serviceWorker'in navigator)){showError('التنزيل دون إنترنت يحتاج HTTPS أو localhost ومتصفحًا يدعم تطبيقات الويب.');$('download').disabled=true;return;}
 try{
  registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  window.AppUpdates.watch(registration,{dialogId:'update-notice',buttonId:'apply-update',command:'SKIP_WAITING',onFirstControl:refreshOffline});
  await navigator.serviceWorker.ready;await refreshOffline();
 }catch(e){showError('لم يكتمل تجهيز التطبيق دون اتصال. تحقق من الاتصال ثم أعد فتحه.');}
}
