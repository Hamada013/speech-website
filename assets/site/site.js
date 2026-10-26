'use strict';
(() => {
 const $=selector=>document.querySelector(selector),root=document.documentElement,search=$('#directory-search');
 let language='en';
 try{language=new URLSearchParams(location.search).get('lang')||localStorage.getItem('speech-site-language')||'en';}catch{}
 function filter(){
  if(!search)return;
  const term=search.value.trim().toLocaleLowerCase();let count=0;
  document.querySelectorAll('[data-card]').forEach(card=>{card.hidden=!card.dataset.search.toLocaleLowerCase().includes(term);if(!card.hidden)count++;});
  document.querySelectorAll('.directory-section').forEach(section=>{section.hidden=!section.querySelector('[data-card]:not([hidden])');});
  $('#no-results').hidden=count>0;
 }
 function renderLanguage(){
  language=language==='ar'?'ar':'en';root.lang=language;root.dir=language==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-en]').forEach(node=>{node.textContent=node.dataset[language];});
  document.querySelectorAll('[data-placeholder-en]').forEach(node=>{node.placeholder=language==='ar'?node.dataset.placeholderAr:node.dataset.placeholderEn;});
  document.querySelectorAll('[data-label-en]').forEach(node=>{node.setAttribute('aria-label',language==='ar'?node.dataset.labelAr:node.dataset.labelEn);});
  const toggle=$('#language-toggle');toggle.querySelector('span').textContent=language==='ar'?'English':'العربية';toggle.querySelector('span').lang=language==='ar'?'en':'ar';toggle.setAttribute('aria-label',language==='ar'?'Switch to English':'التبديل إلى العربية');
  const heading=$('h1');document.title=heading.textContent+(language==='ar'?' | أحمد غانم':' | Ahmad Ghanem SLP');
  document.querySelectorAll('[data-app-language]').forEach(link=>{const url=new URL(link.href);url.searchParams.set('lang',language);link.href=url.href;});
  filter();
 }
 $('#language-toggle').addEventListener('click',()=>{language=language==='en'?'ar':'en';try{localStorage.setItem('speech-site-language',language);}catch{}renderLanguage();});
 const menu=$('#site-navigation'),menuToggle=$('#menu-toggle');
 const closeMenu=()=>{menu.classList.remove('is-open');menuToggle.setAttribute('aria-expanded','false');};
 menuToggle.addEventListener('click',()=>{const open=menu.classList.toggle('is-open');menuToggle.setAttribute('aria-expanded',String(open));});
 document.addEventListener('click',event=>{if(!event.target.closest('.header-controls'))closeMenu();});
 document.querySelectorAll('[data-open-dialog]').forEach(button=>button.addEventListener('click',()=>{closeMenu();$('#'+button.dataset.openDialog+'-dialog').showModal();}));
 document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
 document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
 document.querySelectorAll('[data-protected-forms]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();closeMenu();$('#forms-error').hidden=true;$('#forms-code').value='';$('#forms-dialog').showModal();}));
 const access=$('#forms-access');
 if(access)access.addEventListener('submit',event=>{event.preventDefault();const code=$('#forms-code');if(code.value==='13')location.href=access.action;else{$('#forms-error').hidden=false;code.value='';code.focus();}});
 if(search)search.addEventListener('input',filter);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){const wasOpen=menu.classList.contains('is-open');closeMenu();if(wasOpen)menuToggle.focus();}if(event.key==='/'&&search&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.matches('input,textarea,[contenteditable]')){event.preventDefault();search.focus();}});
 renderLanguage();
})();
