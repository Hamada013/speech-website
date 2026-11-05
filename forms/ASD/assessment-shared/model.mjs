export const MCHAT_YES_CONCERN = new Set(['11','18','20','22']);
export function todayLocal(date=new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function validDate(value) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;
 const [y,m,d]=value.split('-').map(Number),date=new Date(y,m-1,d);
 return date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d;
}
export function ageMonths(dob,date) {
 if(!validDate(dob)||!validDate(date)||dob>date)return null;
 const [by,bm,bd]=dob.split('-').map(Number),[y,m,d]=date.split('-').map(Number);
 return (y-by)*12+m-bm-(d<bd?1:0);
}
export function concern(id,answer) { return answer==='yes'||answer==='no' ? (MCHAT_YES_CONCERN.has(String(id)) ? answer==='yes' : answer==='no') : null; }
export function mchatSummary(session) {
 const answers=Array.from({length:23},(_,i)=>concern(String(i+1),session.answers[String(i+1)]));
 const answered=answers.filter(v=>v!==null).length,score=answers.filter(v=>v===true).length;
 const age=ageMonths(session.meta.dob,session.meta.date),complete=answered===23;
 const eligible=complete&&session.meta.date<=todayLocal()&&age!==null&&age>=16&&age<=30&&session.meta.respondent==='parent'&&session.meta.official===true;
 return {answered,score,other:answered-score,missing:23-answered,age,complete,eligible,band:eligible?(score>=8?'high':score>=3?'followup':'low'):null};
}
export function blafSummary(session,items) {
 const values=items.map(i=>({id:i.id,score:session.answers[i.id]})).filter(i=>Number.isInteger(i.score)&&i.score>=1&&i.score<=5);
 return {answered:values.length,missing:items.length-values.length,complete:values.length===items.length,values};
}
export function newSession(kind) {
 return {version:1,id:crypto.randomUUID(),kind,status:'draft',stage:'details',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),index:0,answers:{},observations:{},meta:{child:'',clinician:'',dob:'',date:todayLocal(),respondent:'',official:false,notes:''}};
}
export function validSession(session,config) {
 if(!session||session.version!==1||session.kind!==config.kind||typeof session.id!=='string'||!['draft','complete','partial'].includes(session.status)||!session.meta||!Number.isInteger(session.index)||session.index<0||session.index>=config.items.length)return false;
 if(!['child','clinician','dob','date','respondent','notes'].every(k=>typeof session.meta[k]==='string')||typeof session.meta.official!=='boolean')return false;
 if(session.stage!==undefined&&!['details','questions'].includes(session.stage))return false;
 if(!session.answers||typeof session.answers!=='object'||Array.isArray(session.answers)||!session.observations||typeof session.observations!=='object'||Array.isArray(session.observations))return false;
 const ids=new Set(config.items.map(i=>i.id));
 return Object.entries(session.answers).every(([id,a])=>ids.has(id)&&(a===null||(config.kind==='mchat'?['yes','no'].includes(a):Number.isInteger(a)&&a>=1&&a<=5)))&&Object.entries(session.observations).every(([id,note])=>ids.has(id)&&typeof note==='string')&&(!(session.status==='complete')||(config.kind==='mchat'?mchatSummary(session).complete:blafSummary(session,config.items).complete));
}
