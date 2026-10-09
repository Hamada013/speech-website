const test=require('node:test');
const assert=require('node:assert/strict');
const A=require('../assets/analysis.js');

function pulseTrain({count=18,gap=0.17,sampleRate=24000,amplitude=0.5,lead=0.25,tail=0.25}={}) {
  const duration=lead+(count-1)*gap+0.09+tail;
  const samples=new Float32Array(Math.ceil(duration*sampleRate));
  for(let n=0;n<count;n++) {
    const center=lead+n*gap+0.045;
    for(let i=Math.max(0,Math.floor((center-0.045)*sampleRate));i<Math.min(samples.length,Math.ceil((center+0.045)*sampleRate));i++){
      const time=i/sampleRate,envelope=Math.exp(-(((time-center)/0.022)**2));
      samples[i]+=amplitude*envelope*(0.7*Math.sin(2*Math.PI*280*time)+0.3*Math.sin(2*Math.PI*560*time));
    }
  }
  return {samples,sampleRate};
}

test('regular synthetic vowel-pulse trains are counted at several repetition rates and sample rates',()=>{
  for(const gap of [0.12,0.17,0.25,0.5])for(const sampleRate of [16000,24000,44100,48000]) {
    const {samples}=pulseTrain({count:12,gap,sampleRate});
    const result=A.analyze(samples,sampleRate);
    assert.equal(result.markers.length,12,`${gap}s spacing at ${sampleRate} Hz`);
    assert.ok(result.markers.every((value,index)=>index===0||value>result.markers[index-1]));
    assert.equal(result.waveform.length,1000);
    assert.ok(result.suggestedStart>=0&&result.suggestedEnd<=result.duration);
  }
});

test('a selected window excludes outside syllables but preserves pauses inside',()=>{
  const {samples,sampleRate}=pulseTrain({count:12,gap:0.2});
  const result=A.analyze(samples,sampleRate,{start:0.8,end:2.0});
  assert.equal(result.markers.length,6);
  assert.ok(result.markers.every(time=>time>=0.8&&time<=2));
});

test('silence is not counted, and quiet / clipping warnings do not invent clinical interpretations',()=>{
  const silence=A.analyze(new Float32Array(24000),24000);
  assert.equal(silence.markers.length,0);
  assert.ok(silence.warnings.includes('noPulses'));
  assert.ok(silence.warnings.includes('quietAudio'));
  const {samples,sampleRate}=pulseTrain({amplitude:0.006});
  assert.ok(A.analyze(samples,sampleRate).warnings.includes('quietAudio'));
  const clipped=pulseTrain({amplitude:4});
  for(let i=0;i<clipped.samples.length;i++)clipped.samples[i]=Math.max(-1,Math.min(1,clipped.samples[i]));
  assert.ok(A.analyze(clipped.samples,clipped.sampleRate).warnings.includes('clippedAudio'));
});

test('minimum spacing suppresses nearby candidates and invalid audio / windows reject safely',()=>{
  const {samples,sampleRate}=pulseTrain({count:15,gap:0.12});
  assert.ok(A.analyze(samples,sampleRate,{minGap:250}).markers.length<15);
  assert.throws(()=>A.analyze(samples,0),/invalidAudio/);
  assert.throws(()=>A.analyze(samples,sampleRate,{start:2,end:1}),/invalidWindow/);
  assert.throws(()=>A.analyze(new Float32Array(24000*61),24000),/audioLength/);
});

test('measurement differentiates syllables and complete sequences, including partial sequences',()=>{
  const result=A.measurement('31','5','10');
  assert.equal(result.rate,6.2);assert.equal(result.sequenceRate,2);assert.equal(result.count,31);
  assert.equal(A.measurement('0','5').rate,0);
  assert.equal(A.measurement('15','3').sequenceRate,null);
  for(const [n,d,c] of [['','5',null],['5','',null],['1.5','5',null],['-1','5',null],['3','0',null],['3','61',null],['5','2','2'],['6','2','1.5']])assert.equal(A.measurement(n,d,c),null);
});

test('descriptive marker variability requires at least three pulses',()=>{
  assert.equal(A.intervalStats([0,1]),null);
  assert.ok(Math.abs(A.intervalStats([0,0.2,0.4,0.6]).meanMs-200)<0.00001);
  assert.ok(A.intervalStats([0,0.2,0.4,0.6]).cvPercent<0.00001);
  assert.ok(A.intervalStats([0,0.2,0.7,0.8]).cvPercent>10);
});

test('recording MIME selection includes Safari MP4 and allows the default fallback',()=>{
  assert.deepEqual(A.recorderOptions({isTypeSupported:type=>type==='audio/mp4'}),{mimeType:'audio/mp4'});
  assert.deepEqual(A.recorderOptions({isTypeSupported:()=>false}),{});
  assert.deepEqual(A.recorderOptions({}),{});
});
