const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx={console};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['data','stimuli','review','manual-data','manual','barriers-data','transitions-data','task-analysis-data','model','iep-curriculum','iep','report'])vm.runInContext(fs.readFileSync(path.join(root,`assets/${f}.js`),'utf8'),ctx);
const {VBModel:M,VB_DATA:D,VBIEP:I,VBReport:R}=ctx,all=M.allMilestones(D),set=(s,id,v)=>M.setScore(s,'milestones',all.find(i=>i.id===id),v);
let s=M.blank();const original=JSON.stringify(s);assert.ok(I.build(s,D).profiles.every(p=>p.status==='assess'));assert.equal(JSON.stringify(s),original);assert.equal(I.draft(s,D,'m1-1','en'),null);
set(s,'m1-5',1);set(s,'m1-3',0);assert.equal(I.build(s,D).profiles[0].status,'assess');assert.equal(I.build(s,D).profiles[0].item.id,'m1-1');
set(s,'m1-1',.5);let p=I.build(s,D).profiles[0];assert.equal(p.stage,0);assert.equal(p.status,'draft');assert.equal(p.evidence[0].value,.5);
const draft=I.draft(s,D,'m1-1','en');assert.equal(draft.selected,false);assert.equal(draft.criteriaReview,'');assert.match(draft.goal,/12 months/);assert.match(draft.support,/level1-text-1:Mand:0/);assert.equal(s.goals['m1-1'],undefined);
s.goals['m1-1']=draft;assert.equal(I.draft(s,D,'m1-1','en'),null);s.goals['m1-1'].goal='Edited annual goal';s.goals['m1-1'].selected=true;assert.equal(M.normalize(s).goals['m1-1'].goal,'Edited annual goal');assert.match(R.make(s,D).text,/Edited annual goal/);
let zero=M.blank();for(const i of all.filter(i=>i.level===1&&['Mand','Tact'].includes(i.category)))M.setScore(zero,'milestones',i,0);
assert.equal(I.build(zero,D).mandAbsent,true);assert.equal(I.build(zero,D).profiles.find(p=>p.category==='Tact').sequenceReview,true);
set(zero,'m1-1',1);assert.equal(I.build(zero,D).mandAbsent,false);
let mastered=M.blank();for(const i of all.filter(i=>i.level===1))M.setScore(mastered,'milestones',i,1);assert.ok(I.build(mastered,D,{level:1}).profiles.every(p=>p.status==='complete'));assert.equal(I.draft(mastered,D,'t1-5','ar'),null);
let mand=M.blank();for(let n=1;n<=3;n++)set(mand,'m1-'+n,1);set(mand,'m1-4',0);assert.equal(I.build(mand,D).profiles[0].status,'source-pending');
const next=M.startFollowup(zero);assert.ok(I.build(next,D).profiles.every(p=>p.status==='assess'));assert.equal(I.build(next,D).coverage.milestones.assessed,0);
const pending=M.normalize(s);pending.scoreReviews['m1-1']='outdated-criteria';assert.equal(M.hasScore(pending,'milestones',all.find(i=>i.id==='m1-1')),false);assert.equal(I.build(pending,D).profiles[0].status,'assess');
set(next,'t1-1',0);assert.match(I.draft(next,D,'t1-1','ar').goal,/12 شهراً/);assert.equal(I.source.received,3);assert.equal(I.source.expected,3);
// Expanded text 1 adds four domains without counting as a second source.
assert.equal(I.build(M.blank(),D).profiles.length,16);
for(const category of ['Social','Imitation','Echoic','Vocal']){
 const items=all.filter(i=>i.level===1&&i.category===category).sort((a,b)=>a.milestone-b.milestone);
 assert.equal(I.rules[category].length,6);
 for(let stage=0;stage<5;stage++){
  const child=M.blank();for(let n=0;n<stage;n++)M.setScore(child,'milestones',items[n],1);
  M.setScore(child,'milestones',items[stage],0);
  const profile=I.build(child,D).profiles.find(p=>p.category===category);
  assert.equal(profile.stage,stage);assert.equal(profile.status,'draft');assert.equal(profile.item.id,items[stage].id);
  const before=JSON.stringify(child),draftEn=I.draft(child,D,items[stage].id,'en'),draftAr=I.draft(child,D,items[stage].id,'ar');
  assert.equal(JSON.stringify(child),before);assert.match(draftEn.support,new RegExp('level1-text-1:'+category+':'+stage));assert.match(draftEn.support,/2026-10-29-v2/);assert.match(draftAr.goal,/[\u0600-\u06ff]/);
  assert.doesNotMatch(draftEn.goal,/cause-and-effect play/);assert.equal(draftEn.selected,false);
 }
}
assert.equal(I.source.received,3);assert.equal(I.source.expected,3);
// All 125 Level 2/3 milestones have placement and source annual examples.
assert.equal(I.sources.length,3);
assert.equal(Object.keys(I.curriculum.sections[2]).length,12);
assert.equal(Object.keys(I.curriculum.sections[3]).length,13);
for(const target of all.filter(i=>i.level>1)){
 const child=M.blank();child.child.name='Mapped child';
 for(const earlier of all.filter(i=>i.category===target.category&&i.milestone<target.milestone))M.setScore(child,'milestones',earlier,1);
 M.setScore(child,'milestones',target,0);
 const state=JSON.stringify(child),profile=I.build(child,D).profiles.find(p=>p.category===target.category);
 assert.equal(profile.item.id,target.id);assert.equal(profile.level,target.level);assert.equal(profile.status,'draft',target.id);
 assert.ok(profile.guidance.en&&profile.guidance.ar&&profile.annual.en&&profile.annual.ar,target.id);
 const plan=I.draft(child,D,target.id,'en');assert.match(plan.support,new RegExp('level'+target.level+'-text-'+target.level));assert.match(plan.support,new RegExp('Baseline: '+target.id+' = 0'));assert.ok(plan.goal.includes(M.itemText(target,child,'en')));assert.match(plan.support,/Source annual example to adapt:/);assert.equal(JSON.stringify(child),state);
 child.goals[target.id]={...plan,goal:'Preserve reviewed edit'};assert.equal(I.draft(child,D,target.id,'ar'),null);assert.equal(M.normalize(child).goals[target.id].goal,'Preserve reviewed edit');
 if(target.level===3&&['Reading','Writing','Linguistics'].includes(target.category))assert.match(plan.support,/not Arabic norms/);
 if(M.halfAllowed(target)){
  M.setScore(child,'milestones',target,.5);assert.equal(I.build(child,D).profiles.find(p=>p.category===target.category).status,'draft');
 }
 const previous=all.find(i=>i.category===target.category&&i.milestone<target.milestone);
 if(previous){
  M.clearScore(child,'milestones',previous.id);
  const blocked=I.build(child,D,{level:target.level}).profiles.find(p=>p.category===target.category);
  assert.ok(blocked.status==='prerequisites'||blocked.status==='assess');assert.equal(I.draft(child,D,target.id,'en'),null);
 }
}
const mixed=M.blank();for(const i of all.filter(i=>i.category==='Tact'&&i.milestone<9))M.setScore(mixed,'milestones',i,1);set(mixed,'t2-9',.5);set(mixed,'m1-1',0);
assert.equal(I.build(mixed,D).profiles.find(p=>p.category==='Tact').level,2);assert.equal(I.build(mixed,D).profiles.find(p=>p.category==='Mand').level,1);
assert.deepEqual([1,2,3].map(level=>I.build(M.blank(),D,{level}).profiles.length),[9,12,13]);
const full=M.blank();for(const i of all)M.setScore(full,'milestones',i,1);assert.ok(I.build(full,D).profiles.every(p=>p.status==='complete'));
const emerging=M.blank(),lastListener=all.find(i=>i.category==='Listener'&&i.milestone===15);for(const i of all.filter(i=>i.category==='Listener'&&i.milestone<15))M.setScore(emerging,'milestones',i,1);M.setScore(emerging,'milestones',lastListener,.5);assert.ok(I.draft(emerging,D,lastListener.id,'en').goal.includes(M.itemText(lastListener,emerging,'en')));
console.log('PASS: all three sources, 125 Level 2/3 mappings, unknown/half/review scores, prerequisite gaps, zero-score sequencing, preserved drafts, report inclusion and current-visit isolation.');
