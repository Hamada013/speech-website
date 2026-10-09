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
const freshState = () => ({meta:{assessment:localToday(),examiner:'Ahmad Ghanem',dialect:'سورية شامية مدينية — مرجع مبدئي قابل للتعديل',languages:'العربية السورية'},trials:{},patterns:[],recommendations:[]});
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
  if (!saving) return;
  try {localStorage.setItem(KEY,JSON.stringify({version:1,state}));$('saveStatus').textContent='تم حفظ المسودة على هذا الجهاز.';}
  catch {$('saveStatus').textContent='تعذر الحفظ؛ أبقِ الصفحة مفتوحة أو صدّر التقرير.';}
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
  const renderChecks=(id,options,key)=>{$(id).innerHTML=options.map((label,i)=>`<label class="choice"><input type="checkbox" data-list="${key}" value="${i}" ${state[key].includes(String(i))?'checked':''}>${escapeHTML(label)}</label>`).join('');};
  renderChecks('patterns',PATTERNS,'patterns');renderChecks('recommendations',RECOMMENDATIONS,'recommendations');
  $('remember').checked=saving;updateDates();enhanceDropdowns();
}
function showPage(id) {
  closeDropdowns();
  ['details','screen','summary'].forEach(page=>$(page).hidden=page!==id);
  document.querySelectorAll('.tabs [data-page]').forEach(button=>{if(button.dataset.page===id)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  if(id==='summary')renderAutomaticSummary();
  $(id+'Title').focus();
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
function renderTrials() {
 const probe=allProbes[selectedProbe],sound=probe.sound,r=trialFor(probe.id),target=expectedTarget(probe),hasError=ERRORS.includes(r.status),expanded=notePanels.has(probe.id)||!!r.note||!!r.noteEn;
 selectedSound=SOUNDS.findIndex(s=>s.id===sound.id);
 $('trials').innerHTML=`<section class="trial play-card" aria-labelledby="heading-${probe.id}"><div class="trial-heading"><span class="target-chip">${escapeHTML(sound.letter)} <b dir="ltr">${target?'/'+escapeHTML(target)+'/':'—'}</b></span><div><h3 id="heading-${probe.id}" tabindex="-1">${probe.position}</h3><p class="muted">الصورة ${selectedProbe+1} من ${allProbes.length}</p></div><button type="button" data-picture="${probe.id}" class="soft-button">عرض الصورة فقط</button></div><div class="picture-navigation" dir="ltr"><button id="nextPicture" class="arrow-button" aria-label="الصورة التالية" ${selectedProbe===allProbes.length-1?'disabled':''}>←</button><div class="stimulus">${pictureMarkup(probe)}<p class="word">${escapeHTML(spokenWord(probe))}</p></div><button id="previousPicture" class="arrow-button" aria-label="الصورة السابقة" ${selectedProbe===0?'disabled':''}>→</button></div><div class="trial-fields"><fieldset class="scoring"><legend>كيف نطق الطفل الصوت؟</legend><div class="score-buttons">${Object.entries(RESULTS).map(([value,label])=>`<button type="button" id="${probe.id}-${value}" data-score="${value}" data-trial-id="${probe.id}" aria-pressed="${r.status===value}" class="score-button score-${value} ${r.status===value?'chosen':''}" ${target===null&&SCORED.includes(value)?'disabled':''}>${label}</button>`).join('')}</div></fieldset>${target===null?`<p class="notice" data-absent-note>${escapeHTML(probe.referenceNote)} الحرف المكتوب ليس هدفاً صوتياً موجوداً في هذا المرجع.</p>`:''}<div class="recorded-sound" ${hasError?'':'hidden'}><span>الصوت المسجل: <strong dir="auto">${escapeHTML(r.status==='omission'?'∅ — حذف':r.actual||'لم يُحدد بعد')}</strong></span>${r.status!=='omission'?`<button type="button" data-pick-actual="${probe.id}">اختيار الصوت / IPA</button>`:''}</div><fieldset><legend>طريقة الاستثارة</legend>${pillGroup(probe,'mode',MODES,r.mode||'naming')}</fieldset>${hasError?`<fieldset data-error-details><legend>القابلية للاستثارة بعد المحاولة</legend>${pillGroup(probe,'stimulability',STIM,r.stimulability||'')}</fieldset>`:''}<details class="reference-panel"><summary>الكلمة المستخدمة والنطق المرجعي السوري</summary><div class="compact-grid"><label>الكلمة المستخدمة<input data-trial="${probe.id}" data-prop="word" value="${escapeHTML(spokenWord(probe))}"></label><label>النطق المرجعي (IPA)<input data-trial="${probe.id}" data-prop="expected" dir="ltr" value="${escapeHTML(expectedWord(probe))}"></label></div><div class="reference-target"><span>الصوت المستهدف فعلياً: <strong dir="ltr">${escapeHTML(target||'غير محدد / غير موجود')}</strong></span><button type="button" data-pick-target="${probe.id}">تعديل الصوت المستهدف</button></div><p class="muted">${escapeHTML(probe.referenceNote)} تغيير الكلمة أو النطق يمسح النتيجة السابقة؛ اختر بعدها الصوت المستهدف من جديد.</p></details><div class="actions"><button type="button" data-note="${probe.id}" aria-controls="note-${probe.id}" aria-expanded="${expanded}" class="soft-button">${expanded?'إخفاء الملاحظة':'إضافة ملاحظة'}</button><button type="button" data-clear="${probe.id}" class="quiet-button">مسح التسجيل</button></div><div id="note-${probe.id}" class="note-panel" ${expanded?'':'hidden'}><label>ملاحظة / تفسير لهجي / التلميح المستخدم<textarea data-trial="${probe.id}" data-prop="note">${escapeHTML(r.note||'')}</textarea></label><details class="english-note"><summary>إضافة نسخة إنجليزية للملاحظة</summary><label lang="en" dir="ltr">English note<textarea data-trial="${probe.id}" data-prop="noteEn" dir="ltr">${escapeHTML(r.noteEn||'')}</textarea></label></details></div></div></section>`;
 wireImages($('trials'));$('previousPicture').onclick=()=>selectPicture(selectedProbe-1);$('nextPicture').onclick=()=>selectPicture(selectedProbe+1);updateCoverage();
}
function selectPicture(index){selectedProbe=Math.max(0,Math.min(allProbes.length-1,index));renderTrials();$('heading-'+allProbes[selectedProbe].id)?.focus();}
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
  const current=expectedTarget(probe);if(current!==value){
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
 if(input.dataset.trial&&['note','noteEn'].includes(input.dataset.prop))changeTrial(input);
});
document.addEventListener('focusout',event=>{if(event.target.dataset.date)updateDates();});
document.addEventListener('change',event=>{
 const input=event.target;
 if(input.dataset.trial&&!['note','noteEn'].includes(input.dataset.prop))changeTrial(input);
 if(input.dataset.list){const key=input.dataset.list;state[key]=state[key].filter(v=>v!==input.value);if(input.checked)state[key].push(input.value);save();}
});
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.page)showPage(button.dataset.page);
 if(button.dataset.sound!==undefined)selectSound(Number(button.dataset.sound));
 if(button.dataset.score)recordScore(button.dataset.trialId,button.dataset.score);
 if(button.dataset.setting){const r=snapshotReference(button.dataset.trialId);r[button.dataset.setting]=button.dataset.value;save();renderTrials();}
 if(button.dataset.pickActual)openSoundPicker(button.dataset.pickActual,'actual');
 if(button.dataset.pickTarget)openSoundPicker(button.dataset.pickTarget,'targetIPA');
 if(button.dataset.phoneme!==undefined)useSound(PHONEMES[Number(button.dataset.phoneme)].ipa);
 if(button.dataset.note){const id=button.dataset.note,panel=$('note-'+id);panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));button.textContent=panel.hidden?'إضافة ملاحظة':'إخفاء الملاحظة';if(panel.hidden)notePanels.delete(id);else{notePanels.add(id);panel.querySelector('textarea').focus();}}
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
$('remember').onchange=()=>{saving=$('remember').checked;if(saving)save();else{try{localStorage.removeItem(KEY);$('saveStatus').textContent='حُذفت المسودة المحفوظة. يبقى التسجيل الحالي مفتوحاً.';}catch{$('saveStatus').textContent='تعذر حذف المسودة؛ امسح بيانات الموقع في المتصفح.';}}};
$('newCase').onclick=()=>openDialog($('resetDialog'));$('cancelReset').onclick=()=>closeDialog($('resetDialog'));
$('confirmReset').onclick=()=>{try{localStorage.removeItem(KEY);}catch{$('message').textContent='تعذر حذف المسودة؛ امسح بيانات الموقع قبل تسجيل حالة جديدة.';closeDialog($('resetDialog'));return;}state=freshState();saving=false;selectedSound=0;selectedProbe=0;notePanels.clear();$('unansweredOnly').checked=false;$('includeUntested').checked=false;$('saveStatus').textContent='الحفظ معطل افتراضياً.';$('message').textContent='';renderMeta();renderTrials();closeDialog($('resetDialog'));showPage('details');};

$('reportButton').onclick=showReport;$('summaryReport').onclick=showReport;$('closeReport').onclick=()=>closeDialog($('reportDialog'));
$('includeUntested').onchange=refreshReport;
$('reportLanguage').onchange=refreshReport;
$('exportText').onclick=()=>{
 const filename=(state.meta.childName||'Arabic-articulation').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').slice(0,70)+'-'+reportLang()+'-screening.txt';
 downloadTextReport(reportText(),filename);
};
$('exportPdf').onclick=()=>{
 $('printArea').innerHTML=reportHTML();$('printArea').dir=reportLang()==='en'?'ltr':'rtl';$('printArea').lang=reportLang();
 closeDropdowns();closeDialog($('reportDialog'));
 const original=document.title;document.title=(state.meta.childName||'Arabic articulation')+' - Screening';
 const restore=()=>{document.title=original;window.removeEventListener('afterprint',restore);};window.addEventListener('afterprint',restore);window.print();
};
renderMeta();renderTrials();
