/* Local PDF/JSON import. Exact PDF data first; older images require review.
 * Legacy recognition is limited to this app's 9/12/13-domain, five-row grids.
 * Unknown layouts and ambiguous marks are left blank, never assigned zero.
 */
(function (root) {
  'use strict';
  const M = root.VBModel, vendor = new URL('./vendor/', document.currentScript.src);
  let library;
  const error = code => Object.assign(new Error(code), { code });
  async function pdfLibrary() {
    library ||= import(new URL('pdf.mjs', vendor).href).then(lib => {
      lib.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.mjs', vendor).href; return lib;
    });
    return library;
  }
  function validate(raw, data) {
    if (!raw || raw.version !== 2 || !raw.child || !raw.scores || Array.isArray(raw.scores)) throw error('invalid-data');
    const records = [raw, ...(Array.isArray(raw.history) ? raw.history : [])];
    for (const record of records) {
      if (!record || !record.scores) throw error('invalid-data');
      if(typeof record.date!=='string'||M.ageOn(record.date,record.date)===null||(record.child?.dob&&M.ageOn(record.child.dob,record.date)===null))throw error('invalid-data');
      if(record!==raw&&record.caseId!==raw.caseId)throw error('invalid-data');
      for (const type of Object.keys(M.allowed)) {
        const ids = new Set(M.records(data, type).map(item => item.id));
        for (const [id, score] of Object.entries(record.scores[type] || {})) {
          if (!ids.has(id) || (!M.allowed[type].includes(score) && !(type === 'tasks' && typeof score === 'boolean'))) throw error('invalid-data');
        }
      }
      for (const key of ['comments', 'customCriteria', 'scoreReviews', 'goals'])
        if (Object.keys(record[key] || {}).some(id => ['__proto__', 'constructor', 'prototype'].includes(id))) throw error('invalid-data');
    }
    return M.normalize(raw);
  }
  function unpack(bytes, data) {
    if (bytes.length > 8 * 1024 * 1024) throw error('too-large');
    let parsed;
    try { parsed = JSON.parse(new TextDecoder('utf-8', { fatal:true }).decode(bytes)); } catch (_) { throw error('invalid-data'); }
    if (parsed.format !== 'VB-MAPP-REPORT' || parsed.schema !== 1) throw error('unsupported-schema');
    return validate(parsed.assessment, data);
  }
  function detectGrid(image, data, debug = false) {
    const { width:w, height:h, data:pix } = image, count=w*h;
    const mask = new Uint8Array(count), visited = new Uint8Array(count), queue = new Int32Array(count);
    for (let i=0;i<count;i++) {
      const r=pix[i*4],g=pix[i*4+1],b=pix[i*4+2], high=Math.max(r,g,b),low=Math.min(r,g,b);
      if ((low < 249 && high-low >= 5) || high < 225) mask[i]=1;
    }
    const boxes=[];
    for (let start=0;start<count;start++) {
      if (!mask[start] || visited[start]) continue;
      let first=0,last=1,minX=w,minY=h,maxX=0,maxY=0;queue[0]=start;visited[start]=1;
      while(first<last) {
        const p=queue[first++],x=p%w,y=(p-x)/w;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
        for(const n of [p-1,p+1,p-w,p+w]) {
          if(n<0||n>=count||visited[n]||!mask[n]||(Math.abs(n-p)===1&&Math.floor(n/w)!==y))continue;
          visited[n]=1;queue[last++]=n;
        }
      }
      const bw=maxX-minX+1,bh=maxY-minY+1;
      if(bw>=25&&bw<=105&&bh>=23&&bh<=45&&bw/bh>=.8)boxes.push({x:minX,y:minY,w:bw,h:bh});
    }
    const rows=[];
    for(const box of boxes.sort((a,b)=>a.y-b.y||a.x-b.x)) {
      let row=rows.find(r=>Math.abs(r.y-box.y)<=2);
      if(!row){row={y:box.y,boxes:[]};rows.push(row);}row.boxes.push(box);
    }
    const groups=[];
    for(let at=0;at<rows.length;at++) {
      const row=rows[at], columns=row.boxes.length;
      if(![9,12,13].includes(columns))continue;
      const group=rows.slice(at,at+5);
      if(group.length!==5||!group.every(r=>r.boxes.length>=Math.ceil(columns/2)&&r.boxes.length<=columns))continue;
      const anchors=row.boxes.sort((a,b)=>a.x-b.x);
      if(!group.every(r=>r.boxes.every(b=>anchors.some(a=>Math.abs(b.x-a.x)<=2&&Math.abs(b.w-a.w)<=3))))continue;
      if(!group.slice(1).every((r,i)=>r.y-group[i].y>=25&&r.y-group[i].y<=48))continue;
      // Filled cells can merge into JPEG components. Their positions are taken
      // only from a complete anchor row in an otherwise consistent five-row grid.
      const sorted=group.map(r=>anchors.map(a=>({...a,y:r.y,h:r.boxes[0].h})));
      groups.push({level:columns===9?1:columns===12?2:3,rows:sorted});at+=4;
    }
    function score(box) {
      let top=0,bottom=0,nt=0,nb=0,gray=0,samples=0,brown=0,blueGlyph=0;
      for(let y=box.y+3;y<box.y+box.h-3;y++)for(let x=box.x+3;x<box.x+box.w-3;x++) {
        const i=(y*w+x)*4,r=pix[i],g=pix[i+1],b=pix[i+2];
        const central=Math.abs(x-(box.x+box.w/2))<8;
        if(central){if(r>b+25&&g>b+15&&r<210)brown++;if(b>r+10&&g>r+8&&Math.max(r,g,b)<160)blueGlyph++;continue;}
        const colored=Math.max(r,g,b)<220||Math.max(r,g,b)-Math.min(r,g,b)>20;
        if(y<box.y+box.h/2){nt++;if(colored)top++;}else{nb++;if(colored)bottom++;}
        if(r>=225&&r<248&&g>=230&&b>=233)gray++;samples++;
      }
      if(top/nt>.75&&bottom/nb>.75)return 1;
      if(top/nt<.15&&bottom/nb>.65)return .5;
      if(brown||gray/samples>.5)return null;
      if(top/nt<.08&&bottom/nb<.08&&blueGlyph>=10)return 0;
      return null;
    }
    const scores={}, levels=[];
    for(const group of groups) {
      if(levels.includes(group.level))continue;
      // Two-visit printed grids contain a separate previous-score strip.
      // Do not confuse that strip with a current result during visual recovery.
      if(group.rows[0][0].h>35)continue;
      levels.push(group.level);
      const cats=data.categories.filter(cat=>M.allMilestones(data).some(item=>item.level===group.level&&item.category===cat));
      for(let row=0;row<5;row++)for(let col=0;col<cats.length;col++) {
        const milestone=group.level*5-row,item=M.allMilestones(data).find(i=>i.category===cats[col]&&i.milestone===milestone),value=score(group.rows[row][col]);
        if(item&&value!==null&&M.validScore('milestones',item,value))scores[item.id]=value;
      }
    }
    return { scores, levels, ...(debug ? {rows} : {}) };
  }
  async function read(file, data, progress) {
    if (!file || file.size > 50*1024*1024) throw error('too-large');
    const bytes=new Uint8Array(await file.arrayBuffer());
    if(/\.json$/i.test(file.name)||file.type==='application/json') {
      let raw;try{raw=JSON.parse(new TextDecoder().decode(bytes));}catch(_){throw error('invalid-data');}
      return { state:validate(raw,data), exact:true, method:'json', name:file.name };
    }
    if(!new TextDecoder().decode(bytes.subarray(0,1024)).includes('%PDF-'))throw error('not-pdf');
    progress?.('reading');
    const lib=await pdfLibrary(), task=lib.getDocument({data:bytes,isEvalSupported:false,enableXfa:false,useSystemFonts:true});
    try {
      const pdf=await task.promise, attachments=await pdf.getAttachments();
      const entries=attachments instanceof Map?[...attachments]:Object.entries(attachments||{});
      for(const [id,entry] of entries) if(entry.filename===root.VBPDFData.filename) {
        const content=entry.content||await pdf.getAttachmentContent(id);
        return {state:unpack(content,data),exact:true,method:'pdf-data',name:file.name};
      }
      const state=M.blank();state.date='';state.reportScope={milestones:true,eesa:false,barriers:false,transitions:false,tasks:false};
      const named=/^VB-MAPP-(.+)-(\d{4}-\d{2}-\d{2})-(?:ar|en)\.pdf$/i.exec(file.name);
      if(named){state.child.name=named[1]==='Assessment'?'':named[1];state.date=named[2];}
      const previews=[],levels=new Set();
      // Rendering older reports is intentionally bounded on tablets.
      for(let n=1;n<=Math.min(pdf.numPages,8);n++) {
        progress?.(`page ${n}`);
        const page=await pdf.getPage(n), viewport=page.getViewport({scale:794/page.getViewport({scale:1}).width});
        const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
        const ctx=canvas.getContext('2d',{willReadFrequently:true});await page.render({canvasContext:ctx,canvas,viewport}).promise;
        const found=detectGrid(ctx.getImageData(0,0,canvas.width,canvas.height),data);
        if(n===1||found.levels.length)previews.push({page:n,url:canvas.toDataURL('image/png')});
        if(found.levels.every(level=>!levels.has(level))) {
          Object.assign(state.scores.milestones,found.scores);found.levels.forEach(level=>levels.add(level));
        }
        canvas.width=1;canvas.height=1;page.cleanup();if(levels.size===3)break;
      }
      state.importSource=file.name;
      return {state,exact:false,method:levels.size?'legacy-grid':'manual',name:file.name,previews,levels:[...levels]};
    } catch(e) {if(e.code)throw e;throw error(e.name==='PasswordException'?'password-pdf':'pdf-open');}
    finally {await task.destroy();}
  }
  root.VBImport={read,validate,unpack,detectGrid};
})(window);
