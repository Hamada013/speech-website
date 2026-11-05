import {icon} from './icons.mjs';
import {todayLocal,validDate,ageMonths,newSession,validSession,mchatSummary,blafSummary} from './model.mjs';
import {setupPwa} from './pwa.mjs';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function start() {
 const response=await fetch('./assets/data.json');if(!response.ok)throw Error('Content unavailable');
 const config=await response.json(),isM=config.kind==='mchat',key=`asd-${config.kind}-records-v1`,langKey=`asd-${config.kind}-language`;
 document.body.classList.toggle('blaf-app',!isM);
 document.body.classList.toggle('mchat-app',isM);document.body.classList.add('assessment-app');
 let lang='ar',db={version:1,active:null,sessions:[]},session=null,screen='home',unsaved=false,storageBroken=false;
 try{lang=localStorage.getItem(langKey)==='en'?'en':'ar';}catch{}
 const t=(ar,en)=>lang==='ar'?ar:en,local=v=>typeof v==='object'?v[lang]:v;
 function fail(message){$('#error-message').textContent=message;$('#error').hidden=false;}
 function clearError(){$('#error').hidden=true;}
 function load(){const raw=localStorage.getItem(key);if(raw===null)return {version:1,active:null,sessions:[]};const value=JSON.parse(raw);if(value.version!==1||!Array.isArray(value.sessions)||!value.sessions.every(s=>validSession(s,config))||new Set(value.sessions.map(s=>s.id)).size!==value.sessions.length)throw Error('Invalid saved records');return value;}
 try{db=load();session=db.sessions.find(s=>s.id===db.active)||null;}catch{storageBroken=true;fail(t('تعذر قراءة السجلات المحفوظة. لم تُحذف أو تُستبدل. أعد فتح التطبيق أو افحص تخزين المتصفح.','Saved records could not be read. They have not been deleted or replaced. Reopen the app or check browser storage.'));}
 function save(){
  if(storageBroken){fail(t('السجلات السابقة غير قابلة للقراءة. الحفظ متوقف لحمايتها.','Existing records are unreadable. Saving is blocked to protect them.'));return false;}
  if(!session)return true;
  try{const latest=load();session.updatedAt=new Date().toISOString();latest.sessions=latest.sessions.filter(s=>s.id!==session.id);latest.sessions.push(structuredClone(session));latest.active=session.id;localStorage.setItem(key,JSON.stringify(latest));db=latest;unsaved=false;clearError();$('#save-state').textContent=t('محفوظ على هذا الجهاز','Saved on this device');return true;}
  catch{unsaved=true;$('#save-state').textContent=t('تغييرات غير محفوظة','Unsaved changes');fail(t('تعذر الحفظ على الجهاز. أبقِ هذه الصفحة مفتوحة ثم أعد المحاولة. لن ننتقل قبل حفظ إجاباتك.','This device could not save. Keep this page open and retry. Your answers must save before continuing.'));return false;}
 }
 function setScreen(name){screen=name;document.body.dataset.screen=name;$$('.screen').forEach(el=>el.hidden=el.id!==`${name}-screen`);$('#contact-footer').hidden=name!=='home';$('#main').focus({preventScroll:true});window.scrollTo(0,0);requestAnimationFrame(name==='report'?paginateReport:fitQuestionOptions);}
 function $$(selector){return [...document.querySelectorAll(selector)];}
 const action=(id,label,handler,name)=>{const b=document.createElement('button');b.type='button';b.id=id;b.className='icon';b.setAttribute('aria-label',label);b.title=label;b.innerHTML=icon(name);b.onclick=handler;return b;};
 function instrument(){return isM?t('نسخة أصلية من ٢٣ بنداً — سجل مساعد','Original 23-item version — recording aid'):t('تكييف محلي من BLAF — ١٢ مجالاً','Local BLAF adaptation — 12 domains');}
 function sourceLinks(){return `<ul>${config.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul>`;}
 function header(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.title=`${local(config.name)} · ${config.shortName}`;$('#brand-title').textContent=config.shortName;$('#brand-subtitle').textContent=t('مع حمادة','with Hamada');$('#skip-link').textContent=t('انتقل إلى المحتوى','Skip to content');$('#header-controls').replaceChildren(action('language-button',t('Switch to English','التبديل إلى العربية'),()=>{if(unsaved&&!save())return;lang=lang==='ar'?'en':'ar';try{localStorage.setItem(langKey,lang);}catch{}render();},'language'),action('download-button',t('تنزيل وتثبيت التطبيق','Offline download and install'),()=>{pwa.open();},'download'),action('home-button',t('الرئيسية','Home'),home,'home'));$('#retry-save').textContent=t('إعادة محاولة الحفظ','Retry saving');$('#header-controls').setAttribute('aria-label',t('أدوات التطبيق','App controls'));$$('[data-close]').forEach(b=>b.setAttribute('aria-label',t('إغلاق','Close')));}
 function home(){if(session&&!save())return;setScreen('home');renderHome();}
 function renderHome(){
  $('#home-screen').innerHTML=`<div class="home"><img class="home-logo" src="assets/icons/logo.webp" alt="" width="130" height="130"><h1>${esc(local(config.name))}</h1><p class="subtitle">${esc(instrument())}</p><div class="activity-grid"><button class="activity-card" id="new-button">${icon('start')}<span>${t('تسجيل جديد','New record')}</span></button><button class="activity-card" id="resume-button" ${!session?'disabled':''}>${icon('resume')}<span>${t('متابعة السجل','Continue record')}</span></button><button class="activity-card" id="history-button">${icon('history')}<span>${t('السجلات والتقارير','Records and reports')}</span></button><button class="activity-card" id="information-button">${icon('info')}<span>${t('عن هذا النموذج','About this form')}</span></button></div><p class="subtitle section-gap">${t('تُحفظ البيانات على هذا الجهاز فقط.','Records are saved only on this device.')}</p></div>`;
  $('#new-button').onclick=()=>{if(unsaved&&!save())return;session=newSession(config.kind);if(!save())return;renderMeta();setScreen('meta');};
  $('#resume-button').onclick=()=>session.status==='draft'?(session.stage==='questions'?showQuestion():showMeta()):showReport();
  $('#history-button').onclick=openHistory;$('#information-button').onclick=openInfo;
 }
 function showMeta(){session.stage='details';if(!save())return;renderMeta();setScreen('meta');}
 function renderMeta(){
  let detailsStep=0;
  const m=session.meta;
  $('#meta-screen').innerHTML=`<div class="panel"><h1>${t('معلومات السجل','Record details')}</h1><p class="muted">${esc(instrument())}</p><form id="meta-form"><div class="meta-form"><label>${t('اسم الطفل','Child name')}<input id="child-name" name="child" required autocomplete="off" maxlength="150" value="${esc(m.child)}"></label><label>${t('اسم الفاحص','Clinician / observer')}<input name="clinician" autocomplete="off" maxlength="150" value="${esc(m.clinician)}"></label><label>${t('تاريخ الملاحظة','Observation date')}<input id="assessment-date" name="date" type="date" required max="${todayLocal()}" value="${esc(m.date)}"></label><label>${t('تاريخ الميلاد','Date of birth')}<input id="birth-date" name="dob" type="date" max="${esc(m.date)}" value="${esc(m.dob)}"></label>${isM?`<fieldset class="wide"><legend>${t('من يقدّم الإجابات؟','Who provides the answers?')}</legend><div class="segments" id="respondent-options">${[['parent',t('أحد الوالدين','Parent')],['other',t('شخص آخر','Another person')]].map(([value,label])=>`<button type="button" class="segment" data-respondent="${value}" aria-pressed="${m.respondent===value}">${label}</button>`).join('')}</div></fieldset><div class="wide notice">${t('هذا سجل للنسخة الأصلية ذات ٢٣ سؤالاً، وليس M-CHAT-R/F. الصياغة المحلية مختصرة؛ لتفسير حسابي مطابق للإرشادات استخدم النموذج الأصلي غير المعدّل مع ولي الأمر.','This records the original 23-item M-CHAT, not M-CHAT-R/F. Local wording is abbreviated; use the unmodified official original form with the parent for guideline-based interpretation.')} <a href="https://www.mchatscreen.com/m-chat/" target="_blank" rel="noopener">${t('النموذج الأصلي','Official original form')}</a></div><label class="wide check-line"><input name="official" type="checkbox" ${m.official?'checked':''}><span>${t('أنقل الإجابات من النموذج الأصلي الرسمي غير المعدّل (٢٣ بنداً).','I am transcribing answers from the unmodified official original form (23 items).')}</span></label>`:`<p class="wide notice">${t('اختر ما يصف الأداء المعتاد، لا أفضل محاولة فقط. إذا لم تلاحظ المهارة اتركها غير مقيّمة. هذا تكييف وصفي، وليس تشخيصاً أو مقارنة بعمر الطفل.','Choose the usual performance, not only the best attempt. Leave skills you have not observed unrated. This is a descriptive adaptation, not a diagnosis or an age comparison.')}</p>`}<label class="wide">${t('ملاحظات عامة','General observations')}<textarea name="notes" maxlength="10000">${esc(m.notes)}</textarea></label></div><div class="actions"><button class="secondary" type="button" id="meta-home">${icon('home')}${t('الرئيسية','Home')}</button><button type="submit" class="primary" id="begin-button">${t('متابعة','Continue')}${icon('next')}</button></div></form></div>`;
  prepareMetaNotes();if(isM)prepareMchatDetails();
  $('#meta-form').addEventListener('invalid',e=>{if(isM&&e.target.closest('.meta-step')?.hidden)showDetailsStep(0);},true);
  $('#meta-form').addEventListener('input',event=>{const el=event.target;if(!el.name)return;session.meta[el.name]=el.type==='checkbox'?el.checked:el.value;if(el.name==='date')$('#birth-date').max=el.value;save();});
  $$('[data-respondent]').forEach(b=>b.onclick=()=>{session.meta.respondent=b.dataset.respondent;save();$$('[data-respondent]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));});
  $('#meta-form').onsubmit=e=>{e.preventDefault();if(isM&&detailsStep===0){showDetailsStep(1);return;}if(!validDate(m.date)||m.date>todayLocal()||m.dob&&(!validDate(m.dob)||m.dob>m.date)){fail(t('تحقق من تاريخ الميلاد وتاريخ الملاحظة؛ لا يمكن أن يكونا في المستقبل.','Check the birth and observation dates; they cannot be in the future.'));return;}if(!m.child.trim()){ $('#child-name').focus();return;}session.stage='questions';if(!save())return;showQuestion();};$('#meta-home').onclick=home;
  function showDetailsStep(index){detailsStep=index;$$('.meta-step').forEach((el,i)=>el.hidden=i!==index);$('#meta-previous').disabled=index===0;$('#meta-next').disabled=index===1;$('#meta-page-status').textContent=`${index+1} / 2`;$('#begin-button').firstChild.textContent=t(index===0?'متابعة':'بدء الملاحظة',index===0?'Continue':'Begin observation');}
  function prepareMchatDetails(){
   const grid=$('#meta-form .meta-form'),fields=[...grid.children],identity=document.createElement('div'),eligibility=document.createElement('div');identity.className=eligibility.className='meta-step';identity.append(...fields.slice(0,4));eligibility.append(...fields.slice(4));grid.append(identity,eligibility);
   const nav=document.createElement('nav');nav.className='meta-pagination';nav.setAttribute('aria-label',t('صفحات معلومات السجل','Record detail pages'));
   const status=document.createElement('span');status.id='meta-page-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
   nav.append(action('meta-previous',t('السابق','Previous'),()=>showDetailsStep(0),'back'),status,action('meta-next',t('التالي','Next'),()=>showDetailsStep(1),'next'));grid.after(nav);showDetailsStep(0);
  }

 }
 function prepareMetaNotes(){
  $('#meta-notes-dialog')?.remove();
  const label=$('#meta-form textarea[name="notes"]').closest('label'),dialog=document.createElement('dialog');dialog.id='meta-notes-dialog';dialog.setAttribute('aria-labelledby','meta-notes-title');
  dialog.innerHTML=`<div class="dialog-heading"><h2 id="meta-notes-title">${t('ملاحظات عامة','General observations')}</h2></div>`;
  const close=action('close-meta-notes',t('إغلاق','Close'),()=>dialog.close(),'close');dialog.firstChild.append(close);dialog.append(label);document.body.append(dialog);
  dialog.querySelector('textarea').oninput=e=>{session.meta.notes=e.target.value;save();};
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  const button=action('meta-notes-button',t('ملاحظات عامة','General observations'),()=>dialog.showModal(),'edit');$('#meta-form .actions').insertBefore(button,$('#begin-button'));
 }
 function summary(){return isM?mchatSummary(session):blafSummary(session,config.items);}
 function showQuestion(){renderQuestion();setScreen('question');}
 function renderQuestion(){
  const item=config.items[session.index],value=session.answers[item.id],s=summary(),options=isM?[{value:'yes',label:t('نعم','Yes'),symbol:'check'},{value:'no',label:t('لا','No'),symbol:'cross'}]:item.options.map(o=>({value:o.score,label:local(o.text),symbol:String(o.score)}));
  $('#question-screen').innerHTML=`<div class="progress-line"><p>${t('مقيّم','Recorded')} <bdi>${s.answered} / ${config.items.length}</bdi></p><progress aria-label="${t('البنود المقيّمة','Items recorded')}" max="${config.items.length}" value="${s.answered}"></progress><button class="icon" id="question-report" aria-label="${t('عرض التقرير','View report')}" title="${t('عرض التقرير','View report')}">${icon('report')}</button></div><div class="panel" data-item="${esc(item.id)}"><div class="question-head"><span class="muted">${!isM?esc(local(item.label)):t('السؤال','Question')}</span><span class="question-index">${session.index+1} / ${config.items.length}</span></div><h1 id="question-title">${esc(local(item.question))}</h1><div class="options" role="group" aria-labelledby="question-title">${options.map(o=>`<button class="option" data-answer="${o.value}" aria-pressed="${value===o.value}"><strong>${isM?icon(o.symbol):o.symbol}</strong><span>${esc(o.label)}</span><span class="check" aria-hidden="true">${value===o.value?icon('check'):''}</span></button>`).join('')}<button class="option option-muted" data-answer="unrated" aria-pressed="${value===null}"><strong>${icon('minus')}</strong><span>${t(isM?'لم تُجب بعد':'لم تُلاحظ / غير مقيّمة',isM?'Unanswered':'Not observed / not rated')}</span><span class="check">${value===null?icon('check'):''}</span></button></div><label>${t('مثال أو ملاحظة (اختياري)','Example or observation (optional)')}<textarea id="item-note" maxlength="5000">${esc(session.observations[item.id]||'')}</textarea></label><div class="actions"><button class="icon" id="previous-button" aria-label="${t('السابق','Previous')}" title="${t('السابق','Previous')}">${icon('back')}</button><button class="text-link" id="edit-details">${t('معلومات السجل','Record details')}</button><button class="primary" id="next-button">${t(session.index===config.items.length-1?'التقرير':'التالي',session.index===config.items.length-1?'Report':'Next')}${icon(session.index===config.items.length-1?'report':'next')}</button></div></div>`;
  $$('[data-answer]').forEach(b=>b.onclick=()=>{session.answers[item.id]=b.dataset.answer==='unrated'?null:isM?b.dataset.answer:Number(b.dataset.answer);save();renderQuestion();$(`[data-answer="${b.dataset.answer}"]`).focus({preventScroll:true});});
  $('#item-note').oninput=e=>{session.observations[item.id]=e.target.value;save();};
  $('#next-button').onclick=()=>{if(!save())return;if(session.index===config.items.length-1)showReport();else{session.index++;if(save())showQuestion();}};
  $('#previous-button').onclick=()=>{if(!save())return;if(session.index===0)showMeta();else{session.index--;if(save())showQuestion();}};
  prepareQuestionPages();
  $('#edit-details').onclick=()=>{if(save())showMeta();};$('#question-report').onclick=showReport;
 }
 function prepareQuestionPages(){
  const options=$('#question-screen .options');
  const nav=document.createElement('nav');nav.className='option-pagination';nav.setAttribute('aria-label',t('خيارات التقييم','Rating options'));
  const previous=action('options-previous',t('الخيارات السابقة','Previous options'),()=>selectOptions(-1),'back'),next=action('options-next',t('المزيد من الخيارات','More options'),()=>selectOptions(1),'next');
  const status=document.createElement('span');status.id='options-page-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');nav.append(previous,status,next);options.after(nav);
  requestAnimationFrame(fitQuestionOptions);
 }
 function selectOptions(delta){
  const pages=$$('.option-page');if(!pages.length)return;
  const current=Math.max(0,pages.findIndex(p=>p.classList.contains('is-current'))),index=Math.max(0,Math.min(pages.length-1,current+delta));
  pages.forEach((p,i)=>{p.classList.toggle('is-current',i===index);p.inert=i!==index;});
  $('#options-previous').disabled=index===0;$('#options-next').disabled=index===pages.length-1;
  $('#options-page-status').textContent=`${index+1} / ${pages.length}`;
 }
 function fitQuestionOptions(){
  if(screen!=='question')return;
  const options=$('#question-screen .options');if(!options?.clientHeight)return;
  const nav=$('.option-pagination');nav.hidden=false;
  const buttons=[...options.querySelectorAll('[data-answer]')],selected=buttons.find(b=>b.getAttribute('aria-pressed')==='true'&&b.dataset.answer!=='unrated');
  options.replaceChildren();let page;
  function addPage(){page=document.createElement('div');page.className='option-page is-current';options.append(page);}
  addPage();
  for(const button of buttons){page.append(button);if(page.scrollHeight>options.clientHeight+1&&page.children.length>1){addPage();page.append(button);}}
  const pages=[...options.children],index=selected?pages.indexOf(selected.parentElement):0;
  selectOptions(index);nav.hidden=pages.length===1;
 }
 function showReport(){if(!save())return;session.status=summary().complete?'complete':'partial';if(!save())return;renderReport();setScreen('report');}
 function blafMeaning(s){return s.answered?t('هذه خريطة للملاحظات الحالية عبر مجالات التواصل. راجع الأوصاف والأمثلة قبل اختيار أهداف التدريب.','This is a map of current observations across communication skills. Review the descriptions and examples before choosing practice goals.'):t('لم تُسجّل درجات بعد. أضف ملاحظات لتكوين خريطة المهارات.','No ratings have been recorded yet. Add observations to build the skill profile.');}
 function mchatMeaning(s){
  if(!s.complete)return {title:t('السجل غير مكتمل','Record incomplete'),text:t('أكمل الإجابات على البنود الـ٢٣ قبل تفسير النتيجة. البنود غير المجابة لا تُحسب كإجابات مطمئنة.','Complete all 23 responses before interpretation. Unanswered items are not counted as reassuring answers.')};
  if(!s.eligible)return {title:t('وصف للإجابات فقط','Descriptive record only'),text:t('لا تُعرض فئة تحرٍّ: يلزم عمر ١٦–٣٠ شهراً وقت الملاحظة، وإجابات أحد الوالدين من النموذج الأصلي الرسمي. راجع معلومات السجل.','No screening band is assigned: the child must be 16–30 months at observation, with parent responses transcribed from the official original form. Check record details.')};
  if(s.band==='high')return {title:t('مخاطر تحرٍّ مرتفعة — تقييم متخصص','High screening risk — specialist evaluation'),text:t('بلغت الاستجابات المثيرة للقلق ٨ أو أكثر. وفق إرشادات النسخة الأصلية يمكن الإحالة مباشرة لتقييم النمو والتدخل المبكر. هذه نتيجة تحرٍّ وليست تشخيصاً.','Eight or more responses raise concern. Original-version guidance allows direct referral for developmental evaluation and early intervention. This is a screening result, not a diagnosis.')};
  if(s.band==='followup')return {title:t('مخاطر تحرٍّ متوسطة — مقابلة متابعة','Moderate screening risk — Follow-Up needed'),text:t('هناك ٣–٧ استجابات تستدعي الاستيضاح. يُجري المختص مقابلة متابعة النسخة الأصلية قبل التفسير النهائي. لا يتضمن هذا التطبيق المقابلة ولا يحسب نتيجتها.','Three to seven responses need clarification. A clinician should conduct the original M-CHAT Follow-Up before final interpretation. This app does not administer or score that interview.')};
  return {title:t('مخاطر تحرٍّ منخفضة — متابعة النمو','Low screening risk — developmental monitoring'),text:t('هناك ٠–٢ استجابة تستدعي الانتباه. استمر في متابعة النمو؛ ناقش أي قلق مع المختص مهما كانت الدرجة. إذا كان الطفل أصغر من ٢٤ شهراً، فخطّط لإعادة التحري وفق إرشادات المصدر.','Zero to two responses raise concern. Continue developmental monitoring and discuss any concerns regardless of the score. If younger than 24 months, plan rescreening according to the source guidance.')};
 }
 function bar(label,value,max,cls=''){return `<div class="bar-row"><span class="bar-label">${esc(label)}</span><span class="bar-track" aria-hidden="true"><span class="bar-fill ${cls}" style="width:${value===null?0:value/max*100}%"></span></span><span class="bar-value">${value===null?'—':value}${!isM&&value!==null?' / 5':''}</span></div>`;}
 function renderReport(){
  const s=summary(),m=session.meta,meaning=isM?mchatMeaning(s):null,age=ageMonths(m.dob,m.date),rows=isM?[[t('استجابات تستدعي الاستيضاح','Responses needing clarification'),s.score,'concern'],[t('استجابات أخرى','Other responses'),s.other,''],[t('لم تُجب','Unanswered'),s.missing,'missing']]:config.items.map(item=>[local(item.label),session.answers[item.id]??null,'']);
  const chart=rows.map(([label,value,cls])=>bar(label,value,isM?23:5,cls)).join('');
  $('#report-screen').innerHTML=`<div class="panel report"><div class="report-top"><div><h1>${t('تقرير الملاحظة','Observation report')}</h1><p class="muted">${esc(instrument())}</p></div><img src="assets/icons/logo.webp" width="64" height="64" alt=""></div><div class="actions no-print"><div class="report-actions"><button class="icon" id="print-button" aria-label="${t('طباعة أو حفظ PDF','Print or save PDF')}" title="${t('طباعة أو حفظ PDF','Print or save PDF')}">${icon('print')}</button><button class="icon" id="text-button" aria-label="${t('تنزيل التقرير النصي','Download text report')}" title="${t('تنزيل التقرير النصي','Download text report')}">${icon('download')}</button><button class="icon" id="edit-button" aria-label="${t('تعديل السجل','Edit record')}" title="${t('تعديل السجل','Edit record')}">${icon('edit')}</button></div><span class="muted">${t(s.complete?'مكتمل':'جزئي',s.complete?'Complete':'Partial')}</span></div><dl class="metadata"><div><dt>${t('الطفل','Child')}</dt><dd>${esc(m.child)||'—'}</dd></div><div><dt>${t('الفاحص','Observer')}</dt><dd>${esc(m.clinician)||'—'}</dd></div><div><dt>${t('تاريخ الملاحظة','Observation date')}</dt><dd><bdi>${esc(m.date)}</bdi></dd></div><div><dt>${t('العمر عند الملاحظة','Age at observation')}</dt><dd>${age===null?'—':`${age} ${t('شهراً','months')}`}</dd></div>${isM?`<div><dt>${t('مصدر الإجابات','Respondent')}</dt><dd>${m.respondent==='parent'?t('أحد الوالدين','Parent'):m.respondent==='other'?t('شخص آخر','Another person'):t('غير محدد','Not specified')}</dd></div><div><dt>${t('مصدر البنود','Form used')}</dt><dd>${m.official?t('النموذج الأصلي الرسمي — بإقرار الفاحص','Official original — observer confirmed'):t('الصياغة المحلية المكيّفة','Local adapted wording')}</dd></div>`:''}</dl><h2>${isM?esc(meaning.title):t('ما الذي تصفه الملاحظات؟','What do the observations show?')}</h2><p id="report-meaning">${isM?esc(meaning.text):blafMeaning(s)}</p><div class="metrics"><div class="metric"><strong>${s.answered} / ${config.items.length}</strong><span>${t('بنود مقيّمة','Items recorded')}</span></div><div class="metric"><strong>${s.missing}</strong><span>${t('غير مقيّمة','Unrated')}</span></div><div class="metric"><strong>${isM?s.score:'1–5'}</strong><span>${isM?t('استجابات تستدعي الاستيضاح','Responses needing clarification'):t('مقياس وصفي لكل مجال','Descriptive scale per domain')}</span></div></div><h2>${t('عرض الدرجات','Scores at a glance')}</h2><p class="chart-caption">${isM?t('عدد الاستجابات من أصل ٢٣، وليس نسبة احتمال التوحد.','Item counts out of 23, not the probability of autism.'):t('كل شريط يمثل وصفاً من ١ إلى ٥، وليس نسبة إتقان. الشرطة تعني أن المجال غير مقيّم.','Each bar shows a 1–5 description, not mastery percentage. A dash means the domain is unrated.')}</p><div class="chart" aria-label="${t('مخطط أعمدة الدرجات','Score bar graph')}">${chart}</div><div class="axis" aria-hidden="true">${(isM?[0,23]:[0,1,2,3,4,5]).map(n=>`<span>${n}</span>`).join('')}</div>${!isM&&s.answered?practiceSummary(s):''}<div class="notice">${isM?t('أداة مساعدة للتسجيل، لا تشخّص التوحد ولا تستبعده. أي قلق بشأن النمو يستحق مناقشة المختص.','A recording aid cannot diagnose or rule out autism. Discuss developmental concerns with a qualified clinician.'):t('هذه ملاحظات وصفية لاختيارات الفاحص؛ لا تمنح عمراً لغوياً، أو تشخيصاً، أو مقارنة معيارية بأطفال آخرين.','These are descriptive observer ratings. They do not provide a language age, diagnosis or standardized comparison with other children.')}</div>${m.notes?`<h2>${t('ملاحظات الفاحص','Observer notes')}</h2><p class="report-note observation">${esc(m.notes)}</p>`:''}${isM?riskGuidance(s):''}${config.items.map(item=>session.observations[item.id]?`<div class="report-detail"><h3>${esc(local(isM?item.question:item.label))}</h3><p class="observation">${esc(session.observations[item.id])}</p></div>`:'').join('')}${!isM?`<div class="sources no-print"><p>${esc(config.copyright)}</p><p>${t('صياغة التطبيق تكييف محلي وليست نموذجاً معتمداً.','App wording is a local adaptation, not an approved instrument.')}</p>${sourceLinks()}<p>${t('نسخة بيانات التطبيق','App data revision')}: <bdi>${esc(config.revision)}</bdi> · <bdi>${esc(session.id)}</bdi></p></div>`:''}</div>`;
  prepareReportPages();
  $('#print-button').onclick=()=>window.print();$('#text-button').onclick=downloadReport;$('#edit-button').onclick=()=>{session.status='draft';if(save())showMeta();};
 }
 // Keep report pages as real DOM content so printing includes the entire record.
 function prepareReportPages(){
  const report=$('#report-screen .report'),children=[...report.children].slice(2),pages=document.createElement('div');
  pages.className='report-pages';
  for(const child of children){
   if(child.classList.contains('chart')||child.classList.contains('metadata')){
    const rows=[...child.children];
    for(let i=0;i<rows.length;i+=2){const chart=child.cloneNode(false);chart.append(...rows.slice(i,i+2));pages.append(chart);}child.remove();

   }else pages.append(child);
  }
  report.append(pages);
  const nav=document.createElement('nav');nav.className='report-pagination no-print';nav.setAttribute('aria-label',t('صفحات التقرير','Report pages'));
  const previous=action('report-previous',t('الصفحة السابقة','Previous page'),()=>selectReportPage(-1),'back'),next=action('report-next',t('الصفحة التالية','Next page'),()=>selectReportPage(1),'next');
  const status=document.createElement('span');status.id='report-page-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  nav.append(previous,status,next);report.append(nav);
  requestAnimationFrame(paginateReport);
 }
 function selectReportPage(delta){
  const pages=$$('.report-page'),current=Math.max(0,pages.findIndex(p=>p.classList.contains('is-current'))),index=Math.max(0,Math.min(pages.length-1,current+delta));
  pages.forEach((p,i)=>{p.classList.toggle('is-current',i===index);p.inert=i!==index;});
  $('#report-previous').disabled=index===0;$('#report-next').disabled=index===pages.length-1;
  $('#report-page-status').textContent=`${index+1} / ${pages.length}`;
 }
 function paginateReport(){
  if(screen!=='report'||matchMedia('print').matches)return;
  const container=$('.report-pages');if(!container||!container.clientHeight)return;
  const blocks=[...container.querySelectorAll(':scope > .report-page > *, :scope > :not(.report-page)')];
  container.replaceChildren();
  let page;
  function addPage(){page=document.createElement('div');page.className='report-page is-current';container.append(page);}
  addPage();
  for(const block of blocks){
   page.append(block);
   if(page.scrollHeight>container.clientHeight+1&&page.children.length>1){addPage();page.append(block);}
  }
  selectReportPage(0);
 }
 window.addEventListener('resize',()=>{requestAnimationFrame(screen==='report'?paginateReport:fitQuestionOptions);});
 window.addEventListener('beforeprint',()=>{$$('.report-page').forEach(p=>p.inert=false);});
 window.addEventListener('afterprint',()=>{if(screen==='report')selectReportPage(0);});
 function riskGuidance(s){
  const bands=[['low','0–2',t('منخفضة','Low'),t('متابعة النمو؛ إعادة التحري عند ٢٤ شهراً إذا كان الطفل أصغر.','Monitor development; rescreen at 24 months if younger.')],['followup','3–7',t('متوسطة','Moderate'),t('مقابلة M-CHAT/F مع المختص قبل التفسير النهائي.','Clinician M-CHAT/F interview before final interpretation.')],['high','8–23',t('مرتفعة','High'),t('إحالة مباشرة لتقييم النمو وتحديد أهلية التدخل المبكر.','Direct referral for developmental evaluation and early-intervention eligibility.')]];
  return `<div class="risk-heading"><h2>${t('مستوى مخاطر التحري والخطوة التالية','Screening risk and next steps')}</h2><p class="muted">${t('منخفضة / متوسطة / مرتفعة: مستوى للتحري، وليس شدة التوحد.','Low / moderate / high describes screening risk, not autism severity.')}</p>${!s.eligible?`<p>${t('لم يُحدّد مستوى لهذا السجل؛ أكمل الإجابات وتحقق من شروط التفسير.','No level is assigned to this record; complete responses and check interpretation requirements.')}</p>`:''}</div>${bands.map(([band,range,label,step])=>`<div class="risk-band risk-${band} ${s.band===band?'risk-current':''}" ${s.band===band?'aria-current="true"':''}><h3>${label} <bdi>${range}</bdi>${s.band===band?` — ${t('نتيجة هذا السجل','This record')}`:''}</h3><p>${step}</p></div>`).join('')}${referralRecommendation(s)}`;
 }
 function referralRecommendation(s){
  let decision='review',text;
  if(!s.complete)text=t('لا يمكن تحديد الحاجة إلى إحالة تشخيصية قبل إكمال الإجابات. ناقش أي قلق بشأن النمو مع المختص دون انتظار اكتمال السجل.','The need for diagnostic referral cannot be determined until responses are complete. Discuss developmental concerns with a clinician without waiting for this record.');
  else if(!s.eligible)text=t('لا يمكن تحديد الإحالة من هذا السجل؛ راجع العمر ومصدر الإجابات والنموذج المستخدم مع المختص.','Referral cannot be determined from this record; review the child’s age, respondent and form used with a clinician.');
  else if(s.band==='high'){decision='recommended';text=t('نعم، يُنصح بإحالة مباشرة لتقييم تشخيصي للنمو واحتمال اضطراب طيف التوحد، وتقييم أهلية التدخل المبكر. هذه إحالة للتقييم وليست تشخيصاً.','Yes — direct referral is recommended for developmental and autism diagnostic evaluation, and early-intervention eligibility assessment. This recommends evaluation; it is not a diagnosis.');}
  else if(s.band==='followup'){decision='followup';text=t('قد تحتاج الحالة إلى إحالة تشخيصية. تُوصى أولاً مقابلة M-CHAT/F مع المختص لتحديد الحاجة إلى الإحالة؛ لم تُسجّل نتيجة المقابلة في هذا التطبيق.','Diagnostic referral may be needed. A clinician M-CHAT/F interview is recommended first to decide on referral; no Follow-Up result is recorded in this app.');}
  else{decision='monitor';text=t('لا تستلزم الدرجة وحدها إحالة روتينية للتشخيص حالياً. استمر في متابعة النمو وناقش أي قلق مع المختص، حتى مع انخفاض الدرجة.','This score alone does not call for routine diagnostic referral at present. Continue developmental monitoring and discuss concerns with a clinician even with a low score.');}
  return `<div class="risk-referral" data-referral="${decision}"><h2>${t('هل تحتاج الحالة إلى إحالة للتشخيص؟','Does this case need diagnostic referral?')}</h2><p>${text}</p></div>`;
 }
 function practiceSummary(s){
  const ranked=[...s.values].sort((a,b)=>a.score-b.score),lower=ranked.filter(x=>x.score<5).slice(0,2),higher=ranked.filter(x=>x.score>=4).slice(-2),name=id=>local(config.items.find(i=>i.id===id).label);
  return `<div class="section-gap"><h2>${t('نقاط للمناقشة والتدريب','Discussion and practice starting points')}</h2>${higher.length?`<p>${t('المجالات الأعلى تقييماً حالياً','Currently higher-rated domains')}: ${higher.map(x=>`${esc(name(x.id))} (${x.score}/5)`).join('، ')}.</p>`:''}${lower.length?`<p>${t('ابدأ بمراجعة أمثلة الأداء في','Start by reviewing examples in')}: ${lower.map(x=>`${esc(name(x.id))} (${x.score}/5)`).join('، ')}. ${t('اختر هدفاً وظيفياً صغيراً يناسب حياة الطفل.','Choose a small functional goal that fits the child’s daily life.')}</p>`:''}</div>`;
 }
 function downloadReport(){const content=[$('.report-top').innerText,...$$('.report-page > *, .report-pages > :not(.report-page)').map(el=>el.textContent)].join('\n\n'),blob=new Blob(['\uFEFF'+content],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${config.shortName}-${session.meta.date}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function openInfo(){
  $('#info-title').textContent=t('عن النموذج واستخدامه','About this form and its use');$('#info-content').innerHTML=`<p>${esc(instrument())}</p><p class="notice">${isM?t('النسخة الموجودة في المشروع تتبع بنود M-CHAT الأصلية الـ٢٣، لا النسخة المنقحة ذات ٢٠ بنداً. تُحسب الدرجات هنا حسب إرشادات المجموع المنشورة للنسخة الأصلية؛ لا تُستخدم البنود الستة وحدها لتغيير فئة النتيجة.','The project contains 23 original-version M-CHAT items, not the revised 20-item version. This app follows the published total-score guidance for the original version; the six historical critical items do not independently change the result band.'):t('BLAF نموذج لتحديد نقطة بدء في ملاحظة مهارات اللغة والتعلم. هذه صياغة محلية مكيّفة؛ الدرجات ترتيب وصفي ١–٥ لكل مجال، ولا تعني أن الطفل أتقن نسبة من اللغة.','BLAF helps identify starting points when observing language and learning. This is a local adaptation; 1–5 ratings are descriptive ordered categories, not a percentage of language mastered.')}</p><p>${isM?t('تفسير التحري يتطلب إجابات ولي الأمر، عمر ١٦–٣٠ شهراً، واستخدام النموذج الرسمي غير المعدّل. المتابعة جزء منفصل يجريه المختص؛ النموذج الرسمي M-CHAT-R/F هو الإصدار الأحدث.','Screening interpretation requires parent responses, age 16–30 months, and the unmodified official form. Follow-Up is a separate clinician interview; M-CHAT-R/F is the newer instrument.'):t('اختر الأداء المعتاد مع أمثلة واضحة، واترك ما لم يُلاحظ غير مقيّم. لا توجد معايير عمرية أو تشخيص في هذا التطبيق.','Rate typical performance with clear examples; leave unobserved skills unrated. This app has no age norms or diagnostic output.')}</p><p class="section-gap">${t('البيانات محلية على هذا المتصفح. مسح بيانات الموقع يزيل السجلات؛ احفظ تقريراً مطبوعاً عند الحاجة.','Data stays in this browser. Clearing site data removes records; save a printed report when needed.')}</p><div class="sources"><p>${esc(config.copyright)}</p>${sourceLinks()}${isM?`<p>${t('توزيع نسخة إلكترونية من M-CHAT يخضع لترخيص المؤلفين. لا يمثل هذا التطبيق اعتماداً أو إذناً للنشر.','Electronic distribution of M-CHAT is subject to the authors’ licensing terms. This app does not establish endorsement or publication permission.')}</p>`:''}</div>`;$('#info-dialog').showModal();
 }
 function openHistory(){
  if(unsaved&&!save())return;
  const list=$('#history-list');list.replaceChildren();let records=[];try{records=load().sessions.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));}catch{fail(t('تعذر قراءة السجلات.','Could not read records.'));return;}
  $('#history-title').textContent=t('السجلات والتقارير','Records and reports');
  if(!records.length)list.textContent=t('لا توجد سجلات محفوظة بعد.','No saved records yet.');
  for(const record of records){const b=document.createElement('button');b.className='history-row';b.innerHTML=`<strong>${esc(record.meta.child)||t('سجل جديد','New record')}</strong><span><bdi>${esc(record.meta.date)}</bdi> · ${record.status==='draft'?t('مسودة','Draft'):record.status==='complete'?t('مكتمل','Complete'):t('جزئي','Partial')}</span>`;b.onclick=()=>{session=structuredClone(record);if(!save())return;$('#history-dialog').close();session.status==='draft'?(session.stage==='questions'?showQuestion():showMeta()):showReport();};list.append(b);}$('#history-dialog').showModal();
 }
 function render(){header();if(screen==='home')renderHome();else if(screen==='meta')renderMeta();else if(screen==='question')renderQuestion();else renderReport();}
 $('#brand-home').onclick=e=>{e.preventDefault();home();};$('#retry-save').onclick=()=>{if(storageBroken){try{db=load();storageBroken=false;clearError();}catch{fail(t('ما زالت السجلات غير قابلة للقراءة؛ لم يتم تغييرها.','Records are still unreadable and have not been changed.'));}}else save();};
 $$('[data-close]').forEach(b=>{b.setAttribute('aria-label',t('إغلاق','Close'));b.innerHTML=icon('close');b.onclick=()=>b.closest('dialog').close();});
 $$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
 window.addEventListener('beforeunload',e=>{if(unsaved){e.preventDefault();e.returnValue='';}});
 const pwa=setupPwa({t,canUpdate:()=>!unsaved,fail});
 $('#loading').hidden=true;render();setScreen('home');
}
