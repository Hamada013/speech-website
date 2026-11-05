export function setupPwa({t,canUpdate,fail}) {
 let registration=null,installPrompt=null,waiting=null;
 const $=s=>document.querySelector(s),status=message=>{$('#offline-status').textContent=message;};
 const install=$('#install-button'),retry=$('#offline-retry'),update=$('#update-now');
 function labels(){
  $('#offline-title').textContent=t('تنزيل وتثبيت التطبيق','Offline download and install');
  $('#install-help').textContent=t('على iPhone وiPad: مشاركة ← إضافة إلى الشاشة الرئيسية. على الكمبيوتر أو Android استخدم تثبيت التطبيق من المتصفح. يلزم HTTPS أو localhost.','On iPhone/iPad: Share → Add to Home Screen. On desktop/Android use the browser’s install option. HTTPS or localhost is required.');
  install.textContent=t('تثبيت التطبيق','Install app');retry.textContent=t('إعادة المحاولة','Retry');
  $('#update-title').textContent=t('تحديث جاهز','Update available');$('#update-message').textContent=t('يمكن تحميل النسخة الجديدة الآن. ستبقى سجلاتك المحفوظة على الجهاز.','A new version is ready. Your saved records remain on this device.');update.textContent=t('تحديث الآن','Update now');$('#update-later').textContent=t('لاحقاً','Later');
 }
 function offer(worker){waiting=worker;if(!worker||!navigator.serviceWorker.controller)return;labels();if(!$('#update-dialog').open)$('#update-dialog').showModal();}
 async function prepare(){
  labels();retry.hidden=true;status(t('جارٍ حفظ التطبيق للاستخدام دون إنترنت…','Saving the app for offline use…'));
  if(!('serviceWorker'in navigator)||!window.isSecureContext){status(t('يتطلب الاستخدام دون إنترنت اتصال HTTPS أو localhost ومتصفحاً يدعم التطبيق.','Offline use requires HTTPS or localhost and a browser with service-worker support.'));return;}
  try{
   registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
   const worker=registration.installing||registration.waiting||registration.active;
   if(worker&&worker.state!=='activated'&&!registration.waiting)await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('timeout')),20000);worker.addEventListener('statechange',()=>{if(worker.state==='activated'||worker.state==='installed'){clearTimeout(timer);resolve();}if(worker.state==='redundant'){clearTimeout(timer);reject(Error('install'));}});});
   if(registration.active)status(t('جاهز للاستخدام دون إنترنت. يمكنك إضافة التطبيق إلى الشاشة الرئيسية.','Ready for offline use. You can add the app to your home screen.'));
   else if(registration.waiting)status(t('تم تنزيل التحديث؛ النسخة الحالية محفوظة دون إنترنت.','The update is downloaded; the current version remains available offline.'));
   else throw Error('not ready');
   if(registration.waiting)offer(registration.waiting);
   registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&registration.waiting)offer(registration.waiting);});});
  }catch{retry.hidden=false;status(t('لم يكتمل التنزيل. تحقق من الاتصال ثم أعد المحاولة.','The offline download did not complete. Check the connection and retry.'));}
 }
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;install.hidden=false;});
 window.addEventListener('appinstalled',()=>{installPrompt=null;install.hidden=true;});
 install.onclick=async()=>{if(!installPrompt)return;const prompt=installPrompt;await prompt.prompt();await prompt.userChoice;installPrompt=null;install.hidden=true;};
 retry.onclick=prepare;$('#update-later').onclick=()=>$('#update-dialog').close();
 let accepting=false;
 update.onclick=()=>{if(!canUpdate()){fail(t('احفظ التغييرات أولاً ثم حدّث التطبيق.','Save the pending changes before updating.'));return;}if(!waiting){$('#update-dialog').close();return;}accepting=true;update.disabled=true;waiting.postMessage({type:'ACTIVATE_UPDATE'});};
 navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(accepting)location.reload();});
 void prepare();
 return {open(){labels();$('#offline-dialog').showModal();},retry:prepare};
}
