const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{value:'',checked:false,hidden:true,dataset:{},style:{},textContent:'',innerHTML:'',addEventListener(){},setAttribute(key,value){this[key]=value;},focus(){this.focused=true;},querySelectorAll(){return[];},classList:{toggle(){}}});return elements.get(id);}
const context=vm.createContext({console,Date,Set,document:{getElementById:el,documentElement:{}},localStorage:{getItem(){return null;},setItem(key,value){context.saved=value;}},window:{},setTimeout});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/app.js'),'utf8'),context);
const run=code=>vm.runInContext(code,context);
assert.equal(run('allFields.filter(f=>f.options&&!addedChoices[f.id]&&f.id!=="commLevel").every(f=>f.options.length<=4)'),true);assert.equal(run('allFields.filter(f=>f.options).every(f=>f.options.length<=12)'),true);
assert.equal(run('allFields.filter(f=>f.converted).every(f=>f.options.at(-1)===otherChoice)'),true);
assert.equal(run("allFields.find(f=>f.id==='pregnancy').options[0][1]"),'لا توجد مضاعفات حمل حسب الإفادة');
assert.equal(run("allFields.find(f=>f.id==='languages').options[0][1]"),'العربية');
// A normal response clears concerns; concerns clear normal, while multiple concerns may coexist.
run("answers.sleep=['1','2'];updateAnswer({dataset:{field:'sleep'},value:'0',checked:true})");
assert.equal(run('answers.sleep.join()'),'0');
run("updateAnswer({dataset:{field:'sleep'},value:'2',checked:true});updateAnswer({dataset:{field:'sleep'},value:'1',checked:true})");
assert.equal(run('answers.sleep.join()'),'1,2');
run("updateAnswer({dataset:{field:'sleep'},value:'3',checked:true})");
assert.equal(el('note-panel-sleep').hidden,false);assert.equal(el('sleep-note').focused,true);
assert.equal(run("migrateChoiceDraft({regression:'0'}).regression"),'1');
assert.equal(run("migrateChoiceDraft({swallowConcerns:'2'}).swallowConcerns"),'2');
// Old indices must retain their original meaning, including removed choices and Unknown.
run("const migrated=migrateChoiceDraft({sleep:['0','4'],sleepNote:'Existing note',preferred:'4',birthType:'4',hearingScreen:'3',pregnancy:'Legacy narrative'});");
assert.match(run('migrated.sleepNote'),/Existing note[\s\S]*Snoring[\s\S]*Breathing pauses reported/);
assert.equal(run('migrated.sleep.includes("0")'),false);
assert.match(run('migrated.preferredNote'),/Armenian/);assert.equal(run('migrated.preferred'),'3');
assert.match(run('migrated.birthTypeNote'),/Unknown/);assert.equal(run('migrated.birthType'),'3');
assert.match(run('migrated.hearingScreenNote'),/Unknown/);
assert.equal(run('migrated.pregnancyNote'),'Legacy narrative');
run("answers={sleep:['1'],sleepNote:'Saved note'};storageEnabled=true;save();const reloaded=migrateChoiceDraft(JSON.parse(saved).answers,JSON.parse(saved).choiceSchema)");
assert.equal(run('JSON.parse(saved).choiceSchema'),3);assert.equal(run('reloaded.sleep.join()'),'1');assert.equal(run('reloaded.sleepNote'),'Saved note');
assert.match(run('valueText(allFields.find(f=>f.id==="sleep"))'),/Snoring/);
run('lang=1;render()');assert.match(run('valueText(allFields.find(f=>f.id==="sleep"))'),/شخير/);
assert.match(run('reportHTML()'),/Saved note/);
// Schema 2 drafts: original choices keep their meaning, and only Other moves.
run("var old=migrateChoiceDraft({concerns:['1','3'],concernsNote:'n',sleep:['3']},2)");
assert.equal(run("allFields.find(f=>f.id==='concerns').options[Number(old.concerns[1])]===otherChoice"),true);assert.equal(run("old.concerns[0]"),'1');assert.equal(run("old.sleep[0]"),'3');
assert.equal(run("migrateChoiceDraft({concerns:['3']},3).concerns[0]"),'3');
// Follow-up questions appear only when relevant, and hidden answers leave the report.
run("answers={regression:'0',regressionDetails:['1']}");
assert.equal(run("isShown(allFields.find(f=>f.id==='regressionDetails'))"),false);assert.equal(run("valueText(allFields.find(f=>f.id==='regressionDetails'))"),'');
run("answers={regression:'1',regressionDetails:['1']}");
assert.equal(run("isShown(allFields.find(f=>f.id==='regressionDetails'))"),true);
run("answers={regressionDetails:['1']}");assert.equal(run("isShown(allFields.find(f=>f.id==='regressionDetails'))"),true);
// The snapshot reports explicit answers only: blanks and normal answers raise nothing.
run("answers={}");assert.equal(run("attentionItems().length"),0);assert.equal(run("snapshotHTML()"),'');
run("answers={regression:'0',swallowConcerns:'0',hearing:['0']}");assert.equal(run("attentionItems().length"),0);
run("answers={regression:'1',formalHearing:'2',concernWords:'لا يتكلم'}");assert.equal(run("attentionItems().length"),2);assert.match(run("snapshotHTML()"),/لا يتكلم/);
run("answers={concernWords:'<b>x</b>'}");assert.doesNotMatch(run("snapshotHTML()"),/<b>x/);
console.log('PASS: compact bilingual choices, normal/concern exclusivity, Other notes, legacy index preservation, schema round-trip and report labels.');
