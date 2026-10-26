'use strict';
const SIGNATURE='SPEECH AND LANGUAGE PATHOLOGY\nAhmad Ghanem\nLatakia - Syria\nslp.ahmadghanem@gmail.com';
const FIELD_LABELS={
 childName:['اسم الطفل','Child’s name'],recordId:['رقم الملف','Record number'],examiner:['الفاحص','Clinician'],informant:['مصدر المعلومات / مرافق الطفل','Informant / accompanying caregiver'],dialect:['اللهجة المرجعية','Reference dialect'],languages:['لغات الطفل ولهجاته','Languages / dialects'],procedure:['طريقة الإجراء','Administration'],hearing:['حالة السمع','Hearing status'],oral:['مراجعة آلية النطق','Oral mechanism review'],consent:['موافقة ولي الأمر','Caregiver consent'],concerns:['سبب الإحالة / الشكوى / تاريخ السمع','Referral concerns / hearing history'],intelligibility:['وضوح الكلام المتصل','Connected-speech intelligibility'],participation:['المشاركة وصلاحية العينة','Participation / sample validity'],connected:['وصف عينة الكلام المتصل','Connected-speech sample'],analysis:['التحليل والأمثلة والقيود','Clinical interpretation / examples / limitations'],conclusion:['قرار الفاحص','Clinician’s conclusion'],plan:['الخطة الفردية / المتابعة','Individual plan / follow-up']
};
const RESULT_EN={correct:'Correct',substitution:'Substitution',omission:'Omission',distortion:'Distortion',addition:'Addition',dialect:'Dialect-appropriate realization',unelicited:'Not elicited / unfamiliar word',skipped:'Not tested / skipped'};
const MODE_EN={naming:'Independent naming',imitation:'Imitation',context:'Contextual cue'};
const STIM_EN={'':'Not tested',yes:'Successful with a model / cue',partial:'Partially successful',no:'Not successful in this attempt'};
const PATTERN_EN=['Final consonant deletion','Place change','Stopping','Emphasis change','Cluster simplification','Assimilation','Inconsistent productions','Other pattern described in notes'];
const REC_EN=['Comprehensive speech sound assessment','Complete hearing review','Oral mechanism examination','Additional connected-speech sample','Stimulability testing','Dialect / language review','Family / school collaboration','Rescreen and follow up'];
const FIXED_EN={
 'سورية شامية مدينية — مرجع مبدئي قابل للتعديل':'Urban Syrian Levantine — editable draft reference','العربية السورية':'Syrian Arabic',
 'حضوري':'In person','عن بُعد':'Remote',
 'فحص سمع موثق دون شكوى حالية':'Documented hearing check; no current concerns',
 'شكوى سمعية / نتيجة تتطلب متابعة':'Hearing concern / result requiring follow-up',
 'لم يُفحص / النتيجة غير معروفة':'Not checked / result unknown',
 'لم تُجرَ':'Not performed','أُجريت دون ملاحظات في العينة':'Performed; no concerns observed in the sample','ملاحظات تحتاج تقييماً إضافياً':'Findings requiring further assessment',
 'موثقة':'Documented','بانتظار التوثيق':'Awaiting documentation',
 'مفهوم غالباً':'Usually understood','مفهوم جزئياً / يحتاج تكراراً':'Partly understood / needs repetition','يصعب فهمه غالباً':'Often difficult to understand','عينة غير كافية للحكم':'Insufficient sample to judge',
 'مشاركة جيدة وعينة مناسبة للفحص':'Good participation; suitable screening sample',
 'مشاركة متغيرة / احتاج دعماً':'Variable participation / support required',
 'عينة محدودة؛ يلزم استكمال الفحص':'Limited sample; complete the screening',
 'يُقترح تقييم شامل لأصوات الكلام':'Comprehensive speech sound assessment is suggested',
 'يُقترح متابعة وإعادة فحص':'Follow-up and rescreening are suggested',
 'لا توجد أخطاء ملحوظة ضمن العينة المفحوصة؛ تُراجع الشكوى والقيود':'No errors observed in the tested sample; review concerns and limitations',
 'الفحص غير مكتمل / العينة غير كافية':'Screening incomplete / insufficient sample'
};
function reportLang(){return $('reportLanguage').value==='en'?'en':'ar';}
function rt(ar,en,lang=reportLang()){return lang==='en'?en:ar;}
function labelFor(key,lang=reportLang()){return FIELD_LABELS[key][lang==='en'?1:0];}
function resultLabel(status,lang=reportLang()){return (lang==='en'?RESULT_EN:RESULTS)[status]||rt('غير مسجل','Not recorded',lang);}
function modeLabel(mode,lang=reportLang()){return (lang==='en'?MODE_EN:MODES)[mode]||rt('غير مسجل','Not recorded',lang);}
function positionLabel(probe,lang=reportLang()){return lang==='en'?({'أول الكلمة':'Initial','وسط الكلمة':'Medial','آخر الكلمة':'Final'}[probe.position]||probe.position):probe.position;}
function metaValue(key,lang=reportLang()){
 const raw=String(state.meta[key]||'').trim();
 if(lang==='en'&&state.meta[key+'En']?.trim())return state.meta[key+'En'].trim();
 return (lang==='en'?FIXED_EN[raw]:null)||raw||rt('غير مسجل','Not recorded',lang);
}
function ageForReport(lang=reportLang()){
 const age=ageText();if(!age)return rt('غير متاح','Not available',lang);
 return lang==='en'?age.replace('سنة','years').replace(' و',' and ').replace('شهر','months'):age;
}
function fraction(correct,total,lang=reportLang()){return total?`${Math.round(correct/total*1000)/10}% (${correct}/${total})`:rt('غير متاح — لا توجد بنود مصححة','Unavailable — no scored items',lang);}
function processAnalysis(){return analyzeProcesses(allProbes,state.trials);}
function processHTML(lang=reportLang()){
 const a=processAnalysis();
 const title=rt('التحليل الفونولوجي التلقائي','Automatic phonological analysis',lang);
 const note=rt('مؤشرات مستخلصة من المرجع الصوتي وإنتاج الطفل المسجل. تُعرض التسمية والتقليد منفصلين. «متكرر» يعني أكثر من مثال في هذه العينة، وليس حداً تشخيصياً.','Candidate patterns derived from the reference phoneme and the recorded production. Naming and imitation are separate. “Repeated” means more than one example in this sample, not a diagnostic cutoff.',lang);
 const unsupported=rt('لا يمكن استنتاج المماثلة، حذف المقاطع، تبسيط التجمعات أو عدم الثبات من حكم صوت منفرد؛ تحتاج نسخ الكلمة كاملة أو محاولات متكررة. يُراجع حذف الصامت الأخير في سياق التجمعات واللغة واللهجة.','Assimilation, syllable deletion, cluster reduction and inconsistency cannot be inferred from a single-phoneme judgment; whole-word transcriptions or repeated trials are needed. Review candidate final deletion in cluster, language and dialect context.',lang);
 const rows=a.results.map(r=>`<div class="process-result"><div class="section-head"><strong>${escapeHTML(lang==='en'?r.en:r.ar)}</strong><span class="process-badge">${r.count>1?rt('مؤشر متكرر','Repeated candidate',lang):rt('مثال واحد','Single example',lang)}</span></div><p>${escapeHTML(modeLabel(r.mode,lang))} · ${r.count}/${r.opportunities} ${rt('من الفرص القابلة للتفسير لهذه القاعدة','interpretable opportunities for this rule',lang)}</p><p class="examples" dir="auto">${r.examples.map(e=>`${escapeHTML(e.word)} <b dir="ltr">/${escapeHTML(e.target)}/ → /${escapeHTML(e.actual)}/</b>`).join(' · ')}</p></div>`).join('');
 return `<h3>${title}</h3><p class="muted">${note}</p>${rows||`<p class="notice">${rt('لم يظهر مؤشر تدعمه التسجيلات القابلة للتفسير. لا يعني ذلك غياب الأنماط في بنود غير مسجلة أو ناقصة التفاصيل.','No candidate pattern was supported by the interpretable records. This does not establish absence in unrecorded or insufficiently detailed items.',lang)}</p>`}<p>${a.interpretable} ${rt('بنداً قابلاً للتحليل؛','interpretable items; ',lang)} ${a.pending.length} ${rt('بنداً يحتاج تأكيد المرجع أو اختيار صوت بديل معروف.','items need reference confirmation or an interpretable replacement sound.',lang)}</p><p class="muted">${unsupported}</p>`;
}
function renderAutomaticSummary(){$('automaticSummary').innerHTML=processHTML('ar');}
function listLabels(key,lang=reportLang()){
 const options=key==='patterns'?(lang==='en'?PATTERN_EN:PATTERNS):(lang==='en'?REC_EN:RECOMMENDATIONS);
 return state[key].map(i=>options[Number(i)]).filter(Boolean).join(lang==='en'?'; ':'؛ ')||rt('لم تُحدد','Not specified',lang);
}
function detailsFor(probe,lang=reportLang()){
 const r=trialFor(probe.id),parts=[rt('المرجع: ','Reference: ',lang)+expectedWord(probe),rt('الهدف: ','Target: ',lang)+(expectedTarget(probe)||rt('غير محدد / غير موجود','Unspecified / absent',lang))];
 if(ERRORS.includes(r.status)){
  if(r.actual)parts.push(rt('الإنتاج: ','Production: ',lang)+r.actual);
  parts.push(rt('قابلية الاستثارة: ','Stimulability: ',lang)+(lang==='en'?STIM_EN:STIM)[r.stimulability||'']);
 }
 const note=lang==='en'?(r.noteEn||r.note):r.note;
 if(note)parts.push(rt('ملاحظة: ','Note: ',lang)+note);
 return parts.join('\n');
}
function reportModel(lang=reportLang()){
 const stats=aggregate(),naming=stats.modes.naming||{total:0,correct:0};
 const rows=allProbes.filter(p=>RESULTS[trialFor(p.id).status]||$('includeUntested').checked).map(p=>{
  const r=trialFor(p.id),target=expectedTarget(p);
  const word=spokenWord(p)+(lang==='en'&&p.gloss?' ('+p.gloss+')':'');
  return [p.sound.letter+' /'+(target||'—')+'/',positionLabel(p,lang),word,RESULTS[r.status]?modeLabel(r.mode||'naming',lang):rt('غير مسجل','Not recorded',lang),resultLabel(r.status,lang),detailsFor(p,lang)];
 });
 const messages=[rt(`سُجل ${stats.recorded} من ${stats.total} بنداً؛ غير مسجل ${stats.unrecorded}.`,`${stats.recorded} of ${stats.total} items recorded; ${stats.unrecorded} unrecorded.`,lang),
 rt(`بنود مصححة ${stats.scored}؛ صحيح ${stats.correct}؛ أخطاء ${stats.errors}.`,`${stats.scored} scored items; ${stats.correct} correct; ${stats.errors} with errors.`,lang),
 rt(`استُبعدت من الدقة: لهجي مقبول ${stats.dialect}؛ لم يُستثر ${stats.unelicited}؛ تجاوز ${stats.skipped}؛ غير مسجل ${stats.unrecorded}.`,`Excluded from accuracy: ${stats.dialect} dialect-appropriate; ${stats.unelicited} unelicited; ${stats.skipped} skipped; ${stats.unrecorded} unrecorded.`,lang),
 ...['naming','imitation','context'].map(mode=>{const m=stats.modes[mode]||{total:0,correct:0};return modeLabel(mode,lang)+': '+fraction(m.correct,m.total,lang);}),
 rt('هذه دقة أحكام الأصوات المختارة؛ ليست PCC أو درجة معيارية أو حكماً آلياً على الشدة.','These are target-level judgments, not PCC, standardized scores or automatic severity classifications.',lang)];
 const positions=['أول الكلمة','وسط الكلمة','آخر الكلمة'].map((position,i)=>{const s=aggregate(allProbes.filter(p=>p.position===position));return rt(`${position}: صحيح ${s.correct}/${s.scored}؛ أخطاء ${s.errors}؛ غير مسجل ${s.unrecorded}.`,`${['Initial','Medial','Final'][i]}: ${s.correct}/${s.scored} correct; ${s.errors} errors; ${s.unrecorded} unrecorded.`,lang);});
 const st={yes:0,partial:0,no:0,untested:0};allProbes.filter(p=>ERRORS.includes(trialFor(p.id).status)).forEach(p=>{const code=trialFor(p.id).stimulability;st[hasOwn(st,code)?code:'untested']++;});
 return {stats,naming,rows,messages,positions,st};
}
function reportBlocks(lang=reportLang()){
 const m=reportModel(lang),s=m.stats;
 const info=[...['childName','recordId','examiner','informant','dialect','languages','procedure','hearing','oral','consent'].map(key=>[labelFor(key,lang),metaValue(key,lang)]),[rt('تاريخ الميلاد','Date of birth',lang),parseDate(state.meta.dob).iso||rt('غير مسجل','Not recorded',lang)],[rt('تاريخ الفحص','Assessment date',lang),parseDate(state.meta.assessment).iso||rt('غير مسجل','Not recorded',lang)],[rt('العمر عند الفحص','Age at assessment',lang),ageForReport(lang)]];
 const errors=ERRORS.map(status=>`${resultLabel(status,lang)}: ${s.counts[status]||0}`).join(' · ');
 const stim=rt(`في البنود ذات الأخطاء: نجاح ${m.st.yes}؛ جزئي ${m.st.partial}؛ لم ينجح ${m.st.no}؛ لم يُفحص ${m.st.untested}.`,`In error items: successful ${m.st.yes}; partial ${m.st.partial}; unsuccessful ${m.st.no}; not tested ${m.st.untested}.`,lang);
 return {m,info,errors,stim};
}
function compactProcessHTML(lang=reportLang()){
 const analysis=processAnalysis();if(!analysis.results.length)return '';
 return `<h3>${rt('الأنماط المستخلصة من التسجيلات','Patterns observed in recorded productions',lang)}</h3><table class="process-table"><thead><tr><th>${rt('النمط','Pattern',lang)}</th><th>${rt('الاستثارة','Elicitation',lang)}</th><th>${rt('الأمثلة / الفرص','Examples / opportunities',lang)}</th></tr></thead><tbody>${analysis.results.map(r=>`<tr><td>${escapeHTML(lang==='en'?r.en:r.ar)}</td><td>${escapeHTML(modeLabel(r.mode,lang))}</td><td>${r.count} / ${r.opportunities}</td></tr>`).join('')}</tbody></table>`;
}
function assessmentReportHTML(){
 const lang=reportLang(),{m,info}=reportBlocks(lang),s=m.stats;
 return `<div class="report-document" dir="${lang==='en'?'ltr':'rtl'}" lang="${lang}"><h1>${rt('تقرير اختبار النطق','Speech Sound Assessment Report')}</h1><h3>${rt('بيانات الطفل والاختبار','Child and assessment details')}</h3><dl>${info.map(([label,value])=>`<div><dt>${escapeHTML(label)}</dt><dd dir="auto">${escapeHTML(value)}</dd></div>`).join('')}</dl>${state.meta.concerns?.trim()?`<h3>${labelFor('concerns')}</h3><p>${escapeHTML(metaValue('concerns'))}</p>`:''}<h3>${rt('ملخص النتائج','Results summary')}</h3><div class="stats">${[[`${s.recorded}/${s.total}`,rt('بنود مسجلة','Recorded items')],[s.scored,rt('بنود مصححة','Scored items')],[s.errors,rt('بنود ذات أخطاء','Error items')],[fraction(m.naming.correct,m.naming.total),rt('تسمية مستقلة','Independent naming')]].map(([value,label])=>`<div class="stat"><strong>${escapeHTML(value)}</strong>${label}</div>`).join('')}</div>${resultCharts()}${errorPositionTable()}${diagnosisHTML()}${compactProcessHTML()}<h3>${rt('سجل البنود','Item record')}</h3><div class="table-wrap"><table class="assessment-table"><thead><tr>${(lang==='en'?['Target / position','Word','Result / elicitation','Production / notes']:['الصوت والموضع','الكلمة','النتيجة والاستثارة','الإنتاج والملاحظات']).map(label=>`<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${m.rows.map(row=>`<tr>${[row[0]+'\n'+row[1],row[2],row[4]+'\n'+row[3],row[5]].map(cell=>`<td dir="auto">${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><footer class="signature contact-only">${contactLinks()}</footer></div>`;
}
function reportHTML(){return visibleReportHTML();}
function refreshReport(){
 const en=reportLang()==='en';$('reportPreview').innerHTML=visibleReportHTML();$('reportPreview').dir=en?'ltr':'rtl';$('reportPreview').lang=reportLang();
 $('reportTitle').textContent=comparisonSelection?(en?'Assessment comparison':'مقارنة الفحوصات'):(en?'Assessment report':'تقرير الفحص');
 setButtonIcon($('closeReport'),'close',en?'Close report':'إغلاق التقرير');setButtonIcon($('exportPdf'),'download',en?'Print / Save PDF':'طباعة / حفظ PDF');
 $('exportHelp').textContent=en?'PDF report — choose Save as PDF in the print window.':'تقرير PDF — اختر حفظ كـ PDF في نافذة الطباعة.';
 $('reportLanguageNote').textContent='';renderHistory();
}
function showReport(){
 if(!activeChild()){openAccounts();return;}
 closeDropdowns();updateDates();if(dateProblem()){showPage('details');document.querySelector('[data-date="dob"]')?.focus();$('message').textContent='صحح التاريخ قبل التصدير.';return;}
 save();reportSourceId=null;comparisonSelection=null;$('message').textContent='';refreshReport();openDialog($('reportDialog'));
}
