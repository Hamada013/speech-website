// Research workbook for the language-cognitive assessment, rebuilt from the de-identified dataset on every send.
// Norms follow the Russian Aphasia Test method (Ivanova et al., 2021): healthy adults, age groups, 5th percentile cut-off.
import {createRequire} from 'node:module';
import {col,STYLE as S,writeXlsx} from './xlsx.mjs';
const require=createRequire(import.meta.url),R=require('../assets/research.js'),{ADDED}=require('../assets/added-items.js');
export const DEFAULT_SETTINGS={minPerGroup:30,itemMinPeople:10,itemControlFloor:80,itemMinDifference:10};
const BLUE='3F7EA6',GREEN='3C9478',GREY='8796A3',RED='C0604F';
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,sd=a=>a.length>1?Math.sqrt(a.reduce((x,y)=>x+(y-mean(a))**2,0)/(a.length-1)):null,round=(v,d=1)=>v===null||v===undefined||Number.isNaN(v)?'':Math.round(v*10**d)/10**d;
// Same rule as Excel's PERCENTILE.INC.
const percentile=(a,p)=>{const s=a.slice().sort((x,y)=>x-y),h=(s.length-1)*p,lo=Math.floor(h);return s[lo]+(s[Math.min(lo+1,s.length-1)]-s[lo])*(h-lo);};
const normalCdf=z=>{const t=1/(1+.2316419*Math.abs(z)),d=.3989423*Math.exp(-z*z/2),p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p;};
const MEASURES=[...R.DOMAINS.map(d=>({key:d.key,label:d.en,get:r=>r.domains?.[d.key]?.complete?r.domains[d.key].percent:null})),{key:'total',label:'Total',get:r=>r.total?.complete?r.total.percent:null},{key:'fluency',label:'Animal fluency (words in 1 minute)',get:r=>r.fluencyAnimals}];
// The first visit of each healthy adult, so nobody counts twice. Outliers are removed as in the Russian Aphasia Test:
// a control below 90% and more than 3 SD under the group mean.
export function norms(rows,settings){
 const seen=new Set(),controls=[];for(const r of rows.slice().sort((a,b)=>String(a.visitMonth).localeCompare(String(b.visitMonth))))if(R.eligibleControl(r)&&!seen.has(r.caseCode)){seen.add(r.caseCode);controls.push(r);}
 const out=[];
 for(const group of R.NORM_GROUPS)for(const m of MEASURES){
  let v=controls.filter(r=>R.normGroup(r)===group).map(m.get).filter(x=>typeof x==='number');
  if(m.key!=='fluency'&&v.length>2){const mu=mean(v),s=sd(v);v=v.filter(x=>!(x<90&&x<mu-3*s));}
  const n=v.length,ready=n>=settings.minPerGroup;
  out.push({key:`${group} | ${m.label}`,group,measure:m.label,n,mean:n?round(mean(v),1):'',sd:n>1?round(sd(v),1):'',cutoff:n?round(percentile(v,.05),1):'',ready});
 }
 return {rows:out,controls:controls.length};
}
export function buildWorkbook(dataset,settings=DEFAULT_SETTINGS){
 settings={...DEFAULT_SETTINGS,...settings};
 const rows=dataset.assessments,header=list=>list.map(v=>({v,s:S.header})),N=norms(rows,settings);
 /* Assessments */
 const assess=[header(['Assessment ID','Person code','Visit month','Group','Age','Age band','Education (years)','Education band','Norm group','Healthy norm eligible','Sex','Handedness','Cause','Months since onset','Hearing','Vision','Dialect','Other language','Animal fluency',...R.DOMAINS.map(d=>d.en+' %'),'Total %','Domains complete','Profile: fluency','Profile: comprehension','Profile: repetition','Profile: naming'])];
 for(const r of rows)assess.push([r.assessmentId,r.caseCode,r.visitMonth,r.group,r.age,R.ageBand(r.age)||'',r.educationYears,R.educationBand(r.educationYears)||'',R.normGroup(r)||'',R.eligibleControl(r)?'yes':'no',r.sex,r.handedness,r.etiology,r.monthsPostOnset,r.hearing,r.vision,r.dialect,r.otherLanguages,r.fluencyAnimals,...R.DOMAINS.map(d=>{const x=r.domains?.[d.key];return x?.complete?x.percent:'';}),r.total?.complete?r.total.percent:'',Object.values(r.domains||{}).filter(x=>x.complete).length,r.profile?.fluency,r.profile?.comprehension,r.profile?.repetition,r.profile?.naming]);
 /* Items */
 const items=[header(['Assessment ID','Person code','Group','Item ID','Domain','Score','Support'])];for(const r of rows)for(const it of r.items||[])items.push([r.assessmentId,r.caseCode,r.group,it.id,R.domainOf(it.id.replace(/^item-|-\d+$/g,''))||'observation',it.score,it.support]);
 /* Norms */
 const norm=[[{v:'Healthy-adult norms by age and education',s:S.title}],[{v:'Eligible healthy adults only, first visit each. Cut-off = 5th percentile of the group, as in the Russian Aphasia Test (Ivanova et al., 2021). A score at or below the cut-off counts as below the healthy range.',s:S.note}],['Minimum people per group',{v:settings.minPerGroup,s:S.input}],[],header(['Key','Norm group','Measure','People','Mean','SD','Cut-off (5th percentile)','Status'])];
 for(const x of N.rows)norm.push([x.key,{v:x.group,s:S.bold},x.measure,{v:x.n,s:S.int},{v:x.mean,s:S.dec1},{v:x.sd,s:S.dec1},{v:x.cutoff,s:S.dec1},{v:x.ready?'Ready':`Need ${settings.minPerGroup-x.n} more`,s:S.int}]);
 const normEnd=norm.length;
 /* Score check */
 const check=[[{v:'Score check',s:S.title}],[{v:'Choose the yellow cells. The healthy cut-off is the main result. Healthy adults score near the top of these tasks, so the bell curve is a guide only.',s:S.note}],['Norm group',{v:R.NORM_GROUPS[2],s:S.input}],['Measure',{v:'Total',s:S.input}],['Score',{v:80,s:S.input}],
  ['Status',{f:`IFERROR(INDEX(Norms!$H$6:$H$${normEnd},MATCH(B3&" | "&B4,Norms!$A$6:$A$${normEnd},0)),"Not found")`,v:'',s:S.good}],
  ['Healthy cut-off',{f:`IFERROR(INDEX(Norms!$G$6:$G$${normEnd},MATCH(B3&" | "&B4,Norms!$A$6:$A$${normEnd},0)),"")`,v:'',s:S.good}],
  ['Result',{f:'IF(B6<>"Ready","Group not ready yet",IF(B5<=B7,"At or below the healthy cut-off","Within the healthy range"))',v:'Group not ready yet',s:S.good}],
  ['z score',{f:`IF(B6<>"Ready","",IFERROR((B5-INDEX(Norms!$E$6:$E$${normEnd},MATCH(B3&" | "&B4,Norms!$A$6:$A$${normEnd},0)))/INDEX(Norms!$F$6:$F$${normEnd},MATCH(B3&" | "&B4,Norms!$A$6:$A$${normEnd},0)),""))`,v:'',s:S.dec1}],
  ['Standard score (guide)',{f:'IF(ISNUMBER(B9),MAX(40,MIN(160,ROUND(100+15*B9,0))),"")',v:'',s:S.int}],
  ['Percentile (guide)',{f:'IF(ISNUMBER(B9),ROUND(NORMSDIST(B9)*100,1),"")',v:'',s:S.dec1}],[],[{v:'Curve',s:S.header},{v:'Height',s:S.header},null,{v:'Marker',s:S.header},{v:'Height',s:S.header}]];
 for(let x=40,r=14;x<=160;x+=5,r++){check[r-1]=[{v:x,s:S.int},{f:`ROUND(NORMDIST(A${r},100,15,FALSE),4)`,v:round(Math.exp(-((x-100)**2)/450)/(15*Math.sqrt(2*Math.PI)),4),s:S.int}];}
 check[13].push(null,{f:'IF(ISNUMBER($B$10),$B$10,100)',v:100,s:S.int},{v:0,s:S.int});check[14].push(null,{f:'IF(ISNUMBER($B$10),$B$10,100)',v:100,s:S.int},{f:'IF(ISNUMBER($B$10),MAX($B$14:$B$38),0)',v:0,s:S.int});
 /* Item analysis */
 const tally=new Map();for(const r of rows){const kind=R.eligibleControl(r)?'control':r.group==='aphasia'?'aphasia':null;if(!kind)continue;for(const it of r.items||[]){if(!['correct','incorrect','dontknow'].includes(it.score))continue;const k=it.id+'|'+kind,x=tally.get(k)||{pass:0,all:0};x.all++;if(it.score==='correct')x.pass++;tally.set(k,x);}}
 const catalog=dataset.catalog||[],analysis=[[{v:'Does each task separate healthy adults from people with aphasia?',s:S.title}],[{v:`Working thresholds, not from a published source (edit in research/settings.json): healthy adults should pass at least ${settings.itemControlFloor}%, the groups should differ by at least ${settings.itemMinDifference} points, with ${settings.itemMinPeople}+ people in each group.`,s:S.note}],header(['Item ID','Domain','Task','Origin','Not for healthy adults','Healthy: % correct','Healthy: people','Aphasia: % correct','Aphasia: people','Difference','Check'])];
 for(const it of catalog){if(R.OBSERVATION_GROUPS.has(it.group))continue;const c=tally.get(it.id+'|control'),a=tally.get(it.id+'|aphasia'),cp=c?100*c.pass/c.all:null,ap=a?100*a.pass/a.all:null;let verdict='Not enough data';
  if(R.HEALTHY_NA.has(it.id))verdict='Not used in scores';else if(c&&a&&c.all>=settings.itemMinPeople&&a.all>=settings.itemMinPeople)verdict=cp<settings.itemControlFloor?'Hard for healthy adults':cp-ap<settings.itemMinDifference?'Does not separate the groups':'Separates the groups';
  analysis.push([it.id,R.domainOf(it.group)||'',{v:it.label,s:S.wrap},ADDED[it.group]?'Added':'Original',R.HEALTHY_NA.has(it.id)?'yes':'',{v:round(cp),s:S.dec1},{v:c?c.all:0,s:S.int},{v:round(ap),s:S.dec1},{v:a?a.all:0,s:S.int},{v:cp!==null&&ap!==null?round(cp-ap):'',s:S.dec1},verdict]);}
 /* Dashboard */
 const groups=['control','aphasia','other'],people=g=>new Set(rows.filter(r=>r.group===g).map(r=>r.caseCode)).size;
 const dash=[[{v:'Language-cognitive research dashboard',s:S.title}],[{v:'Rebuilt from the de-identified data on every send. People are identified by code only.',s:S.note}],['Visits',{v:rows.length,s:S.good}],['Healthy adults in norms',{v:N.controls,s:S.good}],['People with aphasia',{v:people('aphasia'),s:S.good}],['Other conditions',{v:people('other'),s:S.good}],[],header(['Norm group','Healthy adults','Groups ready'])];
 for(const g of R.NORM_GROUPS){const total=N.rows.find(x=>x.group===g&&x.measure==='Total');dash.push([{v:g,s:S.bold},{v:total.n,s:S.int},{v:N.rows.filter(x=>x.group===g&&x.ready).length+' / '+N.rows.filter(x=>x.group===g).length,s:S.int}]);}
 const domStart=dash.length+2;dash.push([],header(['Domain','Healthy mean %','Aphasia mean %']));
 for(const d of R.DOMAINS){const avg=g=>{const v=rows.filter(r=>(g==='control'?R.eligibleControl(r):r.group===g)&&r.domains?.[d.key]?.complete).map(r=>r.domains[d.key].percent);return v.length?round(mean(v)):'';};dash.push([{v:d.en,s:S.bold},{v:avg('control'),s:S.dec1},{v:avg('aphasia'),s:S.dec1}]);}
 const domEnd=dash.length,gEnd=8+R.NORM_GROUPS.length;
 const sources=[header(['Source','Used for']),...[
  ['Ivanova MV, Akinina YS, Soloukhina OA, et al. The Russian Aphasia Test. PLoS One. 2021;16(11):e0258946. doi:10.1371/journal.pone.0258946','Healthy controls as the norm group; age cohorts; cut-off at the 5th percentile; removing control outliers below 90% and 3 SD under the mean.'],
  ['ASHA Practice Portal: Aphasia. https://www.asha.org/practice-portal/clinical-topics/aphasia/','Areas a comprehensive assessment covers; added tasks for word repetition, reading aloud, writing, gestures and sentence comprehension.'],
  ['ASHA Practice Portal: Acquired Apraxia of Speech. https://www.asha.org/practice-portal/clinical-topics/acquired-apraxia-of-speech/','Motor speech observations: groping and inconsistent errors.'],
  ['Khwaileh T, Mustafawi E, Elbuy S, et al. Arabic Aphasia Research Through a Clinical and Linguistic Lens. Int J Lang Commun Disord. 2025;60(4):e70064. doi:10.1111/1460-6984.70064','Need for Arabic norms, dialect and diglossia, cultural bias in imported items.'],
  ...Object.entries(ADDED).map(([g,a])=>[a.source,`Added group ${g}: ${a.title}`])].map(([a,b])=>[{v:a,s:S.wrap},{v:b,s:S.wrap}])];
 const dictionary=[header(['Term','Meaning']),...[['Domain score','Correct ÷ tasks given, as a percentage. Observations and the tasks healthy adults cannot answer are left out.'],['Domain complete',`At least ${Math.round(R.COMPLETE_SHARE*100)}% of the domain's tasks were given. Only complete domains enter norms. This share is a working choice.`],['Total','All scored tasks together. Complete only when every domain is complete.'],['Healthy norm eligible','Group = healthy adult, hearing and vision normal or corrected, age 18+ and education recorded.'],['Norm group',`Age 18–39, 40–59 or 60+, by education up to ${R.EDUCATION_CUT} years or more. The education split is a working choice; the age groups follow the Russian Aphasia Test's original cohorts.`],['Cut-off','5th percentile of the healthy group (PERCENTILE.INC). At or below it = below the healthy range.'],['Minimum people per group','30 is a working starting point, not a published rule. The Russian Aphasia Test had 106 controls in two age groups.'],['Standard score and percentile','From the group mean and SD. Healthy scores bunch near 100%, so these are a guide; the cut-off is the main result.'],['Privacy','No names, doctor, examiner, birth date, incident date or free text are stored.']].map(([a,b])=>[{v:a,s:S.bold},{v:b,s:S.wrap}])];
 return writeXlsx([
  {name:'Dashboard',rows:dash,cols:[30,16,16],showGrid:false,charts:[{type:'bar',title:'Healthy adults per norm group',cats:`Dashboard!$A$9:$A$${gEnd}`,series:[{name:'Healthy adults',ref:`Dashboard!$B$9:$B$${gEnd}`,color:GREY}],from:[4,1],to:[13,17]},{type:'bar',title:'Mean domain score: healthy adults and aphasia (%)',cats:`Dashboard!$A$${domStart+1}:$A$${domEnd}`,series:[{name:'Healthy adults',ref:`Dashboard!$B$${domStart+1}:$B$${domEnd}`,color:GREEN},{name:'Aphasia',ref:`Dashboard!$C$${domStart+1}:$C$${domEnd}`,color:BLUE}],from:[4,18],to:[16,38]}]},
  {name:'Norms',rows:norm,cols:[44,22,32,9,9,9,14,14],freeze:{y:5},statuses:[`H6:H${normEnd}`],filter:`A5:H${normEnd}`},
  {name:'Score_Check',rows:check,cols:[24,30,3,9,9],showGrid:false,validations:[{ref:'B3',list:`"${R.NORM_GROUPS.join(',')}"`},{ref:'B4',list:`"${MEASURES.map(m=>m.label).join(',')}"`}],charts:[{type:'scatter',title:'Bell curve (guide)',xTitle:'Standard score',series:[{name:'Normal curve',x:'Score_Check!$A$14:$A$38',ref:'Score_Check!$B$14:$B$38',color:BLUE},{name:'This person',x:'Score_Check!$D$14:$D$15',ref:'Score_Check!$E$14:$E$15',color:RED,straight:true}],from:[6,1],to:[15,22]}]},
  {name:'Item_Analysis',rows:analysis,cols:[18,14,48,9,10,11,9,11,9,10,26],freeze:{y:3},heights:{3:34}},
  {name:'Assessments',rows:assess,cols:[38,13,10,9,6,8,9,10,22,9,8,9,10,9,9,9,9,9,9,...R.DOMAINS.map(()=>10),8,9,12,12,12,12],freeze:{y:1},filter:`A1:${col(assess[0].length-1)}${Math.max(1,assess.length)}`,heights:{1:48}},
  {name:'Items',rows:items,cols:[38,13,10,16,14,10,12],freeze:{y:1}},
  {name:'Dictionary',rows:dictionary,cols:[26,100]},
  {name:'Sources',rows:sources,cols:[90,70]}]);
}
