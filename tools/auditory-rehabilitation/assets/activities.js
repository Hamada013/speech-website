import {AudioEngine} from './audio.js';
import {SOUND_NAMES,WIDE_PAIRS,SIMILAR_PAIRS,SETS,SUDDEN,CONTINUOUS} from './data.js';

export function createActivities({main,icon,pic,control,title,tile,button,escape,shuffle,openModal,status,drag}){
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const environment=Object.keys(SOUND_NAMES).map(Number),audio=new AudioEngine();
 let current=null,clipController=null,listeningOwner=null,durationSound=1;
 const source=(id,type='')=>`sounds/${type?type+'/':''}${id}.m4a`;
 const errorNode=()=>'<p id="status" class="status" role="alert" hidden></p>';
 const heading=(text,back,tools='')=>`<div class="activity-heading">${title(text,back)}<div class="activity-tools">${tools}</div></div>`;
 const modeTools=prefix=>control(prefix+'-practice','practice','تدريب')+control(prefix+'-test','test','اختبار');
 const active=s=>current===s&&!s.signal.aborted;
 function wait(ms,signal){return new Promise((resolve,reject)=>{
  if(signal.aborted)return reject(new DOMException('Cancelled','AbortError'));
  const finish=error=>{clearTimeout(timer);signal.removeEventListener('abort',abort);error?reject(error):resolve();};
  const abort=()=>finish(new DOMException('Cancelled','AbortError')),timer=setTimeout(()=>finish(),ms);
  signal.addEventListener('abort',abort,{once:true});
 });}
 function stopPlayback(){clipController?.abort();clipController=null;audio.stop();}
 function closeEar(owner){if(owner&&owner!==listeningOwner)return;listeningOwner=null;if($('#listening-overlay').open)$('#listening-overlay').close();}
 function reset(){
  current?.controller.abort();current=null;stopPlayback();closeEar();
  if($('#session-countdown').open)$('#session-countdown').close();
  $$('.demo-ghost,#answer-feedback').forEach(node=>{node.getAnimations().forEach(a=>a.cancel());node.remove();});
 }
 function begin(fields){reset();const controller=new AbortController();return current={...fields,controller,signal:controller.signal,phase:'ready'};}
 function run(s,fn){if($('#status')?.classList.contains('error'))status('');void fn().catch(error=>{
  if(error.name==='AbortError'||!active(s))return;
  s.phase='error';closeEar();status('تعذر تشغيل الصوت. تحقق من تنزيل المحتوى ثم أعد المحاولة.',true);
  for(const selector of ['#identify-target','#duration-replay','#detect-auto'])if($(selector))$(selector).disabled=false;
  if(s.mode==='detection'){s.auto=false;updateDetectionAuto();}
 });}
 document.addEventListener('click',()=>audio.unlock(),{capture:true});
 async function countdown(s){
  s.phase='countdown';const dialog=$('#session-countdown'),number=$('#countdown-number');dialog.showModal();
  for(const value of [1,2,3]){
   if(!active(s))throw new DOMException('Cancelled','AbortError');
   number.textContent=value;number.dataset.step=value;number.getAnimations().forEach(a=>a.cancel());
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches)number.animate([{opacity:0,transform:'scale(.55)'},{opacity:1,transform:'scale(1.08)',offset:.45},{opacity:1,transform:'scale(1)'}],{duration:700,easing:'ease-out'});
   await wait(1000,s.signal);
  }
  s.phase='ready';dialog.close();
 }
 function cover(selector,selected){
  $$(selector).forEach((card,index)=>{
   const visible=selected===null||card===selected;card.classList.toggle('practice-covered',!visible);
   card.setAttribute('aria-label',visible?(card.dataset.originalLabel||SOUND_NAMES[card.dataset.sound]):`بطاقة مغطاة ${index+1}`);
  });
 }
 async function clip(s,id,type='',card=null,{ear=false,progress=false,signal=s.signal}={}){
  stopPlayback();const controller=new AbortController();clipController=controller;
  const abort=()=>controller.abort();signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();
  let frame,start,duration;
  const bar=$('#sound-progress');
  try{
   if(progress){duration=await audio.duration(source(id,type),{signal:controller.signal});bar.hidden=false;bar.dataset.duration=type;bar.className='sound-time '+type;bar.setAttribute('aria-valuenow','0');bar.firstElementChild.style.width='0%';}
   await audio.play(source(id,type),{signal:controller.signal,onStart:()=>{
    card?.classList.add('cue');
    if(ear){listeningOwner=controller;$('#listening-ear').innerHTML=icon('ear');$('#listening-overlay').showModal();}
    if(progress){start=performance.now();const update=()=>{if(controller.signal.aborted)return;const value=Math.min(100,(performance.now()-start)/(duration*1000)*100);bar.firstElementChild.style.width=value+'%';bar.setAttribute('aria-valuenow',String(Math.round(value)));frame=requestAnimationFrame(update);};frame=requestAnimationFrame(update);}
   }});
   if(progress&&active(s)){bar.firstElementChild.style.width='100%';bar.setAttribute('aria-valuenow','100');}
  }finally{
   cancelAnimationFrame(frame);card?.classList.remove('cue');closeEar(controller);signal.removeEventListener('abort',abort);
   if(clipController===controller)clipController=null;
  }
 }
 function stars(answers=[]){return `<div class="stars" aria-label="${answers.filter(Boolean).length} من ${answers.length}">${Array.from({length:10},(_,i)=>`<svg class="trial-star ${answers[i]?'filled':''}" data-completed="${i<answers.length}" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>`).join('')}</div>`;}
 function scorePopup(s,restart){
  s.phase='complete';const practice=s.activity==='practice';
  openModal(s.text||'اكتشاف الصوت',`<div class="center"><div class="result-metric" dir="ltr">${practice?10:s.score} / 10</div>${practice?'':`<p class="result-percent" dir="ltr">${s.score*10}%</p>`}<div class="actions">${control('session-again','refresh',practice?'تدريب جديد':'جلسة جديدة')}${control('session-back','back','رجوع')}</div></div>`);
  $('#session-again').onclick=()=>{$('#modal').close();restart();};
  $('#session-back').onclick=()=>{$('#modal').close();returnToWorkplace();};
 }
 function returnToWorkplace(){
  const s=current;if(!s)return;
  if(s.mode==='identification')startIdentification(s.pool,s.text,s.back);
  else if(s.mode==='duration')durationExplore(s.id);
  else if(s.mode==='detection'){reset();detectionSetup();}
 }
 $('#session-countdown').addEventListener('cancel',event=>{event.preventDefault();returnToWorkplace();});
 $('#listening-overlay').addEventListener('cancel',event=>{event.preventDefault();if(current?.mode==='detection')pauseDetection();});

 function detectionSetup(){
  main.innerHTML=heading('اكتشاف الصوت','around')+`<div class="setup-board"><div class="tiles"><button id="sudden" class="tile">${icon('sound')}<span>أصوات مفاجئة</span></button><button id="continuous" class="tile">${icon('ear')}<span>أصوات مستمرة</span></button></div></div>`;
  $('#sudden').onclick=()=>startDetection(SUDDEN);$('#continuous').onclick=()=>startDetection(CONTINUOUS);
 }
 function startDetection(pool){
  const s=begin({mode:'detection',pool,queue:shuffle([...Array(5).fill(true),...Array(5).fill(false)]),trial:0,score:0,answers:[],auto:true});
  drawDetection(s);run(s,async()=>{await countdown(s);await playDetection(s);});
 }
 function updateDetectionAuto(){const s=current,button=$('#detect-auto');button.innerHTML=icon(s.auto?'pause':'play');button.setAttribute('aria-pressed',String(s.auto));button.setAttribute('aria-label',s.auto?'إيقاف مؤقت':'متابعة');}
 function drawDetection(s){
  main.innerHTML=heading('اكتشاف الصوت','around/detection',control('detect-auto',s.auto?'pause':'play','إيقاف مؤقت'))+stars(s.answers)+`<div class="activity-board"><div class="detect-responses"><button id="heard" class="detect-answer yes" aria-label="سمعت صوتاً" disabled>${icon('check')}</button><button id="silent" class="detect-answer no" aria-label="لم أسمع صوتاً" disabled>${icon('close')}</button></div></div>${errorNode()}`;
  updateDetectionAuto();$('#detect-auto').onclick=()=>{if(s.auto)pauseDetection();else{s.auto=true;updateDetectionAuto();if(s.phase==='ready'||s.phase==='error')run(s,()=>playDetection(s));}};
  for(const value of [true,false])$(value?'#heard':'#silent').onclick=()=>{
   if(s.phase!=='answer')return;s.phase='answered';const correct=value===s.queue[s.trial];s.score+=Number(correct);s.answers.push(correct);
   $$('.detect-answer').forEach(button=>button.disabled=true);$('.stars').outerHTML=stars(s.answers);
   run(s,async()=>{await wait(650,s.signal);if(s.trial===9){scorePopup(s,()=>startDetection(s.pool));return;}s.trial++;drawDetection(s);s.phase='ready';if(s.auto)await playDetection(s);});
  };
 }
 function pauseDetection(){const s=current;if(!s||s.mode!=='detection')return;s.auto=false;s.detectionController?.abort();stopPlayback();closeEar();if(s.phase==='playing')s.phase='ready';updateDetectionAuto();}
 async function playDetection(s){
  s.phase='playing';s.target=shuffle(s.pool)[0];s.detectionController?.abort();const controller=new AbortController();s.detectionController=controller;
  const abort=()=>controller.abort();s.signal.addEventListener('abort',abort,{once:true});
  try{
   if(s.queue[s.trial])await clip(s,s.target,'',null,{ear:true,signal:controller.signal});
   else{listeningOwner=controller;$('#listening-ear').innerHTML=icon('ear');$('#listening-overlay').showModal();await wait(3000,controller.signal);}
   if(!active(s)||controller.signal.aborted)return;s.phase='answer';$$('.detect-answer').forEach(button=>button.disabled=false);
  }finally{closeEar(controller);s.signal.removeEventListener('abort',abort);}
 }

 function discriminationSetup(){
  main.innerHTML=heading('التمييز السمعي','around')+`<div class="setup-board"><div class="tiles"><button id="wide" class="tile">${icon('sound')}<span>1</span></button><button id="similar" class="tile">${icon('ear')}<span>2</span></button>${tile('around/duration','clock','طويل وقصير')}</div></div>`;
  $('#wide').onclick=()=>chooseSets(WIDE_PAIRS,'التمييز · المستوى 1','around/discrimination');$('#similar').onclick=()=>chooseSets(SIMILAR_PAIRS,'التمييز · المستوى 2','around/discrimination');
  $('#wide').setAttribute('aria-label','المستوى 1، أصوات متباينة');$('#similar').setAttribute('aria-label','المستوى 2، أصوات متشابهة');
 }
 function identificationSetup(){
  main.innerHTML=heading('التعرف على الصوت','around')+`<div class="setup-board"><div class="tiles"><button id="open-set" class="tile">${icon('book')}<span>10</span></button><button id="two-set" class="tile">${icon('cards')}<span>2</span></button><button id="closed-set" class="tile">${icon('target')}<span dir="ltr">3 / 4</span></button></div></div>`;
  $('#open-set').onclick=()=>startIdentification(environment,'التعرف على الصوت');$('#two-set').onclick=()=>chooseSets(SETS[2],'التعرف على الصوت');$('#closed-set').onclick=()=>chooseSets(SETS[3],'التعرف على الصوت');
  $('#open-set').setAttribute('aria-label','المجموعة المفتوحة، 10 صور');$('#two-set').setAttribute('aria-label','خياران');$('#closed-set').setAttribute('aria-label','3 أو 4 خيارات');
 }
 function chooseSets(sets,text,back='around/identification'){
  openModal(text,`<div class="set-library">${sets.map((set,index)=>`<button class="set-card" data-set="${index}" aria-label="${escape(set.map(id=>SOUND_NAMES[id]).join('، '))}">${set.map(id=>`<img src="images/${id}.webp" alt="">`).join('')}</button>`).join('')}</div>`);
  $$('.set-card').forEach(button=>button.onclick=()=>{$('#modal').close();startIdentification(sets[Number(button.dataset.set)],text,back);});
 }
 function startIdentification(pool,text,back='around/identification',activity='listen'){
  const s=begin({mode:'identification',pool:[...pool],text,back,activity,trial:0,score:0,answers:[],previousTarget:null});
  prepareIdentification(s);drawIdentification(s);
  if(activity!=='listen')run(s,async()=>{await countdown(s);await runIdentification(s);});
 }
 function prepareIdentification(s){
  s.target=shuffle(s.pool.filter(id=>id!==s.previousTarget))[0]??s.pool[0];s.previousTarget=s.target;
  s.options=s.pool.length>10?shuffle([s.target,...shuffle(s.pool.filter(id=>id!==s.target)).slice(0,9)]):shuffle(s.pool);
 }
 function drawIdentification(s){
  const count=s.options.length;
  main.innerHTML=heading(s.text,s.back,modeTools('identify'))+(s.activity==='test'?`<div class="trial-progress"><div class="trial-number" id="trial-number" dir="ltr">${s.trial+1} / 10</div>${stars(s.answers)}</div>`:'')+`<div class="identify-board activity-board"><div class="identify-layout" data-size="${count}"><button id="identify-target" class="ear-card" data-sound="target" aria-label="استمع إلى الصوت">${icon('ear')}</button><div class="answer-grid" data-size="${count}">${s.options.map(id=>pic('around',id,'',false)).join('')}</div></div></div>${errorNode()}`;
  $('#identify-practice').onclick=()=>startIdentification(s.pool,s.text,s.back,'practice');$('#identify-test').onclick=()=>startIdentification(s.pool,s.text,s.back,'test');
  $('#identify-practice').setAttribute('aria-pressed',String(s.activity==='practice'));$('#identify-test').setAttribute('aria-pressed',String(s.activity==='test'));
  $('#identify-target').onclick=()=>{
   if(s.activity==='practice'){if(s.phase==='error')startIdentification(s.pool,s.text,s.back,'practice');return;}
   if(['ready','answer','error'].includes(s.phase))run(s,()=>playIdentificationTarget(s));
  };
  $$('.answer-grid button').forEach(card=>{
   card.disabled=s.activity!=='listen';card.dataset.originalLabel=card.getAttribute('aria-label');
   card.onclick=()=>{if(s.activity==='listen')run(s,()=>clip(s,Number(card.dataset.sound),'',card));else identifyAnswer(s,Number(card.dataset.sound));};
   card.style.touchAction='none';drag(card,()=>Number(card.dataset.sound),(_,id)=>identifyAnswer(s,id),'#identify-target');
  });
  if(s.activity==='practice')cover('.answer-grid button',$(`.answer-grid [data-sound="${s.target}"]`));
 }
 async function playIdentificationTarget(s){
  s.phase='playing';$('#identify-target').disabled=true;$$('.answer-grid button').forEach(card=>card.disabled=s.activity!=='listen');
  try{await clip(s,s.target);if(!active(s))return;s.phase=s.activity==='test'?'answer':'ready';$('#identify-target').disabled=false;$$('.answer-grid button').forEach(card=>card.disabled=false);}
  finally{if(active(s)&&s.activity==='listen'){s.phase='ready';$('#identify-target').disabled=false;}}
 }
 async function runIdentification(s){
  if(s.activity==='test'){await playIdentificationTarget(s);return;}
  while(s.trial<10){
   s.phase='exposure';const card=$(`.answer-grid [data-sound="${s.target}"]`);$('#identify-target').disabled=true;
   await clip(s,s.target,'',card);if(!active(s))return;s.phase='demonstrating';await demonstrate(s,card,$('#identify-target'));await wait(1000,s.signal);
   s.trial++;if(s.trial<10){prepareIdentification(s);drawIdentification(s);}
  }
  if(active(s))scorePopup(s,()=>startIdentification(s.pool,s.text,s.back,'practice'));
 }
 async function demonstrate(s,card,box){
  const img=card.querySelector('img'),from=card.getBoundingClientRect(),to=box.getBoundingClientRect(),ghost=img.cloneNode();
  ghost.className='demo-ghost';ghost.style.cssText=`position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;object-fit:contain;background:white;border:2px solid #0284c7;border-radius:18px;pointer-events:none;z-index:50`;document.body.append(ghost);
  const animation=ghost.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${to.left+to.width/2-from.left-from.width/2}px,${to.top+to.height/2-from.top-from.height/2}px) scale(.75)`}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:700,easing:'ease-in-out',fill:'forwards'});
  const abort=()=>{animation.cancel();ghost.remove();};s.signal.addEventListener('abort',abort,{once:true});
  try{await animation.finished;if(!active(s))throw new DOMException('Cancelled','AbortError');box.replaceChildren(img.cloneNode());card.classList.add('matched');}
  finally{s.signal.removeEventListener('abort',abort);ghost.remove();}
 }
 function identifyAnswer(s,id){
  if(s.activity!=='test'||s.phase!=='answer')return;
  s.phase='answered';stopPlayback();const correct=id===s.target;s.score+=Number(correct);s.answers.push(correct);
  $(`.answer-grid [data-sound="${id}"]`).classList.add(correct?'matched':'wrong');$$('.answer-grid button').forEach(card=>card.disabled=true);$('#identify-target').disabled=true;$('.stars').outerHTML=stars(s.answers);
  run(s,async()=>{await feedback(s,correct);s.trial++;if(s.trial===10){scorePopup(s,()=>startIdentification(s.pool,s.text,s.back,'test'));return;}prepareIdentification(s);drawIdentification(s);await playIdentificationTarget(s);});
 }
 async function feedback(s,correct){
  const node=document.createElement('div');node.id='answer-feedback';node.className=`answer-feedback ${correct?'correct':'incorrect'}`;node.setAttribute('role','status');node.setAttribute('aria-label',correct?'إجابة صحيحة':'إجابة غير صحيحة');node.innerHTML=icon(correct?'check':'close');document.body.append(node);
  try{await wait(650,s.signal);}finally{node.remove();}
 }

 function durationSetup(){durationExplore(durationSound);}
 function durationChooser(){
  returnToWorkplace();openModal('اختر الصوت',`<div id="duration-library" class="sound-grid">${environment.map(id=>pic('around',id,'',false)).join('')}</div>`);
  $$('#duration-library button').forEach(card=>card.onclick=()=>{durationSound=Number(card.dataset.sound);$('#modal').close();durationExplore(durationSound);});
 }
 function durationExplore(id){
  durationSound=id;const s=begin({mode:'duration',id,activity:'listen',trial:0,score:0,answers:[],queue:shuffle([...Array(5).fill('short'),...Array(5).fill('long')]),order:['short','long']});drawDuration(s);
 }
 function setDurationMode(activity){
  const s=begin({mode:'duration',id:current.id,activity,trial:0,score:0,answers:[],queue:shuffle([...Array(5).fill('short'),...Array(5).fill('long')]),order:['short','long']});drawDuration(s);
  run(s,async()=>{await countdown(s);if(activity==='practice')await runDurationPractice(s);else await playDurationTarget(s);});
 }
 function drawDuration(s){
  main.innerHTML=heading('طويل وقصير','around/discrimination',control('duration-choose','cards','اختيار الصوت')+modeTools('duration')+(s.activity==='test'?control('duration-replay','ear','إعادة الصوت'):''))+(s.activity==='test'?stars(s.answers):'')+`<div class="duration-board activity-board"><div id="duration-cards" class="picture-grid">${s.order.map(type=>pic('around',s.id,'',false).replace('data-sound=',`data-duration="${type}" data-sound=`).replace(/aria-label="[^"]*"/,'aria-label="بطاقة صوت"')).join('')}</div></div><div class="sound-time-area"><div id="sound-progress" class="sound-time" role="progressbar" aria-label="مدة الصوت" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" hidden><span></span></div></div>${errorNode()}`;
  $('#duration-choose').onclick=durationChooser;$('#duration-practice').onclick=()=>setDurationMode('practice');$('#duration-test').onclick=()=>setDurationMode('test');
  $('#duration-practice').setAttribute('aria-pressed',String(s.activity==='practice'));$('#duration-test').setAttribute('aria-pressed',String(s.activity==='test'));
  if(s.activity==='practice')cover('#duration-cards button',$('#duration-cards [data-duration="short"]'));
  if($('#duration-replay'))$('#duration-replay').onclick=()=>{if(['answer','error'].includes(s.phase))run(s,()=>playDurationTarget(s));};
  $$('#duration-cards button').forEach(card=>{card.disabled=s.activity!=='listen';card.onclick=()=>{if(s.activity==='listen')run(s,()=>clip(s,s.id,card.dataset.duration,card,{progress:true}));else answerDuration(s,card.dataset.duration);};});
 }
 async function runDurationPractice(s){
  for(const type of s.order){
   const card=$(`#duration-cards [data-duration="${type}"]`);cover('#duration-cards button',card);
   for(let repetition=0;repetition<10;repetition++){
    s.phase='exposure';await clip(s,s.id,type,card,{progress:true});$('#sound-progress').hidden=true;
    if(type!=='long'||repetition!==9)await wait(1000,s.signal);
   }
  }
  if(active(s))durationExplore(s.id);
 }
 async function playDurationTarget(s){
  s.target=s.queue[s.trial];s.phase='playing';$('#duration-replay').disabled=true;$$('#duration-cards button').forEach(card=>card.disabled=true);
  await clip(s,s.id,s.target);if(!active(s))return;s.phase='answer';$('#duration-replay').disabled=false;$$('#duration-cards button').forEach(card=>card.disabled=false);
 }
 function answerDuration(s,type){
  if(s.activity!=='test'||s.phase!=='answer')return;s.phase='answered';const correct=type===s.target;s.score+=Number(correct);s.answers.push(correct);
  $$('#duration-cards button').forEach(card=>card.disabled=true);$('#duration-replay').disabled=true;$('.stars').outerHTML=stars(s.answers);
  run(s,async()=>{await feedback(s,correct);s.trial++;if(s.trial===10){scorePopup(s,()=>setDurationMode('test'));return;}drawDuration(s);await playDurationTarget(s);});
 }

 function memorySetup(){main.innerHTML=heading('الذاكرة','around')+`<div class="setup-board"><div class="actions">${[4,6,8,12].map(size=>`<button class="button" data-size="${size}">${size}</button>`).join('')}</div></div>`;$$('[data-size]').forEach(button=>button.onclick=()=>startMemory(Number(button.dataset.size)));}
 function startMemory(size){
  const previous=current?.mode==='memory'?[...new Set(current.deck)]:[];
  const pool=shuffle(environment.filter(id=>!previous.includes(id))).slice(0,size/2),s=begin({mode:'memory',size,deck:shuffle([...pool,...pool]),open:[],matched:new Set(),locked:false});
  main.innerHTML=heading('الذاكرة','around',control('memory-restart','refresh','بدء لعبة جديدة')+control('memory-size','cards','عدد البطاقات'))+`<div class="memory-board activity-board"><div class="memory-grid" data-size="${size}">${s.deck.map((id,index)=>pic('around',id,'hidden-face',false).replace(/aria-label="[^"]*"/,'aria-label="بطاقة مقلوبة"').replace('data-sound=',`data-index="${index}" data-sound=`)).join('')}</div></div>${errorNode()}`;
  $$('.memory-grid button').forEach(card=>card.onclick=()=>flipMemory(s,Number(card.dataset.index)));$('#memory-restart').onclick=()=>startMemory(size);$('#memory-size').onclick=()=>{reset();memorySetup();};
 }
 function flipMemory(s,index){
  if(s.locked||s.open.includes(index)||s.matched.has(index))return;
  const card=$(`.memory-grid [data-index="${index}"]`);card.classList.remove('hidden-face');card.setAttribute('aria-label',SOUND_NAMES[s.deck[index]]);run(s,()=>clip(s,s.deck[index]));s.open.push(index);
  if(s.open.length!==2)return;s.locked=true;const [a,b]=s.open;
  if(s.deck[a]===s.deck[b]){
   for(const i of [a,b]){s.matched.add(i);const card=$(`.memory-grid [data-index="${i}"]`);card.classList.add('matched');card.disabled=true;}
   s.open=[];s.locked=false;if(s.matched.size===sizeOf(s)){s.locked=true;run(s,async()=>{await wait(1200,s.signal);startMemory(s.size);});}
  }else run(s,async()=>{await wait(1000,s.signal);for(const i of [a,b]){const card=$(`.memory-grid [data-index="${i}"]`);card.classList.add('hidden-face');card.setAttribute('aria-label','بطاقة مقلوبة');}s.open=[];s.locked=false;});
 }
 function sizeOf(s){return s.deck.length;}
 function library(){const s=begin({mode:'library'});main.innerHTML=heading('مكتبة الأصوات','around')+`<div class="sound-grid">${environment.map(id=>pic('around',id)).join('')}</div>${errorNode()}`;$$('.sound-grid button').forEach(card=>card.onclick=()=>run(s,()=>clip(s,Number(card.dataset.sound),'',card)));}
 function render(page){
  if(page==='detection')detectionSetup();else if(page==='discrimination')discriminationSetup();else if(page==='duration')durationSetup();else if(page==='identification')identificationSetup();else if(page==='memory')memorySetup();else if(page==='library')library();else location.hash='/around';
 }
 function hide(){if(current&&['detection','duration','identification'].includes(current.mode)&&current.activity!=='listen')returnToWorkplace();else stopPlayback();}
 return {render,reset,hide};
}
