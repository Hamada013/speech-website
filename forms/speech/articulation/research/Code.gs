// Bound Google Sheets script. Also add assets/research-schema.js as ResearchSchema.gs.
// No web-app deployment, public write endpoint, or OAuth client ID is needed.
function onOpen(){SpreadsheetApp.getUi().createMenu('بحث أصوات الكلام').addItem('استيراد حالة / تحديثها','showResearchImport').addToUi();}
function showResearchImport(){SpreadsheetApp.getUi().showSidebar(HtmlService.createHtmlOutputFromFile('Sidebar').setTitle('استيراد حالة البحث'));}
function importResearchJSON(text){
 const incoming=ArticulationResearch.validate(JSON.parse(text)),lock=LockService.getDocumentLock();lock.waitLock(30000);
 try{
  const book=SpreadsheetApp.getActive(),caseSheet=book.getSheetByName('Case_info'),findings=book.getSheetByName('Findings'),results=book.getSheetByName('Results');
  if(!caseSheet||!findings||!results)throw Error('افتح ملف البحث المرتبط بالتطبيق.');
  if(caseSheet.getMaxColumns()<42)caseSheet.insertColumnsAfter(caseSheet.getMaxColumns(),42-caseSheet.getMaxColumns());
  if(findings.getMaxColumns()<40)findings.insertColumnsAfter(findings.getMaxColumns(),40-findings.getMaxColumns());
  if(caseSheet.getRange(1,37).getValue()==='')caseSheet.getRange(1,37,1,6).setValues([ArticulationResearch.SOURCE_COLUMNS]);
  if(findings.getRange(1,35).getValue()==='')findings.getRange(1,35,1,6).setValues([ArticulationResearch.SOURCE_COLUMNS]);
  if(caseSheet.getRange(1,1,1,42).getValues()[0].join('|')!==ArticulationResearch.CASE_COLUMNS.join('|')||findings.getRange(1,1,1,40).getValues()[0].join('|')!==ArticulationResearch.FINDING_COLUMNS.join('|'))throw Error('أعمدة ملف البحث لا تطابق الإصدار الحالي.');
  const existing=ArticulationResearch.empty();existing.caseRows=caseSheet.getLastRow()>1?caseSheet.getRange(2,1,caseSheet.getLastRow()-1,42).getValues().filter(r=>r[0]):[];existing.findingRows=findings.getLastRow()>1?findings.getRange(2,1,findings.getLastRow()-1,40).getValues().filter(r=>r[0]):[];
  const merged=ArticulationResearch.merge(existing,incoming);
  const literal=rows=>rows.map(row=>row.map(v=>typeof v==='string'&&/^[=+@-]/.test(v)?"'"+v:v===null?'':v));
  if(caseSheet.getMaxRows()<2001)caseSheet.insertRowsAfter(caseSheet.getMaxRows(),2001-caseSheet.getMaxRows());
  if(findings.getMaxRows()<168001)findings.insertRowsAfter(findings.getMaxRows(),168001-findings.getMaxRows());
  if(results.getMaxRows()<2089)results.insertRowsAfter(results.getMaxRows(),2089-results.getMaxRows());
  caseSheet.getRange(2,1,merged.caseRows.length,42).setValues(literal(merged.caseRows));findings.getRange(2,1,merged.findingRows.length,40).setValues(literal(merged.findingRows));
  const formulas=merged.caseRows.map((_,i)=>{const r=i+90,s=i+2;return [`=IF(Case_info!A${s}="","",Case_info!A${s})`,`=IF(A${r}="","",Case_info!C${s})`,`=IF(A${r}="","",Case_info!F${s})`,`=IF(A${r}="","",IF(Case_info!G${s}="","",Case_info!G${s}))`,`=IF(A${r}="","",IF(COUNTIFS($B$90:B${r},B${r})=1,1,0))`,`=IF(A${r}="","",D${r})`,`=IF(A${r}="","",Case_info!W${s})`,`=IF(A${r}="","",Case_info!X${s})`];});
  results.getRange(90,1,formulas.length,8).setFormulas(formulas);
  // Expand only the authored Results input references, preserving layout and charts.
  const resultRange=results.getRange(1,1,80,5),current=resultRange.getFormulas();
  for(let row=0;row<current.length;row++)for(let col=0;col<current[row].length;col++)if(current[row][col])resultRange.getCell(row+1,col+1).setFormula(current[row][col].replace(/Findings!(\$[A-Z]+\$2:\$[A-Z]+\$)\d+/g,(_,range)=>'Findings!'+range+'168001').replace(/Case_info!(\$[A-Z]+\$2:\$[A-Z]+\$)\d+/g,(_,range)=>'Case_info!'+range+'2001'));
  let accounts=book.getSheetByName('Accounts');if(!accounts)accounts=book.insertSheet('Accounts');accounts.clearContents();
  accounts.getRange('A1').setFormula(`=IFERROR(QUERY(Case_info!A2:AP2001,"select AK, AL, AM, count(A), sum(W), sum(X), sum(Y) where A is not null group by AK, AL, AM label AK 'Source account', AL 'Email', AM 'Sign-in', count(A) 'Assessments', sum(W) 'Recorded', sum(X) 'Scored', sum(Y) 'Correct'",0),"No shared assessments yet")`);
  accounts.setFrozenRows(1);accounts.getRange('A1:G1').setFontWeight('bold').setBackground('#edf0f3');accounts.setColumnWidths(1,3,220);
  SpreadsheetApp.flush();return {assessments:merged.caseRows.length,findings:merged.findingRows.length};
 }finally{lock.releaseLock();}
}
