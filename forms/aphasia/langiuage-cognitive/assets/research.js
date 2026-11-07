/* Research record, domain scores and norm groups. Shared by the app, the local server and the tests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AphasiaResearch=api;})(globalThis,function(){
'use strict';
// Observation checklists describe behaviour; they are not right/wrong tasks, so they never enter a score.
const OBSERVATION_GROUPS=new Set(['11','13sub1','13sub3','13sub5']);
// Healthy adults cannot answer these (accident, treating doctor, treatments), so no score uses them.
const HEALTHY_NA=new Set(['item-1-10','item-1-11','item-1-13','item-12sub3-6','item-12sub3-7','item-12sub3-8']);
const DOMAINS=[
 ['orientation','التوجه','Orientation',g=>/^1$/.test(g)],
 ['auditory','الفهم السمعي','Auditory comprehension',g=>/^2sub/.test(g)],
 ['complex','الأسئلة الفكرية المعقدة','Complex ideational material',g=>/^3sub/.test(g)],
 ['problem','حل المشكلات','Problem solving',g=>g==='4'],
 ['naming','التسمية','Naming',g=>g==='5'],
 ['repetition','التكرار','Repetition',g=>/^6sub/.test(g)],
 ['reasoning','المنطق والاستدلال','Reasoning',g=>/^7sub/.test(g)],
 ['organization','تنظيم الأفكار','Organisation of ideas',g=>g==='8'],
 ['reading','القراءة والكتابة','Reading and writing',g=>/^9sub/.test(g)],
 ['calculation','الحساب','Calculation',g=>g==='10'],
 ['memory','الذاكرة','Memory',g=>/^12sub/.test(g)],
 ['discourse','السرد ووصف الصور','Discourse',g=>g==='13sub2'],
 ['gesture','الإيماءات','Gesture',g=>g==='13sub4']
].map(([key,ar,en,match])=>({key,ar,en,match}));
const domainOf=group=>DOMAINS.find(d=>d.match(group))?.key||null;
// A domain counts only when most of it was given; partial testing would make it look easier or harder.
const COMPLETE_SHARE=0.8;
const AGE_BANDS=[[18,39,'18–39'],[40,59,'40–59'],[60,120,'60+']];
const EDUCATION_CUT=9;
const ageBand=age=>{const b=AGE_BANDS.find(([lo,hi])=>age>=lo&&age<=hi);return b?b[2]:null;};
const educationBand=years=>years===null||years===undefined||!Number.isFinite(years)?null:years<=EDUCATION_CUT?`≤${EDUCATION_CUT} years`:`>${EDUCATION_CUT} years`;
const normGroup=r=>{const a=ageBand(r.age),e=educationBand(r.educationYears);return a&&e?`${a} · ${e}`:null;};
const NORM_GROUPS=AGE_BANDS.flatMap(([, ,a])=>[`≤${EDUCATION_CUT} years`,`>${EDUCATION_CUT} years`].map(e=>`${a} · ${e}`));
const scorable=item=>!OBSERVATION_GROUPS.has(item.group)&&!HEALTHY_NA.has(item.id)&&domainOf(item.group);
function domainScores(catalog,responses){
 const out={};let correct=0,assessed=0,total=0,allComplete=true;
 for(const d of DOMAINS){
  const list=catalog.filter(i=>scorable(i)&&domainOf(i.group)===d.key);if(!list.length)continue;
  const s={total:list.length,assessed:0,correct:0};
  for(const i of list){const r=responses[i.id];if(['correct','incorrect','dontknow'].includes(r)){s.assessed++;if(r==='correct')s.correct++;}}
  s.complete=s.assessed>=Math.ceil(COMPLETE_SHARE*s.total);s.percent=s.assessed?Math.round(1000*s.correct/s.assessed)/10:null;
  out[d.key]=s;correct+=s.correct;assessed+=s.assessed;total+=s.total;if(!s.complete)allComplete=false;
 }
 return {domains:out,total:{total,assessed,correct,complete:allComplete,percent:assessed?Math.round(1000*correct/assessed)/10:null}};
}
const CHOICES={group:['control','aphasia','other'],sex:['female','male'],handedness:['right','left','both'],etiology:['none','stroke','tbi','tumour','progressive','other'],hearing:['normal','corrected','impaired'],vision:['normal','corrected','impaired'],dialect:['syrian','levantine','other'],otherLanguages:['no','yes']};
const num=(v,lo,hi)=>{const n=Number(String(v??'').replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).trim());return String(v??'').trim()!==''&&Number.isFinite(n)&&n>=lo&&n<=hi?Math.round(n):null;};
function cleanResearch(input={}){const out={};for(const [k,list]of Object.entries(CHOICES))out[k]=list.includes(input[k])?input[k]:'';out.age=num(input.age,18,110);out.educationYears=num(input.educationYears,0,30);out.monthsPostOnset=num(input.monthsPostOnset,0,600);return out;}
function missingResearch(r){const need=['group','sex','handedness','hearing','vision','dialect','otherLanguages','age','educationYears'];if(r.group&&r.group!=='control')need.push('etiology','monthsPostOnset');return need.filter(k=>r[k]===''||r[k]===null||r[k]===undefined);}
// Healthy norms: neurologically healthy adults whose hearing and vision allow the tasks.
const eligibleControl=r=>r.group==='control'&&['normal','corrected'].includes(r.hearing)&&['normal','corrected'].includes(r.vision)&&normGroup(r)!==null;
// Never carries a name, doctor, examiner, dates of birth or incident, or any free text.
function record({caseCode,assessmentId,visitDate,research,state,catalog}){
 const r=cleanResearch(research),scores=domainScores(catalog,state.responses||{});
 const fluency=num(state.fields?.fluencyAnimals,0,150);
 return {assessmentId:String(assessmentId),caseCode:String(caseCode),visitMonth:String(visitDate||'').slice(0,7),...r,fluencyAnimals:fluency,
  profile:{fluency:state.fields?.profileFluency||'',comprehension:state.fields?.profileComprehension||'',repetition:state.fields?.profileRepetition||'',naming:state.fields?.profileNaming||''},
  domains:scores.domains,total:scores.total,
  items:catalog.filter(i=>state.responses?.[i.id]).map(i=>({id:i.id,score:state.responses[i.id],support:state.supports?.[i.id]||''}))};
}
return {DOMAINS,OBSERVATION_GROUPS,HEALTHY_NA,COMPLETE_SHARE,AGE_BANDS,EDUCATION_CUT,NORM_GROUPS,CHOICES,domainOf,scorable,ageBand,educationBand,normGroup,domainScores,cleanResearch,missingResearch,eligibleControl,record};
});
