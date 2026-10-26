'use strict';
// Descriptive decision support, not an age-normed or independently confirmed diagnosis.
const CLINICAL_SOURCE='https://www.asha.org/practice-portal/clinical-topics/articulation-and-phonology/';
function diagnosticSignature(record){const m=record.meta||{};return JSON.stringify([record.trials,m.dialect,m.languages,m.referenceReviewed,m.etiology,m.diagnosisOverride]);}
function diagnosticImpression(record=state,lang='ar'){
 const t=(ar,en)=>lang==='en'?en:ar,meta=record.meta||{},trials=Object.values(record.trials||{});
 const scored=trials.filter(r=>['correct','substitution','omission','distortion','addition'].includes(r.status));
 const errors=scored.filter(r=>r.status!=='correct'),pending=analyzeProcesses(allProbes,record.trials||{}).pending.length;
 let suggestion,kind='insufficient';
 const reviewed=meta.referenceReviewed===true&&String(meta.dialect||'').trim()&&String(meta.languages||'').trim();
 if(!scored.length)suggestion=t('العينة غير كافية لاقتراح انطباع تشخيصي.','Insufficient scored data for a diagnostic impression.');
 else if(!errors.length){kind='no_errors_observed';suggestion=t('لم تُرصد أخطاء في البنود المصححة من هذه العينة.','No errors observed in the scored items in this sample.');}
 else if(!reviewed){kind='reference_review';suggestion=t('توجد أخطاء مسجلة؛ يلزم مراجعة لغة الطفل ولهجته والمرجع قبل اقتراح نوع الاضطراب.','Recorded errors require language, dialect and reference review before suggesting a disorder type.');}
 else if(meta.etiology!=='none'){kind='etiology_review';suggestion=t('صعوبات في إنتاج أصوات الكلام تحتاج تقييماً تفريقياً ومراجعة العوامل السمعية والبنيوية والعصبية.','Speech sound production difficulties require differential assessment and review of hearing, structural and neurological factors.');}
 else if(pending){kind='production_review';suggestion=t('صعوبات في إنتاج أصوات الكلام؛ بعض التسجيلات تحتاج توضيح المرجع أو الإنتاج قبل تحديد النوع.','Speech sound production difficulties; some records need reference or production clarification before subtype interpretation.');}
 else {
  const patternErrors=errors.filter(r=>['substitution','omission','addition'].includes(r.status)).length,distortions=errors.some(r=>r.status==='distortion');
  kind=patternErrors&&distortions?'mixed_candidate':patternErrors?'phonological_candidate':'articulation_candidate';
  suggestion=kind==='mixed_candidate'?t('انطباع أولي: يُشتبه بصعوبات نطقية وفونولوجية مختلطة؛ تحتاج تأكيداً بتقييم شامل.','Provisional impression: possible mixed articulation and phonological difficulties; comprehensive assessment is needed.'):kind==='phonological_candidate'?t('انطباع أولي: أخطاء الإبدال أو الحذف أو الإضافة تستدعي تقييم المكوّن الفونولوجي؛ لا تكفي وحدها لتأكيد اضطراب.','Provisional impression: substitutions, omissions or additions warrant assessment of the phonological component; they do not independently confirm a disorder.'):t('انطباع أولي: تشويه صوتي يستدعي تقييم المكوّن النطقي؛ يحتاج تأكيداً سريرياً.','Provisional impression: sound distortion warrants articulation assessment and clinical confirmation.');
 }
 const override=String(meta.diagnosisOverride||'').trim();
 return {suggestion,kind,override,effective:override||suggestion,source:override?'clinician':'automatic',clinicianReviewed:meta.diagnosisReviewed===true,provisional:meta.diagnosisReviewed!==true,scored:scored.length,errors:errors.length};
}
function diagnosisHTML(lang=reportLang()){
 const d=diagnosticImpression(state,lang),t=(ar,en)=>lang==='en'?en:ar;
 return `<section class="diagnosis-report"><h3>${t('الانطباع التشخيصي','Diagnostic impression')}</h3><p>${escapeHTML(d.effective)}</p><small>${d.source==='clinician'?t('صياغة الفاحص','Clinician wording'):t('اقتراح آلي','Automatic suggestion')} · ${d.clinicianReviewed?t('تمت المراجعة السريرية','Clinician reviewed'):t('بانتظار المراجعة السريرية','Awaiting clinician review')}</small></section>`;
}
function renderDiagnosisEditor(){
 const d=diagnosticImpression();$('automaticDiagnosis').innerHTML=`<p>${escapeHTML(d.suggestion)}</p><small>اقتراح وصفي للمراجعة؛ لا يعتمد على معايير عمرية عربية.</small>`;
 $('diagnosisOverride').value=state.meta.diagnosisOverride||'';$('diagnosisReviewed').checked=state.meta.diagnosisReviewed===true;
}
function errorPositionTable(lang=reportLang()){
 const positions=['أول الكلمة','وسط الكلمة','آخر الكلمة'],t=(ar,en)=>lang==='en'?en:ar;
 // Group by the actual reference phoneme, not a written letter whose dialect realization may differ.
 const groups=new Map();
 for(const probe of allProbes){const target=expectedTarget(probe);if(!target)continue;if(!groups.has(target))groups.set(target,{target,letters:new Set(),probes:[]});const group=groups.get(target);group.letters.add(probe.sound.letter);group.probes.push(probe);}
 const wrong=[...groups.values()].filter(group=>group.probes.some(p=>ERRORS.includes(trialFor(p.id).status)));
 return `<section class="error-position-record"><h3>${t('سجل البنود غير الصحيحة حسب موضع الصوت','Incorrect sounds by word position')}</h3>${wrong.length?`<table class="error-position-table"><thead><tr><th>${t('الصوت','Sound')}</th>${(lang==='en'?['Initial','Medial','Final']:positions).map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${wrong.map(group=>`<tr><th scope="row">${escapeHTML([...group.letters].join(' / '))} <bdi dir="ltr">/${escapeHTML(group.target)}/</bdi></th>${positions.map(position=>{const probes=group.probes.filter(p=>p.position===position),errors=probes.filter(p=>ERRORS.includes(trialFor(p.id).status));return `<td class="${errors.length?'position-error':''}">${errors.length?`${t('خطأ','Error')} (${errors.length})<br><small>${errors.map(p=>escapeHTML(spokenWord(p))+' — '+escapeHTML(resultLabel(trialFor(p.id).status,lang))).join('<br>')}</small>`:probes.some(p=>trialFor(p.id).status==='correct')?t('صحيح','Correct'):probes.some(p=>trialFor(p.id).status==='dialect')?t('لهجي مقبول','Dialect-appropriate'):t('غير مصحح','Not scored')}</td>`;}).join('')}</tr>`).join('')}</tbody></table>`:`<p>${t('لا توجد أصوات ذات أخطاء مسجلة.','No sounds with recorded errors.')}</p>`}</section>`;
}
