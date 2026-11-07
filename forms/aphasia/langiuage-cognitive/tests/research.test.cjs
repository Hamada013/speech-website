'use strict';
// Research record, norms and the local collector. Run: node --test forms/aphasia/langiuage-cognitive/tests/research.test.cjs
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const R=require('../assets/research.js'),{ADDED}=require('../assets/added-items.js'),root=path.resolve(__dirname,'..');
const catalog=[...R.DOMAINS.flatMap((d,i)=>{const group={orientation:'1',auditory:'2subA',complex:'3subA',problem:'4',naming:'5',repetition:'6subA',reasoning:'7subA',organization:'8',reading:'9subA',calculation:'10',memory:'12sub1',discourse:'13sub2',gesture:'13sub4'}[d.key];return Array.from({length:5},(_,k)=>({id:`item-${group}-${k+1}`,group,section:Number(group.match(/^\d+/)[0]),observation:false,label:d.en+' '+(k+1)}));}),{id:'item-11-1',group:'11',section:11,observation:true,label:'obs'},{id:'item-1-10',group:'1',section:1,observation:false,label:'accident'}];
const all=(score)=>Object.fromEntries(catalog.map(i=>[i.id,score]));
const person=(over={})=>({group:'control',sex:'female',handedness:'right',etiology:'',hearing:'normal',vision:'normal',dialect:'syrian',otherLanguages:'no',age:45,educationYears:12,monthsPostOnset:'',...over});

test('every scored group belongs to a domain, and observations never score',()=>{
 for(const g of ['1','2subA','2subE','3subB','4','5','6subF','6subG','7subC','8','9subG','9subH','10','12sub4','13sub2','13sub4'])assert.ok(R.domainOf(g),g);
 for(const g of ['11','13sub1','13sub3','13sub5'])assert.ok(R.OBSERVATION_GROUPS.has(g),g);
 for(const [g,a] of Object.entries(ADDED)){assert.ok(a.source.length>40&&a.how&&a.items.length,g);if(!a.observation)assert.ok(R.domainOf(g),g);}
});
test('domain scores use given tasks only and need most of the domain',()=>{
 const s=R.domainScores(catalog,all('correct'));assert.equal(s.domains.orientation.total,5,'the accident item is left out');assert.equal(s.total.percent,100);assert.equal(s.total.complete,true);
 const part={...all('correct')};for(const id of ['item-5-1','item-5-2'])delete part[id];const p=R.domainScores(catalog,part);assert.equal(p.domains.naming.complete,false);assert.equal(p.total.complete,false);
 const mixed={...all('correct'),'item-4-1':'incorrect','item-4-2':'dontknow','item-4-3':'skip'};assert.equal(R.domainScores(catalog,mixed).domains.problem.percent,50);
 assert.equal(R.domainScores(catalog,{}).total.percent,null);
});
test('norm groups follow age and education, and only suitable healthy adults qualify',()=>{
 assert.equal(R.normGroup({age:45,educationYears:12}),'40–59 · >9 years');assert.equal(R.normGroup({age:70,educationYears:6}),'60+ · ≤9 years');assert.equal(R.normGroup({age:17,educationYears:6}),null);assert.equal(R.NORM_GROUPS.length,6);
 assert.equal(R.eligibleControl(person()),true);
 for(const bad of [{group:'aphasia'},{hearing:'impaired'},{vision:'impaired'},{educationYears:null}])assert.equal(R.eligibleControl(R.cleanResearch(person(bad))),false,JSON.stringify(bad));
 assert.deepEqual(R.missingResearch(R.cleanResearch(person())),[]);assert.deepEqual(R.missingResearch(R.cleanResearch(person({group:'aphasia'}))).sort(),['etiology','monthsPostOnset']);
 assert.equal(R.cleanResearch({age:'٦٤'}).age,64);assert.equal(R.cleanResearch({age:'5'}).age,null);
});
test('the research record carries no identifying details',()=>{
 const state={fields:{name:'SECRETNAME',treatingDoctor:'SECRETDOC',examinerName:'SECRETEXAM',clinicalImpression:'SECRETNOTE',fluencyAnimals:'18',profileFluency:'fluent'},responses:all('correct'),comments:{'item-1-1':'SECRETCOMMENT'},notes:{1:'SECRETNOTE'},supports:{'item-1-1':'cued'}};
 const r=R.record({caseCode:'P-ABCDEF12',assessmentId:'a1',visitDate:'2026-11-05',research:{...person(),name:'SECRETNAME'},state,catalog});
 assert.doesNotMatch(JSON.stringify(r),/SECRET|2026-11-05/);assert.equal(r.visitMonth,'2026-11');assert.equal(r.fluencyAnimals,18);assert.equal(r.items.find(i=>i.id==='item-1-1').support,'cued');
});
test('workbook norms: 5th percentile cut-off, one visit per person, outliers removed',async()=>{
 const {norms,buildWorkbook}=await import('../scripts/workbook.mjs');
 const rows=[];const add=(code,month,percent,over={})=>{const d=Object.fromEntries(R.DOMAINS.map(x=>[x.key,{total:5,assessed:5,correct:5,complete:true,percent}]));rows.push({assessmentId:code+month,caseCode:code,visitMonth:month,...person(over),domains:d,total:{complete:true,percent},fluencyAnimals:20,items:[]});};
 for(let i=0;i<40;i++)add('P-'+String(i).padStart(8,'0'),'2026-01',90+i%10);
 add('P-00000001','2026-05',10);add('P-OUTLIER0','2026-01',20);add('P-APHASIA0','2026-01',40,{group:'aphasia'});
 const n=norms(rows,{minPerGroup:30}),total=n.rows.find(x=>x.key==='40–59 · >9 years | Total');
 assert.equal(total.n,40,'later visit and the outlier are not counted');assert.equal(total.ready,true);
 const values=Array.from({length:40},(_,i)=>90+i%10).sort((a,b)=>a-b),h=39*.05;assert.equal(total.cutoff,Math.round((values[1]+(values[2]-values[1])*(h-1))*10)/10);
 assert.equal(n.rows.find(x=>x.key==='60+ · ≤9 years | Total').ready,false);
 const book=buildWorkbook({version:1,catalog,assessments:rows});assert.equal(book.subarray(0,2).toString(),'PK');assert.ok(book.length>8000);
});
test('the local collector keeps only known fields and never serves research files',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aphasia-research-')),server=cp.spawn(process.execPath,[path.join(root,'scripts/research-server.mjs')],{env:{...process.env,RESEARCH_PORT:'0',RESEARCH_DIR:dir},stdio:['ignore','pipe','inherit']});
 try{
  const base=await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{const m=String(d).match(/http:\/\/127\.0\.0\.1:\d+/);if(m)resolve(m[0]);});server.once('exit',c=>reject(Error('exit '+c)));});
  const record=R.record({caseCode:'P-ABCDEF12',assessmentId:'a1',visitDate:'2026-11-05',research:person(),state:{fields:{},responses:all('correct'),supports:{}},catalog});
  const post=(body,origin=base)=>fetch(base+'/api/aphasia/share',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
  assert.equal((await post({record:{...record,caseCode:'bad'},catalog})).status,400);
  assert.equal((await post({record,catalog},'https://unrelated.example')).status,403);
  for(let i=0;i<2;i++){const r=await post({record:{...record,name:'SECRETNAME',notes:'SECRETNOTE'},catalog});assert.equal(r.status,200);assert.equal((await r.json()).assessments,1,'resending replaces');}
  const saved=fs.readFileSync(path.join(dir,'dataset.json'),'utf8');assert.doesNotMatch(saved,/SECRET/);
  const book=await fetch(base+'/api/aphasia/workbook');assert.equal(book.status,200);assert.equal(Buffer.from(await book.arrayBuffer()).subarray(0,2).toString(),'PK');
  for(const f of ['research/dataset.json','research/settings.json','scripts/workbook.mjs','tests/research.test.cjs'])assert.equal((await fetch(base+'/'+f)).status,404,f);
  assert.equal((await fetch(base+'/research/SETUP.md')).status,200);assert.equal((await fetch(base+'/')).status,200);
  const reset=await fetch(base+'/api/aphasia/reset',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({confirm:'aphasia'})});assert.equal(reset.status,200);assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'dataset.json'),'utf8')).assessments.length,0);
 }finally{server.kill();}
});
