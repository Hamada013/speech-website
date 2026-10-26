(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ArticulationCloudModel=api;})(globalThis,function(){
 'use strict';
 const clone=value=>JSON.parse(JSON.stringify(value));
 const tombstone=value=>({kind:value.kind,childId:value.childId,deleted:true,data:{id:value.data.id}});
 const stable=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
 function entities(store){const out={};for(const child of store.children){const {assessments,...info}=child;out['c-'+child.id]={kind:'child',childId:child.id,data:info};for(const record of assessments)out['a-'+record.id]={kind:'assessment',childId:child.id,data:record};}return out;}
 function reconcile(local,remote,base,newId){
  const result=clone(remote),conflicts=[];
  for(const key of new Set([...Object.keys(local),...Object.keys(base)])){
   const old=base[key],here=local[key]||(old?tombstone(old):undefined),there=remote[key];
   if(stable(here)===stable(old))continue;
   if(stable(there)===stable(old)||stable(here)===stable(there)||!there){result[key]=clone(here);continue;}
   // Concurrent edits retain both complete assessments instead of losing responses.
   if(here?.kind==='assessment'&&!here.deleted&&!there.deleted){const id=newId(),copy=clone(here);copy.data.id=id;copy.data.syncConflictOf=here.data.id;result['a-'+id]=copy;conflicts.push({from:here.data.id,to:id});}
   else if(here?.deleted||there.deleted)result[key]=tombstone(here||there);
   else result[key]=clone(here);
  }
  // A remote child deletion wins over an unchanged local copy. Preserve concurrent
  // local assessment edits as a separate recovered child, never resurrect the ID.
  for(const [key,item] of Object.entries(result))if(item.kind==='child'&&item.deleted){
   const changed=new Map();
   for(const source of [remote,local])for(const [id,v] of Object.entries(source))if(v.kind==='assessment'&&v.childId===item.childId&&!v.deleted&&stable(v)!==stable(base[id]))changed.set(stable(v),v);
   if(changed.size){const childId=newId();result['c-'+childId]={kind:'child',childId,data:{...clone(local[key]?.data||remote[key]?.data||item.data),id:childId,name:(local[key]?.data.name||remote[key]?.data.name||'حالة محفوظة')+' · نسخة محفوظة'}};for(const v of changed.values()){const copy=clone(v),id=newId();copy.childId=childId;copy.data.id=id;copy.data.syncConflictOf=v.data.id;result['a-'+id]=copy;conflicts.push({from:v.data.id,to:id});}}
   for(const [id,v] of Object.entries(result))if(v.kind==='assessment'&&v.childId===item.childId)result[id]=tombstone(v);
  }
  for(const [key,item] of Object.entries(result))if(item.deleted)result[key]=tombstone(item);
  return {entities:result,conflicts};
 }
 function storeFromEntities(all,previous){const children=Object.values(all).filter(v=>v.kind==='child'&&!v.deleted).map(v=>({...clone(v.data),assessments:Object.values(all).filter(a=>a.kind==='assessment'&&!a.deleted&&a.childId===v.childId).map(a=>clone(a.data)).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id))}));const child=children.find(c=>c.id===previous.activeChild),assessment=child?.assessments.find(a=>a.id===previous.activeAssessment);return {version:2,children,activeChild:assessment?child.id:null,activeAssessment:assessment?assessment.id:null};}
 return {entities,reconcile,storeFromEntities,stable};
});
