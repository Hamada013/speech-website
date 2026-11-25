// Google sign-in and cloud sync (Firebase project speech-apps-5d3b0) were removed on 2026-11-25.
// While a Google account was signed in, this device kept its cases under 'articulation-cases-google-<account>'
// instead of the device's own store ('articulation-cases-v2'). Once per device, every such account space is merged
// back into the device's own store, so no case is hidden after the sign-in button is gone:
// - children are matched by id; a matching assessment keeps the newer copy (updatedAt); nothing is deleted;
// - the account spaces stay in storage as a backup, and are listed as merged so a child deleted later never returns;
// - if the store is full, the sync baselines (copies kept only for syncing) are dropped and the save is tried again;
// - if the merge cannot be saved, it returns false and the app keeps reading the signed-in account's space as before.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ArticulationRetiredSync=api;})(globalThis,function(){
 'use strict';
 const LOCAL='articulation-cases-v2',SPACE='articulation-cases-google-',DONE='articulation-cases-merged-spaces';
 const OWNER='articulation-cloud-owner',CLAIM='articulation-guest-claimed-by',BASELINE='articulation-cloud-baseline-';
 const clone=value=>JSON.parse(JSON.stringify(value));
 const keys=storage=>{const out=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key)out.push(key);}return out;};
 const parse=raw=>{try{const value=raw?JSON.parse(raw):null;return value&&value.version===2&&Array.isArray(value.children)?value:null;}catch{return null;}};
 function mergeAccountSpaces(storage){
  let done=[];try{done=JSON.parse(storage.getItem(DONE))||[];}catch{}
  const owner=storage.getItem(OWNER)||'';
  // The signed-in account first: its space is what the app was showing.
  const spaces=keys(storage).filter(key=>key.startsWith(SPACE)&&!done.includes(key)).sort((a,b)=>(b===SPACE+owner)-(a===SPACE+owner));
  if(!spaces.length){storage.removeItem(OWNER);storage.removeItem(CLAIM);return true;}
  const raw=storage.getItem(LOCAL),local=raw?parse(raw):{version:2,children:[],activeChild:null,activeAssessment:null};
  if(!local)return false;// The device's own store is unreadable: change nothing.
  for(const key of spaces){
   const space=parse(storage.getItem(key));if(!space)continue;// Unreadable: left untouched, not listed as merged.
   for(const child of space.children){
    const mine=local.children.find(item=>item.id===child.id);
    if(!mine){local.children.push(clone(child));continue;}
    mine.assessments||=[];
    for(const record of child.assessments||[]){
     const at=mine.assessments.findIndex(item=>item.id===record.id);
     if(at<0)mine.assessments.push(clone(record));
     else if(String(record.updatedAt||'')>String(mine.assessments[at].updatedAt||''))mine.assessments[at]=clone(record);
    }
    mine.assessments.sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
   }
   if(key===SPACE+owner&&space.activeChild){local.activeChild=space.activeChild;local.activeAssessment=space.activeAssessment;}
   done.push(key);
  }
  if(!local.children.some(child=>child.id===local.activeChild)){local.activeChild=null;local.activeAssessment=null;}
  const save=()=>{storage.setItem(LOCAL,JSON.stringify(local));storage.setItem(DONE,JSON.stringify(done));};
  try{save();}catch{
   for(const key of keys(storage))if(key.startsWith(BASELINE))storage.removeItem(key);
   try{save();}catch{return false;}
  }
  storage.removeItem(OWNER);storage.removeItem(CLAIM);
  return true;
 }
 return {mergeAccountSpaces,LOCAL,SPACE,DONE};
});
