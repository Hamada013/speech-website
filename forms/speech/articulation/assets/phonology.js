'use strict';
// Single-phoneme inventory. Additional/custom transcriptions remain recordable without guessing features.
const PHONEMES = [
 ['ء','ʔ','glottal','stop',false],['ب','b','bilabial','stop',true],['ت','t','alveolar','stop',false],
 ['ث','θ','dental','fricative',false],['ج','ʒ','postalveolar','fricative',true],['ج','dʒ','postalveolar','affricate',true],
 ['ح','ħ','pharyngeal','fricative',false],['خ','x','velar','fricative',false],['د','d','alveolar','stop',true],
 ['ذ','ð','dental','fricative',true],['ر','r','alveolar','liquid',true],['ر','ɾ','alveolar','liquid',true],
 ['ز','z','alveolar','fricative',true],['س','s','alveolar','fricative',false],['ش','ʃ','postalveolar','fricative',false],
 ['ص','sˤ','alveolar','fricative',false,true],['ض','dˤ','alveolar','stop',true,true],['ط','tˤ','alveolar','stop',false,true],
 ['ظ','zˤ','alveolar','fricative',true,true],['ظ','ðˤ','dental','fricative',true,true],
 ['ع','ʕ','pharyngeal','fricative',true],['غ','ɣ','velar','fricative',true],['ف','f','labiodental','fricative',false],
 ['ق','q','uvular','stop',false],['ك','k','velar','stop',false],['ل','l','alveolar','liquid',true],
 ['م','m','bilabial','nasal',true],['ن','n','alveolar','nasal',true],['ه','h','glottal','fricative',false],
 ['و','w','labialvelar','glide',true],['ي','j','palatal','glide',true],
 ['گ','ɡ','velar','stop',true],['پ','p','bilabial','stop',false],['ڤ','v','labiodental','fricative',true],
 ['خ','χ','uvular','fricative',false],['غ','ʁ','uvular','fricative',true],['تش','tʃ','postalveolar','affricate',false],
 ['فتحة','a','vowel','vowel',true],['ألف','aː','vowel','vowel',true],['كسرة','i','vowel','vowel',true],
 ['ياء مد','iː','vowel','vowel',true],['ضمة','u','vowel','vowel',true],['واو مد','uː','vowel','vowel',true],
 ['إي','e','vowel','vowel',true],['إي مد','eː','vowel','vowel',true],['أو','o','vowel','vowel',true],['أو مد','oː','vowel','vowel',true],['حركة مركزية','ə','vowel','vowel',true]
].map(([letter,ipa,place,manner,voiced,emphatic=false])=>({letter,ipa,place,manner,voiced,emphatic}));
function phoneme(value) {
 const ipa=String(value||'').trim().replace(/^[/\[]|[/\]]$/g,'').replaceAll('g','ɡ').replaceAll('ˁ','ˤ');
 return PHONEMES.find(p=>p.ipa===ipa)||null;
}
const PROCESS_RULES = [
 {id:'finalDeletion',ar:'حذف الصامت الأخير — مؤشر مرشح',en:'Final consonant deletion — candidate',eligible:(t,p)=>p.position==='آخر الكلمة',match:(t,a,r)=>r.status==='omission'},
 {id:'initialDeletion',ar:'حذف الصامت الأول — مؤشر مرشح',en:'Initial consonant deletion — candidate',eligible:(t,p)=>p.position==='أول الكلمة',match:(t,a,r)=>r.status==='omission'},
 {id:'stopping',ar:'تحويل الاحتكاكي / المركب إلى وقفي',en:'Stopping',eligible:t=>['fricative','affricate'].includes(t.manner),match:(t,a,r)=>r.status==='substitution'&&a?.manner==='stop'},
 {id:'fronting',ar:'تقديم الأصوات الطبقية / اللهوية',en:'Velar / uvular fronting',eligible:t=>['velar','uvular'].includes(t.place),match:(t,a,r)=>r.status==='substitution'&&['alveolar','dental'].includes(a?.place)&&t.manner===a.manner},
 {id:'backing',ar:'تأخير الأصوات السنخية / الأسنانية',en:'Alveolar / dental backing',eligible:t=>['alveolar','dental'].includes(t.place),match:(t,a,r)=>r.status==='substitution'&&['velar','uvular'].includes(a?.place)&&t.manner===a.manner},
 {id:'gliding',ar:'إبدال ر / ل بصوت انزلاقي',en:'Liquid gliding',eligible:t=>t.manner==='liquid',match:(t,a,r)=>r.status==='substitution'&&a?.manner==='glide'},
 {id:'deaffrication',ar:'تبسيط الصوت المركب إلى احتكاكي',en:'Deaffrication',eligible:t=>t.manner==='affricate',match:(t,a,r)=>r.status==='substitution'&&a?.manner==='fricative'&&t.place===a.place},
 {id:'depalatalization',ar:'تحويل ش / ج الاحتكاكية إلى س / ز',en:'Depalatalization',eligible:t=>['ʃ','ʒ'].includes(t.ipa),match:(t,a,r)=>r.status==='substitution'&&(['ʃ:s','ʒ:z'].includes(t.ipa+':'+a?.ipa))},
 {id:'deemphasis',ar:'فقدان التفخيم',en:'De-emphasis',eligible:t=>t.emphatic,match:(t,a,r)=>r.status==='substitution'&&!a?.emphatic&&a?.ipa===t.ipa.replace('ˤ','')},
 {id:'devoicing',ar:'فقدان الجهر',en:'Devoicing',eligible:t=>t.voiced&&['stop','fricative','affricate'].includes(t.manner),match:(t,a,r)=>r.status==='substitution'&&a&&!a.voiced&&t.place===a.place&&t.manner===a.manner&&t.emphatic===a.emphatic},
 {id:'voicing',ar:'إضافة الجهر',en:'Voicing',eligible:t=>!t.voiced&&['stop','fricative','affricate'].includes(t.manner),match:(t,a,r)=>r.status==='substitution'&&a?.voiced&&t.place===a.place&&t.manner===a.manner&&t.emphatic===a.emphatic}
];
function analyzeProcesses(probes,trials) {
 const groups={naming:[],imitation:[],context:[]},pending=[];
 for(const p of probes){
  const r=trials[p.id]||{};
  if(!['correct','substitution','omission','distortion','addition'].includes(r.status))continue;
  const expected=hasOwn(r,'targetIPA')?r.targetIPA:p.targetIPA;
  const t=phoneme(expected);
  if(!t||t.manner==='vowel'){pending.push({id:p.id,reason:'reference'});continue;}
  const a=phoneme(r.actualIPA||r.actual);
  if(r.status==='substitution'&&!a){pending.push({id:p.id,reason:'replacement'});continue;}
  // Contradictory same-phoneme substitutions cannot establish a phonological process.
  if(r.status==='substitution'&&a.ipa===t.ipa){pending.push({id:p.id,reason:'same'});continue;}
  const mode=r.mode||'naming';
  if(!hasOwn(groups,mode)){pending.push({id:p.id,reason:'mode'});continue;}
  groups[mode].push({p,r,t,a});
 }
 const results=[];
 for(const [mode,entries] of Object.entries(groups)){
  for(const rule of PROCESS_RULES){
   const eligible=entries.filter(e=>rule.eligible(e.t,e.p));
   const matching=eligible.filter(e=>rule.match(e.t,e.a,e.r));
   if(matching.length)results.push({id:rule.id,ar:rule.ar,en:rule.en,mode,count:matching.length,opportunities:eligible.length,
    examples:matching.map(({p,r,t,a})=>({id:p.id,word:r.word||p.spoken||p.word,target:t.ipa,actual:r.status==='omission'?'∅':a?.ipa,position:p.position}))});
  }
 }
 return {results,pending,interpretable:Object.values(groups).flat().length};
}
