/* Explicit, per-child session boundaries shared by the three offline apps. */
((root)=>{
 'use strict';
 const names={voc:'الكلمات والمفاهيم',senb:'بناء الجمل',taffaha:'الكلمات والمقاطع'};
 const domains={receptive:'فهم الكلمات',expressive:'التعبير والتسمية',count:'تمييز عدد المقاطع',picture:'ربط المقاطع بالصورة'};
 const clone=value=>JSON.parse(JSON.stringify(value));
 function message(app,name,session){
  const items=Object.values(session.items),help=items.filter(item=>item.help),focus=(help.length?help:items).slice(0,3);
  const lines=['مرحبًا ماما وبابا 🌷',`أنا ${name}، اليوم اشتغلت على ${names[app]}.`,`لعبت وتدرّبت على: ${Object.keys(session.activities).join('، ')}.`, ''];
  for(const [entity,title]of [['word','الكلمات اللي اشتغلت عليها'],['sentence','الجمل اللي اشتغلت عليها']]){
   const list=items.filter(item=>item.entity===entity);if(list.length)lines.push(`${title}: ${list.map(item=>item.label).join('، ')}.`);
  }
  const scores={};
  for(const item of items)for(const [domain,value]of Object.entries(item.scores)){
   const key=`${domain}:${item.entity}`;
   const label=app==='senb'?`${domain==='receptive'?'فهم ':'التعبير بـ'}${item.entity==='sentence'?'الجمل':'الكلمات'}`:domains[domain];
   scores[key]||={label,correct:0,total:0};scores[key].correct+=value.correct;scores[key].total+=value.total;
  }
  if(Object.keys(scores).length){
   lines.push('');for(const value of Object.values(scores))lines.push(`في ${value.label}، سجّلنا ${value.correct} استجابة صحيحة من أصل ${value.total} فرصة.`);
   lines.push('هالأرقام بتحكي عن محاولاتي بهالجلسة، ولسه منكمّل التعلّم خطوة خطوة.');
  }else lines.push('','كان شغلنا تعرّف وتدريب، وما سجّلنا إجابات مقيّمة بهالجلسة.');
  if(help.length)lines.push(`بحتاج نرجع بهدوء لهالكلمات أو الجمل: ${help.map(item=>item.label).join('، ')}.`);
  lines.push('','خلّونا نلعب شوي بالبيت 💛',`نختار من شغل اليوم: ${focus.map(item=>`«${item.label}»`).join('، ')}، ونلعب ٣–٥ دقائق بوقت مريح.`);
  if(app==='voc')lines.push(
   '• ورّوني غرضين أو صورتين، وسمّوهم أول شي. بعدين اسألوني «وين…؟» أو «عطيني…»، واعطوني وقت أشير أو أختار؛ مو ضروري أحكي.',
   `• نستخدم ${focus.map(item=>`«${item.label}»`).join(' و')} بلعبة أو بموقف من يومنا. قولوا الكلمة بجملة قصيرة، واتركوا لي فرصة أحاول بصوت أو كلمة أو إشارة.`,
   '• إذا احتجت مساعدة، ورّوني الجواب وسمّوه بلطف. بعد شوي نجرّب مرة ثانية، ونخفّف المساعدة شوي شوي.');
  else if(app==='senb')lines.push(
   `• نمثّل سوا ${focus.some(item=>item.entity==='sentence')?'جملة من جمل اليوم':'كلمات اليوم'} بألعاب أو أغراض البيت. قولوا الجملة بهدوء، وورّوني معناها.`,
   '• خلّوني أختار الصورة أو أمثّل الحركة. بعدين اتركوا لي فرصة أحكي بطريقتي؛ كلمة أو إشارة كمان إلها قيمة.',
   '• إذا قلت كلمة، زيدوا عليها كلمة مناسبة للموقف. وإذا صعبت الجملة، قصّروها وارجعوا قدّموا النموذج بلطف، من دون إلحاح.');
  else{
   const example=focus.find(item=>item.syllables?.length);
   if(example)lines.push(`• نبدأ بكلمة «${example.label}»: نسمعها كاملة، وبعدها نقول مقاطعها بهدوء: ${example.syllables.join(' ـ ')} (${example.count===1?'مقطع واحد':example.count===2?'مقطعان':`${example.count} مقاطع`}).`);
   else lines.push('• نختار كلمة من كلمات اليوم، نقولها كاملة، وبعدها نقول مقاطعها بهدوء.');
   lines.push('• مع كل مقطع نعمل طقّة خفيفة أو نحط قطعة لعبة. بعدين نقول الكلمة كاملة مرة ثانية.',
    '• خلّوني أشير للصورة أو أختار عدد القطع. وإذا حبيت أقلّد الصوت، تقبّلوا محاولتي وشجّعوني من دون ضغط.');
  }
  lines.push('','شجّعوني على المحاولة، وكرّروا شغلنا بمواقف حلوة خلال اليوم. إذا تعبت نرتاح، والأهم ننبسط سوا!');
  return lines.join('\n');
 }
 function create({app,storage,owner,onError=()=>{}}){
  const memory=new Map();let ok=true;
  const activeOwner=()=>{const child=owner();if(!child?.id)return null;try{if(JSON.parse(storage.getItem('voc-children-v1'))?.deletedChildren?.[child.id])return null;}catch{}return child;};
  const storageKey=id=>`speech-homework-v1:${app}:${encodeURIComponent(id)}`;
  function read(id){const key=storageKey(id);if(!ok&&memory.has(key))return clone(memory.get(key));try{const value=JSON.parse(storage.getItem(key));return value?.version===1?value:{version:1,current:null,last:null,cursors:{}};}catch{return memory.get(key)||{version:1,current:null,last:null,cursors:{}};}}
  function write(id,value){const key=storageKey(id);memory.set(key,clone(value));try{storage.setItem(key,JSON.stringify(value));ok=true;}catch{ok=false;onError();}}
  function add(state,entry){
   const label=String(entry.label||'').trim();if(!label)return;
   state.current||={id:root.crypto?.randomUUID?.()||String(Date.now()),started:new Date().toISOString(),activities:{},items:{}};
   const session=state.current,key=JSON.stringify([entry.entity==='sentence'?'sentence':'word',label.normalize('NFKC')]);
   session.activities[entry.activity||'التدريب']=true;
   const item=session.items[key]||={label,entity:entry.entity==='sentence'?'sentence':'word',scores:{},help:false};
   if(Array.isArray(entry.syllables)){item.syllables=entry.syllables.map(String);item.count=Number(entry.count)||entry.syllables.length;}
   item.help||=entry.needsHelp===true;
   if(entry.kind==='assessment'&&domains[entry.domain]&&Number(entry.total)>0){
    const total=Math.max(0,Number(entry.total)),correct=Math.max(0,Math.min(total,Number(entry.correct)||0));
    item.scores[entry.domain]||={correct:0,total:0};item.scores[entry.domain].correct+=correct;item.scores[entry.domain].total+=total;item.help||=correct<total;
   }
  }
  function record(entry){const child=activeOwner();if(!child?.id||!entry?.label)return;const state=read(child.id);add(state,entry);write(child.id,state);}
  // A paused/reloaded game saves a growing result array. Only consume new rows,
  // even after an explicit session end and later resumption of the same game.
  function capture({id,activity,kind,domain,records}){
   const child=activeOwner();if(!child?.id||!id||!records?.length)return;const state=read(child.id),cursor=state.cursors[id]||0;
   if(records.length<=cursor)return;
   for(const entry of records.slice(cursor))add(state,{activity,kind,domain,...entry});
   state.cursors[id]=records.length;write(child.id,state);
  }
  function finish(){const child=activeOwner();if(!child?.id)return null;const state=read(child.id);
   if(state.current){state.last={...state.current,ended:new Date().toISOString(),name:child.name};state.last.text=message(app,child.name,state.last);state.current=null;write(child.id,state);}
   return clone(state.last);
  }
  return {record,capture,finish,current:()=>{const child=activeOwner();return child?.id?clone(read(child.id).current):null;},
   edit:text=>{const child=activeOwner();if(!child?.id)return;const state=read(child.id);if(state.last){state.last.text=String(text);write(child.id,state);}},storageOK:()=>ok};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={create,message};
 if(!root.document)return;
 const app=document.currentScript.dataset.app,progress=()=>({voc:root.VocProgress,senb:root.SenbProgress,taffaha:root.TaffahaProgress})[app];
 let storage;try{storage=root.localStorage;}catch{storage={getItem(){},setItem(){throw Error('unavailable');}};}
 const model=create({app,storage,owner:()=>progress()?.active()});let dialog,input,status,trigger;
 function open(){
  if(!progress()?.active()||dialog?.open)return;
  root.dispatchEvent(new Event('suite-navigation-open'));root.AppNavigation?.closeSettings(false,true);
  const note=model.finish();
  if(!dialog){
   dialog=document.createElement('dialog');dialog.id='session-homework-dialog';dialog.className='suite-dialog session-homework-dialog';dialog.dir='rtl';dialog.setAttribute('aria-labelledby','session-homework-title');
   dialog.innerHTML='<header><div><h2 id="session-homework-title" tabindex="-1">رسالتنا لماما وبابا</h2><p data-homework-meta></p></div><button type="button" class="suite-icon" data-homework-close aria-label="إغلاق" title="إغلاق"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><textarea dir="rtl" aria-label="ملخص الجلسة ونشاط للبيت، يمكنك تعديل الرسالة"></textarea><p data-homework-empty hidden>لسه ما سجّلنا نشاط بهالتطبيق. نلعب ونتدرّب، وبنهاية الجلسة منرجع لهون لرسالتنا 💛</p><footer><button type="button" class="session-homework-copy" data-homework-copy>نسخ الرسالة</button></footer><p class="session-homework-status" role="status" aria-live="polite"></p>';
   document.body.append(dialog);input=dialog.querySelector('textarea');status=dialog.querySelector('[role=status]');
   dialog.querySelector('[data-homework-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>trigger?.focus());
   dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
   input.addEventListener('input',()=>model.edit(input.value));
   dialog.querySelector('[data-homework-copy]').onclick=async()=>{try{await navigator.clipboard.writeText(input.value);status.textContent='تم نسخ رسالتنا 💛';}catch{input.focus();input.select();status.textContent='حدّدنا الرسالة؛ فيكم تنسخوها من هون.';}};
  }
  input.value=note?.text||'';input.hidden=!note;dialog.querySelector('[data-homework-copy]').hidden=!note;dialog.querySelector('[data-homework-empty]').hidden=!!note;
  dialog.querySelector('[data-homework-meta]').textContent=note?`${note.name} · ${new Date(note.ended).toLocaleDateString('ar')}`:progress().active().name;
  status.textContent=model.storageOK()?'':'تعذّر حفظ الرسالة على الجهاز. انسخوا الرسالة قبل إغلاق الصفحة.';
  dialog.showModal();dialog.querySelector('h2').focus();input.scrollTop=0;
 }
 function init(){
  const host=document.querySelector(app==='taffaha'?'.topbar nav':app==='senb'?'#homeHeaderTools':'.app-home-tools'),home=document.querySelector(app==='taffaha'?'#home-screen':app==='senb'?'#homeView':'#home-view');
  if(!host||!home)return;
  trigger=document.createElement('button');trigger.type='button';trigger.className='suite-icon';trigger.dataset.sessionEnd='';trigger.title='إنهاء الجلسة ورسالة الأهل';trigger.setAttribute('aria-label',trigger.title);trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','session-homework-dialog');
  trigger.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V3m0 1h16l-3 5 3 5H4m5-5 2 2 4-4"/></svg>';trigger.onclick=open;host.append(trigger);
  const sync=()=>{trigger.hidden=home.hidden||home.classList.contains('hidden');trigger.disabled=!progress()?.active();};
  new MutationObserver(sync).observe(home,{attributes:true,attributeFilter:['hidden','class']});
  for(const event of [`${app}-ready`,`${app}-profile-change`,`${app}-profile-memorychange`,`${app}-progress-change`])root.addEventListener(event,sync);
  root.addEventListener(`${app}-profile-beforechange`,()=>dialog?.close());sync();
 }
 root.SessionHomework={...model,open};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(globalThis);
