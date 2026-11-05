import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newSession,ageMonths,mchatSummary,blafSummary,validSession,concern,todayLocal,validDate} from './model.mjs';
const blaf=JSON.parse(fs.readFileSync(new URL('../BALF/assets/data.json',import.meta.url))),mchat=JSON.parse(fs.readFileSync(new URL('../M-CHAT/assets/data.json',import.meta.url)));
assert.equal(blaf.items.length,12);assert.equal(mchat.items.length,23);assert.ok(blaf.items.every(i=>i.options.length===5&&i.options.every((o,k)=>o.score===k+1)));
assert.notDeepEqual(blaf.items.find(i=>i.id==='vocal_play').options,blaf.items.find(i=>i.id==='vocal_imitation').options,'Spontaneous speech and imitation must have separate criteria');
assert.match(blaf.items.find(i=>i.id==='cooperation').options[1].text.en,/reward/);assert.doesNotMatch(blaf.items.find(i=>i.id==='cooperation').options[1].text.en,/firm commands/);
assert.equal(validDate('2024-02-29'),true);assert.equal(validDate('2023-02-29'),false);assert.equal(validDate('2024-13-01'),false);
assert.equal(ageMonths('2024-01-15','2025-05-14'),15);assert.equal(ageMonths('2024-01-15','2025-05-15'),16);assert.equal(ageMonths('2024-01-15','2026-08-15'),31);assert.equal(ageMonths('2027-01-01','2026-01-01'),null);
function caseM(score){const s=newSession('mchat');s.meta={...s.meta,child:'QA Child',dob:'2024-03-01',date:'2026-01-01',respondent:'parent',official:true};for(let id=1;id<=23;id++)s.answers[id]=[11,18,20,22].includes(id)?'no':'yes';for(let id=1;id<=score;id++)s.answers[id]=s.answers[id]==='yes'?'no':'yes';return s;}
for(const [score,band]of [[0,'low'],[2,'low'],[3,'followup'],[7,'followup'],[8,'high'],[23,'high']]){const s=caseM(score),r=mchatSummary(s);assert.equal(r.score,score);assert.equal(r.band,band);assert.equal(r.other,23-score);assert.ok(validSession(s,mchat));}
const crit=caseM(0);crit.answers[2]='no';crit.answers[7]='no';assert.equal(mchatSummary(crit).band,'low','Current original-version guidance uses total score, not the historical Critical6 cutoff');
for(const id of [11,18,20,22])assert.equal(concern(id,'yes'),true);assert.equal(concern(1,'yes'),false);assert.equal(concern(1,null),null);
for(const mutate of [s=>delete s.answers[1],s=>s.answers[1]=null,s=>s.meta.dob='',s=>s.meta.dob='2025-03-01',s=>s.meta.dob='2020-01-01',s=>s.meta.respondent='other',s=>s.meta.official=false,s=>s.meta.date='2099-01-01']){const s=caseM(8);mutate(s);assert.equal(mchatSummary(s).band,null,'Do not assign a screening band to incomplete or inapplicable records');}
const b=newSession('blaf');assert.equal(blafSummary(b,blaf.items).answered,0);b.answers.cooperation=1;b.answers.mand=5;b.answers.vocal_play=null;const bs=blafSummary(b,blaf.items);assert.equal(bs.answered,2);assert.equal(bs.missing,10);assert.equal(bs.complete,false);assert.equal(bs.values.find(i=>i.id==='cooperation').score,1);assert.ok(validSession(b,blaf));
for(const bad of [0,6,'3',NaN]){const invalid=structuredClone(b);invalid.answers.cooperation=bad;assert.equal(validSession(invalid,blaf),false);}
assert.equal(validSession({...b,status:'complete'},blaf),false);assert.equal(validSession({...b,index:12},blaf),false);assert.equal(validSession({...b,kind:'mchat'},blaf),false);assert.match(todayLocal(),/^\d{4}-\d{2}-\d{2}$/);
console.log('PASS: original M-CHAT 0/2/3/7/8/23 boundaries, four reverse items, age/respondent/form/missing-answer guards; BLAF 12 domains, independent imitation anchors, ordinal ratings and missing-data integrity.');
