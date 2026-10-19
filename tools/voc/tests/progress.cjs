const assert = require('node:assert/strict');
const { create, STORAGE } = require('../assets/progress.js');
const map = new Map(); const storage = { getItem: key => map.get(key), setItem: (key, value) => map.set(key, value) };
let p = create(storage); p.signIn('  سارة  '); const first = p.active().id;
p.record('receptive', [{ key: '1_1', correct: true }, { key: '1_1', correct: false }]);
p.record('expressive', [{ key: '1_1', correct: true }]);
assert.equal(p.mastered('1_1'), false, '80%/mixed responses cannot earn 100% mastery');
p.record('receptive', [{ key: '1_1', correct: true }, { key: '1_1', correct: true }]);
assert.equal(p.mastered('1_1'), true, 'Both domains are required');
p.saveWorkspace({ slotsCount: 2, slots: ['1_1', '1_2'], practiced: '1_1|1_2' });
p.signIn('عمر'); assert.equal(p.mastered('1_1'), false); assert.equal(p.active().workspace, null);
assert.notEqual(p.scope('draft'), `draft-child-${first}`);
p.signIn('سارة'); assert.equal(p.active().id, first); assert.equal(p.active().workspace.slots.length, 2);
p = create(storage); assert.equal(p.mastered('1_1'), true); assert.equal(p.active().name, 'سارة');
for (const [difficulty, level, duration] of [['easy',2,6],['moderate',4,4],['advanced',6,2]]) {
 const keys = Array.from({length:9}, (_,i)=>`1_${i+1}`);
 const plan = p.startPlan(keys, difficulty, ['memory','rapid','test']);
 assert.equal(plan.rounds.some(round=>round.mode==='matching'),false);
 assert.deepEqual(plan.rounds.filter(round=>round.mode==='memory').flatMap(round=>round.keys), keys);
 assert.ok(plan.rounds.every(round=>round.settings.level===level && round.settings.duration===duration));
 assert.equal(plan.rounds.find(round=>round.mode==='rapid').settings.sound,false, 'Production assessment hides its spoken answer');
 assert.equal(p.advancePlan('stale', 0), null); assert.equal(p.active().plan.position,0);
 while(p.currentRound()) {const at=p.active().plan; p.advancePlan(at.id,at.position);}
 assert.equal(p.active().plan,null);
}
p.startPlan(['1_1'], 'easy', ['matching','memory','rapid','test']);
const M = require('../assets/game-model.js');
for (const round of p.active().plan.rounds) {
 const session = M.createSession(round.mode, [{key:'1_1',name:'أريد',imageHash:'one'}], round.settings, 'v');
 assert.deepEqual(session.order,['1_1']);
}
p.cancelPlan(); assert.equal(p.currentRound(),null);
let warned=false; create({getItem:()=>'{broken',setItem:()=>{throw Error();}},()=>warned=true).signIn('<script>'); assert.equal(warned,true);
assert.equal(JSON.parse(map.get(STORAGE)).schema,1);
console.log('Child profile, mastery, persistence, and automation rules passed.');

p.startPlan(['1_1','1_2'], 'easy', ['rapid','test']);
let plan=p.active().plan;
p.advancePlan(plan.id,0,{domain:'expressive',records:[{key:'1_1',correct:true},{key:'1_2',correct:false}]});
p = create(storage); plan=p.active().plan;
p.advancePlan(plan.id,1,{domain:'receptive',records:[{key:'1_1',correct:false},{key:'1_2',correct:true}]});
assert.equal(p.active().homeLesson.evidence.length,2);
const {text:lessonText}=require('../assets/home-lesson.js');
const note=lessonText(p.active().name,p.active().homeLesson,[{key:'1_1',name:'كرة'},{key:'1_2',name:'تفاحة'}]);
assert.ok(note.startsWith('مرحباً، أنا سارة!'));
assert.ok(note.includes('كنت شاطر بهالكلمات: تفاحة.'));
assert.ok(note.includes('بحتاج مساعدتكم فيها: كرة.'));
assert.ok(note.includes('كنت شاطر بهالكلمات: كرة.'));
assert.ok(!note.includes('undefined'));
p.startPlan(['1_2'],'easy',['memory']);plan=p.active().plan;p.advancePlan(plan.id,0);
assert.deepEqual(p.active().homeLesson.evidence,[],'Practice-only plans must not invent assessment results');
assert.ok(lessonText('عمر',p.active().homeLesson,[{key:'1_2',name:'تفاحة'}]).includes('ما سجّلنا استجابة'));
console.log('Completed-plan home lessons preserve separate, session-specific comprehension/production evidence.');
