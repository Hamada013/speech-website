const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),vm=require('node:vm'),schema=require('../assets/research-schema.js');
const {validateAphasia}=require('../scripts/aphasia-research-model.cjs');
let child;
(async()=>{
 const dataDir=await fs.mkdtemp(path.join(os.tmpdir(),'articulation-collector-'));
 const stimuli=await fs.readFile(path.resolve(__dirname,'../assets/stimuli.js'),'utf8');
 const probes=JSON.parse(vm.runInNewContext(stimuli+';JSON.stringify(SOUNDS.flatMap(sound=>sound.probes.map(p=>({...p,sound}))))',{}));
 const state={meta:{assessment:{day:'26',month:'10',year:'2026'},participantCode:'TEST-COLLECTOR'},trials:{'s1-0':{status:'correct'}}};
 const fixture=schema.createPayload({id:'TEST-CHILD',name:'Synthetic collector test',assessments:[{id:'TEST-A',state,createdAt:'2026-10-26T10:00:00Z',updatedAt:'2026-10-26T10:00:00Z'},{id:'TEST-B',state,createdAt:'2026-10-26T11:00:00Z',updatedAt:'2026-10-26T11:00:00Z'}]},probes);
 const entry=path.resolve(__dirname,'../scripts/research-server.mjs');
 child=spawn(process.execPath,[entry],{env:{...process.env,RESEARCH_PORT:'0',RESEARCH_DATA_DIR:dataDir},stdio:['ignore','pipe','pipe']});
 const base=await new Promise((resolve,reject)=>{child.stdout.on('data',data=>{const match=data.toString().match(/http:\/\/127\.0\.0\.1:\d+/);if(match)resolve(match[0]);});child.stderr.on('data',data=>process.stderr.write(data));child.once('error',reject);child.once('exit',code=>{if(code)reject(Error('Collector exited '+code));});});
 assert.deepEqual(await(await fetch(base+'/api/research/status')).json(),{service:'local-research-workbooks'});
 const post=async(data,origin=base)=>fetch(base+'/api/research/share',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
 assert.equal((await post(fixture,'https://unrelated.example')).status,403);
 const first=await post(fixture);assert.equal(first.status,200);assert.deepEqual(await first.json(),{assessments:2,findings:168});
 const second=await post(fixture);assert.equal(second.status,200);assert.deepEqual(await second.json(),{assessments:2,findings:168});
 const saved=JSON.parse(await fs.readFile(path.join(dataDir,'dataset.json'),'utf8'));assert.equal(saved.findingRows.length,168);assert((await fs.stat(path.join(dataDir,'arabic-speech-research.xlsx'))).size>10000);
 assert.equal((await fetch(base+'/research/dataset.json')).status,403);
 const workbook=await fetch(base+'/api/research/workbook');assert.equal(workbook.status,200);assert.match(workbook.headers.get('content-disposition'),/arabic-speech-research.xlsx/);assert.equal(Buffer.from(await workbook.arrayBuffer()).subarray(0,2).toString(),'PK');
 const aphasia={version:1,case:{id:'case-a',name:'Local fixture',assessments:[{id:'visit-a',createdAt:'2026-10-27',state:{fields:{currentDate:'2026-10-27',clinicalImpression:'=NOT_A_FORMULA()'},responses:{'item-1-1':'correct','item-11-1':'present'},comments:{},notes:{},supports:{}}}]},catalog:[{id:'item-1-1',section:1,group:'1',observation:false,label:'Task'},{id:'item-11-1',section:11,group:'11',observation:true,label:'Observation'}]};
 assert.equal(validateAphasia(aphasia).case.id,'case-a');assert.throws(()=>validateAphasia({...aphasia,catalog:[]}));
 const postA=async data=>fetch(base+'/api/aphasia/share',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(data)});
 for(let i=0;i<2;i++){const result=await postA(aphasia);assert.equal(result.status,200);assert.deepEqual(await result.json(),{cases:1,assessments:1,items:2,caseId:'case-a'});}
 aphasia.case.assessments.push({...aphasia.case.assessments[0],id:'visit-b'});let result=await postA(aphasia);assert.equal(result.status,200);assert.equal((await result.json()).assessments,2);
 const secondCase=JSON.parse(JSON.stringify(aphasia));secondCase.case.id='case-b';secondCase.case.assessments.forEach(a=>a.id+='-b');result=await postA(secondCase);assert.equal((await result.json()).assessments,4);
 const localA=await fetch(base+'/api/aphasia/workbook');assert.equal(localA.status,200);assert.equal(Buffer.from(await localA.arrayBuffer()).subarray(0,2).toString(),'PK');assert.equal((await fetch(base+'/forms/aphasia/langiuage-cognitive/')).status,200);assert.equal((await fetch(base+'/forms/aphasia/langiuage-cognitive/research/dataset.json')).status,403);
 const savedA=JSON.parse(await fs.readFile(path.join(dataDir,'aphasia/dataset.json'),'utf8'));assert.equal(savedA.length,2);assert.equal(savedA[0].case.assessments.length,2);
 const reset=async(app,confirm=app,origin=base)=>fetch(base+'/api/'+app+'/reset',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({confirm})});
 assert.equal((await reset('research','aphasia')).status,400);assert.equal((await reset('research','research','https://unrelated.example')).status,403);
 result=await reset('research');assert.equal(result.status,200);assert.deepEqual(await result.json(),{reset:'research'});assert.equal(JSON.parse(await fs.readFile(path.join(dataDir,'dataset.json'),'utf8')).caseRows.length,0);assert.deepEqual(JSON.parse(await fs.readFile(path.join(dataDir,'aphasia/dataset.json'),'utf8')),savedA);
 result=await reset('aphasia');assert.equal(result.status,200);assert.deepEqual(JSON.parse(await fs.readFile(path.join(dataDir,'aphasia/dataset.json'),'utf8')),[]);assert.equal((await fetch(base+'/api/aphasia/workbook')).status,200);
 // Export after reset starts a new collection and remains idempotent.
 result=await post(fixture);assert.equal((await result.json()).assessments,2);assert.equal(JSON.parse(await fs.readFile(path.join(dataDir,'aphasia/dataset.json'),'utf8')).length,0);
 console.log('PASS: both local collectors write/download real XLSX files, upsert without duplication, retain other cases, reject unapproved origins and hide raw records.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>child?.kill());
