/* Installation stays scoped to this assessment. No child data is transmitted. */
(() => {
  'use strict';
  const button=document.querySelector('[data-install]'),dialog=document.getElementById('installDialog');
  const help=document.querySelector('[data-install-help]'),offline=document.querySelector('[data-install-status]');
  let prompt,registration,ready=false;
  const tr=(en,ar)=>document.documentElement.lang==='ar'?ar:en;
  const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  function show(installed=false) {
    help.textContent=installed?tr('The shortcut is installed.','تم تثبيت الاختصار.'):tr('On iPhone or iPad: Share → Add to Home Screen. On Android: browser menu → Install app or Add to Home Screen.','على iPhone وiPad: المشاركة ← إضافة إلى الشاشة الرئيسية. على Android: قائمة المتصفح ← تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية.');
    offline.textContent=ready?tr('Ready for offline assessment and reports. Records are saved on this device.','جاهز للتقييم والتقارير دون اتصال. تُحفظ السجلات على هذا الجهاز.'):tr('Preparing offline access. Keep this page open while connected.','جاري تجهيز الاستخدام دون اتصال. اترك الصفحة مفتوحة مع الاتصال.');
    if(!dialog.open)dialog.showModal();
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;});
  window.addEventListener('appinstalled',()=>show(true));
  button.addEventListener('click',async()=>{
    if(standalone()){show(true);return;}
    if(!prompt){show();return;}
    try{await prompt.prompt();const choice=await prompt.userChoice;prompt=null;if(choice.outcome==='accepted')show(true);}
    catch{prompt=null;show();}
  });
  document.querySelector('[data-install-close]').addEventListener('click',()=>dialog.close());
  function status() {
    return new Promise((resolve,reject)=>{
      const channel=new MessageChannel(),timer=setTimeout(()=>reject(Error('timeout')),15000);
      channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};
      registration.active.postMessage({type:'VBMAPP_STATUS'},[channel.port2]);
    });
  }
  async function setup() {
    if(!('serviceWorker' in navigator)||!isSecureContext){offline.textContent=tr('Offline access needs HTTPS or localhost.','يتطلب الاستخدام دون اتصال HTTPS أو localhost.');return;}
    try {
      registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
      if(!registration.active)await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(Error('setup timeout')),45000);
        const check=()=>{if(registration.active){clearTimeout(timer);resolve();}else if(registration.installing?.state==='redundant'){clearTimeout(timer);reject(Error('install failed'));}};
        registration.installing?.addEventListener('statechange',check);check();
      });
      ready=(await status()).ready;
      if(dialog.open)show(standalone());
    }catch{if(dialog.open)offline.textContent=tr('Offline setup is incomplete. Reconnect and reopen the app.','لم يكتمل التجهيز دون اتصال. أعد الاتصال وافتح التطبيق مجدداً.');}
  }
  void setup();
})();
