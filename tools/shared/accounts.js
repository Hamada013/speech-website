/* Account deletion is shared across all three apps, with tombstones for old tabs. */
((root)=>{
 const KEY='voc-children-v1';
 const isAdmin=child=>child?.role==='admin'||String(child?.name||'').normalize('NFKC').trim().toLocaleLowerCase()==='hamada';
 function remove(storage,ownerId,targetId){
  let data;try{data=JSON.parse(storage.getItem(KEY));}catch{return false;}
  if(data?.schema!==1||!Array.isArray(data.children))return false;
  const owner=data?.children?.find(child=>child.id===ownerId),target=data?.children?.find(child=>child.id===targetId);
  if(!isAdmin(owner)||data.active!==ownerId||!target||isAdmin(target))return false;
  data.deletedChildren={...data.deletedChildren,[targetId]:new Date().toISOString()};
  data.children=data.children.filter(child=>child.id!==targetId);if(data.active===targetId)data.active=null;
  try{storage.setItem(KEY,JSON.stringify(data));}catch{return false;}
  for(const app of ['voc','senb','taffaha'])try{storage.removeItem?.(`speech-homework-v1:${app}:${encodeURIComponent(targetId)}`);}catch{}
  return true;
 }
 if(typeof module!=='undefined')module.exports={remove};
 if(!root.document)return;
 const current=()=>root.VocProgress?.active()||root.SenbProgress?.active()||root.TaffahaProgress?.active();
 let dialog;
 function request(child){
  if(!isAdmin(current())||!child||isAdmin(child))return;
  if(!dialog){dialog=document.createElement('dialog');dialog.id='delete-account-dialog';dialog.className='suite-dialog';dialog.setAttribute('aria-labelledby','delete-account-title');dialog.innerHTML='<h2 id="delete-account-title">حذف الحساب</h2><p data-delete-message></p><div class="suite-text-actions"><button type="button" data-delete-confirm>نعم، حذف الحساب</button><button type="button" data-delete-back>عودة</button></div><p role="alert"></p>';document.body.append(dialog);dialog.querySelector('[data-delete-back]').onclick=()=>dialog.close();}
  const owner=current().id;dialog.querySelector('[data-delete-message]').textContent=`هل أنت متأكد أنك تريد حذف حساب «${child.name}» وتقدّمه من التطبيقات الثلاثة على هذا الجهاز؟`;dialog.querySelector('[role=alert]').textContent='';
  dialog.querySelector('[data-delete-confirm]').onclick=()=>{let ok=false;try{ok=remove(localStorage,owner,child.id);}catch{}if(ok){dialog.close();location.reload();}else dialog.querySelector('[role=alert]').textContent='تعذّر حذف الحساب. تأكد من الحساب النشط وحاول مجددًا.';};
  dialog.showModal();dialog.querySelector('[data-delete-back]').focus();
 }
 function button(child){
  if(!isAdmin(current())||!child||isAdmin(child))return null;
  const b=document.createElement('button');b.type='button';b.className='suite-delete';b.dataset.deleteChild=child.id;
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M5 6l1 14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-14M10 10v7m4-7v7"/></svg>';
  b.setAttribute('aria-label','حذف حساب '+child.name);b.title='حذف حساب '+child.name;b.onclick=()=>request(child);return b;
 }
 function row(child,select,actions=[]){
  const item=document.createElement('div');item.className='suite-account-row';item.setAttribute('role','listitem');
  select.classList.add('suite-account-select');item.append(select,...actions);
  const remove=button(child);if(remove)item.append(remove);return item;
 }
 root.addEventListener('storage',event=>{if(event.key!==KEY)return;try{const before=JSON.parse(event.oldValue||'null'),after=JSON.parse(event.newValue||'null');if(JSON.stringify(before?.deletedChildren)!==JSON.stringify(after?.deletedChildren))location.reload();}catch{}});
 root.SuiteAccounts={button,request,row};
})(globalThis);
