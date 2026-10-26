const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),vm=require('node:vm'),schema=require('../assets/research-schema.js');
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
 const post=async(data,origin=base)=>fetch(base+'/api/research/share',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
 assert.equal((await post(fixture,'https://unrelated.example')).status,403);
 const first=await post(fixture);assert.equal(first.status,200);assert.deepEqual(await first.json(),{assessments:2,findings:168});
 const second=await post(fixture);assert.equal(second.status,200);assert.deepEqual(await second.json(),{assessments:2,findings:168});
 const saved=JSON.parse(await fs.readFile(path.join(dataDir,'dataset.json'),'utf8'));assert.equal(saved.findingRows.length,168);assert((await fs.stat(path.join(dataDir,'arabic-speech-research.xlsx'))).size>10000);
 assert.equal((await fetch(base+'/research/dataset.json')).status,403);
 console.log('PASS: real local collector writes XLSX/JSON inside its configured folder, updates without duplication, rejects unapproved origins and does not serve raw records.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>child?.kill());
