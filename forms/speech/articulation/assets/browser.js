'use strict';
// Feature checks and viewport/dialog handling for touch browsers, including iPad Safari.
const hasOwn = (object,key) => Object.prototype.hasOwnProperty.call(object,key);
const openAppDialogs = new Set();
let lockedPage = null;
function syncViewport() {
 const viewport=window.visualViewport;
 const height=viewport?.height||window.innerHeight;
 if(height&&document.documentElement?.style){
  document.documentElement.style.setProperty('--app-height',height+'px');
  document.documentElement.style.setProperty('--viewport-top',(viewport?.offsetTop||0)+'px');
 }
}
function lockPageScroll() {
 if(lockedPage||!document.body?.style)return;
 const body=document.body;
 lockedPage={x:window.scrollX||0,y:window.scrollY||0,position:body.style.position,top:body.style.top,left:body.style.left,right:body.style.right,width:body.style.width};
 body.style.position='fixed';body.style.top=-lockedPage.y+'px';body.style.left='0';body.style.right='0';body.style.width='100%';
 document.documentElement?.classList?.add('dialog-open');
}
function releasePageScroll() {
 if(openAppDialogs.size||!lockedPage)return;
 const saved=lockedPage;lockedPage=null;
 const body=document.body;
 for(const key of ['position','top','left','right','width'])body.style[key]=saved[key];
 document.documentElement?.classList?.remove('dialog-open');
 window.scrollTo?.(saved.x,saved.y);
}
function dialogClosed(dialog) {
 openAppDialogs.delete(dialog);
 if(dialog._fallbackBackdrop){dialog._fallbackBackdrop.remove();dialog._fallbackBackdrop=null;dialog.classList.remove('fallback-dialog');}
 releasePageScroll();
}
function openDialog(dialog) {
 if(dialog.open||openAppDialogs.has(dialog))return;
 syncViewport();
 if(typeof dialog.showModal==='function')dialog.showModal();
 else {
  dialog.setAttribute('open','');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.classList.add('fallback-dialog');
  const backdrop=document.createElement('div');backdrop.className='fallback-backdrop';document.body.append(backdrop);dialog._fallbackBackdrop=backdrop;
  dialog.querySelector('button,input,select,textarea,[tabindex]')?.focus();
 }
 openAppDialogs.add(dialog);lockPageScroll();
}
function closeDialog(dialog) {
 if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');
 dialogClosed(dialog);
}
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>dialogClosed(dialog)));
document.addEventListener('keydown',event=>{
 const fallback=Array.from(openAppDialogs).find(dialog=>dialog.classList?.contains('fallback-dialog'));
 if(!fallback)return;
 if(event.key==='Escape'){
  const cancelled=new Event('cancel',{cancelable:true});fallback.dispatchEvent(cancelled);if(!cancelled.defaultPrevented)closeDialog(fallback);
 }else if(event.key==='Tab'){
  const controls=Array.from(fallback.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(control=>control.getClientRects().length);
  const first=controls[0],last=controls[controls.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
 }
});
function viewportChanged() {
 syncViewport();
 // Menus must be reopened at their new coordinates after rotation or keyboard changes.
 if(typeof closeDropdowns==='function')closeDropdowns();
}
window.addEventListener('resize',viewportChanged);
window.addEventListener('orientationchange',viewportChanged);
window.visualViewport?.addEventListener('resize',viewportChanged);
window.visualViewport?.addEventListener('scroll',syncViewport);
syncViewport();
function downloadTextReport(text,filename) {
 const blob=new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
 // Safari may resolve a blob asynchronously after the click; retain it long enough.
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
