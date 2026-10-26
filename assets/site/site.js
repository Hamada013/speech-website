'use strict';
(() => {
 const $=selector=>document.querySelector(selector),root=document.documentElement,search=$('#directory-search');
 let language='en';
 try{language=new URLSearchParams(location.search).get('lang')||localStorage.getItem('speech-site-language')||'en';}catch{}
 const deck=$('#directory-deck'),sections=[...document.querySelectorAll('.directory-section')],pager=$('#page-controls');
 let pageIndex=0,pageList=[],capacity=4;
 pager.hidden=false;
 function filter(reset=false){
  if(reset)pageIndex=0;
  const term=(search?.value||'').trim().toLocaleLowerCase();
  const rowHeight=innerHeight<500?90:innerWidth<701?176:150;
  const rows=Math.max(1,Math.min(3,Math.floor((deck.clientHeight-28+12)/(rowHeight+12)))),columns=deck.clientHeight<200&&innerWidth<500?1:2;
  deck.classList.toggle('compact-cards',(deck.clientHeight-28)/rows<155);
  capacity=rows*columns;pageList=[];
  for(const section of sections){const cards=[...section.querySelectorAll('[data-card]')].filter(card=>card.dataset.search.toLocaleLowerCase().includes(term));for(let i=0;i<cards.length;i+=capacity)pageList.push({section,cards:cards.slice(i,i+capacity)});}
  pageIndex=Math.max(0,Math.min(pageIndex,pageList.length-1));
  const current=pageList[pageIndex];
  sections.forEach(section=>{section.hidden=section!==current?.section;section.querySelectorAll('[data-card]').forEach(card=>{card.hidden=!current?.cards.includes(card);});});
  if(current){const grid=current.section.querySelector('.card-grid');grid.style.gridTemplateRows=`repeat(${Math.ceil(current.cards.length/columns)},minmax(0,1fr))`;grid.style.gridTemplateColumns=`repeat(${columns},minmax(0,1fr))`;}
  $('#no-results').hidden=pageList.length>0;
  pager.classList.toggle('single-page',pageList.length<2);
  $('#previous-page').disabled=pageIndex===0;$('#next-page').disabled=pageIndex>=pageList.length-1;
  $('#page-status').textContent=pageList.length?`${pageIndex+1} / ${pageList.length}`:'';
 }
 function turnPage(delta){pageIndex+=delta;filter();deck.animate?.([{opacity:.45,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:220,easing:'ease-out'});}
 $('#previous-page').onclick=()=>turnPage(-1);$('#next-page').onclick=()=>turnPage(1);
 let resizeFrame=null;
 new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>filter());}).observe(deck);
 function renderLanguage(){
  language=language==='ar'?'ar':'en';root.lang=language;root.dir=language==='ar'?'rtl':'ltr';
  try{localStorage.setItem('speech-site-language',language);}catch{}
  document.querySelectorAll('[data-en]').forEach(node=>{node.textContent=node.dataset[language];});
  document.querySelectorAll('[data-placeholder-en]').forEach(node=>{node.placeholder=language==='ar'?node.dataset.placeholderAr:node.dataset.placeholderEn;});
  document.querySelectorAll('[data-label-en]').forEach(node=>{node.setAttribute('aria-label',language==='ar'?node.dataset.labelAr:node.dataset.labelEn);});
  const toggle=$('#language-toggle');toggle.querySelector('span').textContent=language==='ar'?'English':'العربية';toggle.querySelector('span').lang=language==='ar'?'en':'ar';toggle.setAttribute('aria-label',language==='ar'?'Switch to English':'التبديل إلى العربية');
  const heading=$('h1');document.title=heading.textContent+(language==='ar'?' | أحمد غانم':' | Ahmad Ghanem SLP');
  document.querySelectorAll('[data-app-language]').forEach(link=>{const url=new URL(link.href);url.searchParams.set('lang',language);link.href=url.href;});
  filter();
 }
 $('#language-toggle').addEventListener('click',()=>{language=language==='en'?'ar':'en';try{localStorage.setItem('speech-site-language',language);}catch{}renderLanguage();});
 const drawer=$('#navigation-drawer'),menuToggle=$('#menu-toggle');let closeTimer=null;
 const closeMenu=()=>{if(!drawer.open)return;drawer.classList.remove('is-open');menuToggle.setAttribute('aria-expanded','false');clearTimeout(closeTimer);const finish=()=>{drawer.close();menuToggle.focus();};if(matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else closeTimer=setTimeout(finish,320);};
 menuToggle.addEventListener('click',()=>{clearTimeout(closeTimer);drawer.showModal();menuToggle.setAttribute('aria-expanded','true');requestAnimationFrame(()=>drawer.classList.add('is-open'));});
 $('#drawer-close').onclick=closeMenu;
 drawer.addEventListener('cancel',event=>{event.preventDefault();closeMenu();});
 drawer.addEventListener('click',event=>{if(event.target===drawer){const r=drawer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right)closeMenu();}});
 document.querySelectorAll('.drawer-expand').forEach(button=>button.addEventListener('click',()=>{const target=$('#'+button.getAttribute('aria-controls')),open=button.getAttribute('aria-expanded')!=='true';document.querySelectorAll('.drawer-expand').forEach(other=>{other.setAttribute('aria-expanded','false');$('#'+other.getAttribute('aria-controls')).hidden=true;});button.setAttribute('aria-expanded',String(open));target.hidden=!open;}));
 document.querySelectorAll('[data-open-dialog]').forEach(button=>button.addEventListener('click',()=>$('#'+button.dataset.openDialog+'-dialog').showModal()));
 document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
 document.querySelectorAll('dialog:not(.navigation-drawer)').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
 if(search)search.addEventListener('input',()=>filter(true));
 document.addEventListener('keydown',event=>{if(event.key==='/'&&search&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.matches('input,textarea,[contenteditable]')&&!document.querySelector('dialog[open]')){event.preventDefault();search.focus();}});
 let installPrompt=null,offlineReady=false,offlineFailed=false;
 const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 $('#install-app').hidden=installed();
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
 window.addEventListener('appinstalled',()=>{$('#install-app').hidden=true;installPrompt=null;});
 function offlineStatus(){const status=$('#offline-status');status.textContent=offlineReady?(language==='ar'?'صفحات الموقع جاهزة دون اتصال.':'Site pages are ready offline.'):offlineFailed?(language==='ar'?'لم يكتمل التنزيل للاستخدام دون اتصال. افتح الموقع متصلاً وأعد المحاولة.':'Offline preparation did not finish. Reopen online to retry.'):'';status.classList.toggle('form-error',offlineFailed);}
 $('#install-app').onclick=async()=>{if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();}else{offlineStatus();$('#install-dialog').showModal();}};
 const script=document.querySelector('script[src$="/site.js"]'),siteRoot=new URL('../../',script.src);
 if('serviceWorker' in navigator&&(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))){navigator.serviceWorker.register(new URL('sw.js',siteRoot),{scope:siteRoot.pathname,updateViaCache:'none'}).then(()=>navigator.serviceWorker.ready).then(()=>{offlineReady=true;offlineStatus();}).catch(()=>{offlineFailed=true;offlineStatus();});}
 renderLanguage();
})();
