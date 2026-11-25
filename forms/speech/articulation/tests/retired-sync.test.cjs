// Google sync (Firebase project speech-apps-5d3b0) was removed on 2026-11-25. Checks:
// - assets/retired-sync.js brings every Google account's local space back into the device's own store, once,
//   without losing or resurrecting anything, and leaves storage untouched when it cannot save;
// - no Firebase code, configuration or retired online collector path is left in the form;
// - v1 research workbooks still migrate (kept from the former cloud test).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {mergeAccountSpaces,LOCAL,SPACE,DONE}=require('../assets/retired-sync.js'),schema=require('../assets/research-schema.js');
const root=path.resolve(__dirname,'..');

function memory(initial={},{limit=Infinity}={}){
 const data=new Map(Object.entries(initial));
 return {data,get length(){return data.size;},key:i=>[...data.keys()][i]??null,getItem:k=>data.has(k)?data.get(k):null,
  setItem(k,v){const size=[...data].reduce((n,[key,val])=>n+(key===k?0:val.length),0)+String(v).length;if(size>limit)throw Error('QuotaExceededError');data.set(k,String(v));},removeItem:k=>{data.delete(k);}};
}
const record=(id,updatedAt,status='correct')=>({id,createdAt:'2026-10-0'+id.slice(-1)+'T10:00:00Z',updatedAt,cursor:0,state:{meta:{},trials:{a:{status}}}});
const child=(id,name,assessments)=>({id,name,createdAt:'2026-10-01T09:00:00Z',avatar:'leaf',assessments});
const store=(children,active=null,activeAssessment=null)=>JSON.stringify({version:2,children,activeChild:active,activeAssessment});
const read=s=>JSON.parse(s.getItem(LOCAL));

// 1. A device that was signed in: its own store was removed after the upload; the account space holds everything.
{const s=memory({'articulation-cloud-owner':'u1','articulation-guest-claimed-by':'u1',[SPACE+'u1']:store([child('c1','سارة',[record('a1','2026-10-02')])],'c1','a1'),'articulation-cloud-baseline-u1':'{"copy":true}'});
 assert.equal(mergeAccountSpaces(s),true);
 const local=read(s);assert.deepEqual(local.children.map(c=>c.name),['سارة'],'Signed-in cases come back to the device store');
 assert.equal(local.activeChild,'c1','The case on screen stays on screen');assert.equal(local.activeAssessment,'a1');
 assert.equal(s.getItem('articulation-cloud-owner'),null);assert.equal(s.getItem('articulation-guest-claimed-by'),null);
 assert.ok(s.getItem(SPACE+'u1'),'The account space stays as a backup');assert.deepEqual(JSON.parse(s.getItem(DONE)),[SPACE+'u1']);
 assert.equal(s.getItem('articulation-cloud-baseline-u1'),'{"copy":true}','Baselines are only dropped when storage is full');
 // Later: the therapist deletes the child; launching again must not bring it back from the backup.
 s.setItem(LOCAL,store([],null,null));assert.equal(mergeAccountSpaces(s),true);assert.equal(read(s).children.length,0,'A deleted child never returns');}

// 2. A device that signed out: its own store and an account space both hold cases; the newer copy of a shared assessment wins.
{const s=memory({[LOCAL]:store([child('c1','سارة',[record('a1','2026-10-02','correct')]),child('c2','علي',[record('a2','2026-10-03')])],'c2','a2'),
  [SPACE+'u1']:store([child('c1','سارة',[record('a1','2026-10-05','distortion'),record('a3','2026-10-06')]),child('c3','ليان',[record('a4','2026-10-04')])],'c1','a1'),
  [SPACE+'u2']:store([child('c4','نور',[record('a5','2026-10-07')])])});
 assert.equal(mergeAccountSpaces(s),true);const local=read(s);
 assert.deepEqual(local.children.map(c=>c.name).sort(),['سارة','علي','ليان','نور'].sort(),'Every account and the device keep their children');
 const sara=local.children.find(c=>c.id==='c1');assert.deepEqual(sara.assessments.map(a=>a.id),['a1','a3']);
 assert.equal(sara.assessments[0].state.trials.a.status,'distortion','The newer copy of the same assessment is kept');
 assert.equal(local.activeChild,'c2','Signed out: the device store was on screen, so its case stays active');
 assert.deepEqual(JSON.parse(s.getItem(DONE)).sort(),[SPACE+'u1',SPACE+'u2']);}

// 3. Full storage: drop only the sync baselines (copies) and save again; if it still fails, change nothing.
{const space=store([child('c1','سارة',[record('a1','2026-10-02')])],'c1','a1'),baseline='x'.repeat(400);
 const s=memory({'articulation-cloud-owner':'u1',[SPACE+'u1']:space,'articulation-cloud-baseline-u1':baseline},{limit:space.length*2+150});
 assert.equal(mergeAccountSpaces(s),true);assert.equal(s.getItem('articulation-cloud-baseline-u1'),null);assert.equal(read(s).children.length,1);
 const t=memory({'articulation-cloud-owner':'u1',[SPACE+'u1']:space},{limit:space.length+10});
 assert.equal(mergeAccountSpaces(t),false,'Cannot save: the app keeps reading the account space');
 assert.equal(t.getItem('articulation-cloud-owner'),'u1');assert.equal(t.getItem(LOCAL),null);assert.equal(t.getItem(DONE),null);}

// 4. An unreadable device store is never overwritten; nothing to merge is a no-op.
{const s=memory({[LOCAL]:'{broken',[SPACE+'u1']:store([child('c1','سارة',[])])});assert.equal(mergeAccountSpaces(s),false);assert.equal(s.getItem(LOCAL),'{broken');
 const empty=memory({[LOCAL]:store([child('c9','حالة',[])])});assert.equal(mergeAccountSpaces(empty),true);assert.equal(empty.getItem(DONE),null);}

// 5. No Firebase left: no SDK, no project, no configuration, no Google sign-in, no retired online collector paths.
// (assets/retired-sync.js names the retired project in its notes on purpose.)
for(const file of ['index.html',...fs.readdirSync(path.join(root,'assets')).filter(f=>f.endsWith('.js')&&f!=='retired-sync.js').map(f=>'assets/'+f),'../../aphasia/langiuage-cognitive/assets/app.js']){
 const code=fs.readFileSync(path.join(root,file),'utf8');
 assert.doesNotMatch(code,/gstatic\.com\/firebasejs|speech-apps-5d3b0|cloud\/config\.json|signInWithPopup|ArticulationCloud\b|sheets\.googleapis|script\.google\.com|accounts\.google\.com\/gsi|sendResearch|researchEndpoint/,file);
}
assert.equal(fs.existsSync(path.join(root,'cloud')),false,'The cloud folder is gone');

// 6. v1 research workbooks still migrate (from the former cloud test).
{const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../assets/stimuli.js'),'utf8')+';this.probes=SOUNDS.flatMap(s=>s.probes.map((p,i)=>({...p,id:s.id+"-"+i,sound:s})));',ctx);
 const kid=child('child','طفل',[{...record('assessment','2026-10-26'),state:{meta:{assessment:{year:'2026',month:'10',day:'26'},researchConsent:'yes'},trials:{a:{status:'correct'}}}}]);
 const payload=schema.createPayload(kid,ctx.probes,{source:{accountId:'guest-device',email:'',signIn:'guest',deviceId:'device',origin:'https://hamada013.github.io',verified:false}});
 const legacy={...payload,schema:'articulation-research-v1',caseColumns:payload.caseColumns.slice(0,36),findingColumns:payload.findingColumns.slice(0,34),caseRows:payload.caseRows.map(r=>r.slice(0,36)),findingRows:payload.findingRows.map(r=>r.slice(0,34))};
 assert.equal(schema.validate(legacy).caseRows[0][36],'unattributed');assert.equal(schema.merge(legacy,payload).caseRows.length,1);}

console.log('PASS retired Google sync: account spaces merged once (newest copy, no resurrection, full-storage and unreadable-store safety), no Firebase or online collector left, v1 research migration.');
