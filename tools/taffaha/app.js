import {installDialogFallback} from './dialogs.js';
import {applyIcons,icon} from './icons.js';
import {loadWords,loadImage,assetURL} from './assetsManager.js';
import {AudioEngine,VoiceRecorder,micError} from './audio.js';
import {listRecordings,getRecording,putRecording,recordingID,readPreferences,savePreferences} from './storage.js';
import {initOffline,refreshOffline} from './offline.js';
installDialogFallback();applyIcons();
const $=id=>document.getElementById(id),engine=new AudioEngine(),recorder=new VoiceRecorder(engine);
const savedPreferences=readPreferences(),preferences=savedPreferences&&typeof savedPreferences==='object'&&!Array.isArray(savedPreferences)?savedPreferences:{},records=new Map();
let words=[],index=0,playback=null,recordSession=null,finishing=false,recordClock=null,recordingMode=false,libraryCount=3,statusTimer=null,unsavedID=null;
const current=()=>words[index],digits=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const countLabel=count=>count===1?'مقطع واحد':count===2?'مقطعان':digits(count)+' مقاطع';
function segments(word=current()){
 const custom=preferences.segments?.[word.id];
 // Preserve previous valid custom divisions and their recordings. The removed
 // settings screen must not erase any audio a family already saved.
 return Array.isArray(custom)&&custom.length>0&&custom.length<=5&&custom.every(s=>typeof s==='string'&&s.length>0&&s.length<=16)?custom:word.syllables;
}
const group=()=>words.filter(word=>segments(word).length===segments().length);
function say(text,brief=false){clearTimeout(statusTimer);$('status').textContent=text;if(brief)statusTimer=setTimeout(()=>{$('status').textContent='';},2200);}
function savePosition(){preferences.lastWord=current().id;if(!savePreferences(preferences))say('تعذر حفظ موضع البطاقة على هذا المتصفح.');}
function requestPersistence(){try{Promise.resolve(navigator.storage?.persist?.()).catch(()=>{});}catch{}}
function busy(){return recorder.active||(recorder.pending&&!recorder.cancelled)||finishing;}
for(const button of document.querySelectorAll('[data-close]'))button.onclick=()=>button.closest('dialog').close();
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
function locks(){
 const blocked=busy();for(const id of ['previous','next','random','original','sequence','open-library','toggle-recording'])$(id).disabled=blocked||!words.length;
 if(words.length&&group().length<2)for(const id of ['previous','next','random'])$(id).disabled=true;
 for(const circle of document.querySelectorAll('.syllable-circle'))circle.disabled=blocked;
 for(const button of document.querySelectorAll('.record-button')){
  const own=recordSession?.index===Number(button.dataset.index);
  button.disabled=finishing||recorder.pending||(recorder.active&&!own);
  button.innerHTML=icon(recorder.active&&own?'stop':'microphone');
  button.setAttribute('aria-label',(recorder.active&&own?'إنهاء تسجيل المقطع ':'تسجيل المقطع ')+button.dataset.syllable);
 }
 $('finish-recording').disabled=finishing||recorder.pending;
 $('cancel-recording').disabled=finishing;
}
function stopPlayback(){playback?.abort();playback=null;engine.stop();for(const el of document.querySelectorAll('.lit,.is-playing'))el.classList.remove('lit','is-playing');$('sequence').setAttribute('aria-busy','false');}
async function runPlayback(action){
 if(busy()){say('أنهِ التسجيل أولًا.');return;}
 engine.unlock();stopPlayback();say('');const controller=new AbortController();playback=controller;
 try{await action(controller.signal);}catch(e){if(e.name!=='AbortError')say(e.message||'تعذر تشغيل الصوت.');}
 finally{if(playback===controller){playback=null;for(const el of document.querySelectorAll('.lit,.is-playing'))el.classList.remove('lit','is-playing');$('sequence').setAttribute('aria-busy','false');}}
}
function preferredRecord(word,segment){
 // Older versions saved child/model takes separately. Both remain usable;
 // the most recent take overrides the device voice, regardless of old role.
 let selected;for(const record of records.values())if(record.wordID===word.id&&record.segment===segment&&(!selected||record.created>selected.created))selected=record;return selected;
}
async function recordingBlob(record){if(record.blob)return record.blob;const saved=await getRecording(record.id);if(!saved?.blob)throw Error('التسجيل غير متاح. سجّل المقطع مجددًا من زر الميكروفون.');return saved.blob;}
async function playSegment(word,segment,signal){
 const record=preferredRecord(word,segment),source=record?await recordingBlob(record):assetURL(word.syllableAudio?.[segment]);
 if(signal.aborted)throw new DOMException('Cancelled','AbortError');
 if(source)await engine.play(source,{signal});else await engine.speak(segment,{signal});
}
function renderCard(){
 stopPlayback();const word=current(),parts=segments(word),siblings=group();savePosition();
 $('word-label').textContent=word.label;$('category').textContent=countLabel(parts.length);$('position').textContent=digits(siblings.findIndex(w=>w.id===word.id)+1)+' / '+digits(siblings.length);
 loadImage($('word-image'),word.image,word.label);$('syllables').dataset.count=parts.length;$('syllables').replaceChildren();
 parts.forEach((segment,i)=>{
  const unit=document.createElement('div'),circle=document.createElement('button'),tools=document.createElement('div'),record=document.createElement('button');unit.className='syllable-unit';circle.className='syllable-circle';circle.textContent=segment;circle.dataset.index=i;
  const saved=preferredRecord(word,segment);if(saved)circle.classList.add('has-recording');circle.setAttribute('aria-label',(saved?'استمع إلى تسجيل المقطع ':'استمع للمقطع ')+segment);
  circle.onclick=()=>runPlayback(async signal=>{circle.classList.add('lit');await playSegment(word,segment,signal);});
  tools.className='syllable-tools';tools.hidden=!recordingMode;record.className='record-button';record.dataset.index=i;record.dataset.syllable=segment;record.innerHTML=icon('microphone');record.title='تسجيل المقطع '+segment;record.setAttribute('aria-label',record.title);
  record.onclick=()=>{if(recorder.active&&recordSession?.index===i)finishRecording();else startRecording(segment,i);};
  tools.append(record);unit.append(circle,tools);$('syllables').append(unit);
 });locks();
}
function navigate(step){if(busy())return;const siblings=group(),position=siblings.findIndex(w=>w.id===current().id),next=siblings[(position+step+siblings.length)%siblings.length];index=words.findIndex(w=>w.id===next.id);renderCard();say('');}
$('previous').onclick=()=>navigate(-1);$('next').onclick=()=>navigate(1);$('random').onclick=()=>navigate(1+Math.floor(Math.random()*Math.max(1,group().length-1)));
$('original').onclick=()=>runPlayback(async signal=>{
 const word=current();$('original').classList.add('is-playing');
 try{await engine.play(assetURL(word.audio),{signal});}catch(e){if(e.name==='AbortError')throw e;say('صوت المكتبة غير متاح؛ نستخدم صوت الجهاز.');await engine.speak(word.label,{signal});}
});
function gap(ms,signal){return new Promise((resolve,reject)=>{const finish=()=>{signal.removeEventListener('abort',abort);resolve();},timer=setTimeout(finish,ms),abort=()=>{clearTimeout(timer);reject(new DOMException('Cancelled','AbortError'));};signal.addEventListener('abort',abort,{once:true});});}
$('sequence').onclick=()=>runPlayback(async signal=>{
 const word=current(),parts=segments(word);$('sequence').classList.add('is-playing');$('sequence').setAttribute('aria-busy','true');
 for(let i=0;i<parts.length;i++){
  if(signal.aborted)throw new DOMException('Cancelled','AbortError');
  const circle=document.querySelector(`.syllable-circle[data-index="${i}"]`);circle.classList.add('lit');await playSegment(word,parts[i],signal);circle.classList.remove('lit');
  if(i<parts.length-1)await gap([250,600,1000].includes(Number(preferences.pace))?Number(preferences.pace):600,signal);
 }
});
$('stop-audio').onclick=()=>stopPlayback();
$('toggle-recording').onclick=()=>{
 if(busy())return;recordingMode=!recordingMode;$('toggle-recording').setAttribute('aria-pressed',String(recordingMode));const label=recordingMode?'إخفاء أزرار التسجيل':'إظهار أزرار التسجيل';$('toggle-recording').setAttribute('aria-label',label);$('toggle-recording').title=label;
 for(const tools of document.querySelectorAll('.syllable-tools'))tools.hidden=!recordingMode;if(recordingMode)requestPersistence();
};
async function startRecording(segment,i){
 if(!recordingMode||busy()||recorder.pending)return;stopPlayback();engine.unlock();const token={wordID:current().id,label:current().label,segment,kind:'child',index:i};recordSession=token;
 say('اسمح بالميكروفون عندما يسألك المتصفح.');const starting=recorder.start();$('recording-bar').hidden=false;$('recording-label').textContent='بانتظار إذن الميكروفون…';locks();
 try{
  await starting;if(recordSession!==token)return;if(document.hidden){await finishRecording(true);return;}
  $('recording-label').textContent=segment;document.querySelector(`.syllable-circle[data-index="${i}"]`)?.classList.add('recording');
  const tick=()=>{const seconds=Math.floor((Date.now()-recorder.started)/1000);$('recording-time').textContent='٠:'+digits(String(seconds).padStart(2,'0'));if(seconds>=15)finishRecording();};tick();recordClock=setInterval(tick,200);say('');locks();
 }catch(e){if(recordSession===token){recordSession=null;$('recording-bar').hidden=true;locks();if(e.name!=='AbortError')say(micError(e));}}
}
async function finishRecording(discard=false){
 if(finishing)return;if(recorder.pending){recorder.cancelPending();recordSession=null;$('recording-bar').hidden=true;locks();return;}if(!recorder.active)return;
 finishing=true;clearInterval(recordClock);const token=recordSession;locks();
 try{
  const duration=Date.now()-recorder.started,blob=await recorder.stop();if(discard){say('');return;}if(duration<300||blob.size<100)throw Error('التسجيل قصير جدًا. حاول مجددًا.');
  const record={id:recordingID(token.wordID,token.segment,'child'),...token,blob,created:Date.now(),duration};records.set(record.id,record);
  try{await putRecording(record);const{blob,...metadata}=record;records.set(record.id,metadata);if(unsavedID===record.id){unsavedID=null;$('save-copy').hidden=true;}requestPersistence();say('تم الحفظ',true);}
  catch{unsavedID=record.id;$('save-copy').hidden=false;say('تعذر الحفظ الدائم؛ نزّل نسخة من التسجيل قبل الإغلاق.');}
 }catch(e){say(micError(e));}
 finally{finishing=false;recordSession=null;$('recording-bar').hidden=true;renderCard();locks();}
}
$('finish-recording').onclick=()=>finishRecording();$('cancel-recording').onclick=()=>finishRecording(true);
$('save-copy').onclick=async()=>{const record=records.get(unsavedID);if(!record)return;const blob=await recordingBlob(record),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${record.label}-${record.segment}.${blob.type.includes('wav')?'wav':blob.type.includes('mp4')?'m4a':'webm'}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);};
recorder.onInterrupted=()=>finishRecording();recorder.onFailure=e=>{clearInterval(recordClock);recordSession=null;$('recording-bar').hidden=true;finishing=false;renderCard();locks();say(micError(e));};
function background(){stopPlayback();if(recorder.pending){recorder.cancelPending();recordSession=null;$('recording-bar').hidden=true;locks();}else if(recorder.active)finishRecording();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)background();});window.addEventListener('pagehide',background);
document.querySelector('.brand').onclick=e=>{e.preventDefault();if(!busy())stopPlayback();};
function renderLibrary(){
 const q=$('search').value.trim();$('word-library').replaceChildren();
 for(const [i,word]of words.entries())if(segments(word).length===libraryCount&&word.label.includes(q)){
  const b=document.createElement('button'),image=document.createElement('img'),label=document.createElement('span');image.loading='lazy';loadImage(image,word.image);label.textContent=word.label;b.append(image,label);b.setAttribute('aria-current',String(i===index));b.onclick=()=>{if(busy())return;index=i;renderCard();$('library-dialog').close();say('');};$('word-library').append(b);
 }
 if(!$('word-library').children.length)$('word-library').textContent='لا توجد كلمات مطابقة.';
 for(const b of $('category-filters').children)b.setAttribute('aria-pressed',String(Number(b.dataset.count)===libraryCount));
}
$('search').oninput=renderLibrary;$('open-library').onclick=()=>{libraryCount=segments().length;$('search').value='';renderLibrary();$('library-dialog').showModal();};
$('open-offline').onclick=()=>{$('offline-dialog').showModal();refreshOffline();};
async function init(){
 try{
  words=await loadWords();try{for(const record of await listRecordings())if(typeof record.id==='string')records.set(record.id,record);}catch{say('الحفظ المحلي غير متاح في هذا المتصفح.');}
  index=Math.max(0,words.findIndex(w=>w.id===preferences.lastWord));renderCard();
  for(let n=1;n<=5;n++){const b=document.createElement('button');b.textContent=String(n);b.dataset.count=n;b.setAttribute('aria-label',countLabel(n));b.onclick=()=>{libraryCount=n;renderLibrary();};$('category-filters').append(b);}
 }catch(e){say(e.message);$('word-label').textContent='تعذر تحميل البطاقات';}
 initOffline();
}
init();
