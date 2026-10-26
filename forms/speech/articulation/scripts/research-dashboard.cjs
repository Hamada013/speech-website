// Native Google Sheets dashboard. Existing importers only update the source tabs
// and legacy Results helpers; these views recalculate directly from source data.
'use strict';
const SHEETS={Dashboard:18242402,Age_groups:18242403,Children:18242404};
const bands=[{label:'Under 1.5',lo:0,hi:18},...Array.from({length:21},(_,i)=>({label:`${((18+i*6)/12).toFixed(1)}–${((24+i*6)/12).toFixed(1)}`,lo:18+i*6,hi:24+i*6})),{label:'12+',lo:144,hi:10000},{label:'Unknown age'}];
const col=(source,c)=>`${source}!${c}2:${c}2001`;
function childrenFormula(source='Case_info'){
 const c=x=>col(source,x),age=c('G');
 const band=`IF(ISNUMBER(${age}),IF(${age}<18,"Under 1.5",IF(${age}>=144,"12+",TEXT(FLOOR(${age},6)/12,"0.0")&"–"&TEXT((FLOOR(${age},6)+6)/12,"0.0"))),"Unknown age")`;
 // The source account plus participant code defines identity. Blank codes fall
 // back to immutable child ID. Earliest dated visit wins, then creation time/ID.
 return `=IF(COUNTA(${c('A')})=0,"",LET(data,FILTER(HSTACK(${c('AK')}&"|"&IF(${c('C')}="",${c('B')},${c('C')}),IF(${c('C')}="",${c('B')},${c('C')}),${c('D')},${c('AK')},${c('F')},IF(ISNUMBER(${age}),${age},""),${band},${c('W')},${c('X')},${c('Y')},${c('Z')},IF(${c('X')}=0,"",${c('Y')}/${c('X')}),${c('A')},IF(${c('F')}="","9999-12-31",${c('F')}),${c('AF')}),${c('A')}<>""),CHOOSECOLS(SORTN(SORT(data,1,TRUE,14,TRUE,15,TRUE,13,TRUE),2000,2,1,TRUE),2,3,4,5,6,7,8,9,10,11,12,13,1)))`;
}
const rgb=hex=>({red:parseInt(hex.slice(1,3),16)/255,green:parseInt(hex.slice(3,5),16)/255,blue:parseInt(hex.slice(5,7),16)/255});
const blue=rgb('#417da8'),green=rgb('#40978a'),orange=rgb('#d49457');
const range=(sheetId,r0,r1,c0,c1)=>({sheetId,startRowIndex:r0,endRowIndex:r1,startColumnIndex:c0,endColumnIndex:c1});
const cell=v=>({userEnteredValue:typeof v==='number'?{numberValue:v}:typeof v==='string'&&v.startsWith('=')?{formulaValue:v}:{stringValue:v??''}});
const write=(id,row,column,rows)=>({updateCells:{start:{sheetId:id,rowIndex:row,columnIndex:column},rows:rows.map(r=>({values:r.map(cell)})),fields:'userEnteredValue'}});
const fmt=(r,f)=>({repeatCell:{range:r,cell:{userEnteredFormat:f},fields:'userEnteredFormat'}});
function chart(title,subtitle,sheet,row0,row1,domain,series,anchorRow,anchorCol,{type='BAR',percent=false,category='Age (years)',metric='Children',height=500}={}){
 const data=c=>({sourceRange:{sources:[range(sheet,row0,row1,c,c+1)]}});
 const spec={title,subtitle,fontName:'Arial',titleTextFormat:{fontSize:15,bold:true},subtitleTextFormat:{fontSize:10},backgroundColor:{red:1,green:1,blue:1},basicChart:{chartType:type,headerCount:1,legendPosition:series.length===1?'NO_LEGEND':'BOTTOM_LEGEND',axis:[{position:'BOTTOM_AXIS',title:percent?'Correct / scored':metric,viewWindowOptions:{viewWindowMin:0,...(percent?{viewWindowMax:1}:{})}},{position:'LEFT_AXIS',title:category}],domains:[{domain:data(domain)}],series:series.map((c,i)=>({series:data(c),targetAxis:'BOTTOM_AXIS',colorStyle:{rgbColor:[blue,green,orange][i%3]}}))}};
 return {addChart:{chart:{spec,position:{overlayPosition:{anchorCell:{sheetId:SHEETS.Dashboard,rowIndex:anchorRow,columnIndex:anchorCol},widthPixels:570,heightPixels:height}}}}};
}
function buildRequests(existing={}){
 const req=[],ids={...SHEETS,...existing};
 // Stable IDs are used only when the named tabs do not exist.
 for(const [name,id] of Object.entries(SHEETS))if(existing[name]===undefined)req.push({addSheet:{properties:{sheetId:id,title:name,gridProperties:{rowCount:name==='Children'?2003:100,columnCount:14,hideGridlines:true,frozenRowCount:name==='Children'?3:0}}}});
 // These builders are for the initial installation; existing source sheets and
 // charts are deliberately not cleared or rewritten.
 const d=ids.Dashboard,a=ids.Age_groups,k=ids.Children;
 for(const [id,rows,cols] of [[d,65,14],[a,34,8],[k,35,13]]){
  req.push(fmt(range(id,0,rows,0,cols),{backgroundColor:rgb('#ffffff'),textFormat:{fontFamily:'Arial',fontSize:11,foregroundColor:rgb('#243746')},verticalAlignment:'MIDDLE',wrapStrategy:'WRAP'}));
  req.push({updateDimensionProperties:{range:{sheetId:id,dimension:'ROWS',startIndex:0,endIndex:rows},properties:{pixelSize:27},fields:'pixelSize'}});
  req.push({updateDimensionProperties:{range:{sheetId:id,dimension:'COLUMNS',startIndex:0,endIndex:cols},properties:{pixelSize:id===d?85:115},fields:'pixelSize'}});
 }
 const merged=(id,row,c0,c1,text)=>{req.push(write(id,row,c0,[[text]]),{mergeCells:{range:range(id,row,row+1,c0,c1),mergeType:'MERGE_ALL'}});};
 merged(d,0,0,14,'اختبار النطق | Research dashboard');
 merged(d,1,0,14,'Live summaries of imported assessments • age groups in six-month intervals');
 merged(d,2,0,14,'No assessments yet. Charts populate automatically when records are imported or uploaded.');
 for(const [c0,label,formula,detail] of [[0,'Assessments','=COUNTA(Case_info!A2:A2001)','All submitted visits'],[3,'Children','=COUNTIF(Children!A4:A2003,"?*")','One first shared visit per child'],[6,'Scored items','=SUM(Children!H4:H2003)','First shared visits only'],[9,'Target accuracy','=IF(SUM(Children!H4:H2003)=0,"",SUM(Children!I4:I2003)/SUM(Children!H4:H2003))','Correct / scored target judgments']]){
  merged(d,3,c0,c0+3,label);merged(d,4,c0,c0+3,formula);merged(d,5,c0,c0+3,detail);
 }
 // Headline values live in A5 / D5 / G5 / J5 (merged cells).
 req.push(write(d,2,0,[['=IF(A5=0,"No assessments yet. Charts populate automatically after an import.","Live results • "&A5&" assessments • "&D5&" distinct children")']]));
 merged(d,7,0,14,'Age charts count each child once, at their earliest dated shared assessment. Follow-up visits remain in the assessment total.');
 merged(d,8,0,14,'Age intervals include the lower bound and exclude the upper bound: 1.5–2.0 years = 18–23 completed months. Unknown ages stay separate.');
 merged(d,9,0,14,'Accuracy is descriptive target scoring across elicitation methods, not a diagnosis or age norm. Empty denominators remain blank.');
 merged(d,61,0,14,'Refresh: import case JSON using the bound research menu, or use an authorized upload route. Firebase sign-in alone does not send results to Sheets.');
 merged(d,63,0,14,'Open Age_groups for counts, results and in-cell bars; Children for the first shared visit per child; Results for detailed phoneme tables.');
 merged(a,0,0,8,'Age groups | مجموعات العمر');
 merged(a,1,0,8,'One child per source account + participant code; first shared assessment only. Ages use completed months.');
 merged(a,2,0,8,'Scored children have ≥1 scored item. Accuracy = total correct ÷ total scored, across elicitation methods.');
 req.push(write(a,4,0,[['Age (years)','Children','Scored children','Scored items','Correct','Errors','Accuracy','Result bar']]));
 bands.forEach((b,i)=>{const r=i+6,criteria=`Children!$F$4:$F$2003,A${r}`;req.push(write(a,r-1,0,[[b.label,`=COUNTIF(Children!$F$4:$F$2003,A${r})`,`=COUNTIFS(${criteria},Children!$H$4:$H$2003,">0")`,`=SUMIF(Children!$F$4:$F$2003,A${r},Children!$H$4:$H$2003)`,`=SUMIF(Children!$F$4:$F$2003,A${r},Children!$I$4:$I$2003)`,`=SUMIF(Children!$F$4:$F$2003,A${r},Children!$J$4:$J$2003)`,`=IF(D${r}=0,"",E${r}/D${r})`,`=IF(D${r}=0,"",SPARKLINE(G${r},{"charttype","bar";"max",1;"color1","#40978a"}))`]]));});
 const end=5+bands.length;
 req.push(write(a,end+1,0,[['Total',`=SUM(B6:B${end})`,`=SUM(C6:C${end})`,`=SUM(D6:D${end})`,`=SUM(E6:E${end})`,`=SUM(F6:F${end})`,`=IF(D${end+2}=0,"",E${end+2}/D${end+2})`]]));
 req.push(write(k,0,0,[['Children | أول فحص مشارك لكل طفل']]));
 merged(k,1,0,13,'Updates automatically. Repeated visits do not duplicate children. Blank participant codes fall back to child ID; different source accounts remain separate.');
 req.push(write(k,2,0,[['Participant code','Child name (optional)','Source account','First shared date','Age (months)','Age (years)','Recorded','Scored','Correct','Errors','Accuracy','Assessment ID','Identity key']]));
 req.push(write(k,3,0,[[childrenFormula()]]));
 req.push({setBasicFilter:{filter:{range:range(k,2,2003,0,13)}}});
 for(const [id,r,c] of [[d,0,14],[a,0,8],[k,0,13]])req.push(fmt(range(id,r,r+1,0,c),{textFormat:{fontFamily:'Arial',fontSize:18,bold:true,foregroundColor:rgb('#243746')},verticalAlignment:'MIDDLE'}),{updateDimensionProperties:{range:{sheetId:id,dimension:'ROWS',startIndex:r,endIndex:r+1},properties:{pixelSize:40},fields:'pixelSize'}});
 for(const [id,r,cols] of [[a,4,8],[k,2,13]])req.push(fmt(range(id,r,r+1,0,cols),{backgroundColor:rgb('#edf0f3'),textFormat:{fontFamily:'Arial',fontSize:11,bold:true},wrapStrategy:'WRAP',verticalAlignment:'MIDDLE'}),{updateDimensionProperties:{range:{sheetId:id,dimension:'ROWS',startIndex:r,endIndex:r+1},properties:{pixelSize:42},fields:'pixelSize'}});
 for(const [r,c] of [[4,0],[4,3],[4,6],[4,9]])req.push(fmt(range(d,r,r+1,c,c+3),{textFormat:{fontFamily:'Arial',fontSize:26,bold:true,foregroundColor:rgb('#417da8')},numberFormat:{type:c===9?'PERCENT':'NUMBER',pattern:c===9?'0.0%':'0'}}));
 req.push({updateDimensionProperties:{range:{sheetId:d,dimension:'ROWS',startIndex:4,endIndex:5},properties:{pixelSize:48},fields:'pixelSize'}},{updateDimensionProperties:{range:{sheetId:d,dimension:'ROWS',startIndex:5,endIndex:6},properties:{pixelSize:38},fields:'pixelSize'}});
 for(const [id,r0,r1,c] of [[a,5,end,6],[a,end+1,end+2,6],[k,3,2003,10]])req.push({repeatCell:{range:range(id,r0,r1,c,c+1),cell:{userEnteredFormat:{numberFormat:{type:'PERCENT',pattern:'0.0%'}}},fields:'userEnteredFormat.numberFormat'}});
 req.push({updateDimensionProperties:{range:{sheetId:a,dimension:'COLUMNS',startIndex:0,endIndex:1},properties:{pixelSize:145},fields:'pixelSize'}},{updateDimensionProperties:{range:{sheetId:a,dimension:'COLUMNS',startIndex:7,endIndex:8},properties:{pixelSize:180},fields:'pixelSize'}});
 for(const [c,w] of [[0,210],[1,190],[2,220],[3,150],[4,110],[5,130],[11,230],[12,300]])req.push({updateDimensionProperties:{range:{sheetId:k,dimension:'COLUMNS',startIndex:c,endIndex:c+1},properties:{pixelSize:w},fields:'pixelSize'}});
 req.push({updateSheetProperties:{properties:{sheetId:d,index:0},fields:'index'}},{updateSheetProperties:{properties:{sheetId:a,index:1,gridProperties:{frozenRowCount:5}},fields:'index,gridProperties.frozenRowCount'}},{updateSheetProperties:{properties:{sheetId:k,index:2,gridProperties:{frozenRowCount:3}},fields:'index,gridProperties.frozenRowCount'}});
 // Outlying and unknown ages remain visible alongside six-month bands.
 req.push(chart('Children by age group','First shared assessment • six-month age groups',a,4,end,0,[1],12,0));
 req.push(chart('Correct and error items by age','First shared assessment • see Age_groups for accuracy percentages',a,4,end,0,[4,5],12,7,{metric:'Items'}));
 const outcomeRow=53;
 req.push(write(d,outcomeRow,0,[['Outcome','Items'],['Correct','=SUM(Children!I4:I2003)'],['Errors','=SUM(Children!J4:J2003)'],['Not scored','=COUNTIF(Children!A4:A2003,"?*")*84-SUM(Children!H4:H2003)']]));
 req.push(chart('Target results','First shared assessments • unscored items shown separately',d,outcomeRow,outcomeRow+4,0,[1],33,0,{category:'Outcome',metric:'Items'}));
 // Legacy Results keeps the authored reference-IPA independent naming formulas.
 req.push(chart('Independent naming by phoneme','All visits • reviewed references • see Results for accuracy percentages',existing.Results,33,71,0,[1,2],33,7,{metric:'Items',category:'Reference IPA',height:720}));
 if(existing.Results!==undefined){
  req.push(write(existing.Results,4,1,[[`=COUNTIF(Children!A4:A2003,"?*")`]]));
  // Keep the legacy yearly table consistent with the same deduplicated children.
  for(const [i,[lo,hi]] of [[0,23],[24,35],[36,47],[48,59],[60,71],[72,83],[84,95],[96,119],[120,179],[180,299]].entries())req.push(write(existing.Results,22+i,1,[[`=COUNTIFS(Children!$E$4:$E$2003,">=${lo}",Children!$E$4:$E$2003,"<=${hi}",Children!$E$4:$E$2003,"<>")`]]));
 }
 return req;
}
module.exports={SHEETS,bands,childrenFormula,buildRequests};
if(require.main===module)process.stdout.write(JSON.stringify(buildRequests({Results:18242401})));
