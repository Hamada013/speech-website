const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx={console};ctx.window=ctx;vm.createContext(ctx);
for(const file of ['data','stimuli','review','manual-data','manual','barriers-data','transitions-data','task-analysis-data','model','report','pdf-data'])vm.runInContext(fs.readFileSync(path.join(root,`assets/${file}.js`),'utf8'),ctx);
const {VB_DATA:D,VBModel:M,VBReport:R,VBPDFData:P}=ctx,all=M.allMilestones(D),s=M.blank();
assert.equal(D.tasks.length,740);assert.equal(new Set(D.tasks.map(i=>i.id)).size,740);
assert.deepEqual([1,2,3].map(level=>D.tasks.filter(i=>i.level===level).length),[119,266,355]);
for(const i of D.tasks){
 assert.ok(i.text.en.trim());assert.match(i.text.ar,/[\u0600-\u06ff]/);assert.ok(i.sourcePage>=4&&i.sourcePage<=38);
 assert.ok(all.some(m=>m.id===i.milestoneId&&m.category===i.category&&m.level===i.level));
 assert.match(i.code,/^\d{1,2}-[a-k]$/);assert.match(i.method,/^(T|O|E|TO:.*)$/);
 M.setScore(s,'tasks',i,1);assert.equal(M.hasScore(s,'tasks',i),true);
 assert.throws(()=>M.setScore(s,'tasks',i,.5));
}
assert.equal(M.stats(s,D.tasks,'tasks').score,740);
for(const id of ['ta-m1-1a','ta-m1-1b','ta-m1-1c','ta-m1-2a','ta-m1-2b']){
 const i=D.tasks.find(i=>i.id===id),legacy=M.blank();legacy.scores.tasks[id]=1;
 assert.equal(M.hasScore(legacy,'tasks',i),false);assert.equal(legacy.scores.tasks[id],1);
 M.setScore(legacy,'tasks',i,0);assert.equal(M.hasScore(legacy,'tasks',i),true);
}
const next=M.startFollowup(s);assert.equal(M.stats(next,D.tasks,'tasks').assessed,0);assert.equal(M.stats(next.history[0],D.tasks,'tasks').assessed,740);
M.setScore(next,'milestones',all.find(i=>i.id==='m1-1'),1);assert.equal(Object.keys(next.scores.tasks).length,0);
next.reportLang='ar';M.setScore(next,'tasks',D.tasks[0],0);assert.match(R.make(next,D).text,/تحليل المهام/);
next.reportLang='en';assert.match(R.make(next,D).text,/Task Analysis/);
const normalized=M.normalize(next);assert.equal(normalized.scores.tasks[D.tasks[0].id],0);assert.equal(normalized.history[0].scores.tasks[D.tasks[0].id],1);
console.log('PASS: 740 bilingual skills, source coverage and milestone mapping, separate binary scoring, legacy review, fresh follow-ups, Task Analysis reports.');
