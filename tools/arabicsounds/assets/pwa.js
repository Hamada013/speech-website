import {MEDIA} from './release.js';
import './updates.js';
const $=id=>document.getElementById(id),dialog=$('install-dialog');
let registration,downloading=false;
const mediaURLs=MEDIA.map(entry=>new URL(entry.url,document.baseURI).href);
window.addEventListener('beforeinstallprompt',event=>event.preventDefault());
function showError(error){$('offline-error').textContent=error?.message||'تعذر تجهيز التنزيل. اتصل بالإنترنت ثم حاول مجدداً.';$('offline-error').hidden=false;}
export function request(type,url){return new Promise((resolve,reject)=>{
 const controller=navigator.serviceWorker?.controller,script=new URL('sw.js',document.baseURI).href;
 const worker=controller?.scriptURL===script?controller:registration?.active;
 if(!worker){reject(Error('انتظر تجهيز التطبيق ثم أعد المحاولة.'));return;}
 const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('انتهت مهلة التنزيل. حاول مجدداً.'));},45000);
 channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();event.data.error?reject(Error(event.data.error)):resolve(event.data);};
 worker.postMessage({type,url},[channel.port2]);
});}
function display(count){
 const percent=MEDIA.length?Math.min(100,Math.floor(count/MEDIA.length*100)):0;
 $('offline-progress').value=percent;$('offline-status').textContent=`${percent}%`;$('offline-error').hidden=true;
}
async function sync(){const state=await request('STATUS');display(state.count);return state;}
$('install').addEventListener('click',()=>{if(!dialog.open)dialog.showModal();sync().catch(showError);});
$('offline-download').addEventListener('click',async()=>{
 if(downloading)return;downloading=true;$('offline-download').disabled=true;window.AppUpdates.setBusy(true);
 navigator.storage?.persist?.().catch(()=>{});
 try{
  const state=await sync(),missing=mediaURLs.filter(url=>!state.urls.includes(url));let next=0,count=state.count,failed=null;
  await Promise.all(Array.from({length:3},async()=>{while(next<missing.length&&!failed){const url=missing[next++];try{await request('CACHE_ONE',url);count++;if(!failed)display(count);}catch(error){failed=error;}}}));
  if(failed)throw failed;await sync();
 }catch(error){showError(error);}
 finally{downloading=false;$('offline-download').disabled=false;window.AppUpdates.setBusy(false);}
});
async function init(){
 if(!('serviceWorker'in navigator)||!isSecureContext){showError(Error('افتح التطبيق عبر HTTPS أو localhost لتفعيل التنزيل.'));return;}
 try{
  const scope=new URL('./',document.baseURI).href;
  registration=await navigator.serviceWorker.getRegistration(scope);
  if(registration?.scope!==scope||!registration.active)registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  window.AppUpdates.watch(registration,{onFirstControl:()=>sync().catch(showError)});
  if(!registration.active)await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('تعذر تجهيز التطبيق. أعد فتحه ثم حاول مجدداً.')),45000);
   const check=()=>{if(registration.active){clearTimeout(timer);resolve();}else if(registration.installing?.state==='redundant'){clearTimeout(timer);reject(Error('تعذر تنزيل ملفات التطبيق.'));}};
   registration.installing?.addEventListener('statechange',check);registration.addEventListener('updatefound',()=>registration.installing?.addEventListener('statechange',check));check();
  });
  await sync();$('offline-download').disabled=false;
 }catch(error){showError(error);}
}
void init();
