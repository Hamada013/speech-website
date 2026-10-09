// Run: node child/tests/screener.test.cjs
// Tests recording and clinical inference; the DOM stub does not verify visual layout.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function fixture(saved=null){
 const elements=new Map(),storage=new Map();if(saved)storage.set('aghanem-arabic-articulation-v1',JSON.stringify(saved));
 function el(id){if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',checked:false,hidden:false,dataset:{},style:{},addEventListener(){},setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];},querySelectorAll(){return[];},querySelector(){return el(id+'-query');},focus(){},showModal(){this.open=true;},close(){this.open=false;}});return elements.get(id);}
 const context={console,Blob,URL,setTimeout,document:{getElementById:el,querySelectorAll(){return[];},querySelector(){return null;},addEventListener(){},title:'Screener',body:{append(){}},createElement(){return{click(){},remove(){}}}},window:{addEventListener(){},removeEventListener(){},print(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}};
 vm.createContext(context);for(const file of ['stimuli','browser','phonology','reporting','dropdowns','app'])vm.runInContext(fs.readFileSync(path.join(root,'assets',file+'.js'),'utf8'),context);
 return{run:code=>vm.runInContext(code,context),el};
}
const {run,el}=fixture();
assert.equal(run('allProbes.length'),84);assert.equal(run('new Set(allProbes.map(p=>p.image)).size'),69);
assert.equal(run('allProbes.every(p=>p.spoken&&p.reference)'),true);
assert.equal(run("allProbes.find(p=>p.id==='s1-1').spoken"),'فأس');
assert.equal(run("allProbes.find(p=>p.id==='s1-1').targetIPA"),'ʔ');
assert.equal(run("allProbes.find(p=>p.id==='s1-1').reference"),'faʔs');
assert.equal(run("allProbes.find(p=>p.id==='s1-2').spoken"),'ماء');
assert.equal(run("allProbes.find(p=>p.id==='s1-2').reference"),'maːʔ');
assert.equal(run("allProbes.find(p=>p.id==='s1-2').gloss"),'water');
assert.equal(run("allProbes.find(p=>p.id==='s1-2').image"),'3.png');

assert.equal(run("allProbes.find(p=>p.id==='s28-0').spoken"),'إيد');
assert.equal(run("allProbes.find(p=>p.id==='s28-0').targetIPA"),null);
assert.equal(run("allProbes.find(p=>p.id==='s21-0').targetIPA"),'ʔ');
assert.equal(run('aggregate().scored'),0);assert.equal(run('processAnalysis().results.length'),0);
assert.equal((el('trials').innerHTML.match(/class="trial play-card"/g)||[]).length,1);
run('selectPicture(83)');assert.equal(run('selectedProbe'),83);assert.equal(el('nextPicture').disabled,undefined); // disabled attribute is tested in markup
assert.ok(el('trials').innerHTML.includes('id="nextPicture" class="arrow-button" aria-label="الصورة التالية" disabled'));
run('selectPicture(84)');assert.equal(run('selectedProbe'),83);run('selectPicture(-1)');assert.equal(run('selectedProbe'),0);
run("recordScore('s1-0','substitution')");assert.equal(run("state.trials['s1-0']?.status"),undefined);
run("$('closeSound').onclick()");assert.equal(run('soundPicker'),null);assert.equal(run("state.trials['s1-0']?.status"),undefined);
run("recordScore('s22-0','substitution');useSound('t')");assert.equal(run("state.trials['s22-0'].actualIPA"),'t');
assert.equal(run("processAnalysis().results.find(r=>r.id==='fronting').count"),1);
run("recordScore('s22-1','substitution');useSound('d');recordScore('s22-2','correct')");
assert.equal(run("processAnalysis().results.find(r=>r.id==='fronting').count"),2);
assert.equal(run("processAnalysis().results.find(r=>r.id==='fronting').opportunities"),3);
run("state.trials['s22-1'].mode='imitation'");
assert.equal(run("processAnalysis().results.filter(r=>r.id==='fronting').length"),2);
assert.equal(run("processAnalysis().results.find(r=>r.id==='fronting'&&r.mode==='naming').opportunities"),2);
run("recordScore('s12-0','substitution');useSound('t');recordScore('s10-0','substitution');useSound('w');recordScore('s13-0','substitution');useSound('s');recordScore('s14-0','substitution');useSound('s');recordScore('s2-2','omission')");
for(const id of ['stopping','gliding','depalatalization','deemphasis','finalDeletion'])assert.ok(run(`processAnalysis().results.some(r=>r.id==='${id}')`),id);
run("recordScore('s4-0','dialect')");assert.equal(run('aggregate().dialect'),1);
const count=run('aggregate().scored');run("recordScore('s28-0','omission')");assert.equal(run('aggregate().scored'),count);assert.equal(run("state.trials['s28-0']?.status"),undefined);
run("recordScore('s2-0','substitution');useSound('an unlisted sound','custom')");
assert.ok(run("processAnalysis().pending.some(p=>p.id==='s2-0'&&p.reason==='replacement')"));
run("recordScore('s4-1','substitution');useSound('s')");
assert.ok(run("processAnalysis().pending.some(p=>p.id==='s4-1'&&p.reason==='same')"));
run("recordScore('s22-0','correct')");assert.equal(run("state.trials['s22-0'].actualIPA"),undefined);
run("changeTrial({dataset:{trial:'s22-0',prop:'word'},value:'different word'})");assert.equal(run("state.trials['s22-0'].status"),undefined);assert.equal(run("state.trials['s22-0'].targetIPA"),'');
assert.ok(run("pictureMarkup(allProbes.find(p=>p.id==='s22-0')).includes('كلمة بديلة')"));
run("openSoundPicker('s22-0','targetIPA');useSound('k');recordScore('s22-0','substitution');useSound('t')");
assert.equal(run("state.trials['s22-0'].targetIPA"),'k');
run("state.meta.childName='<script>child</script>';state.meta.analysis='ملاحظة عربية';state.meta.analysisEn='English clinician note';state.trials['s22-0'].note='<img src=x>';state.trials['s22-0'].noteEn='English item note'");
assert.ok(!run('reportHTML().includes("<script>child")'));assert.ok(run('reportHTML().includes("&lt;img")'));
run("$('reportLanguage').value='en';refreshReport()");
assert.ok(run('reportHTML().includes("Arabic Speech Sound Screening Report")'));
assert.ok(run('reportHTML().includes("Automatic phonological analysis")'));
assert.ok(run('reportHTML().includes("English clinician note")'));
assert.ok(run('reportHTML().includes("English item note")'));
assert.ok(run('reportHTML()').includes('dir="ltr" lang="en"'));
assert.ok(run('reportText().includes("Velar / uvular fronting")'));
assert.ok(run('reportText().endsWith(SIGNATURE)'));
assert.ok(run('reportHTML().includes("No connected-speech sample")'));
run("$('reportLanguage').value='ar'");assert.ok(run('reportHTML().includes("التحليل الفونولوجي التلقائي")'));
run("$('includeUntested').checked=true");assert.equal(run('reportModel().rows.length'),84);
assert.equal(run("parseDate({day:'٢٩',month:'٢',year:'٢٠٢٤'}).iso"),'2024-02-29');
assert.equal(run("parseDate({day:'29',month:'2',year:'2023'}).error"),true);
assert.equal(run("parseDate({day:'1',month:'1',year:'20'}).error"),true);
run("saving=true;save()");const saved=JSON.parse(run('localStorage.getItem(KEY)'));const restored=fixture(saved);assert.equal(restored.run("state.trials['s22-0'].actualIPA"),'t');
const legacy=fixture({version:1,state:{meta:{examiner:'Old'},trials:{'s4-0':{status:'substitution',actual:'t'}},patterns:[],recommendations:[]}});
assert.equal(legacy.run("state.trials['s4-0'].status"),'substitution');assert.equal(legacy.run("state.trials['s4-0'].targetIPA"),'');assert.equal(legacy.run('processAnalysis().pending.length'),1);
// Feature rules and dialect exclusions independent of the supplied word list.
run(`const mock=[{id:'test',targetIPA:'dʒ',position:'أول الكلمة',word:'word'}];`);
assert.equal(run("analyzeProcesses(mock,{test:{status:'substitution',actualIPA:'ʒ'}}).results[0].id"),'deaffrication');
assert.equal(run("analyzeProcesses([{...mock[0],targetIPA:'b'}],{test:{status:'substitution',actualIPA:'p'}}).results[0].id"),'devoicing');
assert.equal(run("analyzeProcesses([{...mock[0],targetIPA:'t'}],{test:{status:'substitution',actualIPA:'d'}}).results[0].id"),'voicing');
assert.equal(run("analyzeProcesses([{...mock[0],targetIPA:'θ'}],{test:{status:'dialect',actualIPA:'t'}}).results.length"),0);
run("openSoundPicker('s21-0','targetIPA');useSound('q')");
assert.equal(run("state.trials['s21-0'].expected"),'qalam');
run("openSoundPicker('s12-2','targetIPA');useSound('z')");
assert.equal(run("state.trials['s12-2'].expected"),'ʃamz');
assert.equal(run("phoneme('/dʒ/').ipa"),'dʒ');
assert.equal(run("phoneme('ɡ').ipa"),'ɡ');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/(?:src|href)="(assets\/[^"#]+)"/g))assert.ok(fs.existsSync(path.join(root,m[1])));
const css=fs.readFileSync(path.join(root,'assets/styles.css'),'utf8');assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
console.log('Passed: single-picture navigation, picker save/cancel/custom entry, dialect baselines, absent-target protection, pattern rules and opportunity counts, elicitation separation, English/Arabic reports, authored English notes, escaping, dates, draft restore and legacy-reference review.');
