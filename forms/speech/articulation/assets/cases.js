'use strict';
// Independent local cases. Write a child record only; never clear another app's data.
let CASE_KEY='articulation-cases-v2';
try{const uid=localStorage.getItem('articulation-cloud-owner');if(uid)CASE_KEY='articulation-cases-google-'+uid;}catch{}
const caseId=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const copyCase=value=>JSON.parse(JSON.stringify(value));
function emptyCases(){return {version:2,children:[],activeChild:null,activeAssessment:null};}
function readCases(){const raw=localStorage.getItem(CASE_KEY);if(!raw)return emptyCases();const value=JSON.parse(raw);if(value.version!==2||!Array.isArray(value.children))throw Error('Invalid case store');return value;}
let cases=emptyCases(),caseStorageBlocked=false;
function caseFailure(){caseStorageBlocked=true;$('message').textContent='تعذر حفظ بيانات الحالة على الجهاز. أبقِ التطبيق مفتوحاً وصدّر التقرير قبل المغادرة.';}
function writeCases(next){try{localStorage.setItem(CASE_KEY,JSON.stringify(next));cases=next;caseStorageBlocked=false;window.dispatchEvent(new Event('articulation-cases-saved'));return true;}catch{caseFailure();return false;}}
function activeChild(){return cases.children.find(child=>child.id===cases.activeChild);}
function activeAssessment(){return activeChild()?.assessments.find(item=>item.id===cases.activeAssessment);}
function caseDate(item){const d=item.state.meta.assessment||{};return [d.year,d.month?.padStart(2,'0'),d.day?.padStart(2,'0')].filter(Boolean).join('-')||item.createdAt.slice(0,10);}
function caseDateLabel(item){return caseDate(item)+' · '+new Date(item.createdAt).toLocaleTimeString('ar-SY',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+(item.syncConflictOf?' · نسخة متزامنة':'');}
function newAssessmentRecord(meta={}){const defaults=freshState();return {id:caseId(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),cursor:0,state:{...defaults,meta:{...defaults.meta,...meta,assessment:localToday()}}};}
function initializeCases(){
 try{
  cases=readCases();
  // Import the former draft once; remove its duplicate only after a successful save.
  if(!localStorage.getItem(CASE_KEY)&&saving){
   const record=newAssessmentRecord();record.state=copyCase(state);
   const child={id:caseId(),name:state.meta.childName?.trim()||'حالة محفوظة',createdAt:new Date().toISOString(),avatar:'leaf',assessments:[record]};
   if(!writeCases({...cases,children:[child],activeChild:child.id,activeAssessment:record.id}))return;
   localStorage.removeItem(KEY);
  }
  const record=activeAssessment();
  if(record){state=copyCase(record.state);state.meta.childName=activeChild().name;selectedProbe=record.cursor||0;}
  else{state=freshState();cases.activeChild=null;cases.activeAssessment=null;}
  saving=true;
 }catch{caseFailure();}
}
function saveCase(){
 if(!cases.activeChild)return false;
 try{
  const latest=readCases(),child=latest.children.find(child=>child.id===cases.activeChild),record=child?.assessments.find(item=>item.id===cases.activeAssessment);
  // A deleted child or a selection changed in another tab cannot be resurrected.
  if(!record||latest.activeChild!==cases.activeChild||latest.activeAssessment!==cases.activeAssessment){$('message').textContent='تغيرت الحالة في نافذة أخرى. افتح الحسابات لاختيارها مجدداً.';return false;}
  if(typeof diagnosticSignature==='function'&&diagnosticSignature(record.state)!==diagnosticSignature(state)){state.meta.diagnosisReviewed=false;if($('diagnosisReviewed'))$('diagnosisReviewed').checked=false;}
  record.state=copyCase(state);record.state.meta.childName=child.name;record.cursor=selectedProbe;record.updatedAt=new Date().toISOString();
  if(!writeCases(latest))return false;
  $('saveStatus').textContent='تم الحفظ على الجهاز';return true;
 }catch{caseFailure();return false;}
}
function selectCase(childId,assessmentId){
 if(cases.activeChild&&!saveCase())return false;
 try{const latest=readCases(),child=latest.children.find(child=>child.id===childId),record=child?.assessments.find(item=>item.id===assessmentId)||child?.assessments.at(-1);if(!record)return false;
  if(!writeCases({...latest,activeChild:childId,activeAssessment:record.id}))return false;
  state=copyCase(record.state);state.meta.childName=child.name;selectedProbe=record.cursor||0;notePanels.clear();reportSourceId=null;comparisonSelection=null;renderMeta();renderTrials();refreshHome();return true;
 }catch{caseFailure();return false;}
}
function createChild(name){
 name=name.trim();if(!name)return false;
 if(cases.activeChild&&!saveCase())return false;
 try{const latest=readCases(),record=newAssessmentRecord({childName:name}),child={id:caseId(),name,createdAt:new Date().toISOString(),avatar:['leaf','star','heart','flower'][latest.children.length%4],assessments:[record]};
  if(!writeCases({...latest,children:[...latest.children,child],activeChild:child.id,activeAssessment:record.id}))return false;
  state=copyCase(record.state);selectedProbe=0;reportSourceId=null;comparisonSelection=null;renderMeta();renderTrials();refreshHome();return true;
 }catch{caseFailure();return false;}
}
function startNewAssessment(){
 if(!activeChild()||!saveCase())return;
 const meta=state.meta,keep={};
 for(const key of ['childName','recordId','dob','examiner','informant','dialect','languages','participantCode','sex','country','region','sampleSource','languageExposure','etiology','researchConsent','referenceReviewed'])if(meta[key])keep[key]=copyCase(meta[key]);
 const record=newAssessmentRecord(keep),next=copyCase(cases);next.children.find(c=>c.id===next.activeChild).assessments.push(record);next.activeAssessment=record.id;
 if(!writeCases(next))return;
 state=copyCase(record.state);selectedProbe=0;reportSourceId=null;comparisonSelection=null;notePanels.clear();renderMeta();renderTrials();closeDialog($('resetDialog'));showPage('details');
}
function deleteChild(id){
 try{const latest=readCases();latest.children=latest.children.filter(child=>child.id!==id);if(latest.activeChild===id){latest.activeChild=null;latest.activeAssessment=null;}
  if(!writeCases(latest))return false;
  if(!activeChild()){state=freshState();selectedProbe=0;reportSourceId=null;comparisonSelection=null;renderMeta();renderTrials();showPage('home');}
  refreshHome();return true;
 }catch{caseFailure();return false;}
}
window.addEventListener('storage',event=>{
 if(event.key!==CASE_KEY)return;
 try{cases=readCases();const record=activeAssessment();state=record?copyCase(record.state):freshState();selectedProbe=record?.cursor||0;reportSourceId=null;comparisonSelection=null;document.querySelectorAll('dialog[open]').forEach(closeDialog);renderMeta();renderTrials();showPage('home');refreshHome();$('message').textContent='تم تحديث الحالات من نافذة أخرى.';}catch{caseFailure();}
});
