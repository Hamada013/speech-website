(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ArticulationResearch=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const VERSION='articulation-research-v2',PROTOCOL='arabic-articulation-84-v2';
 const CASE_COLUMNS=['assessment_id','child_id','participant_code','child_name','date_of_birth','assessment_date','age_months','sex','country','region','reference_dialect','languages','language_exposure','sample_source','research_consent','examiner','hearing','oral_mechanism','known_factors','procedure','caregiver_consent','reference_reviewed','recorded_items','scored_items','correct_items','error_items','accuracy','diagnostic_suggestion','diagnosis_override','effective_impression','clinician_reviewed','created_at','updated_at','protocol_version','exported_at','metadata_json'];
 const FINDING_COLUMNS=['finding_id','assessment_id','child_id','participant_code','assessment_date','age_months','sex','country','region','dialect','sample_source','research_consent','probe_id','letter_group','sound_ipa','position','stimulus_word','reference_ipa','production_ipa','status','elicitation','replacement_ipa','stimulability','note','note_en','reference_reviewed','modified_stimulus','recorded','scored','correct','error','protocol_version','reference_key','exported_at'];
 const SOURCE_COLUMNS=['source_account_id','source_account_email','source_sign_in','source_device_id','source_app_origin','source_verified'];
 CASE_COLUMNS.push(...SOURCE_COLUMNS);FINDING_COLUMNS.push(...SOURCE_COLUMNS);
 const STATUSES=['correct','substitution','omission','distortion','addition','dialect','unelicited','skipped','unrecorded'];
 const SCORED=STATUSES.slice(0,5),ERRORS=STATUSES.slice(1,5),own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const iso=d=>{if(!d)return '';const digits=s=>String(s||'').replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).replace(/[۰-۹]/g,c=>c.charCodeAt(0)-1776),y=+digits(d.year),m=+digits(d.month),day=+digits(d.day),date=new Date(Date.UTC(y,m-1,day));return y>=1900&&y<2200&&date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===day?`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`:'';};
 function ageMonths(dob,assessment){const a=iso(dob),b=iso(assessment);if(!a||!b||a>b)return null;const [ay,am,ad]=a.split('-').map(Number),[by,bm,bd]=b.split('-').map(Number);return (by-ay)*12+bm-am-(bd<ad?1:0);}
 function hash(value){let n=2166136261;for(const c of value){n^=c.codePointAt(0);n=Math.imul(n,16777619);}return (n>>>0).toString(16).padStart(8,'0');}
 const clean=v=>v===undefined||v===null?'':typeof v==='string'?v:String(v);
 function createPayload(child,probes,options={}){
  if(!child||!Array.isArray(child.assessments)||!child.id)throw Error('Invalid child');
  const exportedAt=options.exportedAt||new Date().toISOString(),caseRows=[],findingRows=[];
  for(const record of child.assessments){
   const state=record.state||{},m=state.meta||{},trials=state.trials||{},date=iso(m.assessment),age=ageMonths(m.dob,m.assessment),participant=clean(m.participantCode)||'P-'+child.id;
   const metadata=JSON.parse(JSON.stringify(m));if(!options.identifiers){delete metadata.childName;delete metadata.dob;delete metadata.recordId;}
   const stats={recorded:0,scored:0,correct:0,errors:0};
   for(const p of probes){
    const r=trials[p.id]||{},status=STATUSES.slice(0,8).includes(r.status)?r.status:'unrecorded',recorded=status!=='unrecorded',scored=SCORED.includes(status),correct=status==='correct',error=ERRORS.includes(status);
    const target=own(r,'targetIPA')?r.targetIPA:p.targetIPA,word=r.word||p.spoken||p.word,reference=own(r,'expected')?r.expected:p.reference,reviewed=m.referenceReviewed===true;
    stats.recorded+=+recorded;stats.scored+=+scored;stats.correct+=+correct;stats.errors+=+error;
    findingRows.push([record.id+':'+p.id,record.id,child.id,participant,date,age,clean(m.sex),clean(m.country),clean(m.region),clean(m.dialect),clean(m.sampleSource),clean(m.researchConsent),p.id,p.sound.letter,clean(target),['أول الكلمة','وسط الكلمة','آخر الكلمة'].indexOf(p.position)===0?'initial':p.position==='وسط الكلمة'?'medial':'final',word,clean(reference),clean(r.productionIPA),status,r.mode||(recorded?'naming':''),clean(r.actualIPA||r.actual),clean(r.stimulability),clean(r.note),clean(r.noteEn),+reviewed,+(word!==(p.spoken||p.word)||reference!==p.reference||target!==p.targetIPA),+recorded,+scored,+correct,+error,PROTOCOL,hash(JSON.stringify([p.id,word,reference,target])),exportedAt]);
   }
   const d=options.diagnose?options.diagnose(state):{suggestion:'',effective:m.diagnosisOverride||'',clinicianReviewed:m.diagnosisReviewed===true};
   caseRows.push([record.id,child.id,participant,options.identifiers?child.name:'',options.identifiers?iso(m.dob):'',date,age,clean(m.sex),clean(m.country),clean(m.region),clean(m.dialect),clean(m.languages),clean(m.languageExposure),clean(m.sampleSource),clean(m.researchConsent),clean(m.examiner),clean(m.hearing),clean(m.oral),clean(m.etiology),clean(m.procedure),clean(m.consent),+(m.referenceReviewed===true),stats.recorded,stats.scored,stats.correct,stats.errors,stats.scored?stats.correct/stats.scored:null,clean(d.suggestion),clean(m.diagnosisOverride),clean(d.effective),+(m.diagnosisReviewed===true),record.createdAt,record.updatedAt,PROTOCOL,exportedAt,JSON.stringify(metadata)]);
  }
  const source=options.source||{},values=[clean(source.accountId)||'unattributed',clean(source.email),source.signIn==='google'?'google':'guest',clean(source.deviceId),clean(source.origin),+(source.verified===true)];
  for(const row of [...caseRows,...findingRows])row.push(...values);
  return {schema:VERSION,caseColumns:CASE_COLUMNS,findingColumns:FINDING_COLUMNS,caseRows,findingRows,exportedAt,identifiersIncluded:!!options.identifiers};
 }
 function normalize(payload){
  if(payload?.schema==='articulation-research-v1'&&payload.caseColumns?.length===36&&payload.findingColumns?.length===34)return {...payload,schema:VERSION,caseColumns:CASE_COLUMNS,findingColumns:FINDING_COLUMNS,caseRows:payload.caseRows.map(r=>[...r,'unattributed','','legacy','','',0]),findingRows:payload.findingRows.map(r=>[...r,'unattributed','','legacy','','',0])};
  return payload;
 }
 function validate(payload){
  payload=normalize(payload);
  if(payload?.schema!==VERSION||JSON.stringify(payload.caseColumns)!==JSON.stringify(CASE_COLUMNS)||JSON.stringify(payload.findingColumns)!==JSON.stringify(FINDING_COLUMNS))throw Error('Unsupported research schema');
  if(!Array.isArray(payload.caseRows)||!Array.isArray(payload.findingRows)||payload.caseRows.length>2000||payload.findingRows.length>168000)throw Error('Invalid research batch size');
  const cases=new Map(),seen=new Set();
  for(const row of payload.caseRows){if(row.length!==CASE_COLUMNS.length||!row[0]||!row[1]||cases.has(row[0]))throw Error('Invalid assessment row');cases.set(row[0],row);}
  const counts=new Map();
  for(const row of payload.findingRows){
   if(row.length!==FINDING_COLUMNS.length||!cases.has(row[1])||row[2]!==cases.get(row[1])[1]||row[0]!==row[1]+':'+row[12]||seen.has(row[0])||!STATUSES.includes(row[19])||!/^s(?:[1-9]|1\d|2[0-8])-[0-2]$/.test(row[12]))throw Error('Invalid finding row');
   const flags=[+(row[19]!=='unrecorded'),+SCORED.includes(row[19]),+(row[19]==='correct'),+ERRORS.includes(row[19])];
   if(flags.some((value,index)=>row[27+index]!==value))throw Error('Outcome flags do not match recorded status');
   seen.add(row[0]);counts.set(row[1],(counts.get(row[1])||0)+1);
  }
  for(const id of cases.keys())if(counts.get(id)!==84)throw Error('Each assessment must contain all 84 item records');
  if([...payload.caseRows,...payload.findingRows].some(row=>row.some(value=>typeof value==='object'&&value!==null||typeof value==='string'&&value.length>50000)))throw Error('Invalid cell data');
  return payload;
 }
 function merge(existing,incoming){
  incoming=validate(incoming);if(existing)existing=validate(existing);
  const assessmentIds=new Set(incoming.caseRows.map(r=>r[0]));
  const caseRows=[...(existing?.caseRows||[]).filter(r=>!assessmentIds.has(r[0])),...incoming.caseRows].sort((a,b)=>String(a[36]).localeCompare(String(b[36]))||String(a[2]).localeCompare(String(b[2]))||String(a[5]).localeCompare(String(b[5]))||String(a[31]).localeCompare(String(b[31]))||String(a[0]).localeCompare(String(b[0])));
  const findingRows=[...(existing?.findingRows||[]).filter(r=>!assessmentIds.has(r[1])),...incoming.findingRows].sort((a,b)=>String(a[1]).localeCompare(String(b[1]))||String(a[12]).localeCompare(String(b[12]),undefined,{numeric:true}));
  const result={...incoming,caseRows,findingRows};validate(result);return result;
 }
 function empty(){return {schema:VERSION,caseColumns:CASE_COLUMNS,findingColumns:FINDING_COLUMNS,caseRows:[],findingRows:[],exportedAt:'',identifiersIncluded:false};}
 return {VERSION,PROTOCOL,SOURCE_COLUMNS,normalize,CASE_COLUMNS,FINDING_COLUMNS,STATUSES,SCORED,ERRORS,ageMonths,createPayload,validate,merge,empty};
});
