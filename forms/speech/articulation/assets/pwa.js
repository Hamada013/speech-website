'use strict';
// Installation/offline support is independent of patient state and opt-in drafts.
(() => {
 const status=document.getElementById('pwaStatus'),panel=document.getElementById('pwaPanel');
 const installButton=document.getElementById('pwaInstall'),help=document.getElementById('pwaInstallHelp');
 const error=document.getElementById('pwaError'),updatePanel=document.getElementById('pwaUpdatePanel');
 const updateButton=document.getElementById('pwaUpdate'),updateDialog=document.getElementById('pwaUpdateDialog');
 let installPrompt=null,registration=null,reloadRequested=false;
 function showError(message){error.textContent=message;error.hidden=false;panel.open=true;}
 function detectInstalled(){installButton.hidden=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;}
 const standalone=matchMedia('(display-mode: standalone)');
 standalone.addEventListener?.('change',detectInstalled);detectInstalled();
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
 window.addEventListener('appinstalled',()=>{installPrompt=null;installButton.hidden=true;});
 installButton.addEventListener('click',async()=>{
  if(!installPrompt){help.hidden=!help.hidden;installButton.setAttribute('aria-expanded',String(!help.hidden));return;}
  const prompt=installPrompt;installPrompt=null;
  try{await prompt.prompt();await prompt.userChoice;}
  catch{help.hidden=false;installButton.setAttribute('aria-expanded','true');showError('تعذر فتح نافذة التثبيت. استخدم قائمة المتصفح للإضافة إلى الشاشة الرئيسية.');}
 });
 function activateUpdate(){
  if(!registration?.waiting)return;
  reloadRequested=true;updateButton.disabled=true;
  registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
 }
 function currentCaseIsSaved(){
  try{const draft=JSON.parse(localStorage.getItem(KEY)||'null');return draft?.version===1&&JSON.stringify(draft.state)===JSON.stringify(state);}
  catch{return false;}
 }
 function hasCaseData(){return JSON.stringify(state)!==JSON.stringify(freshState());}
 updateButton.addEventListener('click',()=>{
  if(hasCaseData()&&!currentCaseIsSaved()){openDialog(updateDialog);return;}
  activateUpdate();
 });
 document.getElementById('pwaCancelUpdate').addEventListener('click',()=>closeDialog(updateDialog));
 document.getElementById('pwaConfirmUpdate').addEventListener('click',()=>{closeDialog(updateDialog);activateUpdate();});
 if(!('serviceWorker' in navigator)||!window.isSecureContext){status.textContent='افتح الموقع عبر HTTPS لتفعيل التثبيت والعمل دون إنترنت.';return;}
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(reloadRequested){location.reload();return;}
  status.textContent='جاهز دون إنترنت — التطبيق وجميع الصور.';
 });
 navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'}).then(reg=>{
  registration=reg;
  function inspect(){
   if(reg.active)status.textContent='جاهز دون إنترنت — التطبيق وجميع الصور.';
   updatePanel.hidden=!reg.waiting;
   if(reg.waiting)panel.open=true;
  }
  function watch(worker){worker?.addEventListener('statechange',()=>{
   if(worker.state==='redundant'&&!reg.active){status.textContent='لم يكتمل تنزيل التطبيق والصور.';showError('اتصل بالإنترنت وأعد فتح التطبيق لإكمال تجهيزه للعمل دون إنترنت.');}
   inspect();
  });}
  inspect();watch(reg.installing);reg.addEventListener('updatefound',()=>watch(reg.installing));
  const checkUpdate=()=>{if(!document.hidden&&navigator.onLine)reg.update().catch(()=>{});};
  document.addEventListener('visibilitychange',checkUpdate);window.addEventListener('online',checkUpdate);
 }).catch(()=>{status.textContent='العمل دون إنترنت غير جاهز.';showError('تعذر تجهيز التطبيق دون إنترنت. اتصل بالإنترنت وأعد فتحه للمحاولة مجدداً.');});
})();
