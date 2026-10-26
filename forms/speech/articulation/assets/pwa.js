'use strict';
// Scoped offline download, installation and saved-case-safe updates.
(() => {
 const status=document.getElementById('pwaStatus'),error=document.getElementById('pwaError');
 const install=document.getElementById('pwaInstall'),help=document.getElementById('pwaInstallHelp'),update=document.getElementById('pwaUpdate');
 let registration=null,installPrompt=null,reloadRequested=false,downloading=false;
 function failure(message){error.hidden=false;error.textContent=message;status.textContent='تعذر إكمال التنزيل';}
 function inspect(){update.hidden=!registration?.waiting;document.getElementById('downloadButton').classList.toggle('update-available',!!registration?.waiting);}
 function waitActive(reg){
  if(reg.active)return Promise.resolve(reg.active);
  return new Promise((resolve,reject)=>{
   let timer;const workers=new Set();
   const finish=(error,worker)=>{clearTimeout(timer);reg.removeEventListener('updatefound',watch);error?reject(error):resolve(worker);};
   function watch(){const worker=reg.installing||reg.waiting||reg.active;if(!worker||workers.has(worker))return;workers.add(worker);const changed=()=>{if(worker.state==='activated')finish(null,worker);if(worker.state==='redundant')finish(Error('Install failed'));};worker.addEventListener('statechange',changed);changed();}
   reg.addEventListener('updatefound',watch);timer=setTimeout(()=>finish(Error('Install timeout')),45000);watch();
  });
 }
 async function setup(){
  if(!('serviceWorker' in navigator)||!window.isSecureContext)throw Error('HTTPS required');
  const reg=await navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'});registration=reg;
  reg.addEventListener('updatefound',()=>{reg.installing?.addEventListener('statechange',inspect);});inspect();
  return reg;
 }
 let setupPromise=setup().then(async reg=>{await waitActive(reg);status.textContent='جاهز دون إنترنت';document.getElementById('downloadProgress').value=100;document.getElementById('downloadPercent').textContent='100%';document.getElementById('downloadButton').dataset.ready='true';return reg;}).catch(()=>{status.textContent='اضغط التنزيل للمحاولة مجدداً';return null;});
 async function download(){
  if(downloading)return;downloading=true;error.hidden=true;document.getElementById('downloadStart').disabled=true;
  try{
   let reg=await setupPromise;if(!reg){reg=await setup();if(!reg.active&&!reg.installing)await reg.update();}
   status.textContent='جارٍ التنزيل';const worker=await waitActive(reg);
   await new Promise((resolve,reject)=>{
    const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('Download timeout'));},60000);
    channel.port1.onmessage=event=>{const data=event.data;if(data.error){clearTimeout(timer);channel.port1.close();reject(Error(data.error));return;}document.getElementById('downloadProgress').value=data.percent;document.getElementById('downloadPercent').textContent=data.percent+'%';if(data.done){clearTimeout(timer);channel.port1.close();resolve();}};
    worker.postMessage({type:'DOWNLOAD_OFFLINE'},[channel.port2]);
   });
   status.textContent='جاهز دون إنترنت';document.getElementById('downloadButton').dataset.ready='true';navigator.storage?.persist?.().catch(()=>{});
  }catch{failure('لم يكتمل التنزيل. تحقق من الاتصال ثم اضغط أيقونة التنزيل للمحاولة مجدداً.');}
  finally{downloading=false;document.getElementById('downloadStart').disabled=false;}
 }
 document.getElementById('downloadButton').onclick=()=>{openDialog(document.getElementById('downloadDialog'));};
 document.getElementById('downloadStart').onclick=download;
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
 install.onclick=async()=>{if(!installPrompt){help.hidden=!help.hidden;return;}const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();await prompt.userChoice;}catch{help.hidden=false;}};
 const installed=()=>{install.hidden=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;};installed();window.addEventListener('appinstalled',installed);
 update.onclick=()=>{if(!registration?.waiting)return;if(cases.activeChild&&!saveCase()){failure('احفظ الفحص أو صدّر التقرير قبل التحديث.');return;}reloadRequested=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});};
 navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(reloadRequested)location.reload();else{status.textContent='جاهز دون إنترنت';inspect();}});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&navigator.onLine)registration?.update().catch(()=>{});});
 window.addEventListener('online',()=>registration?.update().catch(()=>{}));
})();
