(() => {
 'use strict';
 let registration,installPrompt;
 const dialog=document.getElementById('modal'),body=document.getElementById('modal-body'),title=document.getElementById('modal-title');
 const show=(heading,html)=>{title.textContent=heading;body.innerHTML=html;if(!dialog.open)dialog.showModal();};
 function updateOffer(){if(!registration?.waiting)return;if(dialog.open){dialog.addEventListener('close',updateOffer,{once:true});return;}show('تحديث لينغ','<p>إصدار جديد جاهز.</p><button class="primary" id="accept-update">تحديث الآن</button> <button class="primary" id="later-update">لاحقًا</button>');document.getElementById('accept-update').onclick=()=>registration.waiting?.postMessage({type:'ACTIVATE'});document.getElementById('later-update').onclick=()=>dialog.close();}
 let controlled=!!navigator.serviceWorker?.controller,reloading=false;
 if('serviceWorker'in navigator){navigator.serviceWorker.addEventListener('controllerchange',()=>{if(controlled&&!reloading){reloading=true;location.reload();}controlled=true;});navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'}).then(r=>{registration=r;if(r.waiting)updateOffer();r.addEventListener('updatefound',()=>r.installing?.addEventListener('statechange',()=>{if(r.waiting&&navigator.serviceWorker.controller)updateOffer();}));r.update().catch(()=>{});}).catch(()=>{});}
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
 document.getElementById('download').onclick=async()=>{
  show('تنزيل لينغ','<p role="status" id="download-status">جارٍ حفظ الصور والأصوات…</p><progress id="download-progress" max="100" value="0" aria-label="تقدم التنزيل"></progress><p id="download-percent">0٪</p>');
  try{if(!navigator.serviceWorker)throw Error();await navigator.serviceWorker.ready;const release=await fetch('release.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();});const entries=await caches.open('ling-'+release.version);let count=0;for(const file of release.files){const url=new URL(file,location.href);if(!await entries.match(url)){const response=await fetch(url,{cache:'reload'});if(!response.ok)throw Error();await entries.put(url,response);}count++;const percent=Math.round(count/release.files.length*100);if(document.getElementById('download-progress')){document.getElementById('download-progress').value=percent;document.getElementById('download-percent').textContent=percent+'٪';}}document.getElementById('download-status').textContent='جاهز للعمل دون اتصال';if(installPrompt){const b=document.createElement('button');b.className='primary';b.textContent='تثبيت التطبيق';b.onclick=()=>installPrompt.prompt();body.append(b);}}
  catch{const status=document.getElementById('download-status');if(status)status.textContent='تعذر إكمال التنزيل. تحقق من الاتصال ثم أعد المحاولة.';}
 };
})();
