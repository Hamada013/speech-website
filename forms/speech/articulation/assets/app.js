'use strict';
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY = 'aghanem-arabic-articulation-v1';
const RESULTS = {correct:'صحيح',substitution:'إبدال',omission:'حذف',distortion:'تشويه',addition:'إضافة',dialect:'نطق مقبول في اللهجة',unelicited:'لم تُستثر الكلمة / غير مألوفة',skipped:'لم يُفحص / تجاوز'};
const MODES = {naming:'تسمية مستقلة',imitation:'تقليد نموذج',context:'استثارة سياقية / تلميح'};
const STIM = {'':'لم يُفحص',yes:'نجح مع النموذج / التلميح',partial:'نجاح جزئي',no:'لم ينجح في المحاولة'};
const SCORED = ['correct','substitution','omission','distortion','addition'];
const ERRORS = ['substitution','omission','distortion','addition'];
const PATTERNS = ['حذف في آخر الكلمة','تغيير موضع النطق','تحويل الاحتكاكي إلى وقفي','تغير التفخيم','تبسيط تجمعات صامتة','مماثلة أصوات','إنتاج غير ثابت','نمط آخر موضح في الملاحظات'];
const RECOMMENDATIONS = ['تقييم شامل لأصوات الكلام','استكمال مراجعة السمع','فحص آلية النطق الفموية','عينة كلام متصل إضافية','فحص القابلية للاستثارة','مراجعة اللهجة واللغات','تعاون مع الأسرة / المدرسة','إعادة فحص ومتابعة'];
const allProbes = SOUNDS.flatMap(sound => sound.probes.map(probe => ({...probe,sound})));
const localToday = () => {const d=new Date();return {day:String(d.getDate()),month:String(d.getMonth()+1),year:String(d.getFullYear())};};
const freshState = () => ({meta:{assessment:localToday(),examiner:'Ahmad Ghanem',dialect:'',languages:''},trials:{},patterns:[],recommendations:[]});
let state = freshState(), selectedSound = 0, selectedProbe = 0, saving = false, soundPicker = null;
const notePanels = new Set();
try {
  const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (stored?.version===1 && stored.state?.meta && stored.state?.trials) {
    state = {...freshState(),...stored.state,meta:{...freshState().meta,...stored.state.meta}};
    if (!Array.isArray(state.patterns)) state.patterns=[];
    if (!Array.isArray(state.recommendations)) state.recommendations=[];
    // Preserve older records; do not silently reinterpret them using the new dialect baseline.
    for(const probe of allProbes){const record=state.trials[probe.id];if(record?.status&&!hasOwn(record,'targetIPA')){record.targetIPA='';record.word=record.word||probe.word;record.expected=record.expected||'';record.referenceNeedsReview=true;}}
    saving = true;
  }
} catch {}
function save() {
  if (typeof saveCase==='function') return saveCase();
  if (!saving) return false;
  try {localStorage.setItem(KEY,JSON.stringify({version:1,state}));return true;}
  catch {$('message').textContent='تعذر الحفظ؛ أبقِ الصفحة مفتوحة أو صدّر التقرير.';return false;}
}
function normalizeDigits(s) {return String(s||'').replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));}
function parseDate(v) {
  if (!v || !v.day&&!v.month&&!v.year) return {empty:true};
  const day=normalizeDigits(v.day),month=normalizeDigits(v.month),year=normalizeDigits(v.year);
  if (!/^\d{1,2}$/.test(day)||!/^\d{1,2}$/.test(month)||!/^\d{4}$/.test(year)||Number(year)<1900||Number(year)>2199) return {error:true};
  const date=new Date(Number(year),Number(month)-1,Number(day));
  if(date.getFullYear()!==Number(year)||date.getMonth()!==Number(month)-1||date.getDate()!==Number(day))return {error:true};
  return {date,iso:`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`};
}
function dateProblem() {
  const birth=parseDate(state.meta.dob),exam=parseDate(state.meta.assessment);
  if(birth.error||exam.error)return 'أكمل التاريخ بسنة من أربعة أرقام وتحقق من صحة اليوم والشهر.';
  if(birth.date&&(birth.date>parseDate(localToday()).date||exam.date&&birth.date>exam.date))return 'تاريخ الميلاد يجب ألا يتجاوز اليوم أو تاريخ الفحص.';
  return '';
}
function ageText() {
  const a=parseDate(state.meta.dob).date,b=parseDate(state.meta.assessment).date;
  if(!a||!b||dateProblem())return '';
  let years=b.getFullYear()-a.getFullYear(),months=b.getMonth()-a.getMonth();
  if(b.getDate()<a.getDate())months--;
  if(months<0){years--;months+=12;}
  return `${years} سنة و${months} شهر`;
}
function updateDates() {$('dateError').textContent=dateProblem();$('age').textContent=ageText()?'العمر عند الفحص: '+ageText():'أدخل تاريخ الميلاد وتاريخ الفحص لحساب العمر.';}
function renderMeta() {
  document.querySelectorAll('[data-meta]').forEach(input=>{input.value=state.meta[input.dataset.meta]||'';});
  document.querySelectorAll('[data-date]').forEach(input=>{input.value=state.meta[input.dataset.date]?.[input.dataset.part]||'';});
  if($('referenceReviewed'))$('referenceReviewed').checked=state.meta.referenceReviewed===true;
  if($('diagnosisReviewed'))$('diagnosisReviewed').checked=state.meta.diagnosisReviewed===true;
  $('remember').checked=saving;updateDates();enhanceDropdowns();
}
function showPage(id) {
  closeDropdowns();
  if(id!=='home'&&!activeChild()){openAccounts();return;}
  ['home','details','screen','summary'].forEach(page=>$(page).hidden=page!==id);
  document.body.dataset.page=id;
  document.querySelector('.tabs').hidden=id==='home';
  $('downloadButton').hidden=id!=='home';
  document.querySelectorAll('.tabs [data-page]').forEach(button=>{if(button.dataset.page===id)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  if(id==='summary')renderDiagnosisEditor();
  if(id==='home')refreshHome();
  if(id==='screen'){document.body.classList.add('workplace-focused');renderTrials();}
  else document.body.classList.remove('workplace-focused');
  const heading=$(id+'Title');if(id!=='home')heading?.focus({preventScroll:true});else if(document.activeElement?.matches?.('h1,h2,h3,[tabindex="-1"]'))document.activeElement.blur();
}
function trialFor(id) {return state.trials[id]||{};}
function aggregate(probes=allProbes) {
  const results={total:probes.length,recorded:0,scored:0,correct:0,errors:0,dialect:0,unelicited:0,skipped:0,unrecorded:0,counts:{},modes:{}};
  for(const probe of probes){
    const trial=trialFor(probe.id),status=trial.status;
    if(!RESULTS[status]){results.unrecorded++;continue;}
    results.recorded++;results.counts[status]=(results.counts[status]||0)+1;
    if(SCORED.includes(status)) {
      results.scored++;if(status==='correct')results.correct++;else results.errors++;
      const mode=trial.mode||'naming';results.modes[mode]??={total:0,correct:0};results.modes[mode].total++;if(status==='correct')results.modes[mode].correct++;
    } else results[status]++;
  }
  results.accuracy=results.scored?Math.round(results.correct/results.scored*1000)/10:null;
  return results;
}
function updateCoverage() {
  const s=aggregate();$('coverage').textContent=`سُجل ${s.recorded} من ${s.total} بنداً · قابل للتصحيح: ${s.scored} · غير مسجل: ${s.unrecorded}`;
  $('coverageBar').value=s.recorded;
  $('soundNav').innerHTML=SOUNDS.map((sound,i)=>{
    const count=sound.probes.filter(p=>RESULTS[trialFor(p.id).status]).length;
    if($('unansweredOnly').checked&&count===3&&selectedSound!==i)return '';
    return `<button type="button" data-sound="${i}" aria-label="الصوت ${escapeHTML(sound.letter)}، ${count} من 3 بنود مسجلة" ${selectedSound===i?'aria-current="true"':''} class="${count===3?'complete':''}">${escapeHTML(sound.letter)}<small>${count}/3</small></button>`;
  }).join('');
}

function expectedTarget(probe){const r=trialFor(probe.id);return hasOwn(r,'targetIPA')?r.targetIPA:probe.targetIPA;}
function expectedWord(probe){const r=trialFor(probe.id);return r.expected!==undefined?String(r.expected||''):(probe.reference||'');}
function spokenWord(probe){return trialFor(probe.id).word||probe.spoken||probe.word;}
function pictureMarkup(probe,child=false) {
 const word=trialFor(probe.id).word?.trim();
 let content;
 if(word&&![probe.word,probe.spoken].includes(word))content=`<div class="placeholder">${child?'الصورة غير مرتبطة بهذه الكلمة.':'كلمة بديلة — أضف صورة ملائمة قبل عرضها للطفل.'}</div>`;
 else content=`<img decoding="async" src="assets/images/${probe.image}" alt="${child?'صورة للتسمية':escapeHTML(spokenWord(probe))}"><div class="placeholder" hidden><span class="picture-space" aria-hidden="true"></span>${child?'الصورة غير متوفرة بعد.':`مساحة صورتنا القادمة<br><b dir="ltr">${probe.image}</b><span>${escapeHTML(spokenWord(probe))}</span>`}</div>`;
 return `<div class="picture-frame">${content}</div>`;
}
function wireImages(root){root.querySelectorAll('img').forEach(img=>{const fail=()=>{img.hidden=true;img.nextElementSibling.hidden=false;};img.addEventListener('error',fail);if(img.complete&&img.naturalWidth===0)fail();});}
function pillGroup(probe,prop,options,value){return `<div class="pill-group">${Object.entries(options).map(([key,label])=>`<button type="button" data-setting="${prop}" data-trial-id="${probe.id}" data-value="${key}" aria-pressed="${value===key}" class="${value===key?'chosen':''}">${escapeHTML(label)}</button>`).join('')}</div>`;}
function renderTrials() { renderWorkplace(); }
function selectPicture(index){selectedProbe=Math.max(0,Math.min(allProbes.length-1,index));renderTrials();save();$('heading-'+allProbes[selectedProbe].id)?.focus();}
function selectSound(index){const sound=SOUNDS[index];if(sound)selectPicture(allProbes.findIndex(p=>p.sound.id===sound.id));}
function snapshotReference(id){const p=allProbes.find(p=>p.id===id),r=state.trials[id]||{};r.word=r.word||p.spoken||p.word;r.expected=expectedWord(p);r.targetIPA=expectedTarget(p);state.trials[id]=r;return r;}
function recordScore(id,status){
 if(!RESULTS[status])return;
 const probe=allProbes.find(p=>p.id===id);
 if(expectedTarget(probe)===null&&SCORED.includes(status))return;
 if(['substitution','addition'].includes(status)){openSoundPicker(id,'actual',status);return;}
 const r=snapshotReference(id);r.status=status;delete r.actualIPA;delete r.actual;
 if(status==='omission')r.actual='∅';
 delete r.stimulability;save();renderTrials();$(id+'-'+status)?.focus();
}
function openSoundPicker(id,prop,status=null){
 soundPicker={id,prop,status};$('soundDialogTitle').textContent=prop==='targetIPA'?'اختر الصوت المرجعي المستهدف':'اختر الصوت الذي نطق به الطفل';
 $('phonemeGrid').innerHTML=PHONEMES.map((p,i)=>`<button type="button" data-phoneme="${i}" class="phoneme-button ${p.letter.length>2?'long-label':''}"><span>${escapeHTML(p.letter)}</span><b dir="ltr">/${escapeHTML(p.ipa)}/</b></button>`).join('');
 $('customSoundForm').hidden=true;$('customSound').value='';$('soundPickerError').textContent='';$('absentTarget').hidden=prop!=='targetIPA';openDialog($('soundDialog'));
}
function useSound(value,source='picker'){
 if(!soundPicker)return;
 const {id,prop,status}=soundPicker,probe=allProbes.find(p=>p.id===id);let r=state.trials[id]||{};
 if(prop==='targetIPA'){
  const current=expectedTarget(probe);if(current!==value){state.meta.referenceReviewed=false;
   const fullWord=expectedWord(probe);
   // Replace exact known IPA tokens, rather than letters within emphatic/affricate tokens.
   const tokens=PHONEMES.map(p=>p.ipa).sort((a,b)=>b.length-a.length);
   let rebuilt='',offset=0;
   while(offset<fullWord.length){const token=tokens.find(t=>fullWord.startsWith(t,offset));if(token){rebuilt+=(token===current?(value||''):token);offset+=token.length;}else{rebuilt+=fullWord[offset];offset++;}}
   r={word:r.word||probe.spoken,expected:current?rebuilt:fullWord,targetIPA:value};
  }
 }else{
  r=snapshotReference(id);r.actual=value;r.actualIPA=phoneme(value)?.ipa||null;r.actualSource=source;
  if(status&&status!==r.status)delete r.stimulability;
  if(status)r.status=status;
 }
 state.trials[id]=r;soundPicker=null;closeDialog($('soundDialog'));save();renderTrials();
}
function changeTrial(input){
 const id=input.dataset.trial,prop=input.dataset.prop;if(!id)return;
 const p=allProbes.find(p=>p.id===id),current=trialFor(id);
 if(prop==='word'||prop==='expected'){
  const previous=prop==='word'?spokenWord(p):expectedWord(p);if(input.value.trim()===previous.trim())return;
  state.meta.referenceReviewed=false;
  state.trials[id]={word:current.word||p.spoken,expected:prop==='word'?'':expectedWord(p),targetIPA:'',[prop]:input.value.trim()};
  // Keep the editor and the tapped control in place while invalidating the old judgment.
  const root=$('trials'),stimulus=root.querySelector('.stimulus');
  if(stimulus){stimulus.innerHTML=pictureMarkup(p)+`<p class="word">${escapeHTML(spokenWord(p))}</p>`;wireImages(stimulus);}
  root.querySelectorAll('[data-score]').forEach(button=>{button.classList.remove('chosen');button.setAttribute('aria-pressed','false');button.disabled=false;});
  root.querySelectorAll('.recorded-sound,[data-error-details],[data-absent-note]').forEach(element=>{element.hidden=true;});
  const targetLabel=root.querySelector('.reference-target strong');if(targetLabel)targetLabel.textContent='اختر الصوت المرجعي من جديد';
  root.querySelectorAll('[data-prop=note],[data-prop=noteEn]').forEach(input=>{input.value='';});
  save();updateCoverage();return;
 }
 current[prop]=input.value;state.trials[id]=current;save();updateCoverage();
}
document.addEventListener('input',event=>{
 const input=event.target;
 if(input.dataset.meta){state.meta[input.dataset.meta]=input.value;save();}
 if(input.dataset.date){state.meta[input.dataset.date]={...state.meta[input.dataset.date],[input.dataset.part]:input.value};save();}
 if(input.dataset.trial&&['note','noteEn','productionIPA'].includes(input.dataset.prop))changeTrial(input);
});
document.addEventListener('focusout',event=>{if(event.target.dataset.date)updateDates();});
document.addEventListener('change',event=>{
 const input=event.target;
 if(input.dataset.trial&&!['note','noteEn','productionIPA'].includes(input.dataset.prop))changeTrial(input);
 if(input.id==='referenceReviewed'){state.meta.referenceReviewed=input.checked;save();}
 if(input.id==='diagnosisReviewed'){state.meta.diagnosisReviewed=input.checked;save();}
 if(input.dataset.list){const key=input.dataset.list;state[key]=state[key].filter(v=>v!==input.value);if(input.checked)state[key].push(input.value);save();}
});
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.page)showPage(button.dataset.page);
 if(button.dataset.sound!==undefined){selectSound(Number(button.dataset.sound));closeDialog($('soundNavDialog'));}
 if(button.dataset.score)recordScore(button.dataset.trialId,button.dataset.score);
 if(button.dataset.setting){const r=snapshotReference(button.dataset.trialId);r[button.dataset.setting]=button.dataset.value;save();renderTrials();}
 if(button.dataset.pickActual)openSoundPicker(button.dataset.pickActual,'actual');
 if(button.dataset.pickTarget)openSoundPicker(button.dataset.pickTarget,'targetIPA');
 if(button.dataset.phoneme!==undefined)useSound(PHONEMES[Number(button.dataset.phoneme)].ipa);
 if(button.dataset.note)openTrialNote(button.dataset.note);
 if(button.dataset.clear){const id=button.dataset.clear,current=trialFor(id);state.trials[id]={word:current.word,expected:current.expected,targetIPA:expectedTarget(allProbes.find(p=>p.id===id))};notePanels.delete(id);save();renderTrials();}
 if(button.dataset.picture){const p=allProbes.find(p=>p.id===button.dataset.picture);$('childPicture').innerHTML=pictureMarkup(p,true);wireImages($('childPicture'));openDialog($('pictureDialog'));}
});
document.addEventListener('keydown',event=>{
 if($('screen').hidden||document.querySelector('dialog[open]')||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
 if(['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName))return;
 if(event.key==='ArrowLeft'){event.preventDefault();selectPicture(selectedProbe+1);}
 if(event.key==='ArrowRight'){event.preventDefault();selectPicture(selectedProbe-1);}
});
$('closeSound').onclick=()=>{closeDialog($('soundDialog'));soundPicker=null;};
$('soundDialog').addEventListener('cancel',()=>{soundPicker=null;});
$('customSoundToggle').onclick=()=>{$('customSoundForm').hidden=false;$('customSound').focus();};
$('customSoundForm').onsubmit=event=>{event.preventDefault();const value=$('customSound').value.trim();if(!value){$('soundPickerError').textContent='أدخل الصوت أولاً.';return;}useSound(value,'custom');};
$('absentTarget').onclick=()=>useSound(null,'reference');
$('detailsForm').addEventListener('submit',e=>e.preventDefault());
$('unansweredOnly').onchange=updateCoverage;

$('closePicture').onclick=()=>closeDialog($('pictureDialog'));
$('newCase').onclick=()=>openDialog($('resetDialog'));$('cancelReset').onclick=()=>closeDialog($('resetDialog'));
$('confirmReset').onclick=startNewAssessment;

$('reportButton').onclick=showReport;$('summaryReport').onclick=showReport;$('closeReport').onclick=()=>closeDialog($('reportDialog'));
$('includeUntested').onchange=refreshReport;
$('reportLanguage').onchange=refreshReport;
$('exportPdf').onclick=()=>{
 $('printArea').innerHTML=visibleReportHTML();$('printArea').dir=reportLang()==='en'?'ltr':'rtl';$('printArea').lang=reportLang();
 closeDropdowns();closeDialog($('reportDialog'));
 const original=document.title;
 const dates=comparisonSelection?comparisonSelection.map(id=>activeChild().assessments.find(item=>item.id===id)).map(caseDate).sort().join(' vs '):caseDate(reportRecord());
 document.title=(activeChild()?.name||'Arabic articulation')+' - '+dates;
 const restore=()=>{document.title=original;window.removeEventListener('afterprint',restore);};window.addEventListener('afterprint',restore);window.print();
};
