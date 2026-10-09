/* Browser API/DOM harness: behavior tests, not a substitute for real Safari rendering. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const A=require('../assets/analysis.js'),root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),script=fs.readFileSync(path.join(root,'assets/index-DqtmioYj.js'),'utf8');
const KEY='ag-ddk-draft-v1';
const attrs=source=>Object.fromEntries([...source.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(match=>[match[1],match[2]??true]));

function app({storage=new Map(),secure=false,micError=null,decodeFails=false}={}){
  const elements=new Map(),inputs=new Map(),windowEvents={},documentEvents={},intervals=new Map(),timeouts=new Map(),revoked=[],downloads=[];
  let counter=0,now=0,recorders=[],tracksStopped=0,printCount=0;
  function el(id){
    if(elements.has(id))return elements.get(id);
    const node={id,value:'',checked:false,disabled:false,hidden:false,readOnly:false,name:'',dataset:{},attributes:{},events:{},style:{},open:false,textContent:'',_html:'',
      classList:{toggle(){}},addEventListener(type,fn){this.events[type]=fn;},setAttribute(key,value){this.attributes[key]=value;},removeAttribute(key){delete this.attributes[key];},
      closest(selector){if(selector==='.choice-label')return this.label||el('label-'+id);return null;},
      focus(){this.focused=true;},showModal(){this.open=true;},close(){this.open=false;},replaceChildren(){this.innerHTML='';},
      getBoundingClientRect(){return {width:700,left:0};},getContext(){return {scale(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fillText(){}};},
      pause(){},load(){},appendChild(){},remove(){},click(){if(this.download)downloads.push({name:this.download,url:this.href});}
    };
    Object.defineProperty(node,'innerHTML',{get(){return this._html;},set(value){this._html=value;for(const [id,input] of inputs)if(input.owner===this.id)inputs.delete(id);parseInputs(value,this.id);}});
    elements.set(id,node);return node;
  }
  function parseInputs(source,owner){
    for(const match of source.matchAll(/<input\b([^>]+)>/g)){
      const a=attrs(match[1]),id=a.id||`${a.name}_${a.value}`;
      if(!id||id==='undefined_undefined')continue;
      const node=el(id);node.owner=owner;node.value=a.value||'';node.name=a.name||'';node.type=a.type||'text';node.checked=a.checked===true;node.disabled=a.disabled===true;
      Object.entries(a).filter(([key])=>key.startsWith('data-')).forEach(([key,value])=>node.dataset[key.slice(5).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase())]=value);
      node.label=el('label-'+id);inputs.set(id,node);
    }
  }
  for(const match of html.matchAll(/\bid="([^"]+)"/g))el(match[1]);
  parseInputs(html,'static');
  for(const match of html.matchAll(/<textarea\b([^>]+)>/g)){const a=attrs(match[1]);const node=el(a.id);if(a['data-meta'])node.dataset.meta=a['data-meta'];}
  const translated=[...html.matchAll(/data-i18n="([^"]+)"/g)].map((match,i)=>{const node=el(`translated-${i}`);node.dataset.i18n=match[1];return node;});
  function query(selector){
    if(selector==='[data-i18n]')return translated;
    if(selector==='.choice-label input')return Array.from(inputs.values()).filter(input=>input.name!=='task');
    return Array.from(inputs.values()).filter(input=>selector.split(',').some(part=>{
      const name=part.match(/name="([^"]+)"/)?.[1];return name&&input.name===name&&(!part.includes(':checked')||input.checked);
    }));
  }
  const samples=new Float32Array(24000*3);
  for(let pulse=0;pulse<12;pulse++){const center=0.3+pulse*0.2;for(let i=Math.floor((center-0.045)*24000);i<(center+0.045)*24000;i++)samples[i]=0.5*Math.exp(-(((i/24000-center)/0.022)**2))*Math.sin(2*Math.PI*300*i/24000);}
  const buffer={duration:3,sampleRate:24000,numberOfChannels:1,getChannelData:()=>samples};
  const track={stop(){tracksStopped++;},addEventListener(type,fn){this[type]=fn;}};
  const stream={getTracks:()=>[track],getAudioTracks:()=>[track]};
  class Recorder{
    static isTypeSupported(type){return type==='audio/mp4';}
    constructor(_,options){this.mimeType=options.mimeType||'audio/webm';this.state='inactive';recorders.push(this);}
    start(){this.state='recording';}
    stop(){if(this.state==='inactive')return;this.state='inactive';queueMicrotask(()=>{this.ondataavailable?.({data:new Blob(['test audio'],{type:this.mimeType})});this.onstop?.();});}
  }
  class Context{async decodeAudioData(){if(decodeFails)throw Error('unsupported');return buffer;}async close(){}}
  class Url extends URL{static createObjectURL(){return 'blob:test-'+(++counter);}static revokeObjectURL(url){revoked.push(url);}}
  const doc={getElementById:el,documentElement:{},body:el('body'),hidden:false,querySelectorAll:query,querySelector:selector=>query(selector)[0]||null,createElement:()=>el('download-'+(++counter)),addEventListener(type,fn){documentEvents[type]=fn;}};
  const window={DDKAnalysis:A,isSecureContext:secure,MediaRecorder:secure?Recorder:undefined,AudioContext:Context,devicePixelRatio:1,addEventListener(type,fn){windowEvents[type]=fn;},print(){printCount++;}};
  const context={window,document:doc,navigator:{onLine:true,mediaDevices:secure?{async getUserMedia(){if(micError)throw Object.assign(Error('denied'),{name:micError});return stream;}}:undefined},location:{protocol:'file:'},MediaRecorder:Recorder,
    URL:Url,Blob,Date,performance:{now:()=>now},console,Float32Array,
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
    setInterval(fn){const id=++counter;intervals.set(id,fn);return id;},clearInterval:id=>intervals.delete(id),
    setTimeout(fn,delay){const id=++counter;if(delay===0)queueMicrotask(fn);else timeouts.set(id,{fn,delay});return id;},clearTimeout:id=>timeouts.delete(id)};
  vm.runInNewContext(script,context,{filename:'ddk-workspace.js'});
  const click=id=>el(id).events.click?.({target:el(id)});
  const input=(id,value)=>{const node=el(id);node.value=String(value);el('ddkForm').events.input({target:node});};
  const choose=(group,value,checked=true)=>{
    const node=Array.from(inputs.values()).find(input=>input.name===group&&input.value===value);assert.ok(node,`${group}: ${value}`);
    if(node.type==='radio')Array.from(inputs.values()).filter(input=>input.name===group).forEach(input=>input.checked=false);
    node.checked=checked;el('ddkForm').events.input({target:node});el('ddkForm').events.change({target:node});
  };
  const toggle=(id,value)=>{el(id).checked=value;el(id).events.change?.({target:el(id)});el('ddkForm').events.input({target:el(id)});};
  const change=id=>el('ddkForm').events.change({target:el(id)});
  const report=()=>{click('openReport');return el('reportPreview').innerHTML;};
  return {el,doc,storage,translated,click,input,choose,toggle,change,report,windowEvents,documentEvents,revoked,downloads,recorders,tracksStopped:()=>tracksStopped,printCount:()=>printCount,
    advance(ms){now+=ms;for(const fn of intervals.values())fn();},autoStop(){const timer=Array.from(timeouts.values()).find(timer=>timer.delay===10000);assert.ok(timer);timer.fn();},
    upload(){el('audioFile').files=[new Blob(['test file'],{type:'audio/wav'})];el('audioFile').events.change();},
    removeTrial(id){el('trialsList').events.click({target:{closest:()=>({dataset:{removeTrial:id}})}});}
  };
}
async function flush(){for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));}

test('manual counts save, report, print, escape notes, export, remove and undo',()=>{
  const a=app();assert.equal(a.el('record').disabled,true);a.input('clientName','Example <script>');
  a.input('syllableCount',15);a.input('duration',3);a.input('trialNotes','First line\nSecond line');a.choose('observation','regular');a.toggle('reviewed',true);a.click('saveTrial');
  assert.equal(a.el('trialCount').textContent,'1');assert.match(a.el('trialsList').innerHTML,/5\.00/);
  assert.equal(a.storage.size,0);
  const report=a.report();assert.match(report,/Example &lt;script&gt;/);assert.doesNotMatch(report,/<script>/);assert.match(report,/First line\nSecond line/);assert.match(report,/Reviewed by clinician/);assert.match(report,/slp\.ahmadghanem@gmail\.com/);
  a.click('printReport');assert.equal(a.printCount(),1);assert.equal(a.el('printArea').innerHTML,report);
  a.click('downloadCsv');assert.match(a.downloads[0].name,/\.csv$/);
  a.click('closeReport');a.toggle('remember',true);const saved=JSON.parse(a.storage.get(KEY));a.removeTrial(saved.trials[0].id);assert.equal(a.el('trialCount').textContent,'0');a.click('undoRemove');assert.equal(a.el('trialCount').textContent,'1');
});

test('combined count handles incomplete sequences and invalid measurements',()=>{
  const a=app();a.choose('task','combo');assert.equal(a.el('sequenceField').hidden,false);
  a.input('syllableCount',31);a.input('duration',5);assert.equal(a.el('sequenceCount').value,'10');assert.equal(a.el('rate').textContent,'6.20');assert.equal(a.el('sequenceRate').textContent,'2.00');
  a.input('sequenceCount',11);a.click('saveTrial');assert.equal(a.el('trialCount').textContent,'0');assert.match(a.el('trialMessage').textContent,/cannot exceed/);
  a.input('sequenceCount',10);a.click('saveTrial');assert.equal(a.el('trialCount').textContent,'1');assert.match(a.report(),/Not reviewed/);
});

test('Arabic, bilingual reporting, and local drafts retain reviewed measurements',()=>{
  const storage=new Map();let a=app({storage});a.input('syllableCount',20);a.input('duration',4);a.toggle('reviewed',true);a.click('saveTrial');a.choose('plan','follow-up');a.toggle('remember',true);a.click('language');
  a=app({storage});assert.equal(a.doc.documentElement.dir,'rtl');assert.equal(a.el('trialCount').textContent,'1');assert.match(a.el('saveStatus').textContent,/استُعيدت/);
  a.translated.forEach(node=>assert.notEqual(node.textContent,node.dataset.i18n));
  a.report();a.toggle('bilingualReport',true);assert.match(a.el('reportPreview').innerHTML,/DDK assessment/);assert.match(a.el('reportPreview').innerHTML,/تقييم التكرار/);assert.match(a.el('reportPreview').innerHTML,/Reviewed by clinician/);
  a.click('closeReport');a.click('newExam');a.click('confirmClear');assert.equal(storage.size,0);assert.equal(a.el('trialCount').textContent,'0');assert.equal(a.el('printArea').innerHTML,'');
});

test('manual timer uses elapsed time and unsaved measurement cannot silently disappear from report',()=>{
  const a=app();a.click('manualTimer');a.advance(3210);a.click('tapCount');a.click('tapCount');a.click('manualTimer');assert.equal(a.el('duration').value,'3.210');assert.equal(a.el('syllableCount').value,'2');
  a.report();assert.equal(a.el('reportDialog').open,false);assert.match(a.el('trialMessage').textContent,/not saved/);
  a.click('saveTrial');assert.equal(a.el('trialCount').textContent,'1');
});

test('changing an unsaved task offers cancel and keeps saved trials',()=>{
  const a=app();a.input('syllableCount',4);a.input('duration',2);a.choose('task','ta');assert.equal(a.el('resetDialog').open,true);a.click('cancelReset');assert.equal(a.el('syllableCount').value,'4');
  a.choose('task','ka');a.click('confirmReset');assert.equal(a.el('syllableCount').value,'');assert.match(a.el('taskOptions').innerHTML,/value="ka" checked/);
});

test('local upload automatically estimates pulses; trim, correction, review, and export preserve provenance',async()=>{
  const a=app();a.upload();await flush();assert.equal(a.el('audioReview').hidden,false);assert.equal(a.el('syllableCount').value,'12');assert.equal(a.el('duration').readOnly,true);
  a.input('windowStart','1');a.change('windowStart');assert.ok(Number(a.el('syllableCount').value)<12);
  a.input('syllableCount','9');a.toggle('reviewed',true);a.click('saveTrial');a.toggle('remember',true);
  const saved=JSON.parse(a.storage.get(KEY)).trials[0];assert.equal(saved.source,'audio-edited');assert.equal(saved.analysis.initialEstimate,12);assert.equal(saved.count,9);assert.equal(saved.reviewed,true);
  assert.ok(!JSON.stringify(saved).includes('test file'));assert.ok(!JSON.stringify(saved).includes('samples'));
  const report=a.report();assert.match(report,/Original automatic pulse count/);assert.match(report,/Audio count · corrected/);
});

test('MP4 recording, auto-stop, interruption and denied permission clean up microphone tracks',async()=>{
  const a=app({secure:true});a.click('record');await flush();assert.equal(a.recorders[0].mimeType,'audio/mp4');assert.equal(a.el('stop').disabled,false);a.autoStop();await flush();
  assert.ok(a.tracksStopped()>0);assert.equal(a.el('stop').disabled,true);assert.equal(a.el('syllableCount').value,'12');
  a.click('resetTrial');a.click('confirmReset');a.click('record');await flush();a.doc.hidden=true;a.documentEvents.visibilitychange();await flush();assert.ok(a.tracksStopped()>=2);
  const denied=app({secure:true,micError:'NotAllowedError'});denied.click('record');await flush();assert.match(denied.el('audioStatus').textContent,/denied/);assert.equal(denied.el('record').disabled,false);
});

test('undecodable audio has an actionable fallback and manual measurement still saves',async()=>{
  const a=app({decodeFails:true});a.upload();await flush();assert.match(a.el('audioStatus').textContent,/could not be decoded/);a.input('syllableCount',10);a.input('duration',5);a.click('saveTrial');assert.equal(a.el('trialCount').textContent,'1');
});

test('expanding a reanalyzed window requires a fresh count instead of reporting a partial estimate',async()=>{
  const a=app();a.upload();await flush();
  a.input('windowStart','1');a.change('windowStart');a.input('windowEnd','2');a.change('windowEnd');a.click('analyze');await flush();
  assert.ok(Number(a.el('syllableCount').value)>0);
  a.input('windowStart','0.2');a.change('windowStart');
  assert.equal(a.el('syllableCount').value,'');assert.match(a.el('audioStatus').textContent,/Settings changed/);
  a.click('analyze');await flush();assert.ok(Number(a.el('syllableCount').value)>0);
});

test('leaving the page stops microphone capture and restores usable controls after back navigation',async()=>{
  const a=app({secure:true});a.click('record');await flush();a.windowEvents.pagehide();await flush();a.windowEvents.pageshow();
  assert.ok(a.tracksStopped()>0);assert.equal(a.el('record').disabled,false);assert.equal(a.el('stop').disabled,true);
});

test('malformed draft trials are filtered and rates are recalculated rather than trusted',()=>{
  const storage=new Map([[KEY,JSON.stringify({version:1,meta:{clientName:'Retained'},trials:[null,{task:'ta',labial:'ba',count:12,duration:3,source:'manual',rate:999,reviewed:true,notes:'Valid'}]})]]);
  const a=app({storage});assert.equal(a.el('trialCount').textContent,'1');assert.match(a.el('trialsList').innerHTML,/4\.00/);assert.doesNotMatch(a.el('trialsList').innerHTML,/999/);
});

test('all HTML and manifest assets exist, and DDK worker never intercepts neighboring forms or audio exports',()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);assert.equal(ids.length,new Set(ids).size);
  for(const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))assert.ok(fs.existsSync(path.join(root,match[1])),match[1]);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest')));assert.equal(manifest.scope,'./');
  for(const icon of manifest.icons)assert.ok(fs.existsSync(path.join(root,icon.src)));
  const source=fs.readFileSync(path.join(root,'sw.js'),'utf8'),handlers={},scope='https://example.test/forms/speech/DDK/';
  vm.runInNewContext(source,{URL,self:{location:{origin:'https://example.test'},registration:{scope},addEventListener(type,fn){handlers[type]=fn;}}});
  for(const url of ['https://example.test/forms/speech/oral-motor-exam/','https://example.test/forms/speech/DDK/trial.wav','https://thirdparty.test/audio'])handlers.fetch({request:{url,method:'GET'},respondWith(){assert.fail('Unexpected interception');}});
  const shell=vm.runInNewContext(source.match(/const SHELL=(\[[^;]+\]);/)[1]);for(const resource of shell)assert.ok(fs.existsSync(path.join(root,resource)),resource);
});
