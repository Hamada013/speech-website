import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {Workbook,SpreadsheetFile,sourceSheet} from './build-research.mjs';
const require=createRequire(import.meta.url),M=require('../../../Hearing/ling_test/assets/model.js');
export function validateLing(p){
 if(p?.version!==1||p.app!=='ling'||typeof p.source!=='string'||p.source.length>100||typeof p.child?.id!=='string'||p.child.id.length>100||typeof p.child.caseId!=='string'||p.child.caseId.length>100||!Array.isArray(p.sessions)||p.sessions.length>2000)throw Error('Invalid Ling research payload');
 const ids=new Set();for(const s of p.sessions){M.validateSession(s);if(ids.has(s.id))throw Error('Duplicate session');ids.add(s.id);}return p;
}
export async function buildLing(records,output,{preview}={}){
 const wb=Workbook.create(),assessment=[],practice=[],trials=[];
 for(const p of records){validateLing(p);for(const s of p.sessions){const eligible=M.eligible(s),correct=s.trials.filter(t=>t.response===t.target).length;
  (eligible?assessment:practice).push([p.source,p.child.caseId,p.child.id,s.id,s.started,s.ended||'',s.mode,s.complete?'complete':'incomplete',s.context?.ear||'',s.context?.distance??null,s.context?.environment||'',s.queue.length,s.trials.length,correct,eligible?correct/12:null]);
  s.trials.forEach((t,i)=>trials.push([p.source,p.child.caseId,s.id,eligible?'assessment':'practice',i+1,M.sounds.find(x=>x.id===t.target).phoneme,t.response===null?'no_response':M.sounds.find(x=>x.id===t.response).phoneme,t.choices.length,t.choices.join('|'),t.assisted?1:0,t.deliveries||1,t.target===t.response?1:0,t.phase,t.at||'']));
 }}
 const headers=['Source ID','Case code','Child UUID','Session UUID','Started UTC','Ended UTC','Requested mode','Completion','Ear / device','Distance m (reported)','Conditions (reported)','Planned trials','Recorded trials','Correct responses','Assessment accuracy'];
 for(const [name,rows]of [['Assessments',assessment],['Practice',practice]]){const sheet=sourceSheet(wb,name,headers,rows);sheet.getRange('K1:K'+Math.max(2,rows.length+1)).format.columnWidth=45;sheet.getRange('O2:O'+Math.max(2,rows.length+1)).setNumberFormat('0.0%');if(name==='Assessments'&&rows.length)sheet.getRange('O2:O'+(rows.length+1)).formulas=rows.map((_,i)=>[`=IF(M${i+2}=0,"",N${i+2}/M${i+2})`]);}
 sourceSheet(wb,'Trials',['Source ID','Case code','Session UUID','Report section','Trial','Target phoneme','Response','Visible cards','Choice IDs','Assisted','Deliveries','Correct','Phase','Response UTC'],trials);
 const notes=sourceSheet(wb,'Readme',['Field','Meaning'],[['Export behavior','Only the report export action updates this cumulative workbook. Child names are excluded.'],['Assessment eligibility','Completed 12-trial identification; each Ling sound twice; all six cards visible on every trial; no replay or assistance.'],['Practice','All introductions, practice, smaller choice sets, assisted and incomplete tests. Not assessment accuracy.'],['No response','Explicit examiner entry; retained in the assessment denominator.'],['Interpretation','Descriptive identification responses under reported conditions. Playback level is not calibrated; no norms or diagnosis inferred.'],['Reset','Resets only this app research dataset. Accounts and clinical reports are retained and may be exported again.']]);notes.getRange('B1:B7').format.columnWidth=110;notes.getRange('B1:B7').format.wrapText=true;notes.getRange('A1:B7').format.autofitRows();
 wb.recalculate();if(preview){const image=await wb.render({sheetName:'Assessments',range:'I1:O4',scale:1.5,format:'png'});await fs.writeFile(preview,new Uint8Array(await image.arrayBuffer()));}await (await SpreadsheetFile.exportXlsx(wb)).save(output);await fs.unlink(output+'.inspect.ndjson').catch(()=>{});return {sessions:assessment.length+practice.length,assessments:assessment.length,practice:practice.length,trials:trials.length};
}
