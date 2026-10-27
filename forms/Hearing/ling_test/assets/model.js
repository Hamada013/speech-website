/* The report and collector share this eligibility rule. */
((root)=>{
 'use strict';
 const sounds=[{id:'24',label:'م',phoneme:'/m/'},{id:'27',label:'و',phoneme:'/u/'},{id:'1',label:'آ',phoneme:'/a/'},{id:'28',label:'إي',phoneme:'/i/'},{id:'13',label:'ش',phoneme:'/ʃ/'},{id:'12',label:'س',phoneme:'/s/'}];
 const ids=sounds.map(s=>s.id);
 const six=c=>Array.isArray(c)&&c.length===6&&new Set(c).size===6&&ids.every(id=>c.includes(id));
 function eligible(s){return s.mode==='assessment'&&s.complete===true&&s.queue?.length===12&&s.trials?.length===12&&ids.every(id=>s.queue.filter(x=>x===id).length===2)&&s.trials.every((t,i)=>t.target===s.queue[i]&&six(t.choices)&&!t.assisted&&t.phase==='test'&&(t.response===null||t.choices.includes(t.response)));}
 function classify(s){return eligible(s)?'assessment':'practice';}
 function validateSession(s){if(!s||typeof s.id!=='string'||!['assessment','practice','introduction'].includes(s.mode)||!Array.isArray(s.queue)||!s.queue.length||s.queue.length>36||!s.queue.every(id=>ids.includes(id))||!Array.isArray(s.trials)||s.trials.length>s.queue.length||!Number.isFinite(Date.parse(s.started)))throw Error('Invalid Ling session');s.trials.forEach((t,i)=>{if(t.target!==s.queue[i]||!Array.isArray(t.choices)||!t.choices.length||t.choices.length>6||new Set(t.choices).size!==t.choices.length||!t.choices.includes(t.target)||!t.choices.every(id=>ids.includes(id))||(t.response!==null&&!t.choices.includes(t.response))||typeof t.assisted!=='boolean')throw Error('Invalid Ling trial');});return s;}
 function research(child,source){return {version:1,app:'ling',source,child:{id:child.id,caseId:child.caseId},sessions:child.sessions.map(s=>{validateSession(s);return structuredClone(s);})};}
 const api={sounds,ids,six,eligible,classify,validateSession,research};if(typeof module!=='undefined')module.exports=api;else root.LingModel=api;
})(globalThis);
