const assert=require('node:assert/strict'),M=require('../assets/model.js');
const fixture=()=>{const queue=[...M.ids,...M.ids];return {id:'session',mode:'assessment',queue,complete:true,started:'2026-10-27T10:00:00Z',trials:queue.map(target=>({target,response:target,choices:[...M.ids],assisted:false,phase:'test'}))};};
assert(M.eligible(fixture()));
for(const mutate of [s=>s.complete=false,s=>s.trials[3].assisted=true,s=>s.trials[2].choices.pop(),s=>s.trials.pop(),s=>s.mode='practice',s=>s.trials[0].phase='introduction',s=>s.queue[1]=s.queue[0]]){const s=fixture();mutate(s);assert.equal(M.classify(s),'practice');}
const noResponse=fixture();noResponse.trials[0].response=null;assert(M.eligible(noResponse));M.validateSession(noResponse);
const tampered=fixture();tampered.trials[0].target='unknown';assert.throws(()=>M.validateSession(tampered));
const child={id:'child',caseId:'LING-1',name:'Private name',sessions:[fixture()]};const payload=M.research(child,'source');assert(!JSON.stringify(payload).includes('Private name'));payload.sessions[0].trials[0].assisted=true;assert.equal(child.sessions[0].trials[0].assisted,false);
console.log('PASS eligibility: six visible choices, balanced complete test, no assistance; practice/partial separation; null responses and anonymized copies.');
module.exports={fixture};
