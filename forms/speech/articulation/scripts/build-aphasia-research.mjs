import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {Workbook,SpreadsheetFile,sourceSheet} from './build-research.mjs';
const require=createRequire(import.meta.url),model=require('../../../aphasia/langiuage-cognitive/assets/model.js');
const {validateAphasia}=require('./aphasia-research-model.cjs');
export {validateAphasia};
export async function buildAphasia(records,output,{previews}={}){
 const wb=Workbook.create(),summary=[],details=[],fields=[];
 for(const entry of records){const {case:c,catalog}=validateAphasia(entry);for(const a of c.assessments){
  const s=model.summarize(catalog,a.state);summary.push([c.id,c.name,a.id,a.state.fields.currentDate||'',s.total,s.assessed,s.correct,s.incorrect,s.dontknow,s.skipped,s.unanswered,null]);
  for(const item of catalog)details.push([c.id,a.id,item.id,item.section,item.group,item.label,item.observation?'Observation':'Performance',a.state.responses[item.id]||'unanswered',a.state.supports[item.id]||'',a.state.comments[item.id]||'']);
  for(const [type,map]of [['field',a.state.fields],['section_note',a.state.notes]])for(const [key,value]of Object.entries(map))if(value!==''&&value!==false)fields.push([c.id,a.id,type,key,value]);
 }}
 const main=sourceSheet(wb,'Assessments',['Case ID','Case name','Assessment ID','Assessment date (source)','Performance tasks','Evaluated','Correct','Incorrect','No response','Excluded','Unassessed','Accuracy'],summary);
 sourceSheet(wb,'Items',['Case ID','Assessment ID','Item ID','Section','Group','Task','Type','Result','Support','Comment'],details);
 sourceSheet(wb,'Clinical_fields',['Case ID','Assessment ID','Type','Field','Value'],fields);
 if(summary.length){main.getRange(`L2:L${summary.length+1}`).formulas=summary.map((_,i)=>[`=IF(F${i+2}=0,"",G${i+2}/F${i+2})`]);main.getRange(`L2:L${summary.length+1}`).setNumberFormat('0.0%');}
 main.getRange('N1').values=[['Accuracy = correct / evaluated. Observations, excluded and unassessed tasks are separate.']];main.getRange('N1').format.columnWidth=110;
 for(const [name,range]of [['Assessments','A1:D'+Math.max(2,summary.length+1)],['Items','A1:C'+Math.max(2,details.length+1)],['Clinical_fields','A1:B'+Math.max(2,fields.length+1)]])wb.worksheets.getItem(name).getRange(range).format.columnWidth=39;
 const itemSheet=wb.worksheets.getItem('Items');itemSheet.getRange(`F1:F${Math.max(2,details.length+1)}`).format.columnWidth=65;itemSheet.getRange(`F1:J${Math.max(2,details.length+1)}`).format.wrapText=true;itemSheet.getRange(`A2:J${Math.max(2,details.length+1)}`).format.autofitRows();
 const clinical=wb.worksheets.getItem('Clinical_fields');clinical.getRange(`E1:E${Math.max(2,fields.length+1)}`).format.columnWidth=85;clinical.getRange(`E1:E${Math.max(2,fields.length+1)}`).format.wrapText=true;clinical.getRange(`A2:E${Math.max(2,fields.length+1)}`).format.autofitRows();
 wb.recalculate();const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!',options:{useRegex:true,maxResults:10},maxChars:1500});if(/"value":"#/.test(errors.ndjson))throw Error(errors.ndjson);
 if(previews){await fs.mkdir(previews,{recursive:true});for(const [name,range]of [['Assessments','A1:L6'],['Items','D1:J6'],['Clinical_fields','C1:E6']]){const image=await wb.render({sheetName:name,range,scale:1,format:'png'});await fs.writeFile(path.join(previews,name+'.png'),new Uint8Array(await image.arrayBuffer()));}}
 await(await SpreadsheetFile.exportXlsx(wb)).save(output);await fs.unlink(output+'.inspect.ndjson').catch(()=>{});
 return {cases:records.length,assessments:summary.length,items:details.length};
}
