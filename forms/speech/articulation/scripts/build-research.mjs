import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),schema=require('../assets/research-schema.js');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dependencyRoot=process.env.ARTIFACT_NODE_MODULES||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const artifactRequire=createRequire(path.join(path.dirname(dependencyRoot),'research-builder.cjs'));
const {Workbook,SpreadsheetFile}=await import(pathToFileURL(artifactRequire.resolve('@oai/artifact-tool')).href);
export {Workbook,SpreadsheetFile};
const column=index=>{let out='';for(let n=index+1;n;n=Math.floor((n-1)/26))out=String.fromCharCode(65+(n-1)%26)+out;return out;};
export const CAPACITY=2000,FINDINGS_END=CAPACITY*84+1;
export function resultModel({findingsEnd=FINDINGS_END,caseEnd=CAPACITY+1}={}){
 const f=(name)=>`Findings!$${column(schema.FINDING_COLUMNS.indexOf(name))}$2:$${column(schema.FINDING_COLUMNS.indexOf(name))}$${findingsEnd}`;
 const c=name=>`Case_info!$${column(schema.CASE_COLUMNS.indexOf(name))}$2:$${column(schema.CASE_COLUMNS.indexOf(name))}$${caseEnd}`;
 const rows=[['Arabic speech sound research'],['Descriptive observations. No acquisition norms or diagnostic cutoffs are inferred.'],[''],['Assessments',`=COUNTA(${c('assessment_id')})`],['Participants (distinct codes)',`=SUM(E90:E${CAPACITY+89})`],['Recorded items',`=SUM(${f('recorded')})`],['Scored items',`=SUM(${f('scored')})`],['Correct target judgments',`=SUM(${f('correct')})`],['Target accuracy',`=IF(B7=0,"",B8/B7)`],[],['Outcome','Items']];
 for(const [i,status] of schema.STATUSES.entries())rows.push([status,`=COUNTIFS(${f('status')},A${i+12})`]);
 rows.push([],['Age at first shared assessment (months)','Children']);
 const bands=[[0,23],[24,35],[36,47],[48,59],[60,71],[72,83],[84,95],[96,119],[120,179],[180,299]];
 for(const [i,[lo,hi]] of bands.entries())rows.push([`${lo}-${hi}`,`=SUMIFS($E$90:$E$${CAPACITY+89},$F$90:$F$${CAPACITY+89},">=${lo}",$F$90:$F$${CAPACITY+89},"<=${hi}",$F$90:$F$${CAPACITY+89},"<>")`]);
 rows.push([],['Sound (actual reference IPA)','Independent scored','Independent correct','Accuracy','Error items']);
 const sounds=['ʔ','b','t','θ','ʒ','dʒ','ħ','x','d','ð','r','ɾ','z','s','ʃ','sˤ','dˤ','tˤ','zˤ','ðˤ','ʕ','ɣ','f','q','k','l','m','n','h','w','j','ɡ','p','v','χ','ʁ','tʃ'];
 const soundStart=rows.length+1;
 for(const [i,sound] of sounds.entries()){const row=soundStart+i;rows.push([sound,`=COUNTIFS(${f('sound_ipa')},A${row},${f('elicitation')},"naming",${f('scored')},1,${f('reference_reviewed')},1)`,`=COUNTIFS(${f('sound_ipa')},A${row},${f('elicitation')},"naming",${f('correct')},1,${f('reference_reviewed')},1)`,`=IF(B${row}=0,"",C${row}/B${row})`,`=COUNTIFS(${f('sound_ipa')},A${row},${f('error')},1)`]);}
 while(rows.length<74)rows.push([]);rows.push(['Judgment group','Items'],['Correct','=B8'],['Error','=B7-B8'],['Not scored','=SUM(B12:B20)-B7']);
 return {rows,soundStart,sounds,bands};
}
export function sourceSheet(wb,name,headers,rows){
 const s=wb.worksheets.add(name);s.showGridLines=false;
 s.getRange(`A1:${column(headers.length-1)}1`).values=[headers];
 if(rows.length)s.getRange(`A2:${column(headers.length-1)}${rows.length+1}`).values=rows.map(row=>row.map(value=>typeof value==='string'&&value.startsWith('=')?"'"+value:value));
 const area=s.getRange(`A1:${column(headers.length-1)}${Math.max(2,rows.length+1)}`);
 area.format={font:{name:'Arial',size:10,color:'#1f2937'},verticalAlignment:'center',rowHeight:22,columnWidth:21};
 s.getRange(`A1:${column(headers.length-1)}1`).format={font:{name:'Arial',size:10,bold:true},fill:'#edf0f3',rowHeight:30};
 s.freezePanes.freezeRows(1);s.freezePanes.freezeColumns(name==='Findings'?3:2);
 return s;
}
export async function buildResearch(dataset=schema.empty(),output=path.join(root,'research/arabic-speech-research.xlsx'),options={}){
 dataset=schema.validate(dataset);const wb=Workbook.create(),results=wb.worksheets.add('Results');results.showGridLines=false;
 const caseSheet=sourceSheet(wb,'Case_info',schema.CASE_COLUMNS,dataset.caseRows),findings=sourceSheet(wb,'Findings',schema.FINDING_COLUMNS,dataset.findingRows);
 const sources=[...new Set(dataset.caseRows.map(row=>row[36]||'unattributed'))].sort();
 const accounts=sourceSheet(wb,'Accounts',['Source account','Email','Sign-in','Assessments','Recorded','Scored','Correct'],sources.map((id,i)=>{const first=dataset.caseRows.find(r=>(r[36]||'unattributed')===id),r=i+2,end=Math.max(dataset.caseRows.length+1,2);return [id,first[37],first[38],`=COUNTIF(Case_info!$AK$2:$AK$${end},A${r})`,`=SUMIF(Case_info!$AK$2:$AK$${end},A${r},Case_info!$W$2:$W$${end})`,`=SUMIF(Case_info!$AK$2:$AK$${end},A${r},Case_info!$X$2:$X$${end})`,`=SUMIF(Case_info!$AK$2:$AK$${end},A${r},Case_info!$Y$2:$Y$${end})`];}));
 if(!sources.length)accounts.getRange('A2').values=[['No shared assessments yet']];
 const dictionaryRows=[
 ['Source account','source_account_id; source_account_email; source_sign_in','Accounts groups submissions by their source. Google email is included for signed-in sources; guest IDs remain distinct.'],
 ['Verification','source_verified; source_device_id; source_app_origin','Only the deployed collector verifies Firebase identity and origin. Local/manual exports are self-reported (0); legacy rows are unattributed.'],
 ['Protocol',schema.PROTOCOL,'84 target-position probes; 69 picture assets. Draft Syrian references remain editable.'],
 ['Research schema',schema.VERSION,'One Case_info row per assessment; one Findings row per assessment/probe.'],
 ['Identity','assessment_id; child_id; finding_id','Immutable IDs. Reimport updates the same assessment; distinct dates/assessments are retained.'],
 ['Identifiers','child_name; date_of_birth','Optional. Age in completed months is exported even when the name/DOB are excluded. Free-text notes are retained as authored.'],
 ['Missing','empty cells','Unknown values are not replaced with zero. status=unrecorded is a missing test observation.'],
 ['Accuracy','correct / scored','Target-level judgments, not PCC, diagnosis or sound acquisition percentage. Dialect/unelicited/skipped/unrecorded are excluded.'],
 ['Phoneme','sound_ipa','Uses the actual reference phoneme, not a written letter. Dialect realizations and modifications remain explicit.'],
 ['Production','production_ipa','Optional whole-word transcription entered by the clinician; never inferred from one target judgment. replacement_ipa is target-level only.'],
 ['Elicitation','naming; imitation; context','Never pool assisted productions with independent naming as proof of acquisition.'],
 ['Reference','reference_reviewed; modified_stimulus; reference_key','Reference review is explicit. The reference key is a deterministic change identifier, not a security hash.'],
 ['Diagnostic impression','diagnostic_suggestion; diagnosis_override; clinician_reviewed','Automatic descriptions are provisional. Clinician wording takes priority. No numeric diagnosis code or age-normed diagnosis is generated.'],
 ['First shared assessment','Results rows 90 onward','Rows are sorted by participant code and assessment date. First shared assessment per child is used for the age distribution only.'],
 ['Sampling','sample_source; research_consent','Unknown, community and clinical sampling remain distinct. Research consent is recorded, not assumed.'],
 ['Counts','recorded; scored; correct; error','0/1 processed flags derive from recorded status; raw status, mode and reference remain available for independent analysis.'],
 ['Capacity',String(CAPACITY)+' assessments',String(CAPACITY*84)+' item rows. Imports reject over-capacity batches rather than dropping records.'],
 ['Clinical source','ASHA Speech Sound Disorders', 'https://www.asha.org/practice-portal/clinical-topics/articulation-and-phonology/'],
 ['Norm development','Study design required','This convenience dataset does not establish norms. Retain age, dialect, sampling, consent, repeated-measure IDs and eligibility for separate research review.'],
 ...schema.CASE_COLUMNS.map((name,i)=>['Case_info column '+(i+1),name,'One assessment per row.']),
 ...schema.FINDING_COLUMNS.map((name,i)=>['Findings column '+(i+1),name,'One probe per assessment.'])
 ];
 const dictionary=sourceSheet(wb,'Dictionary',['Field / method','Variable / value','Definition'],dictionaryRows);
 dictionary.getRange(`A1:A${dictionaryRows.length+1}`).format.columnWidth=29;dictionary.getRange(`B1:B${dictionaryRows.length+1}`).format.columnWidth=62;dictionary.getRange(`B2:B${dictionaryRows.length+1}`).format.wrapText=true;dictionary.getRange(`A2:C${dictionaryRows.length+1}`).format.rowHeight=34;dictionary.getRange(`C1:C${dictionaryRows.length+1}`).format.columnWidth=110;
 const model=resultModel({findingsEnd:Math.max(100,dataset.findingRows.length+85),caseEnd:Math.max(100,dataset.caseRows.length+10)});
 results.getRange(`A1:E${model.rows.length}`).values=model.rows.map(row=>Array.from({length:5},(_,i)=>typeof row[i]==='string'&&row[i].startsWith('=')?null:row[i]??null));
 for(const [i,row] of model.rows.entries())row.forEach((value,j)=>{if(typeof value==='string'&&value.startsWith('='))results.getCell(i,j).formulas=[[value]];});
 results.getRange('A89:H89').values=[['Assessment ID','Participant code','Assessment date','Age months','First row per child','First-assessment age','Recorded','Scored']];
 // The first-row indicator is a build calculation; it never changes source records.
 for(let i=0;i<Math.max(dataset.caseRows.length,1);i++){
  const r=i+90,source=i+2;
  results.getRange(`A${r}:H${r}`).formulas=[[`=IF(Case_info!A${source}="","",Case_info!A${source})`,`=IF(A${r}="","",Case_info!C${source})`,`=IF(A${r}="","",Case_info!F${source})`,`=IF(A${r}="","",IF(Case_info!G${source}="","",Case_info!G${source}))`,`=IF(A${r}="","",IF(COUNTIFS($B$90:B${r},B${r})=1,1,0))`,`=IF(A${r}="","",D${r})`,`=IF(A${r}="","",Case_info!W${source})`,`=IF(A${r}="","",Case_info!X${source})`]];
 }
 results.getRange(`A1:O${Math.max(91,90+dataset.caseRows.length)}`).format={font:{name:'Arial',size:10,color:'#203e4b'},rowHeight:22,columnWidth:14,verticalAlignment:'center'};
 results.getRange('A1').format.font={name:'Arial',size:16,bold:true,color:'#22445a'};results.getRange('A1:A90').format.columnWidth=42;
 results.getRange('B1:C90').format.columnWidth=20;results.getRange('D1:D90').format.columnWidth=17;results.getRange('A3').formulas=[['=IF(B4=0,"No shared cases yet - charts update after an import.","Shared assessment records; repeated visits remain identifiable.")']];
 results.getRange('B9').setNumberFormat('0.0%');results.getRange(`D${model.soundStart}:D${model.soundStart+model.sounds.length-1}`).setNumberFormat('0.0%');
 for(const row of [11,22,model.soundStart-1,89])results.getRange(`A${row}:E${row}`).format={fill:'#edf0f3',font:{name:'Arial',size:10,bold:true},rowHeight:27};
 results.getRange('A2').format.font={name:'Arial',size:10,color:'#607789'};
 const pie=results.charts.add('doughnut',results.getRange('A75:B78'));pie.title='Correct / error / not scored';pie.setPosition('G4','O20');
 const ages=results.charts.add('bar',results.getRange('A22:B32'));ages.title='Children by age at first shared assessment';ages.hasLegend=false;ages.setPosition('G23','O40');
 const soundChart=results.charts.add('bar',[results.getRange(`A${model.soundStart-1}:A${model.soundStart+model.sounds.length-1}`),results.getRange(`E${model.soundStart-1}:E${model.soundStart+model.sounds.length-1}`)]);soundChart.title='Error items by actual reference phoneme';soundChart.hasLegend=false;soundChart.setPosition('G43','O80');
 for(const chart of [pie,ages,soundChart]){chart.titleTextStyle.fontSize=12;chart.titleTextStyle.typeface='Arial';}
 ages.yAxis={numberFormatCode:'0.##',numberFormatSourceLinked:false};soundChart.yAxis={numberFormatCode:'0.##',numberFormatSourceLinked:false};
 const last=Math.max(2,dataset.caseRows.length+1);caseSheet.getRange(`AA2:AA${last}`).setNumberFormat('0.0%');
 wb.recalculate();
 const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!',options:{useRegex:true,maxResults:20},maxChars:2000});
 if(/"value":"#/.test(errors.ndjson))throw Error(errors.ndjson);
 if(options.previews){await fs.mkdir(options.previews,{recursive:true});for(const [name,range] of [['Accounts','A1:G8'],['Results','A1:O40'],['Case_info','A1:H8'],['Findings','A1:H8'],['Dictionary','A1:C18']]){const image=await wb.render({sheetName:name,range,scale:1,format:'png'});await fs.writeFile(path.join(options.previews,name+'.png'),new Uint8Array(await image.arrayBuffer()));}}
 await (await SpreadsheetFile.exportXlsx(wb)).save(output);
 await fs.unlink(output+'.inspect.ndjson').catch(()=>{});
 return {output,assessments:dataset.caseRows.length,findings:dataset.findingRows.length,metrics:results.getRange('B4:B9').values};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const datafile=path.join(root,'research/dataset.json');let dataset=schema.empty();try{dataset=JSON.parse(await fs.readFile(datafile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
 console.log(await buildResearch(dataset,process.argv[2]||path.join(root,'research/arabic-speech-research.xlsx'),{previews:process.env.RESEARCH_PREVIEWS}));
}
