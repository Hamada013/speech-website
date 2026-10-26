(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AphasiaModel=api;})(globalThis,function(){
 'use strict';
 const VERSION=1,KEY='aphasia-cases-v1',STATUSES=['correct','incorrect','dontknow','skip','present','absent'],SUPPORTS=['independent','repeated','cued','nonverbal','modified'];
 const clone=value=>JSON.parse(JSON.stringify(value)),empty=()=>({version:VERSION,revision:0,activeCase:null,activeAssessment:null,cases:[]});
 function validate(value){
  if(!value||value.version!==VERSION||(!Number.isInteger(value.revision)||value.revision<0)||!Array.isArray(value.cases)||value.cases.length>500)throw Error('Unsupported or damaged case backup');
  const ids=new Set();let count=0;
  for(const c of value.cases){if(!c||typeof c.id!=='string'||typeof c.name!=='string'||!c.name.trim()||c.name.length>200||ids.has(c.id)||!Array.isArray(c.assessments))throw Error('Invalid case');ids.add(c.id);for(const a of c.assessments){if(!a||typeof a.id!=='string'||ids.has(a.id)||typeof a.createdAt!=='string'||!a.state||typeof a.state.fields!=='object'||!a.state.responses||!a.state.comments||!a.state.notes||!a.state.supports)throw Error('Invalid assessment');ids.add(a.id);count++;for(const key of ['fields','responses','comments','notes','supports'])if(!a.state[key]||typeof a.state[key]!=='object'||Array.isArray(a.state[key]))throw Error('Invalid state map');for(const [id,status] of Object.entries(a.state.responses))if(!/^item-\w+-\d+$/.test(id)||!STATUSES.includes(status)||(/^item-(11|13sub1|13sub3)-/.test(id)?!['present','absent','skip'].includes(status):!['correct','incorrect','dontknow','skip'].includes(status)))throw Error('Invalid item response');for(const support of Object.values(a.state.supports))if(support!==''&&!SUPPORTS.includes(support))throw Error('Invalid support');for(const map of [a.state.fields,a.state.comments,a.state.notes])for(const [key,v] of Object.entries(map)){if(['__proto__','prototype','constructor'].includes(key)||!['string','boolean'].includes(typeof v)||typeof v==='string'&&v.length>50000)throw Error('Invalid field');}}}
  if(count>5000)throw Error('Too many assessments');
  if(value.activeCase!==null){const c=value.cases.find(c=>c.id===value.activeCase);if(!c||!c.assessments.some(a=>a.id===value.activeAssessment))throw Error('Invalid active assessment');}
  return clone(value);
 }
 function summarize(catalog,state,section){
  const list=catalog.filter(i=>!i.observation&&(section===undefined||i.section===section)),s={total:list.length,assessed:0,correct:0,incorrect:0,dontknow:0,skipped:0,unanswered:0};
  for(const item of list){const r=state.responses[item.id];if(!r)s.unanswered++;else if(r==='skip')s.skipped++;else if(['correct','incorrect','dontknow'].includes(r)){s.assessed++;s[r]++;}}
  s.percent=s.assessed?s.correct/s.assessed:null;return s;
 }
 function compare(catalog,earlier,later){
  const contexts=['languageContext','assessmentConditions'],contextComparable=contexts.every(k=>String(earlier.fields[k]||'').trim()&&earlier.fields[k]===later.fields[k]);
  const paired=catalog.filter(i=>!i.observation&&contextComparable&&['correct','incorrect','dontknow'].includes(earlier.responses[i.id])&&['correct','incorrect','dontknow'].includes(later.responses[i.id])&&earlier.supports[i.id]&&earlier.supports[i.id]===later.supports[i.id]&&earlier.supports[i.id]!=='modified');
  const before=paired.filter(i=>earlier.responses[i.id]==='correct').length,after=paired.filter(i=>later.responses[i.id]==='correct').length;
  return {earlier:summarize(catalog,earlier),later:summarize(catalog,later),paired:paired.length,before,after,change:paired.length?(after-before)/paired.length:null,contextComparable};
 }
 const patterns=[
  ['broca','نمط بروكا','Broca-type profile','nonfluent','preserved','impaired'],
  ['transcortical-motor','نمط عبر قشري حركي','Transcortical motor profile','nonfluent','preserved','preserved'],
  ['global','نمط شامل','Global-type profile','nonfluent','impaired','impaired'],
  ['mixed-transcortical','نمط عبر قشري مختلط','Mixed transcortical profile','nonfluent','impaired','preserved'],
  ['wernicke','نمط فيرنيكه','Wernicke-type profile','fluent','impaired','impaired'],
  ['transcortical-sensory','نمط عبر قشري حسي','Transcortical sensory profile','fluent','impaired','preserved'],
  ['conduction','نمط توصيلي','Conduction-type profile','fluent','preserved','impaired'],
  ['anomic','نمط صعوبة التسمية','Anomic-type profile','fluent','preserved','preserved']
 ];
 function suggest(fields){
  const fluency=fields.profileFluency,comprehension=fields.profileComprehension,repetition=fields.profileRepetition,naming=fields.profileNaming;
  const complete=['fluent','nonfluent','mixed'].includes(fluency)&&['preserved','impaired','mixed'].includes(comprehension)&&['preserved','impaired','mixed'].includes(repetition)&&['preserved','impaired','mixed'].includes(naming)&&fields.profileConfounds==='considered';
  if(!complete)return {status:'incomplete',candidates:[]};
  const candidates=patterns.filter(p=>(fluency==='mixed'||p[3]===fluency)&&(comprehension==='mixed'||p[4]===comprehension)&&(repetition==='mixed'||p[5]===repetition)&&(p[0]!=='anomic'||naming!=='preserved')).map(p=>({id:p[0],ar:p[1],en:p[2]}));
  return {status:candidates.length?'provisional':'unclassified',candidates};
 }
 return {VERSION,KEY,STATUSES,SUPPORTS,clone,empty,validate,summarize,compare,suggest,patterns};
});
