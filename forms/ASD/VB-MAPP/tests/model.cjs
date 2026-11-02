const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),context={console,crypto};context.window=context;vm.createContext(context);
for(const file of ['data','stimuli','review','manual-data','manual','barriers-data','transitions-data','task-analysis-data','model','report','pdf-data'])vm.runInContext(fs.readFileSync(path.join(root,`assets/${file}.js`),'utf8'),context);
const {VBModel:M,VB_DATA:D,VBReport:R,VBPDFData:P}=context,items=M.allMilestones(D),state=M.blank();
// Barriers use the supplied item-specific 0–4 criteria, preserving old raw scores for review.
assert.equal(D.barriers.length,24);
const barrierState=M.blank();
for(const item of D.barriers){
 assert.equal(item.criteria.length,5);
 for(let value=0;value<=4;value++){
  assert.equal(item.criteria[value].score,value);
  for(const lang of ['en','ar'])assert.ok(item.criteria[value][lang].trim());
  M.setScore(barrierState,'barriers',item,value);assert.equal(M.hasScore(barrierState,'barriers',item),true);
 }
 M.clearScore(barrierState,'barriers',item.id);assert.equal(M.hasScore(barrierState,'barriers',item),false);
 barrierState.scores.barriers[item.id]=3;delete barrierState.scoreReviews[item.id];
 assert.equal(M.hasScore(barrierState,'barriers',item),false);
 assert.equal(barrierState.scores.barriers[item.id],3);
}
// Transition summaries preserve Protocol gaps rather than inventing conversion bands.
assert.equal(D.transitions.length,18);
const transitionState=M.blank();
for(const item of D.transitions){
 assert.ok(item.guidance.length);
 if(item.derivedFrom){assert.equal(M.eligible(item,transitionState),false);continue;}
 for(const entry of item.guidance)for(const lang of ['en','ar'])assert.ok(entry.text[lang].trim());
 assert.equal(item.guidance.length,5);
 assert.equal(M.needsCriteria(item),false);
 assert.deepEqual(Array.from(item.guidance,g=>g.label.en),['1','2','3','4','5']);
 for(let value=1;value<=5;value++){
  M.setScore(transitionState,'transitions',item,value);assert.equal(M.hasScore(transitionState,'transitions',item),true);
 }
 assert.throws(()=>M.setScore(transitionState,'transitions',item,0));
 M.clearScore(transitionState,'transitions',item.id);assert.equal(M.hasScore(transitionState,'transitions',item),false);
}
// Automatic Transition totals require complete, currently valid source sections.
const autoState=M.blank(),histBefore=JSON.stringify(autoState.history);
M.syncTransitionTotals(autoState,D);assert.equal(Object.keys(autoState.scores.transitions).length,0);
for(const item of M.allMilestones(D))M.setScore(autoState,'milestones',item,0);
for(const item of D.barriers)M.setScore(autoState,'barriers',item,0);
M.syncTransitionTotals(autoState,D);assert.equal(autoState.scores.transitions['tr-1'],1);assert.equal(autoState.scores.transitions['tr-2'],5);
assert.equal(D.transitions.find(i=>i.id==='tr-1').derivedItems.length,170);
for(const item of M.allMilestones(D))M.setScore(autoState,'milestones',item,1);
for(const item of D.barriers)M.setScore(autoState,'barriers',item,4);
M.syncTransitionTotals(autoState,D);assert.equal(autoState.scores.transitions['tr-1'],5);assert.equal(autoState.scores.transitions['tr-2'],1);
M.clearScore(autoState,'milestones',M.allMilestones(D)[0].id);
M.syncTransitionTotals(autoState,D);assert.equal(M.hasScore(autoState,'transitions',D.transitions[0]),false);
assert.equal(JSON.stringify(autoState.history),histBefore);
assert.deepEqual(Object.keys(M.normalize(autoState).scores.transitions).sort(),['tr-1','tr-2']);
for(const [total,expected]of [[0,1],[25,1],[25.5,2],[50,2],[50.5,3],[100,3],[100.5,4],[135,4],[135.5,5],[170,5]]){
 const x=M.blank();let remaining=total;
 for(const item of M.allMilestones(D)){const value=remaining>=1?1:remaining===.5&&M.halfAllowed(item)?.5:0;M.setScore(x,'milestones',item,value);remaining-=value;}
 assert.equal(remaining,0);M.syncTransitionTotals(x,D);assert.equal(x.scores.transitions['tr-1'],expected,`Milestone conversion ${total}`);
}
for(const [total,expected]of [[0,5],[10,5],[11,4],[20,4],[21,3],[30,3],[31,2],[55,2],[56,1],[96,1]]){
 const x=M.blank();let remaining=total;for(const item of D.barriers){const value=Math.min(4,remaining);M.setScore(x,'barriers',item,value);remaining-=value;}
 M.syncTransitionTotals(x,D);assert.equal(x.scores.transitions['tr-2'],expected,`Barrier conversion ${total}`);
}
const independentWork=D.transitions.find(i=>i.id==='tr-6');
assert.match(independentWork.guidance[1].text.en,/at least 1 minute/);
assert.match(independentWork.guidance[2].text.en,/at least 2 minutes/);
assert.match(independentWork.guidance[4].text.en,/at least 10 minutes/);
assert.match(D.transitions[9].guidance[0].text.en,/at least 10 minutes/);
assert.match(D.transitions[9].guidance[2].text.en,/5 or fewer maintenance trials/);
assert.match(D.transitions[10].guidance[3].text.en,/25 new intraverbals/);
assert.match(D.transitions[11].guidance[3].text.en,/10 topics or events/);
assert.match(D.transitions[14].guidance[3].text.en,/11 points/);
assert.equal(items.length,170);assert.equal(new Set(items.map(i=>i.id)).size,170);
assert.deepEqual([1,2,3].map(level=>items.filter(i=>i.level===level).length),[45,60,65]);
const noHalf=new Set(['l1-2','i2-10','iv2-7','r3-14']);
for(const item of items){
 assert.equal(M.eligible(item,state),true,`${item.id} must be immediately scoreable`);
 assert.equal(M.needsCriteria(item),false);
 for(const key of ['objective','application','scoring'])for(const lang of ['ar','en'])assert.ok(item.guide[key][lang]?.trim(),`${item.id} ${key} ${lang}`);
 assert.ok(item.sourcePages.length);
 assert.equal(M.halfAllowed(item),!noHalf.has(item.id),item.id);
 M.setScore(state,'milestones',item,0);assert.equal(M.hasScore(state,'milestones',item),true);
 M.clearScore(state,'milestones',item.id);assert.equal(M.hasScore(state,'milestones',item),false);
 if(M.halfAllowed(item)){M.setScore(state,'milestones',item,.5);assert.equal(M.hasScore(state,'milestones',item),true);}
 else assert.throws(()=>M.setScore(state,'milestones',item,.5));
 M.setScore(state,'milestones',item,1);
}
assert.equal(M.stats(state,items,'milestones').score,170);
const byId=id=>items.find(i=>i.id===id);
assert.match(byId('l2-9').scoring.en,/50 two-component/);assert.match(byId('l2-9').scoring.en,/25 two-component/);
assert.match(byId('l2-10').scoring.en,/selects 150 items/);
assert.match(byId('lr2-9').application.en,/25 different questions/);
assert.match(byId('i2-8').scoring.en,/½ point:.*5 two-component/);
assert.match(byId('e2-6').scoring.en,/50.*20.*Group 2/);
assert.match(byId('e2-10').scoring.en,/85.*10.*Groups 4 and 5/);
assert.match(byId('vp3-13').scoring.en,/½ point:.*20.*4 different parts/);
assert.match(byId('w3-12').scoring.en,/½ point:.*1\/2 inch/);
assert.ok(byId('s2-8').sourceNote&&byId('vp2-8').sourceNote);
// The user's Level I Mand text supplies all five complete tasks and conditions.
for(let n=1;n<=5;n++){
 const item=byId(`m1-${n}`);
 for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(item[field][lang].trim());
 assert.notEqual(item.guide.objective.en,item.text.en,'The objective is separate from the milestone target');
}
assert.match(byId('m1-1').scoring.en,/physical prompts are required/);
assert.match(byId('m1-2').scoring.en,/4 different reinforcers/);
assert.match(byId('m1-2').scoring.en,/3 of these types/);
assert.match(byId('m1-3').scoring.en,/6 mands across 2 people, 2 settings, and 2 examples/);
assert.match(byId('m1-3').scoring.en,/3 mands across 2 people, 2 settings, and 2 examples/);
assert.match(byId('m1-4').scoring.en,/5 times during a 1-hour/);
assert.match(byId('m1-4').scoring.en,/2 times during a 1-hour/);
assert.doesNotMatch(byId('m1-4').scoring.en,/different types|same word/);
assert.match(byId('m1-5').scoring.en,/10 different reinforcers/);
assert.match(byId('m1-5').scoring.en,/8 different mands/);
assert.match(byId('m1-5').scoring.en,/remove aversives/);
const superseded=M.blank();superseded.scores.milestones['m1-4']=.5;
assert.equal(M.hasScore(superseded,'milestones',byId('m1-4')),false);
assert.equal(M.normalize(superseded).scores.milestones['m1-4'],.5,'Keep the old result for review');
M.setScore(superseded,'milestones',byId('m1-4'),.5);assert.equal(M.hasScore(superseded,'milestones',byId('m1-4')),true);
// Tact Level I follows the supplied text; 4-M has no observation time limit.
for(let n=1;n<=5;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`t1-${n}`)[field][lang].trim());
assert.match(byId('t1-1').scoring.en,/2 items without echoic prompts/);
assert.match(byId('t1-1').scoring.en,/same name/);
assert.match(byId('t1-2').scoring.en,/3 items without echoic prompts/);
assert.match(byId('t1-3').scoring.en,/6 items without echoic prompts/);
assert.match(byId('t1-3').scoring.en,/also part mand/);
assert.match(byId('t1-3').scoring.en,/5 items/);
assert.match(byId('t1-4').scoring.en,/2 different items.*no time limits/);
assert.match(byId('t1-4').application.en,/no time limit/);
assert.doesNotMatch(byId('t1-4').application.en,/60 minutes/);
assert.match(byId('t1-4').scoring.en,/1 item during an observation/);
assert.match(byId('t1-5').scoring.en,/10 items without echoic prompts/);
assert.match(byId('t1-5').sourceNote.en,/half-point criterion was not supplied/);
const oldTact=M.blank();oldTact.scores.milestones['t1-4']=1;
assert.equal(M.hasScore(oldTact,'milestones',byId('t1-4')),false);
assert.equal(oldTact.scores.milestones['t1-4'],1);
M.setScore(oldTact,'milestones',byId('t1-4'),1);assert.equal(M.hasScore(oldTact,'milestones',byId('t1-4')),true);
// Listener Level I: speech attention, name response, choice arrays and trials.
for(let n=1;n<=5;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`l1-${n}`)[field][lang].trim());
assert.match(byId('l1-1').scoring.en,/speech sounds 5 times/);
assert.match(byId('l1-1').scoring.en,/speech sounds 2 times/);
assert.match(byId('l1-1').application.en,/Do not require eye contact/);
assert.doesNotMatch(byId('l1-1').application.en,/30 minutes/);
assert.match(byId('l1-2').scoring.en,/eye contact.*5 separate trials.*no specified time limit/);
assert.equal(M.halfAllowed(byId('l1-2')),false);
assert.match(byId('l1-3').text.en,/array of 2.*5 different reinforcers/);
assert.match(byId('l1-3').scoring.en,/2 different reinforcing stimuli/);
assert.match(byId('l1-4').scoring.en,/2 times during testing for 4 different actions/);
assert.match(byId('l1-4').scoring.en,/2 times during testing for 2 different actions/);
assert.match(byId('l1-4').scoring.en,/verbal stimulus alone/);
assert.match(byId('l1-5').scoring.en,/20 different items in an array of 4 on the first trial/);
assert.match(byId('l1-5').scoring.en,/15 different items in an array of 4 on the first trial/);
assert.match(byId('l1-5').scoring.en,/clearly directed to the target stimulus/);
// VP-MTS Level I: timing, three-finger grasp, sustained attention and matching.
for(let n=1;n<=5;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`vp1-${n}`)[field][lang].trim());
assert.match(byId('vp1-1').scoring.en,/2 seconds, 5 times during the 30-minute observation/);
assert.match(byId('vp1-1').scoring.en,/2 seconds, 2 times during the 30-minute observation/);
assert.match(byId('vp1-2').text.en,/thumb, index finger, and middle finger/);
assert.match(byId('vp1-2').scoring.en,/5 times during observation/);
assert.match(byId('vp1-2').scoring.en,/usually requires 2 or more attempts/);
assert.match(byId('vp1-3').objective.en,/without prompts/);
assert.match(byId('vp1-3').scoring.en,/30 seconds/);
assert.match(byId('vp1-3').scoring.en,/always the same item/);
assert.match(byId('vp1-3').scoring.en,/self-stimulation/);
assert.match(byId('vp1-3').scoring.en,/15 seconds/);
assert.match(byId('vp1-4').scoring.en,/independently.*3 items.*any 2 activities/);
assert.match(byId('vp1-4').scoring.en,/2 items.*any single activity/);
assert.match(byId('vp1-5').text.en,/10 identical items/);
assert.match(byId('vp1-5').objective.en,/some verbal prompting and contrived reinforcers/);
assert.match(byId('vp1-5').scoring.en,/matches 10 items/);
assert.match(byId('vp1-5').scoring.en,/matches 5 items/);
// Independent Play Level I: automatic reinforcement, independence and 30-minute windows.
for(let n=1;n<=5;n++){
 const item=byId(`p1-${n}`);
 for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(item[field][lang].trim());
 assert.equal((item.scoring.en.match(/30-minute observation/g)||[]).length,2);
 assert.match(item.text.en,/TO: 30 min/);
}
assert.match(byId('p1-1').scoring.en,/independently manipulates and explores objects for 1 minute/);
assert.match(byId('p1-1').scoring.en,/independently manipulates and explores objects for 30 seconds/);
assert.match(byId('p1-1').objective.en,/automatic.*not contrived/);
assert.match(byId('p1-2').scoring.en,/independently plays with 5 different items/);
assert.match(byId('p1-2').scoring.en,/independently plays with 3 different items/);
assert.match(byId('p1-3').scoring.en,/independently.*new or novel play area for 2 minutes/);
assert.match(byId('p1-3').scoring.en,/independently.*new or novel play area for 1 minute/);
assert.match(byId('p1-4').objective.en,/without adult prompts or reinforcers/);
assert.match(byId('p1-4').scoring.en,/movement play for 2 minutes/);
assert.match(byId('p1-4').scoring.en,/movement play for 1 minute/);
assert.match(byId('p1-5').objective.en,/without adult prompts or reinforcers/);
assert.match(byId('p1-5').scoring.en,/independently.*cause-and-effect play for 2 minutes/);
assert.match(byId('p1-5').scoring.en,/independently.*cause-and-effect play for 1 minute/);
// Social Level I: observation windows, spontaneous responses and total parallel-play time.
for(let n=1;n<=5;n++){
 const item=byId(`s1-${n}`);
 for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(item[field][lang].trim());
 assert.equal((item.scoring.en.match(n===2?/1-hour observation/g:/30-minute observation/g)||[]).length,2);
}
assert.match(byId('s1-1').scoring.en,/visually tracks and shows interest.*at least 5 times/);
assert.match(byId('s1-1').scoring.en,/at least 2 times/);
assert.match(byId('s1-2').scoring.en,/wants to be held or physically played with 2 times/);
assert.match(byId('s1-2').scoring.en,/wants to be held or physically played with 1 time/);
assert.match(byId('s1-2').text.en,/TO: 60 min/);
assert.match(byId('s1-3').application.en,/Eye contact is not required/);
assert.match(byId('s1-3').scoring.en,/spontaneously looks.*5 times/);
assert.match(byId('s1-3').scoring.en,/spontaneously looks.*2 times/);
assert.match(byId('s1-4').scoring.en,/spontaneously.*parallel play.*total of 2 minutes/);
assert.match(byId('s1-4').scoring.en,/total of 1 minute/);
assert.match(byId('s1-4').application.en,/Interaction with peers is not required/);
assert.match(byId('s1-5').objective.en,/without prompts from adults/);
assert.match(byId('s1-5').scoring.en,/spontaneously follows peers or imitates their motor behavior 2 times/);
assert.match(byId('s1-5').scoring.en,/spontaneously follows peers or imitates their motor behavior 1 time/);
// Motor Imitation Level I: approximations, object actions and spontaneous occasions.
for(let n=1;n<=5;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`i1-${n}`)[field][lang].trim());
assert.match(byId('i1-1').text.en,/2 gross motor movements.*Do this/);
assert.match(byId('i1-1').scoring.en,/approximations, score them as correct/);
assert.match(byId('i1-1').scoring.en,/only one motor action/);
assert.match(byId('i1-1').scoring.en,/Do not give any points.*always emits the same behavior/);
assert.match(byId('i1-2').scoring.en,/4 gross motor movements/);
assert.match(byId('i1-2').scoring.en,/approximations, score them as correct/);
assert.match(byId('i1-2').scoring.en,/3 motor actions/);
assert.match(byId('i1-3').scoring.en,/6 motor movements.*2 adult motor behaviors involving objects.*total of 8 imitations/);
assert.match(byId('i1-3').scoring.en,/6 behaviors of any type/);
assert.match(byId('i1-3').scoring.en,/Notes\/comments.*fails to imitate any actions with objects/);
assert.match(byId('i1-4').scoring.en,/spontaneously.*5 occasions/);
assert.match(byId('i1-4').scoring.en,/spontaneously.*2 occasions/);
assert.doesNotMatch(byId('i1-4').scoring.en,/different behaviors|minutes/);
assert.match(byId('i1-5').scoring.en,/20 motor behaviors of any type/);
assert.match(byId('i1-5').scoring.en,/15 motor behaviors of any type/);
for(const id of ['i1-1','i1-4']){
 const earlier=M.blank();earlier.scores.milestones[id]=1;
 assert.equal(M.hasScore(earlier,'milestones',byId(id)),false);
 assert.equal(M.normalize(earlier).scores.milestones[id],1,'Earlier results stay available for review');
 M.setScore(earlier,'milestones',byId(id),1);assert.equal(M.hasScore(earlier,'milestones',byId(id)),true);
}
// Spontaneous Vocal Behavior Level I: variety AND frequency, intonation and identifiable words.
for(let n=1;n<=5;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`v1-${n}`)[field][lang].trim());
assert.match(byId('v1-1').objective.en,/without prompts/);
assert.match(byId('v1-1').scoring.en,/average of 5 speech sounds each hour/);
assert.match(byId('v1-1').scoring.en,/average of 2 speech sounds each hour/);
assert.match(byId('v1-1').scoring.en,/time-sample/);
assert.match(byId('v1-2').scoring.en,/5 different sounds, averaging 10 total sounds each hour/);
assert.match(byId('v1-2').scoring.en,/3 different sounds, averaging 10 total sounds each hour/);
assert.match(byId('v1-3').scoring.en,/10 different sounds with varying intonations, averaging 25 total sounds each hour/);
assert.match(byId('v1-3').scoring.en,/5 different sounds with varying intonations, averaging 25 total sounds each hour/);
assert.match(byId('v1-4').text.en,/5 different whole word approximations.*\(O\)/);
assert.match(byId('v1-4').scoring.en,/5 word approximations during observation/);
assert.match(byId('v1-4').scoring.en,/2 word approximations during observation/);
assert.doesNotMatch(byId('v1-4').application.en,/60 minutes|1-hour|each hour/);
assert.match(byId('v1-4').examples.en,/not necessarily in the appropriate context/);
assert.match(byId('v1-5').text.en,/appropriate intonation and rhythm/);
assert.match(byId('v1-5').scoring.en,/15 different identifiable word approximations during a 1-hour observation/);
assert.match(byId('v1-5').scoring.en,/8 different identifiable word approximations during a 1-hour observation/);
// Echoic Level I is derived from valid current EESA marks; manual overrides persist.
for(let n=1;n<=5;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`e1-${n}`)[field][lang].trim());
const echoIds=[1,2,3,4,5].map(n=>`e1-${n}`);
function eesaFixture(total,group1=total,complete=false){
 const result=M.blank();
 if(complete)for(const entry of D.eesa)M.setScore(result,'eesa',entry,0);
 for(const [entries,points] of [[D.eesa.filter(i=>i.group===1),group1],[D.eesa.filter(i=>i.group!==1&&i.group!==5),total-group1]]){
  let remaining=points;
  for(const entry of entries){if(remaining<=0)break;const value=Math.min(1,remaining);M.setScore(result,'eesa',entry,value);remaining-=value;}
  assert.equal(remaining,0,'fixture has enough EESA items');
 }
 M.syncEchoic(result,D);return result;
}
for(const [total,expected] of [[0,[null,null,null,null,null]],[1,[.5,null,null,null,null]],[1.5,[.5,null,null,null,null]],[2,[1,null,null,null,null]],[3,[1,.5,null,null,null]],[4.5,[1,.5,null,null,null]],[5,[1,1,null,null,null]],[7,[1,1,.5,null,null]],[10,[1,1,1,null,null]],[12,[1,1,1,.5,null]],[15,[1,1,1,1,null]],[20,[1,1,1,1,.5]],[25,[1,1,1,1,1]]]){
 const record=eesaFixture(total);assert.deepEqual(echoIds.map(id=>record.scores.milestones[id]??null),expected,`EESA total ${total}`);
}
assert.equal(eesaFixture(25,14).scores.milestones['e1-5'],undefined);
assert.equal(eesaFixture(25,15).scores.milestones['e1-5'],.5);
assert.equal(eesaFixture(25,19.5).scores.milestones['e1-5'],.5);
assert.equal(eesaFixture(25,20).scores.milestones['e1-5'],1);
assert.equal(eesaFixture(20,15).scores.milestones['e1-5'],.5);
assert.equal(eesaFixture(20,14,true).scores.milestones['e1-5'],0);
assert.deepEqual(echoIds.map(id=>eesaFixture(0,0,true).scores.milestones[id]),[0,0,0,0,0]);
const echoAuto=eesaFixture(5);
M.setScore(echoAuto,'milestones',byId('e1-1'),.5);M.clearScore(echoAuto,'milestones','e1-2');
for(const entry of D.eesa.slice(0,10))M.setScore(echoAuto,'eesa',entry,1);
M.syncEchoic(echoAuto,D);assert.equal(echoAuto.scores.milestones['e1-1'],.5);assert.equal(echoAuto.scores.milestones['e1-2'],undefined);
const echoSaved=M.normalize(JSON.parse(JSON.stringify(echoAuto)));M.syncEchoic(echoSaved,D);
assert.equal(echoSaved.echoicModes['e1-1'],'manual');assert.equal(echoSaved.echoicModes['e1-2'],'manual');assert.equal(echoSaved.scores.milestones['e1-1'],.5);
M.restoreEchoic(echoSaved,D,'e1-1');assert.equal(echoSaved.scores.milestones['e1-1'],1);
M.restoreEchoic(echoSaved,D,'e1-2');assert.equal(echoSaved.scores.milestones['e1-2'],1);
for(const entry of D.eesa)M.clearScore(echoSaved,'eesa',entry.id);
M.syncEchoic(echoSaved,D);assert.equal(echoSaved.scores.milestones['e1-1'],undefined);
const echoExport=M.normalize(echoAuto);echoExport.reportScope.milestones=false;assert.equal(Object.keys(P.pack(echoExport,D).assessment.echoicModes).length,0);
const earlierEcho=M.blank();earlierEcho.scores.milestones['e1-1']=.5;M.syncEchoic(earlierEcho,D);assert.equal(earlierEcho.echoicModes['e1-1'],'manual');assert.equal(earlierEcho.scores.milestones['e1-1'],.5);
const echoNext=M.startFollowup(echoAuto);M.syncEchoic(echoNext,D);assert.equal(echoNext.scores.milestones['e1-1'],undefined);assert.equal(M.previous(echoNext).echoicModes['e1-1'],'manual');assert.equal(M.previous(echoNext).scores.milestones['e1-1'],.5);
// Supplied Mand Level II 6–8: current motivation, allowed general prompts and word combinations.
for(let n=6;n<=8;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`m2-${n}`)[field][lang].trim());
assert.match(byId('m2-6').scoring.en,/20 different missing items without prompts/);
assert.match(byId('m2-6').scoring.en,/10 different missing items without prompts/);
assert.match(byId('m2-6').scoring.en,/current MO at strength/);
assert.match(byId('m2-6').scoring.en,/What do you need/);
assert.match(byId('m2-7').scoring.en,/5 different actions or missing actions/);
assert.match(byId('m2-7').scoring.en,/2 different actions or missing actions/);
assert.equal((byId('m2-7').scoring.en.match(/What do you want me to do/g)||[]).length,2);
assert.doesNotMatch(byId('m2-7').scoring.en,/¼/);
assert.match(byId('m2-8').scoring.en,/5 different mands.*2 or more words.*not including "I want".*1-hour/);
assert.match(byId('m2-8').scoring.en,/2 different mands.*2 or more words.*not including "I want".*1-hour/);
assert.match(byId('m2-8').materials.en,/data sheet/);
assert.match(byId('m2-8').scoring.en,/list.*data base/);
// Mand 9–10 complete Level II: varied motivation and acquisition without direct training.
for(let n=9;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`m2-${n}`)[field][lang].trim());
assert.match(byId('m2-9').scoring.en,/15 different mands.*no adult delivered prompts.*30-minute observation/);
assert.match(byId('m2-9').scoring.en,/controlled by different MOs/);
assert.match(byId('m2-9').scoring.en,/8 times during a 30-minute observation/);
assert.match(byId('m2-9').scoring.en,/different response topographies.*same MO/);
assert.match(byId('m2-9').scoring.en,/at least two different MOs/);
assert.match(byId('m2-10').objective.en,/natural transfer of control.*tact and echoic/);
assert.match(byId('m2-10').scoring.en,/10 new mands without formal training/);
assert.match(byId('m2-10').scoring.en,/5 new mands without formal training/);
assert.match(byId('m2-10').scoring.en,/Record each new mand on a daily data sheet/);
assert.doesNotMatch(byId('m2-10').application.en,/minutes|1-hour/);
const oldMand9=M.blank();oldMand9.scores.milestones['m2-9']=.5;
assert.equal(M.hasScore(oldMand9,'milestones',byId('m2-9')),false);assert.equal(oldMand9.scores.milestones['m2-9'],.5);
oldMand9.scores.milestones['m2-9']=1;assert.equal(M.hasScore(oldMand9,'milestones',byId('m2-9')),true);
M.setScore(oldMand9,'milestones',byId('m2-9'),.5);assert.equal(M.hasScore(oldMand9,'milestones',byId('m2-9')),true);
// Tact Level II: item naming, generalization, actions and two-component responses.
for(let n=6;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`t2-${n}`)[field][lang].trim());
assert.match(byId('t2-6').scoring.en,/25 items when tested/);
assert.match(byId('t2-6').scoring.en,/20 items when tested/);
assert.match(byId('t2-7').scoring.en,/3 examples of 50 items/);
assert.match(byId('t2-7').scoring.en,/2 examples of 50 items/);
assert.match(byId('t2-7').scoring.en,/scoring has been reliable/);
assert.match(byId('t2-8').scoring.en,/10 actions when tested/);
assert.match(byId('t2-8').scoring.en,/5 actions when tested/);
assert.match(byId('t2-8').examples.en,/What is he doing.*What's happening/);
assert.match(byId('t2-9').scoring.en,/50 two-component noun-verb.*verb-noun/);
assert.match(byId('t2-9').scoring.en,/25 two-component noun-verb.*verb-noun/);
assert.match(byId('t2-9').scoring.en,/available and reliable/);
assert.match(byId('t2-10').text.en,/200 nouns and\/or verbs.*other parts of speech/);
assert.match(byId('t2-10').scoring.en,/200 items and\/or actions when tested/);
assert.match(byId('t2-10').scoring.en,/150 items and\/or actions/);
assert.match(byId('t2-10').scoring.en,/list of the child's known nouns and verbs/);
// Listener Level II: messy arrays, generalization, motor approximations and response units.
for(let n=6;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`l2-${n}`)[field][lang].trim());
assert.match(byId('l2-6').scoring.en,/40 items in a messy array of 6.*not lined up/);
assert.match(byId('l2-6').scoring.en,/25 items in a messy array of 6/);
assert.match(byId('l2-7').text.en,/messy array of 8/);
assert.match(byId('l2-7').scoring.en,/3 examples of 50 items/);
assert.match(byId('l2-7').scoring.en,/2 examples of 25 items/);
assert.match(byId('l2-7').materials.en,/at least 8 other items/);
assert.match(byId('l2-7').examples.en,/7 other items/);
assert.match(byId('l2-7').sourceNote.en,/8 choices total/);
assert.match(byId('l2-8').objective.en,/without imitative prompts/);
assert.match(byId('l2-8').scoring.en,/10 actions on command.*Approximations should be scored as correct/);
assert.match(byId('l2-8').scoring.en,/5 actions on command/);
assert.match(byId('l2-9').objective.en,/one task.*one response unit/);
assert.match(byId('l2-9').scoring.en,/50 two-component noun-verb and\/or verb-noun/);
assert.match(byId('l2-9').scoring.en,/25 two-component noun-verb and\/or verb-noun/);
assert.match(byId('l2-10').scoring.en,/250 different items/);
assert.match(byId('l2-10').scoring.en,/150 items/);
assert.match(byId('l2-10').scoring.en,/accumulated list of known LDs/);
// VP-MTS Level II: distinct full/half arrays, sorting prompts, similar stimuli and dimensions.
for(let n=6;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`vp2-${n}`)[field][lang].trim());
assert.match(byId('vp2-6').scoring.en,/25 identical objects or pictures in a messy array of 6/);
assert.match(byId('vp2-6').scoring.en,/15 identical objects or pictures in a messy array of 4/);
assert.match(byId('vp2-7').scoring.en,/10 different colors or shapes given models/);
assert.match(byId('vp2-7').scoring.en,/5 different colors or shapes given models/);
assert.match(byId('vp2-7').scoring.en,/no other prompts.*verbal prompts/);
assert.match(byId('vp2-8').text.en,/array of 8 containing 3 similar stimuli/);
assert.equal((byId('vp2-8').scoring.en.match(/array of 6 containing 3 similar stimuli/g)||[]).length,2);
assert.match(byId('vp2-8').sourceNote.en,/both scoring paragraphs specify 6/);
for(const id of ['vp2-8','vp2-9','vp2-10']){
 assert.match(byId(id).scoring.en,/for 25 items/);assert.match(byId(id).scoring.en,/for 15 items/);
}
assert.equal((byId('vp2-9').scoring.en.match(/non-identical objects or non-identical pictures in a messy array of 10 containing 3 similar stimuli/g)||[]).length,2);
assert.equal((byId('vp2-10').scoring.en.match(/objects \(3D\) to pictures \(2D\) and\/or vice versa/g)||[]).length,2);
assert.equal((byId('vp2-10').scoring.en.match(/array of 10 containing 3 similar stimuli/g)||[]).length,2);
// Independent Play Level II: independent search/use, creative items and total playground time.
for(let n=6;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`p2-${n}`)[field][lang].trim());
assert.match(byId('p2-6').scoring.en,/actively and independently searches.*5 items or sets.*removed or naturally missing/);
assert.match(byId('p2-6').scoring.en,/actively and independently searches.*2 items or sets.*removed or naturally missing/);
assert.match(byId('p2-7').scoring.en,/independently.*according to their function for 5 items/);
assert.match(byId('p2-7').scoring.en,/independently.*according to their function for 2 items/);
assert.match(byId('p2-8').scoring.en,/2 different everyday items in creative ways.*except for stimming/);
assert.match(byId('p2-8').scoring.en,/1 item in a creative way/);
assert.match(byId('p2-9').text.en,/Independently.*total of 5 minutes/);
assert.match(byId('p2-9').scoring.en,/total of 5 minutes during a 30-minute observation/);
assert.match(byId('p2-9').scoring.en,/total of 2 minutes during a 30-minute observation/);
assert.match(byId('p2-10').scoring.en,/independently constructs, assembles, or sets up.*5 different sets of materials/);
assert.match(byId('p2-10').scoring.en,/independently constructs, assembles, or sets up.*2 different sets of materials/);
for(const id of ['p2-6','p2-7','p2-8','p2-10'])assert.doesNotMatch(byId(id).application.en,/30-minute|60-minute/);
// Social Level II: peer initiations, requests, sustained interaction and invitations.
for(let n=6;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`s2-${n}`)[field][lang].trim());
assert.match(byId('s2-6').scoring.en,/interaction with a peer 2 times during a 30-minute/);
assert.match(byId('s2-6').scoring.en,/interaction with a peer 1 time during a 30-minute/);
assert.match(byId('s2-6').scoring.en,/do not count negative types/);
assert.match(byId('s2-7').scoring.en,/spontaneously mands to peers 5 times during a 1-hour/);
assert.match(byId('s2-7').scoring.en,/spontaneously mands to peers 2 times during a 1-hour/);
assert.doesNotMatch(byId('s2-7').scoring.en,/different requests/);
assert.match(byId('s2-7').examples.en,/stop an activity or behavior/);
assert.match(byId('s2-8').text.en,/3 minutes without adult prompts or reinforcement/);
assert.match(byId('s2-8').scoring.en,/5 minutes without prompts during a 30-minute/);
assert.match(byId('s2-8').scoring.en,/2 minutes without prompts during a 30-minute/);
assert.match(byId('s2-8').scoring.en,/specific verbal or nonverbal interaction/);
assert.match(byId('s2-8').scoring.en,/parallel play/);
assert.match(byId('s2-8').sourceNote.en,/target says 3 minutes/);
assert.match(byId('s2-9').scoring.en,/responds to the mands from peers 5 times during observation or testing/);
assert.match(byId('s2-9').scoring.en,/responds to the mands from peers 2 times during observation or testing/);
assert.match(byId('s2-9').scoring.en,/any points if an adult must prompt/);
assert.doesNotMatch(byId('s2-9').scoring.en,/different peer requests|minutes/);
assert.match(byId('s2-10').scoring.en,/social activities 2 times during a 1-hour/);
assert.match(byId('s2-10').scoring.en,/social activities 1 time during a 1-hour/);
// Motor Imitation Level II: object selection, fine motor variety and sequence lengths.
for(let n=6;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`i2-${n}`)[field][lang].trim());
assert.match(byId('i2-6').scoring.en,/10 actions.*specific object selected from an array of 3.*Do this/);
assert.match(byId('i2-6').scoring.en,/5 actions.*specific object selected from an array of 3.*Do this/);
assert.match(byId('i2-7').scoring.en,/20 different fine motor actions/);
assert.match(byId('i2-7').scoring.en,/10 different fine motor actions/);
assert.match(byId('i2-8').scoring.en,/10 three-component actions.*peer or an adult/);
assert.match(byId('i2-8').scoring.en,/5 two-component actions.*peer or an adult/);
assert.match(byId('i2-9').scoring.en,/spontaneously imitates 5 functional skills in the natural environment/);
assert.match(byId('i2-9').scoring.en,/spontaneously imitates 2 functional skills in the natural environment/);
assert.match(byId('i2-9').objective.en,/without any prompts from others/);
assert.match(byId('i2-10').scoring.en,/imitates.*approximates.*many novel motor actions with and without objects/);
assert.match(byId('i2-10').objective.en,/without specific training on each/);
assert.equal(M.halfAllowed(byId('i2-10')),false);
assert.doesNotMatch(byId('i2-10').scoring.en,/20 actions|10 actions/);
// Echoic Level II: total thresholds AND group minimums, with persistent overrides.
for(let n=6;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`e2-${n}`)[field][lang].trim());
function eesaLevel2(total,g2=Math.min(30,total),g45=Math.max(0,total-85),complete=false){
 const result=M.blank();if(complete)for(const item of D.eesa)M.setScore(result,'eesa',item,0);
 for(const [groups,points] of [[[2],g2],[[4,5],g45],[[1,3],total-g2-g45]]){
  let left=points;
  for(const item of D.eesa.filter(item=>groups.includes(item.group))){if(left<=0)break;const value=Math.min(1,left);M.setScore(result,'eesa',item,value);left-=value;}
  assert.equal(left,0,'valid EESA group fixture');
 }
 M.syncEchoic(result,D);return result;
}
for(const [total,expected] of [[0,[null,null,null,null,null]],[39.5,[null,null,null,null,null]],[40,[.5,null,null,null,null]],[49.5,[.5,null,null,null,null]],[50,[1,null,null,null,null]],[55,[1,.5,null,null,null]],[60,[1,1,null,null,null]],[65,[1,1,.5,null,null]],[70,[1,1,1,null,null]],[75,[1,1,1,.5,null]],[80,[1,1,1,1,null]],[85,[1,1,1,1,null]]]){
 const result=eesaLevel2(total);assert.deepEqual([6,7,8,9,10].map(n=>result.scores.milestones[`e2-${n}`]??null),expected,`Level II total ${total}`);
}
assert.equal(eesaLevel2(50,14.5).scores.milestones['e2-6'],undefined);
assert.equal(eesaLevel2(50,15).scores.milestones['e2-6'],.5);
assert.equal(eesaLevel2(50,19.5).scores.milestones['e2-6'],.5);
assert.equal(eesaLevel2(50,20).scores.milestones['e2-6'],1);
assert.equal(eesaLevel2(40,15).scores.milestones['e2-6'],.5);
assert.equal(eesaLevel2(39.5,20).scores.milestones['e2-6'],undefined);
assert.equal(eesaLevel2(90,30,9.5).scores.milestones['e2-10'],undefined);
assert.equal(eesaLevel2(90,30,10).scores.milestones['e2-10'],1);
assert.equal(eesaLevel2(85,30,10).scores.milestones['e2-10'],.5);
assert.equal(eesaLevel2(89.5,30,10).scores.milestones['e2-10'],.5);
assert.equal(eesaLevel2(84.5,30,10).scores.milestones['e2-10'],undefined);
assert.equal(eesaLevel2(90,30,9.5,true).scores.milestones['e2-10'],0);
assert.deepEqual([6,7,8,9,10].map(n=>eesaLevel2(0,0,0,true).scores.milestones[`e2-${n}`]),[0,0,0,0,0]);
const splitGroups=eesaLevel2(90,30,10);for(const item of D.eesa.filter(i=>i.group===4))M.setScore(splitGroups,'eesa',item,0);for(const item of D.eesa.filter(i=>i.group===4).slice(0,5))M.setScore(splitGroups,'eesa',item,1);for(const item of D.eesa.filter(i=>i.group===5))M.setScore(splitGroups,'eesa',item,1);M.syncEchoic(splitGroups,D);assert.equal(splitGroups.scores.milestones['e2-10'],1,'Groups 4 and 5 are combined');
const level2Manual=eesaLevel2(90,30,10);M.setScore(level2Manual,'milestones',byId('e2-6'),0);M.clearScore(level2Manual,'milestones','e2-10');M.syncEchoic(level2Manual,D);
const reloadedLevel2=M.normalize(JSON.parse(JSON.stringify(level2Manual)));M.syncEchoic(reloadedLevel2,D);assert.equal(reloadedLevel2.scores.milestones['e2-6'],0);assert.equal(reloadedLevel2.scores.milestones['e2-10'],undefined);assert.equal(reloadedLevel2.echoicModes['e2-10'],'manual');
M.restoreEchoic(reloadedLevel2,D,'e2-6');M.restoreEchoic(reloadedLevel2,D,'e2-10');assert.equal(reloadedLevel2.scores.milestones['e2-6'],1);assert.equal(reloadedLevel2.scores.milestones['e2-10'],1);
for(const item of D.eesa)M.clearScore(reloadedLevel2,'eesa',item.id);M.syncEchoic(reloadedLevel2,D);assert.equal(reloadedLevel2.scores.milestones['e2-6'],undefined);assert.equal(reloadedLevel2.scores.milestones['e2-10'],undefined);
const oldLevel2=M.blank();oldLevel2.scores.milestones['e2-7']=.5;M.syncEchoic(oldLevel2,D);assert.equal(oldLevel2.echoicModes['e2-7'],'manual');assert.equal(oldLevel2.scores.milestones['e2-7'],.5);
const nextLevel2=M.startFollowup(level2Manual);M.syncEchoic(nextLevel2,D);assert.equal(nextLevel2.scores.milestones['e2-6'],undefined);assert.equal(M.previous(nextLevel2).scores.milestones['e2-6'],0);
// Supplied LRFFC II corrects the tasks assigned to 6–9; old marks must not transfer.
for(let n=6;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`lr2-${n}`)[field][lang].trim());
assert.match(byId('lr2-6').scoring.en,/array of 3, for 5 different sounds/);
assert.match(byId('lr2-6').scoring.en,/array of 3, for 2 different sounds/);
assert.match(byId('lr2-7').scoring.en,/5 different food or drink items.*array of 5/);
assert.match(byId('lr2-7').scoring.en,/2 different food or drink items.*array of 5/);
assert.match(byId('lr2-7').examples.en,/array of 3/);assert.ok(byId('lr2-7').sourceNote);
assert.match(byId('lr2-8').text.en,/array of 8.*25 different LRFFC fill-in/);
assert.match(byId('lr2-8').scoring.en,/array of 5.*25 different LRFFC fill-in/);
assert.match(byId('lr2-8').scoring.en,/12 items/);assert.ok(byId('lr2-8').sourceNote);
assert.match(byId('lr2-9').scoring.en,/array of 10 or from a book for 25 different LRFFC WH questions/);
assert.match(byId('lr2-9').scoring.en,/12 items/);
assert.doesNotMatch(byId('lr2-9').scoring.en,/3 different.*per item/);
assert.match(byId('lr2-10').scoring.en,/50%.*future trials/);
assert.match(byId('lr2-10').scoring.en,/25%.*50%.*always requires one prompt/);
for(const id of ['lr2-6','lr2-7','lr2-8','lr2-9'])for(const value of [0,.5,1]){
 const oldRecord=M.blank();oldRecord.scores.milestones[id]=value;
 assert.equal(M.hasScore(oldRecord,'milestones',byId(id)),false,'No silent transfer of a different LRFFC task');
 assert.equal(M.normalize(oldRecord).scores.milestones[id],value,'Keep the earlier mark for review');
 M.setScore(oldRecord,'milestones',byId(id),value);assert.equal(M.hasScore(oldRecord,'milestones',byId(id)),true);
}
// Intraverbal Level II: verbal control, motivational distinction and no added question-type quotas.
for(let n=6;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`iv2-${n}`)[field][lang].trim());
assert.match(byId('iv2-6').scoring.en,/10 different songs/);
assert.match(byId('iv2-6').scoring.en,/5 phrases/);
assert.match(byId('iv2-6').objective.en,/motivation share control/);
assert.match(byId('iv2-7').scoring.en,/say his name.*without echoic prompts/);
assert.equal(M.halfAllowed(byId('iv2-7')),false);
assert.match(byId('iv2-8').text.en,/not including songs/);
assert.match(byId('iv2-8').objective.en,/without the presence of any objects, echoic prompts, or motivational variables.*general attention/);
assert.match(byId('iv2-8').scoring.en,/25 different phrases/);assert.match(byId('iv2-8').scoring.en,/12 phrases/);
assert.match(byId('iv2-9').scoring.en,/25 different what questions without echoic prompts.*without the presence of the relevant object/);
assert.match(byId('iv2-9').scoring.en,/12 what questions/);
assert.match(byId('iv2-10').scoring.en,/25 different "who" or "where" questions without echoic prompts/);
assert.match(byId('iv2-10').scoring.en,/12 different "who" or "where" questions/);
assert.doesNotMatch(byId('iv2-10').scoring.en,/8 who|8 where|⅜/);
// Classroom Level II: initial vs repeated prompts, physical-prompt exclusion and combined group criteria.
for(let n=6;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`cl2-${n}`)[field][lang].trim());
assert.match(byId('cl2-6').scoring.en,/3 minutes without an adult prompt to sit back down/);
assert.match(byId('cl2-6').scoring.en,/without negative behavior for 1 minute/);
assert.match(byId('cl2-7').scoring.en,/puts away.*and lines up and comes to a table.*only once/);
assert.match(byId('cl2-7').scoring.en,/2 or more prompts/);
assert.match(byId('cl2-8').scoring.en,/1 gestural and\/or 1 verbal prompt and no negative behavior/);
assert.match(byId('cl2-8').scoring.en,/2 or more prompts.*except physical/);
assert.match(byId('cl2-9').scoring.en,/3 or more children for 5 minutes without disruptive behavior or attempting to leave/);
assert.match(byId('cl2-9').scoring.en,/3 or more children for 2 minutes without disruptive behavior or attempting to leave/);
assert.match(byId('cl2-10').scoring.en,/3 or more children for 10 minutes.*50%.*time-sample.*5 teacher questions or instructions/);
assert.match(byId('cl2-10').scoring.en,/3 or more children for 10 minutes.*33%.*2 teacher questions or instructions/);
// Linguistic Structure II: hidden-item intelligibility, receptive/expressive vocabulary and daily speech.
for(let n=6;n<=10;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`li2-${n}`)[field][lang].trim());
assert.match(byId('li2-6').scoring.en,/familiar adults who cannot see the item.*10 tacts/);
assert.match(byId('li2-6').scoring.en,/familiar adults who cannot see the item.*5 tacts/);
assert.match(byId('li2-7').scoring.en,/listener vocabulary of 100 words/);
assert.match(byId('li2-7').scoring.en,/listener vocabulary of 50 words/);
assert.doesNotMatch(byId('li2-7').application.en,/array of 5/);
assert.match(byId('li2-8').scoring.en,/10 different 2-word utterances per day.*except echoic/);
assert.match(byId('li2-8').scoring.en,/5 different 2-word utterances per day.*except echoic/);
assert.match(byId('li2-8').scoring.en,/What is that.*What do you want/);
assert.match(byId('li2-9').scoring.en,/functional prosody.*5 occasions in one day/);
assert.match(byId('li2-9').scoring.en,/functional prosody.*2 occasions in one day/);
assert.match(byId('li2-10').text.en,/300 words.*all verbal operants, except echoic/);
assert.match(byId('li2-10').scoring.en,/speaker vocabulary size of 300 words/);
assert.match(byId('li2-10').scoring.en,/speaker vocabulary size of 200 words/);
// Mand Level III 11–14: genuine information, unprompted refusal, modifiers and daily directions.
for(let n=11;n<=14;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`m3-${n}`)[field][lang].trim());
assert.match(byId('m3-11').objective.en,/motivating operation.*information.*reinforcement/);
assert.match(byId('m3-11').scoring.en,/question words 5 times during a 1-hour observation/);
assert.match(byId('m3-11').scoring.en,/question words 2 times during a 1-hour observation/);
assert.doesNotMatch(byId('m3-11').scoring.en,/2 different question words/);
assert.match(byId('m3-12').scoring.en,/without negative behavior.*without prompts.*5 different circumstances/);
assert.match(byId('m3-12').scoring.en,/without negative behavior.*without prompts.*2 different circumstances/);
assert.match(byId('m3-13').scoring.en,/10 different adjectives, prepositions, or adverbs.*1-hour observation or testing/);
assert.match(byId('m3-13').scoring.en,/at least 2 from each group/);
assert.match(byId('m3-13').scoring.en,/5 different adjectives, prepositions, or adverbs.*1-hour observation or testing/);
assert.match(byId('m3-14').scoring.en,/activity 5 times.*daily tracking sheet/);
assert.match(byId('m3-14').scoring.en,/activity 2 times.*daily tracking sheet/);
assert.doesNotMatch(byId('m3-14').application.en,/1-hour|60-minute/);
// Mand 15: requests for an audience within the child's own intraverbal sequence.
for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId('m3-15')[field][lang].trim());
assert.match(byId('m3-15').scoring.en,/own intraverbal behavior 5 times during observation/);
assert.match(byId('m3-15').scoring.en,/own intraverbal behavior 2 times during observation/);
assert.match(byId('m3-15').scoring.en,/precedes or is embedded in some intraverbal sequence/);
assert.match(byId('m3-15').scoring.en,/make pancakes/);
assert.doesNotMatch(byId('m3-15').application.en,/1-hour|60-minute|30-minute/);
// Tact Level III: mixed testing, category-specific half credit, sentences and accumulated vocabulary.
for(let n=11;n<=15;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`t3-${n}`)[field][lang].trim());
assert.match(byId('t3-11').scoring.en,/color, shape, and function of 5 different objects \(15 trials\).*mixed order/);
assert.match(byId('t3-11').scoring.en,/2 features or functions of 5 different objects \(10 trials\).*mixed order/);
assert.match(byId('t3-12').scoring.en,/4 different prepositions and 4 different pronouns/);
assert.match(byId('t3-12').scoring.en,/total of 4.*some from each category/);
assert.match(byId('t3-12').scoring.en,/4 different prepositions, but not 4 pronouns, or vice versa/);
assert.match(byId('t3-13').scoring.en,/4 different adjectives.*excluding color and shape.*4 different adverbs/);
assert.match(byId('t3-13').scoring.en,/total of 4.*some from each category/);
assert.match(byId('t3-13').scoring.en,/4 different adjectives, but not 4 adverbs, or vice versa/);
for(const id of ['t3-12','t3-13'])assert.match(byId(id).scoring.en,/Comments\/notes/);
assert.match(byId('t3-14').scoring.en,/complete sentences containing 4 or more words 20 times/);
assert.match(byId('t3-14').scoring.en,/complete sentences containing 3 or more words 20 times/);
assert.match(byId('t3-15').scoring.en,/1000 nonverbal stimuli/);
assert.match(byId('t3-15').scoring.en,/750 nonverbal stimuli/);
assert.match(byId('t3-15').scoring.en,/accumulated list.*sampling the repertoire/);
// Listener Level III: compound selections, per-category instructions and receptive vocabulary.
for(let n=11;n<=15;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`l3-${n}`)[field][lang].trim());
assert.match(byId('l3-11').scoring.en,/array of 6 similar stimuli for 4 colors and 4 shapes/);
assert.match(byId('l3-11').scoring.en,/array of 6 similar stimuli for 2 colors and 2 shapes/);
assert.match(byId('l3-12').scoring.en,/2 instructions for each of 6 different prepositions and 4 different pronouns/);
assert.match(byId('l3-12').scoring.en,/2 instructions for each of 3 different prepositions and 2 different pronouns/);
assert.match(byId('l3-12').scoring.en,/6 different prepositions, but not 4 pronouns, or vice versa/);
assert.match(byId('l3-13').scoring.en,/4 pairs of relative adjectives.*4 pairs of relative adverbs/);
assert.match(byId('l3-13').scoring.en,/2 pairs of relative adjectives.*2 instructions involving 2 different adverbs.*some from each category/);
assert.match(byId('l3-13').scoring.en,/4 different adjectives, but not 4 adverbs, or vice versa/);
for(const id of ['l3-12','l3-13'])assert.match(byId(id).scoring.en,/Comments\/notes/);
assert.match(byId('l3-14').scoring.en,/ten 3-step directions/);
assert.match(byId('l3-14').scoring.en,/five 3-step directions/);
assert.match(byId('l3-15').scoring.en,/1200 nonverbal stimuli/);
assert.match(byId('l3-15').scoring.en,/800 nonverbal stimuli/);
assert.equal((byId('l3-15').scoring.en.match(/if it is reliable/g)||[]).length,2);
// VP-MTS III: spontaneous samples, novel first-trial matching, 3D construction and pattern lengths.
for(let n=11;n<=15;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`vp3-${n}`)[field][lang].trim());
assert.match(byId('vp3-11').scoring.en,/spontaneously matches.*adult or peer's sample 2 times/);
assert.match(byId('vp3-11').scoring.en,/adult or peer's sample once/);
assert.match(byId('vp3-12').text.en,/first trial/);
assert.match(byId('vp3-12').examples.en,/first trial without any training/);
assert.match(byId('vp3-12').scoring.en,/novel item.*array of 10 with 3 similar stimuli, for 25 items/);
assert.match(byId('vp3-12').scoring.en,/novel item.*array of 10 with 3 similar stimuli, for 15 items/);
assert.match(byId('vp3-13').objective.en,/three-dimensional items.*two-dimensional cards/);
assert.match(byId('vp3-13').scoring.en,/20 different.*at least 8 different parts/);
assert.match(byId('vp3-13').scoring.en,/20 different.*at least 4 different parts/);
assert.match(byId('vp3-14').scoring.en,/at least 5 items from 5 different categories without a model/);
assert.match(byId('vp3-14').scoring.en,/at least 3 items from 3 different categories without a model/);
assert.match(byId('vp3-14').scoring.en,/starter prompt/);
assert.match(byId('vp3-15').scoring.en,/20 three-step patterns, sequences, or seriation tasks/);
assert.match(byId('vp3-15').scoring.en,/20 two-step patterns, sequences, or seriation tasks/);
assert.match(byId('vp3-15').objective.en,/without prompts.*starter prompt/);
// Mixed supplied passage: Play III 11–13 and Social III 14 tail/15, without filling gaps.
for(const id of ['p3-11','p3-12','p3-13','p3-14','p3-15','s3-15'])for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(id)[field][lang].trim());
assert.match(byId('p3-11').scoring.en,/spontaneously.*5 occasions/);
assert.match(byId('p3-11').scoring.en,/spontaneously.*2 occasions/);
assert.match(byId('p3-11').scoring.en,/different pretend/);
assert.deepEqual(Array.from(byId('p3-11').legacyScores), []);
assert.match(byId('p3-12').scoring.en,/repeat a gross motor play behavior.*desired effect for 2 different activities/);
assert.match(byId('p3-12').scoring.en,/desired effect for 1 activity/);
assert.match(byId('p3-13').scoring.en,/independently.*5 minutes/);
assert.match(byId('p3-13').scoring.en,/independently.*2 minutes/);
assert.match(byId('s3-14').materials.en,/Peers and items and activities/);
assert.match(byId('s3-14').scoring.en,/peers in a pretend or social play activity for 5 minutes/);
assert.match(byId('s3-14').scoring.en,/peers in a pretend or social play activity for 2 minutes/);
assert.match(byId('s3-14').objective.en,/unprompted pretend and\/or social play/);
assert.match(byId('s3-15').text.en,/4 verbal exchanges on 1 topic.*5 topics/);
assert.match(byId('s3-15').scoring.en,/additional and relevant verbal behavior.*4 exchanges during an observation period/);
assert.match(byId('s3-15').scoring.en,/additional and relevant verbal behavior.*2 exchanges during an observation period/);
assert.match(byId('s3-15').scoring.en,/mands, tacts, or intraverbals/);
// Reading III and interleaved Social text: no social scores under Reading 11.
for(const id of ['r3-11','r3-12','r3-13','r3-14','r3-15','s3-12','s3-13','s3-14'])for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(id)[field][lang].trim());
assert.match(byId('r3-11').scoring.en,/75%.*3-minute period, without any prompts/);
assert.match(byId('r3-11').scoring.en,/50%.*3-minute period, without any prompts/);
assert.doesNotMatch(byId('r3-11').scoring.en,/cooperates|peer/);
assert.match(byId('r3-12').scoring.en,/uppercase letter from an array of 5 letters for 10 different letters/);
assert.match(byId('r3-12').scoring.en,/uppercase letter from an array of 5 letters for 5 different letters/);
assert.match(byId('r3-13').scoring.en,/10 uppercase letters/);assert.match(byId('r3-13').scoring.en,/5 uppercase letters/);
assert.equal(M.halfAllowed(byId('r3-14')),false);
assert.match(byId('r3-14').scoring.en,/Whose name is this.*intraverbally/);
assert.match(byId('r3-14').scoring.en,/colors, patterns/);
assert.match(byId('r3-15').scoring.en,/5 words.*array of 5, and vice versa/);
assert.match(byId('r3-15').scoring.en,/3 words.*array of 3, and vice versa/);
assert.match(byId('s3-11').scoring.en,/cooperates.*5 times.*peer can be prompted/);
assert.match(byId('s3-11').text.en,/Spontaneously cooperates with a peer.*specific outcome 5 times/);
assert.match(byId('s3-12').scoring.en,/5 different spontaneous mands in a 1-hour/);
assert.match(byId('s3-12').scoring.en,/2 different spontaneous mands in a 1-hour/);
assert.deepEqual(Array.from(byId('s3-12').legacyScores), []);
assert.doesNotMatch(byId('s3-15').scoring.en,/1-hour/);
assert.match(byId('s3-11').materials.en,/Peers and toys/);
assert.match(byId('s3-11').examples.en,/teeter-totter/);
assert.match(byId('s3-11').objective.en,/without adult prompting or reinforcement/);
assert.equal(byId('s3-11').sourceNote, undefined);
assert.match(byId('s3-13').scoring.en,/5 different questions or statements.*without adult prompting or reinforcement.*1-hour/);
assert.match(byId('s3-13').scoring.en,/2 different questions or statements.*without adult prompting or reinforcement.*1-hour/);
// Writing III: imitation, tracing tolerances, legibility and independent name/letter writing.
for(let n=11;n<=15;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`w3-${n}`)[field][lang].trim());
assert.match(byId('w3-11').scoring.en,/5 different writing actions modeled by an adult/);
assert.match(byId('w3-11').scoring.en,/3 different writing actions modeled by an adult/);
assert.match(byId('w3-12').scoring.en,/independently traces within ¼ inch of 5 different geometrical shapes/);
assert.match(byId('w3-12').scoring.en,/full credit if he is close/);
assert.match(byId('w3-12').scoring.en,/independently traces within 1\/2 inch of 5 different geometrical shapes/);
assert.match(byId('w3-13').scoring.en,/10 letters or numbers of any size legibly/);
assert.match(byId('w3-13').scoring.en,/without seeing the model/);
assert.match(byId('w3-13').scoring.en,/5 letters or numbers of any size legibly/);
assert.match(byId('w3-14').text.en,/without copying/);
assert.match(byId('w3-14').scoring.en,/not clear enough to read, and\/or he misspells/);
assert.match(byId('w3-14').scoring.en,/independently and legibly writes and correctly spells his own name/);
assert.match(byId('w3-14').scoring.en,/does not need to be neat/);
assert.equal(byId('w3-14').sourceNote, undefined);
assert.match(byId('w3-15').scoring.en,/independently copies all 26 uppercase and lowercase letters/);
assert.match(byId('w3-15').scoring.en,/approximates the letters, but they are not clear enough to read/);
// LRFFC III: similar wrong choices, multiple verbal components and rotating-topic responses.
for(let n=11;n<=15;n++)for(const field of ['text','objective','materials','examples','application','scoring'])for(const lang of ['en','ar'])assert.ok(byId(`lr3-${n}`)[field][lang].trim());
assert.match(byId('lr3-11').text.en,/array of 10.*3 similar stimuli.*wrong choices/);
assert.match(byId('lr3-11').scoring.en,/array of 10 or from a book.*3 or more similar stimuli.*25 different LRFFC tasks/);
assert.match(byId('lr3-11').scoring.en,/15 items/);
assert.match(byId('lr3-12').text.en,/2 verbal components/);
assert.match(byId('lr3-13').text.en,/3 verbal components/);
for(const id of ['lr3-12','lr3-13']){assert.match(byId(id).scoring.en,/25 items/);assert.match(byId(id).scoring.en,/15 items/);}
assert.match(byId('lr3-14').scoring.en,/4 items for 25 different topics/);
assert.match(byId('lr3-14').scoring.en,/4 items for 15 different topics/);
assert.match(byId('lr3-14').scoring.en,/verbalize the correct answer instead of pointing/);
assert.match(byId('lr3-14').scoring.en,/unless it is rote/);
assert.match(byId('lr3-15').scoring.en,/1000 different LRFFC responses.*accumulated list/);
assert.match(byId('lr3-15').scoring.en,/750 different LRFFC responses.*accumulated list/);
const compatible=M.blank();compatible.scores.milestones['m1-1']=1;assert.equal(M.hasScore(compatible,'milestones',byId('m1-1')),true);
compatible.scores.milestones['e2-6']=1;assert.equal(M.hasScore(compatible,'milestones',byId('e2-6')),false);
compatible.scores.milestones['e2-7']=1;assert.equal(M.hasScore(compatible,'milestones',byId('e2-7')),true);
compatible.scores.milestones['e2-7']=.5;assert.equal(M.hasScore(compatible,'milestones',byId('e2-7')),false);
compatible.scores.milestones['iv2-8']=.5;assert.equal(M.hasScore(compatible,'milestones',byId('iv2-8')),true);compatible.scores.milestones['iv2-8']=0;assert.equal(M.hasScore(compatible,'milestones',byId('iv2-8')),false);
compatible.goals['m1-1']={selected:true,goal:'Retained goal',criterion:'Retained criterion'};assert.equal(M.currentPlan(compatible,byId('m1-1'),compatible.goals['m1-1']),true);
const compatibleNext=M.startFollowup(compatible);M.setScore(compatibleNext,'milestones',byId('m1-1'),.5);assert.equal(M.comparison(compatibleNext,'milestones',byId('m1-1')).change,-.5);
const old=M.blank();old.scores.milestones['l2-9']=.5;old.comments['l2-9']='retained';old.customCriteria['l2-9']={text:'Earlier task',scoring:'Earlier criterion'};
const normalized=M.normalize(JSON.parse(JSON.stringify(old)));
assert.equal(normalized.scores.milestones['l2-9'],.5);assert.equal(M.hasScore(normalized,'milestones',byId('l2-9')),false);
assert.equal(M.eligible(byId('l2-9'),normalized),true);assert.equal(normalized.comments['l2-9'],'retained');
assert.equal(M.stats(normalized,items,'milestones').pending,1);
M.setScore(normalized,'milestones',byId('l2-9'),.5);assert.equal(M.stats(normalized,items,'milestones').pending,0);
const next=M.startFollowup(normalized,'2026-10-15');assert.equal(next.scores.milestones['l2-9'],undefined);
M.setScore(next,'milestones',byId('l2-9'),1);assert.equal(M.comparison(next,'milestones',byId('l2-9')).change,.5);
assert.equal(M.previous(next).scores.milestones['l2-9'],.5);
assert.equal(M.hasScore(M.normalize(JSON.parse(JSON.stringify(next))),'milestones',byId('l2-9')),true);
state.child.name='<img src=x onerror=alert(1)>';state.reportScope={milestones:true,barriers:false,transitions:false,eesa:false,tasks:false,goals:false};
for(const lang of ['ar','en']){
 state.reportLang=lang;const report=R.make(state,D);
 assert.equal(report.blocks.length,1,'Concise milestone-only report is one sheet');
 assert.equal((report.html.match(/data-milestone-level=/g)||[]).length,3);
 assert.equal((report.html.match(/class="report-color-mark/g)||[]).length,170,'Every score has a color mark');
 assert.ok(!report.html.includes('P: '));
 assert.ok(report.html.includes('&lt;img'));assert.ok(!report.html.includes('<img src=x'));
 assert.ok(!report.html.includes('profile-row'));
}
state.child.language='Arabic / Syrian dialect';assert.ok(R.make(state,D).text.includes(state.child.language));
state.clinical='Observed independent responses. '.repeat(150);state.reportDetails=true;const detail=R.make(state,D);
assert.equal(detail.blocks.length,2,'Milestone chart and item details are separate sheets');
assert.equal(new Set([...detail.html.matchAll(/data-report-item="([^"]+)"/g)].map(m=>m[1])).size,170);
assert.ok(!detail.text.includes('Observed independent responses.'),'Removed narrative fields do not appear in the report');
state.reportLayout='tasks';assert.equal(M.normalize(state).reportLayout,'tasks');assert.equal(M.startFollowup(state).reportLayout,'tasks');
const tasksReport=R.make(state,D);assert.ok(!tasksReport.html.includes('milestone-sheet'));assert.ok(tasksReport.html.includes('data-page-rows'));
state.reportLayout='tables';
const packed=P.pack(state,D);assert.equal(packed.assessment.reportDetails,true);assert.equal(Object.keys(packed.assessment.scores.barriers).length,0);
const relContext={self:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/pwa-release.js'),'utf8'),relContext);
for(const file of relContext.self.VBMAPP_RELEASE.files)assert.equal(file.integrity,'sha256-'+crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file.url))).digest('base64'));
console.log('PASS: all 170 complete and scoreable milestones, precise full/half constraints, protected old scores, follow-up, concise/detail reports, selected-section payloads and offline integrity.');
