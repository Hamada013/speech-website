/* Bind this script to the private Aphasia workbook. See SETUP.md. */
function onOpen(){SpreadsheetApp.getUi().createMenu('Aphasia').addItem('Configure collector','configureCollector').addToUi();}
function configureCollector(){
 const ui=SpreadsheetApp.getUi(),result=ui.prompt('Device key','Enter a private random key of at least 32 characters. Use the same key in your app. Never put it in the website source.',ui.ButtonSet.OK_CANCEL);
 if(result.getSelectedButton()!==ui.Button.OK)return;
 const token=result.getResponseText().trim();if(token.length<32){ui.alert('Use at least 32 characters.');return;}
 PropertiesService.getScriptProperties().setProperties({WORKBOOK_ID:SpreadsheetApp.getActive().getId(),DEVICE_KEY:token});ui.alert('Configured. Deploy as a Web app executing as you; access: Anyone. Keep this workbook private.');
}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function doGet(){return json_({ok:false,message:'Aphasia collector: POST only. No records are exposed by this endpoint.'});}
function doPost(e){
 const lock=LockService.getScriptLock();
 try{
  if(!e||!e.postData||e.postData.contents.length>15000000)throw Error('Invalid request size');
  const p=JSON.parse(e.postData.contents),props=PropertiesService.getScriptProperties();
  if(!props.getProperty('DEVICE_KEY')||p.token!==props.getProperty('DEVICE_KEY'))throw Error('Unauthorized');
  validate_(p);lock.waitLock(25000);
  const wb=SpreadsheetApp.openById(props.getProperty('WORKBOOK_ID')),c=p.case,id=c.id;
  const cases=sheet_(wb,'Cases',['Case ID','Case label','Assessments','Latest assessment','Last received (UTC)','Case tab','Revision']);
  const existing=cases.getLastRow()>1?cases.getRange(2,1,cases.getLastRow()-1,7).getValues():[];
  const previous=existing.find(row=>row[0]===id);if(previous&&Number(previous[6])>p.revision)throw Error('An older device revision cannot replace newer workbook data');
  const assessments=sheet_(wb,'Assessments',['Case ID','Assessment ID','Assessment date','Created UTC','Updated UTC','Correct','Assessed','Accuracy','Excluded','Unassessed','Language / education','Administration conditions','Clinical impression','Recommendations','Provisional profiles','Clinician reviewed']);
  const itemSheet=sheet_(wb,'Items',['Case ID','Assessment ID','Item ID','Section','Prompt (Arabic)','Status','Support','Response / note']);
  const fieldsSheet=sheet_(wb,'Clinical_fields',['Case ID','Assessment ID','Field type','Field ID','Recorded value']);
  const dates=c.assessments.map(a=>a.state.fields.currentDate||a.createdAt.slice(0,10)).sort(),tabName='Case_'+id.replace(/-/g,'');
  const label=c.name,caseRows=[[id,label,c.assessments.length,dates.at(-1)||'',new Date().toISOString(),tabName,p.revision]];
  const aRows=[],iRows=[],fRows=[],summary=[];
  for(const a of c.assessments){const s=stats_(p.catalog,a.state),f=a.state.fields,date=f.currentDate||a.createdAt.slice(0,10);aRows.push([id,a.id,date,a.createdAt,a.updatedAt||a.createdAt,s.correct,s.assessed,s.assessed?s.correct/s.assessed:'',s.skipped,s.unanswered,f.languageContext||'',f.assessmentConditions||'',f.clinicalImpression||'',f.recommendations||'',profile_(f),!!f.profileReviewed]);summary.push([date,a.id,s.correct,s.assessed,s.assessed?s.correct/s.assessed:'',s.skipped,s.unanswered]);for(const i of p.catalog){iRows.push([id,a.id,i.id,i.section,i.label,a.state.responses[i.id]||'unanswered',a.state.supports[i.id]||'',a.state.comments[i.id]||'']);}for(const [key,value]of Object.entries(f))fRows.push([id,a.id,'field',key,value]);for(const [key,value]of Object.entries(a.state.notes))fRows.push([id,a.id,'section note',key,value]);}
  // Upsert only this case. Repeated requests do not create duplicate assessments or items.
  upsert_(assessments,id,aRows);upsert_(itemSheet,id,iRows);upsert_(fieldsSheet,id,fRows);
  let tab=wb.getSheetByName(tabName);if(!tab)tab=wb.insertSheet(tabName);else{tab.getCharts().forEach(chart=>tab.removeChart(chart));tab.clear();}
  tab.setHiddenGridlines(true);tab.getRange('A1').setValue(literal_(label));tab.getRange('A1').setFontSize(16).setFontWeight('bold');tab.getRange('A2').setValue('Descriptive accuracy; not standardized. Comparability depends on items, language, conditions and support.');
  const headers=['Assessment date','Assessment ID','Correct','Assessed','Accuracy','Excluded','Unassessed'];tab.getRange(4,1,1,7).setValues([headers]);style_(tab,4,7);summary.sort((a,b)=>String(a[0]).localeCompare(String(b[0]))||String(a[1]).localeCompare(String(b[1])));if(summary.length){tab.getRange(5,1,summary.length,7).setValues(clean_(summary));tab.getRange(5,5,summary.length,1).setNumberFormat('0%');const chart=tab.newChart().setChartType(Charts.ChartType.LINE).addRange(tab.getRange(4,1,summary.length+1,1)).addRange(tab.getRange(4,5,summary.length+1,1)).setNumHeaders(1).setPosition(4,9,0,0).setOption('title','Recorded accuracy over time').setOption('vAxis',{format:'percent',viewWindow:{min:0,max:1}}).setOption('interpolateNulls',false).build();tab.insertChart(chart);}
  const start=summary.length+8;const needed=start+iRows.length;if(tab.getMaxRows()<needed)tab.insertRowsAfter(tab.getMaxRows(),needed-tab.getMaxRows());tab.getRange(start,1,1,8).setValues([['Assessment ID','Item ID','Section','Prompt (Arabic)','Status','Support','Response / note','Assessment date']]);style_(tab,start,8);const datesById=Object.fromEntries(c.assessments.map(a=>[a.id,a.state.fields.currentDate||a.createdAt.slice(0,10)]));const detail=iRows.map(r=>[...r.slice(1),datesById[r[1]]]);if(detail.length)tab.getRange(start+1,1,detail.length,8).setValues(clean_(detail));tab.setColumnWidths(1,3,150);tab.setColumnWidth(4,350);tab.setColumnWidths(5,2,135);tab.setColumnWidth(7,350);tab.setColumnWidth(8,130);tab.setFrozenRows(4);
  upsert_(cases,id,caseRows);SpreadsheetApp.flush();
  const count=assessments.getRange(2,1,Math.max(1,assessments.getLastRow()-1),1).getValues().filter(r=>r[0]===id).length;if(count!==c.assessments.length)throw Error('Write verification failed');
  return json_({ok:true,caseId:id,revision:p.revision,assessments:count,items:iRows.length});
 }catch(err){return json_({ok:false,error:String(err.message||err)});}finally{if(lock.hasLock())lock.releaseLock();}
}
function validate_(p){
 const id=/^[a-zA-Z0-9-]{1,80}$/;
 if(!p||p.version!==1||!Number.isInteger(p.revision)||p.revision<0||!p.case||!id.test(p.case.id)||typeof p.case.name!=='string'||p.case.name.length>200||!Array.isArray(p.case.assessments)||p.case.assessments.length>500||!Array.isArray(p.catalog)||p.catalog.length>1000)throw Error('Invalid payload');
 const keys=new Set();for(const i of p.catalog){if(!/^item-\w+-\d+$/.test(i.id)||keys.has(i.id)||typeof i.label!=='string'||typeof i.section!=='number')throw Error('Invalid catalog');keys.add(i.id);}
 const ids=new Set();for(const a of p.case.assessments){if(!id.test(a.id)||ids.has(a.id)||typeof a.createdAt!=='string'||!a.state)throw Error('Invalid assessment');ids.add(a.id);for(const key of ['fields','responses','comments','notes','supports']){const map=a.state[key];if(!map||typeof map!=='object'||Array.isArray(map))throw Error('Invalid state');for(const [field,value]of Object.entries(map)){if(['__proto__','constructor','prototype'].includes(field)||!['boolean','string'].includes(typeof value)||String(value).length>45000)throw Error('Invalid field value');}}
 for(const [key,value]of Object.entries(a.state.responses))if(!keys.has(key)||!['correct','incorrect','dontknow','skip','present','absent'].includes(value))throw Error('Invalid response');for(const value of Object.values(a.state.supports))if(!['','independent','repeated','cued','nonverbal','modified'].includes(value))throw Error('Invalid support');}
}
function stats_(catalog,state){const s={correct:0,assessed:0,skipped:0,unanswered:0};for(const i of catalog.filter(i=>!i.observation)){const r=state.responses[i.id];if(r==='correct')s.correct++;if(['correct','incorrect','dontknow'].includes(r))s.assessed++;else if(r==='skip')s.skipped++;else s.unanswered++;}return s;}
function profile_(f){if(f.profileConfounds!=='considered')return 'Incomplete / unresolved';const patterns=[['Broca','nonfluent','preserved','impaired'],['Transcortical motor','nonfluent','preserved','preserved'],['Global','nonfluent','impaired','impaired'],['Mixed transcortical','nonfluent','impaired','preserved'],['Wernicke','fluent','impaired','impaired'],['Transcortical sensory','fluent','impaired','preserved'],['Conduction','fluent','preserved','impaired'],['Anomic','fluent','preserved','preserved']];const vals=[f.profileFluency,f.profileComprehension,f.profileRepetition];if(vals.some(v=>!v)||!f.profileNaming)return 'Incomplete';return patterns.filter(p=>vals.every((v,n)=>v==='mixed'||v===p[n+1])&&(p[0]!=='Anomic'||f.profileNaming!=='preserved')).map(p=>p[0]).join(' / ')||'Unclassified';}
function literal_(value){return typeof value==='string'&&/^[=+@-]/.test(value)?"'"+value:value;}
function clean_(rows){return rows.map(row=>row.map(literal_));}
function style_(sheet,row,width){sheet.getRange(row,1,1,width).setBackground('#22445a').setFontColor('#ffffff').setFontWeight('bold');sheet.setHiddenGridlines(true);}
function sheet_(wb,name,headers){let s=wb.getSheetByName(name);if(!s)s=wb.insertSheet(name);s.getRange(1,1,1,headers.length).setValues([headers]);style_(s,1,headers.length);s.setFrozenRows(1);s.setColumnWidths(1,headers.length,150);return s;}
function upsert_(sheet,id,rows){
 const width=sheet.getLastColumn(),last=sheet.getLastRow(),old=last>1?sheet.getRange(2,1,last-1,width).getValues():[],slots=[];
 old.forEach((row,index)=>{if(row[0]===id)slots.push(index+2);});
 const reused=Math.min(slots.length,rows.length);
 // Write only the selected case. A failed request must never clear another case's records.
 for(let i=0;i<reused;){let end=i+1;while(end<reused&&slots[end]===slots[end-1]+1)end++;sheet.getRange(slots[i],1,end-i,width).setValues(clean_(rows.slice(i,end)));i=end;}
 if(rows.length>reused){const start=sheet.getLastRow()+1,extra=rows.slice(reused),needed=start+extra.length-1;if(sheet.getMaxRows()<needed)sheet.insertRowsAfter(sheet.getMaxRows(),needed-sheet.getMaxRows());sheet.getRange(start,1,extra.length,width).setValues(clean_(extra));}
 for(let i=rows.length;i<slots.length;){let end=i+1;while(end<slots.length&&slots[end]===slots[end-1]+1)end++;sheet.getRange(slots[i],1,end-i,width).clearContent();i=end;}
}
