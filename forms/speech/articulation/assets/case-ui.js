'use strict';
let reportSourceId=null,comparisonSelection=null,compareChoices=[],pendingDeleteChild=null;
function refreshHome(){
 const child=activeChild();$('homeHello').textContent=child?'مرحباً '+child.name:'مرحباً';$('childHome').hidden=!child;
 $('activeChildName').textContent=child?.name||'';
 $('homeProgress').textContent=child?`${aggregate().recorded} / ${allProbes.length} · ${caseDate(activeAssessment())}`:'';
 $('reportButton').disabled=!child;
}
function openAccounts(){if(cases.activeChild&&!saveCase())$('caseError').textContent='تعذر حفظ الفحص الحالي. صدّر التقرير قبل تبديل الحالة.';else $('caseError').textContent='';$('caseSearch').value='';renderAccounts();openDialog($('accountsDialog'));}
function renderAccounts(){
 const search=$('caseSearch').value.trim();
 $('caseList').innerHTML=cases.children.filter(child=>child.name.includes(search)).map(child=>`<article class="child-account ${child.id===cases.activeChild?'active':''}"><button class="child-select" data-child="${child.id}" aria-label="فتح حالة ${escapeHTML(child.name)}"><span class="child-avatar avatar-${child.avatar}">${appIcon(child.avatar)}</span><span>${escapeHTML(child.name)}</span><small>${child.assessments.length} فحص</small></button>${iconButton('trash','حذف حالة '+child.name,`data-delete-child="${child.id}"`,'delete-child')}</article>`).join('')||'<p class="empty-state">لا توجد حالات مطابقة. أضف اسم الطفل لبدء فحصه.</p>';
}
function renderHistory(){
 const child=activeChild();if(!child)return;
 const list=child.assessments.slice().sort((a,b)=>caseDate(b).localeCompare(caseDate(a))||b.createdAt.localeCompare(a.createdAt));
 $('reportHistory').innerHTML=list.map(item=>`<button type="button" class="history-date ${!comparisonSelection&&(reportSourceId||cases.activeAssessment)===item.id?'selected':''}" data-report-assessment="${item.id}" aria-pressed="${!comparisonSelection&&(reportSourceId||cases.activeAssessment)===item.id}">${appIcon('calendar')}<span dir="auto">${escapeHTML(caseDateLabel(item))}</span><small>${Object.values(item.state.trials).filter(t=>RESULTS[t.status]).length}/84</small></button>`).join('');
 $('compareButton').disabled=list.length<2;
}
function withAssessment(record,fn){const current=state;try{state=record?.state||state;return fn();}finally{state=current;}}
function reportRecord(){return activeChild()?.assessments.find(item=>item.id===(reportSourceId||cases.activeAssessment));}
function visibleReportHTML(){return comparisonSelection?comparisonReportHTML():withAssessment(reportRecord(),()=>assessmentReportHTML());}
function assessmentStats(record,probes=allProbes){return withAssessment(record,()=>aggregate(probes));}
function simpleBars(rows,legend=''){
 return `<section class="report-chart">${legend}<div class="chart-rows">${rows.map(row=>`<div class="chart-row"><span>${escapeHTML(row.label)}</span><div class="chart-series">${row.values.map(value=>`<div class="chart-value">${value.label?`<small class="bar-series-label">${escapeHTML(value.label)}</small>`:''}<div class="bar-track"><i class="bar ${value.color||'current'}" style="width:${Math.max(0,Math.min(100,value.percent||0))}%"></i></div><b>${escapeHTML(value.text)}</b></div>`).join('')}</div></div>`).join('')}</div></section>`;
}
function resultCharts(){
 const stats=aggregate();
 const rows=[...Object.keys(RESULTS),'unrecorded'].map(key=>{const count=key==='unrecorded'?stats.unrecorded:stats.counts[key]||0;return {label:key==='unrecorded'?rt('غير مسجل','Not recorded'):resultLabel(key),values:[{percent:100*count/stats.total,text:`${count} / ${stats.total}`,color:key==='correct'?'new':ERRORS.includes(key)?'error':'neutral'}]};});
 const positions=['أول الكلمة','وسط الكلمة','آخر الكلمة'].map(position=>{const a=aggregate(allProbes.filter(p=>p.position===position));return {label:rt(position,{'أول الكلمة':'Initial','وسط الكلمة':'Medial','آخر الكلمة':'Final'}[position]),values:[{percent:a.accuracy,text:a.scored?`${a.accuracy}% (${a.correct}/${a.scored})`:'—'}]};});
 return `<h3>${rt('توزيع نتائج البنود','Item outcomes')}</h3>${simpleBars(rows)}<h3>${rt('الدقة حسب موضع الصوت','Accuracy by word position')}</h3>${simpleBars(positions)}<p class="chart-note">${rt('الشرطة تعني عدم وجود بنود قابلة للتصحيح. تُستبعد الأحكام اللهجية والبنود غير المستثارة والمتجاوزة وغير المسجلة من الدقة.','A dash means there are no scored items. Dialect-appropriate, unelicited, skipped and unrecorded items are excluded from accuracy.')}</p>`;
}
function openComparison(){
 if(!activeChild()||!saveCase())return;
 compareChoices=[];$('compareError').textContent='';renderCompareChoices();openDialog($('compareDialog'));
}
function renderCompareChoices(){
 $('compareChoices').innerHTML=activeChild().assessments.slice().sort((a,b)=>caseDate(a).localeCompare(caseDate(b))||a.createdAt.localeCompare(b.createdAt)).map(item=>`<button class="compare-choice ${compareChoices.includes(item.id)?'selected':''}" data-compare-choice="${item.id}" aria-pressed="${compareChoices.includes(item.id)}">${appIcon(compareChoices.includes(item.id)?'check':'calendar')}<span>${escapeHTML(caseDateLabel(item))}</span><small>${Object.values(item.state.trials).filter(t=>RESULTS[t.status]).length}/84</small></button>`).join('');
 $('confirmCompare').disabled=compareChoices.length!==2;
}
function comparisonReportHTML(){
 const child=activeChild(),records=comparisonSelection.map(id=>child.assessments.find(item=>item.id===id));
 if(records.some(item=>!item))return '';
 records.sort((a,b)=>caseDate(a).localeCompare(caseDate(b))||a.createdAt.localeCompare(b.createdAt));
 const [old,newer]=records,[a,b]=records.map(record=>assessmentStats(record));
 const common=allProbes.filter(p=>{
  const x=old.state.trials[p.id]||{},y=newer.state.trials[p.id]||{};
  if(!SCORED.includes(x.status)||!SCORED.includes(y.status))return false;
  const reference=record=>withAssessment(record,()=>[spokenWord(p),expectedWord(p),expectedTarget(p),trialFor(p.id).mode||'naming']);
  return JSON.stringify(reference(old))===JSON.stringify(reference(newer));
 });
 const matched=records.map(record=>assessmentStats(record,common));
 const legend=`<div class="comparison-key"><span class="old-key">${rt('الأقدم','Earlier')} ${escapeHTML(caseDateLabel(old))}</span><span class="new-key">${rt('الأحدث','Later')} ${escapeHTML(caseDateLabel(newer))}</span></div>`;
 const rows=[...Object.keys(RESULTS),'unrecorded'].map(key=>({label:key==='unrecorded'?rt('غير مسجل','Not recorded'):resultLabel(key),values:[a,b].map((s,i)=>{const count=key==='unrecorded'?s.unrecorded:s.counts[key]||0;return {label:i?rt('الأحدث','Later'):rt('الأقدم','Earlier'),color:i?'new':'old',percent:100*count/s.total,text:`${count} / ${s.total}`};})}));
 const sounds=SOUNDS.map(sound=>({label:`${sound.letter} /${sound.ipa||sound.probes[0].targetIPA||'—'}/`,values:records.map((record,i)=>{const s=assessmentStats(record,allProbes.filter(p=>p.sound.id===sound.id));return {label:i?rt('الأحدث','Later'):rt('الأقدم','Earlier'),color:i?'new':'old',percent:s.accuracy,text:s.scored?`${s.accuracy}% (${s.correct}/${s.scored})`:'—'};})}));
 const scoreText=s=>s.scored?`${s.accuracy}% (${s.correct}/${s.scored})`:'—';
 const changed=common.length?String(Math.round((matched[1].accuracy-matched[0].accuracy)*10)/10):'—';
 const rowDetails=record=>withAssessment(record,()=>allProbes.map(p=>({word:spokenWord(p),result:resultLabel(trialFor(p.id).status),mode:RESULTS[trialFor(p.id).status]?modeLabel(trialFor(p.id).mode||'naming'):rt('غير مسجل','Not recorded'),details:detailsFor(p)})));
 const details=records.map(rowDetails);
 const pairLabel=p=>{
  if(common.includes(p))return rt('متطابق','Matched');
  const x=old.state.trials[p.id]?.status,y=newer.state.trials[p.id]?.status;
  if(!RESULTS[x]&&!RESULTS[y])return rt('غير مسجل','Not recorded');
  if(!RESULTS[x]||!RESULTS[y])return rt('تغطية مختلفة','Different coverage');
  if(!SCORED.includes(x)||!SCORED.includes(y))return rt('غير قابل للتصحيح','Not scored');
  return rt('مرجع / طريقة مختلفة','Different reference / mode');
 };
 return `<div class="report-document comparison-document" dir="${reportLang()==='en'?'ltr':'rtl'}"><h1>${rt('مقارنة فحصي النطق','Speech assessment comparison')}</h1><h2>${escapeHTML(child.name)}</h2>${legend}<div class="stats"><div class="stat"><strong>${common.length}</strong>${rt('بنود مشتركة قابلة للمقارنة','Comparable paired items')}</div><div class="stat"><strong><bdi dir="ltr">${scoreText(matched[0])}</bdi></strong>${rt('الأقدم — البنود المشتركة','Earlier — paired items')}</div><div class="stat"><strong><bdi dir="ltr">${scoreText(matched[1])}</bdi></strong>${rt('الأحدث — البنود المشتركة','Later — paired items')}</div><div class="stat"><strong><bdi dir="ltr">${changed}</bdi></strong>${rt('تغير الدقة (نقطة مئوية)','Paired change (percentage points)')}</div></div><p class="notice">${rt('المقارنة المباشرة تخص البنود المصححة في الفحصين بنفس الكلمة والمرجع والصوت وطريقة الاستثارة. قد تختلف تغطية الفحصين؛ الرسوم التالية تصف كل عينة كاملة ولا تمثل درجة معيارية أو تغيراً تشخيصياً.','Direct comparison uses items scored at both dates with the same word, reference, target and elicitation mode. Coverage may differ; charts below describe each whole sample and are not standardized or diagnostic change scores.')}</p><h3>${rt('النتائج في الفحصين','Outcomes at both dates')}</h3>${simpleBars(rows)}<h3>${rt('الدقة حسب الصوت','Accuracy by sound')}</h3>${simpleBars(sounds)}<p class="chart-note">${rt('الشرطة: لا توجد بنود مصححة. النسبة = الصحيح ÷ المصحح؛ تظهر الأعداد بجانب كل نسبة.','Dash: no scored items. Accuracy = correct ÷ scored; denominators accompany every percentage.')}</p><h3>${rt('سجل المقارنة — جميع البنود','Comparison record — every item')}</h3><div class="table-wrap"><table class="comparison-table"><thead><tr><th>${rt('الصوت والموضع','Target / position')}</th><th class="old-head">${rt('الأقدم','Earlier')}</th><th class="new-head">${rt('الأحدث','Later')}</th><th>${rt('المقارنة','Pairing')}</th></tr></thead><tbody>${allProbes.map((p,i)=>`<tr><td>${escapeHTML(p.sound.letter)}<br>${escapeHTML(positionLabel(p))}</td>${details.map(set=>`<td><strong>${escapeHTML(set[i].word)} · ${escapeHTML(set[i].result)}</strong><br>${escapeHTML(set[i].mode)}<br><span class="item-detail">${escapeHTML(set[i].details)}</span></td>`).join('')}<td>${pairLabel(p)}</td></tr>`).join('')}</tbody></table></div>${records.map((record,i)=>withAssessment(record,()=>{const {info}=reportBlocks();return `<section class="comparison-clinical"><h2>${rt('بيانات الاختبار','Assessment details')}</h2><h3 class="${i?'new':'old'}-label">${escapeHTML(caseDateLabel(record))}</h3><dl>${info.map(([key,value])=>`<div><dt>${escapeHTML(key)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl>${errorPositionTable()}${diagnosisHTML()}${compactProcessHTML()}</section>`;})).join('')}<footer class="signature contact-only">${contactLinks()}</footer></div>`;
}
function installIconControls(){
 const config={homeButton:['home','الرئيسية'],reportButton:['report','التقارير'],accountsButton:['accounts','الحسابات'],downloadButton:['download','تنزيل التطبيق للعمل دون إنترنت'],homeAccounts:['accounts','الحسابات'],continueAssessment:['next','متابعة الفحص'],homeNewAssessment:['plus','فحص جديد'],homeReports:['report','تقارير الطفل'],summaryReport:['report','التقارير'],closeReport:['close','إغلاق التقرير'],exportPdf:['download','طباعة / حفظ PDF'],compareButton:['compare','مقارنة فحصين'],reportCurrent:['report','الفحص الحالي'],closePicture:['close','إغلاق الصورة'],closeSound:['close','إلغاء اختيار الصوت'],customSoundToggle:['edit','إدخال صوت مخصص'],absentTarget:['minus','لا يوجد صوت مستهدف'],cancelReset:['close','إلغاء'],confirmReset:['plus','بدء فحص جديد'],createChildButton:['plus','إضافة طفل'],confirmDeleteChild:['trash','تأكيد حذف الطفل وفحوصاته'],confirmCompare:['compare','عرض تقرير المقارنة'],downloadStart:['download','تنزيل المحتوى'],pwaInstall:['plus','تثبيت التطبيق'],pwaUpdate:['refresh','تحديث التطبيق'],openSoundNav:['wave','اختيار الصوت'],resetDiagnosis:['refresh','العودة إلى الاقتراح الآلي'],shareResearch:['share','مشاركة الحالة في جدول البحث']};
 for(const [id,[name,label]] of Object.entries(config))setButtonIcon($(id),name,label);
 document.querySelectorAll('[data-close]').forEach(button=>setButtonIcon(button,'close','إغلاق'));
 document.querySelectorAll('[data-page]').forEach(button=>{if(!button.id)setButtonIcon(button,{details:'edit',screen:'wave',summary:'report',home:'home'}[button.dataset.page],button.getAttribute('aria-label')||button.textContent);});
 setButtonIcon(document.querySelector('#customSoundForm button'),'check','استخدام الصوت');
}
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.close){closeDialog($(button.dataset.close));if(['referenceDialog','trialNoteDialog'].includes(button.dataset.close))renderTrials();}
 if(button.dataset.child){const child=cases.children.find(c=>c.id===button.dataset.child);if(child&&selectCase(child.id)){closeDialog($('accountsDialog'));showPage('home');}}
 if(button.dataset.deleteChild){pendingDeleteChild=button.dataset.deleteChild;const child=cases.children.find(c=>c.id===pendingDeleteChild);$('deleteChildDescription').textContent=`سيُحذف حساب ${child.name} وجميع فحوصاته من هذا الجهاز. هل أنت متأكد؟`;openDialog($('deleteChildDialog'));}
 if(button.dataset.reportAssessment){reportSourceId=button.dataset.reportAssessment;comparisonSelection=null;refreshReport();}
 if(button.dataset.compareChoice){const id=button.dataset.compareChoice;if(compareChoices.includes(id))compareChoices=compareChoices.filter(value=>value!==id);else if(compareChoices.length<2)compareChoices.push(id);renderCompareChoices();}
});
$('accountsButton').onclick=$('homeAccounts').onclick=openAccounts;
$('createChildForm').onsubmit=event=>{event.preventDefault();const name=$('caseName').value.trim();if(!name){$('caseError').textContent='أدخل اسم الطفل.';return;}if(createChild(name)){$('caseName').value='';closeDialog($('accountsDialog'));showPage('details');}};
$('caseSearch').oninput=renderAccounts;
$('confirmDeleteChild').onclick=()=>{if(deleteChild(pendingDeleteChild)){closeDialog($('deleteChildDialog'));renderAccounts();}};
$('continueAssessment').onclick=()=>showPage('screen');
$('homeNewAssessment').onclick=()=>openDialog($('resetDialog'));
$('homeReports').onclick=showReport;
$('compareButton').onclick=openComparison;
$('reportCurrent').onclick=()=>{reportSourceId=null;comparisonSelection=null;refreshReport();};
$('confirmCompare').onclick=()=>{if(compareChoices.length!==2)return;comparisonSelection=[...compareChoices];closeDialog($('compareDialog'));refreshReport();};
$('resetDiagnosis').onclick=()=>{state.meta.diagnosisOverride='';state.meta.diagnosisReviewed=false;save();renderDiagnosisEditor();};
$('openSoundNav').onclick=()=>{updateCoverage();openDialog($('soundNavDialog'));};
document.querySelector('.app-brand').onclick=event=>{event.preventDefault();showPage('home');};
initializeCases();renderMeta();renderTrials();installIconControls();showPage('home');
$('launchHello').textContent=activeChild()?'مرحباً '+activeChild().name:'مرحباً';
setTimeout(()=>{$('welcomeLaunch').hidden=true;window.dispatchEvent(new Event('articulation-launch-complete'));},matchMedia('(prefers-reduced-motion: reduce)').matches?100:1800);
