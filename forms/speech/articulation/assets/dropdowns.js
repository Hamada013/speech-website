'use strict';
// Native selects retain their values and event API; the visible list is consistently styled in Safari and other browsers.
const styledDropdowns = new Map();
let dropdownSequence = 0;
function enhanceDropdowns() {
 document.querySelectorAll('select').forEach(select=>{
  if(styledDropdowns.has(select)){styledDropdowns.get(select).refresh();return;}
  const id='choice-'+(++dropdownSequence),original=select.parentElement;
  let host,label;
  if(original.tagName==='LABEL'){
   host=document.createElement('div');host.className=(original.className?original.className+' ':'')+'select-field';
   label=document.createElement('label');label.textContent=Array.from(original.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();
   label.htmlFor=id+'-trigger';label.id=id+'-label';
   original.replaceWith(host);host.append(label,select);
  }else{
   host=original;label=host.querySelector('label');
  }
  const wrap=document.createElement('div');wrap.className='custom-select';
  const trigger=document.createElement('button');trigger.type='button';trigger.id=id+'-trigger';trigger.className='select-trigger';trigger.setAttribute('role','combobox');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',id+'-list');
  if(label){label.id=label.id||id+'-label';trigger.setAttribute('aria-labelledby',label.id);}
  const value=document.createElement('span');value.className='select-value';const arrow=document.createElement('span');arrow.className='select-chevron';arrow.setAttribute('aria-hidden','true');trigger.append(value,arrow);
  const list=document.createElement('div');list.id=id+'-list';list.className='select-options';list.setAttribute('role','listbox');if(label)list.setAttribute('aria-labelledby',label.id);list.hidden=true;
  wrap.append(trigger,list);host.append(wrap);select.hidden=true;
  let active=0;
  const options=()=>Array.from(select.options);
  function refresh(){
   value.textContent=select.selectedOptions[0]?.textContent||options()[0]?.textContent||'';
   list.replaceChildren();options().forEach((option,index)=>{
    const item=document.createElement('div');item.className='select-option';item.id=id+'-option-'+index;item.setAttribute('role','option');item.setAttribute('aria-selected',String(option.selected));item.setAttribute('aria-disabled',String(option.disabled));item.textContent=option.textContent;
    item.addEventListener('pointermove',()=>setActive(index));item.addEventListener('click',()=>choose(index));list.append(item);
   });
  }
  function setActive(index){active=index;Array.from(list.children).forEach((item,i)=>item.classList.toggle('active',i===index));trigger.setAttribute('aria-activedescendant',id+'-option-'+index);}
  function close(){list.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');}
  function open(){styledDropdowns.forEach(control=>control.close());refresh();list.hidden=false;trigger.setAttribute('aria-expanded','true');setActive(Math.max(0,select.selectedIndex));const rect=trigger.getBoundingClientRect(),viewport=window.visualViewport,viewportTop=viewport?.offsetTop||0,viewportBottom=viewportTop+(viewport?.height||window.innerHeight),dialog=trigger.closest?.('dialog[open]'),dialogRect=dialog?.getBoundingClientRect(),top=dialogRect?Math.max(viewportTop,dialogRect.top):viewportTop,bottom=dialogRect?Math.min(viewportBottom,dialogRect.bottom):viewportBottom,below=bottom-rect.bottom-16,above=rect.top-top-16,up=below<Math.min(list.scrollHeight,240)&&above>below;list.classList.toggle('opens-up',up);list.style.maxHeight=Math.max(110,Math.min(330,up?above:below))+'px';list.children[active]?.scrollIntoView({block:'nearest'});}
  function choose(index){if(!options()[index]||options()[index].disabled)return;select.selectedIndex=index;refresh();close();trigger.focus();select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));}
  trigger.addEventListener('click',()=>list.hidden?open():close());
  trigger.addEventListener('keydown',event=>{
   if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
    event.preventDefault();const wasClosed=list.hidden;if(wasClosed)open();
    let next=event.key==='Home'?0:event.key==='End'?options().length-1:wasClosed?active:(active+(event.key==='ArrowDown'?1:-1)+options().length)%options().length;
    if(options()[next]?.disabled){for(let tries=0;tries<options().length;tries++){next=(next+(event.key==='ArrowUp'?-1:1)+options().length)%options().length;if(!options()[next].disabled)break;}}
    setActive(next);list.children[next]?.scrollIntoView({block:'nearest'});
   }else if(event.key==='Escape'&&!list.hidden){event.preventDefault();event.stopPropagation();close();}
   else if(['Enter',' '].includes(event.key)){event.preventDefault();if(list.hidden)open();else choose(active);}
   else if(event.key==='Tab')close();
  });
  const control={refresh,close,wrap};styledDropdowns.set(select,control);refresh();
 });
}
function closeDropdowns(){styledDropdowns.forEach(control=>control.close());}
document.addEventListener('click',event=>{styledDropdowns.forEach(control=>{if(!control.wrap.contains(event.target))control.close();});});
document.addEventListener('focusin',event=>{styledDropdowns.forEach(control=>{if(!control.wrap.contains(event.target))control.close();});});
