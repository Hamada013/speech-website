import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {LETTERS,CONSONANTS,MODES,VOWELS,bank,makeItem,newAssessment,addResponse,summarize,validSession,choicesFor} from '../model.mjs';
const root=new URL('../',import.meta.url);
assert.equal(LETTERS.length,28);assert.equal(CONSONANTS.length,25);
for(const letter of LETTERS)assert.ok(fs.existsSync(new URL(`images/${letter.id}.png`,root)));
let count=0;
for(const mode of MODES)for(const letter of CONSONANTS){
 const items=bank([letter.id],mode);assert.equal(items.length,mode==='vcv'?9:3);
 for(const item of items){assert.ok(fs.existsSync(new URL(item.audio,root)),item.audio);assert.equal(item.parts.length,mode==='vcv'?3:2);assert.equal(new Set(choicesFor(item,items)).size,3);count++;}
}
assert.deepEqual(makeItem('cv',2,1).parts,[2,1]);assert.equal(makeItem('cv',2,1).audio,'sounds/2/1.wav');
assert.deepEqual(makeItem('vc',2,27).parts,[27,2]);assert.equal(makeItem('vc',2,27).audio,'sounds/2/5.wav');
assert.deepEqual(makeItem('vcv',2,28,27).parts,[28,2,27]);assert.equal(makeItem('vcv',2,28,27).audio,'sounds/2/14.wav');
assert.equal(bank([2,3,12],'vcv').length,27);assert.equal(bank([2,3],'vcv',1).length,6);
assert.throws(()=>makeItem('cv',1,1));
const listening=newAssessment('listening',[2],'cv');assert.ok(validSession(listening));
const first=listening.plan[0],wrong=first.choices.find(id=>id!==first.id);
assert.equal(addResponse(listening,{id:first.id,outcome:'correct',selected:wrong}),false);
assert.equal(addResponse(listening,{id:first.id,outcome:'incorrect',selected:wrong}),true);
assert.equal(addResponse(listening,{id:first.id,outcome:'correct',selected:first.id}),false,'A retry cannot become a first-attempt success');
const second=listening.plan[1];assert.equal(addResponse(listening,{id:second.id,outcome:'correct',selected:second.id}),true);
const third=listening.plan[2];assert.equal(addResponse(listening,{id:third.id,outcome:'skip'}),true);
assert.equal(listening.status,'complete');assert.deepEqual(summarize(listening),{total:3,recorded:3,assessed:2,correct:1,emerging:0,skipped:1,accuracy:50,modeled:0});assert.ok(validSession(listening));
assert.equal(addResponse(listening,{id:third.id,outcome:'correct',selected:third.id}),false);
const production=newAssessment('production',[2],'vc');
for(const [i,outcome] of ['incorrect','emerging','correct'].entries())assert.ok(addResponse(production,{id:production.plan[i].id,outcome,modeled:i===1}));
assert.equal(summarize(production).accuracy,33);assert.equal(summarize(production).emerging,1);assert.equal(summarize(production).modeled,1);assert.ok(validSession(production));
const bad=structuredClone(listening);bad.plan[0].choices=[bad.plan[0].id];assert.equal(validSession(bad),false);
assert.equal(validSession({...production,cues:{anything:true}}),false);
for(const file of ['syllable.html','matching.html']){const html=fs.readFileSync(new URL(file,root),'utf8');assert.ok(!/https?:\/\/(?:cdn|fonts|assets\.mixkit)/.test(html));assert.ok(!/user-scalable=no|maximum-scale=1/.test(html));}
console.log(`PASS: ${count} real CV/VC/VCV audio targets; picture paths, three listening choices, finite tests, one response per trial, production grades/cues, resume validation and local/zoom-friendly pages.`);
