(function () {
  'use strict';
  function paginate(report, state) {
    const stage = document.createElement('div'); stage.className = 'pdf-stage'; stage.setAttribute('aria-hidden', 'true');
    stage.lang = state.reportLang; stage.dir = state.reportLang === 'ar' ? 'rtl' : 'ltr'; document.body.append(stage);
    let page, body;
    const pages = [];
    function newPage() {
      page = document.createElement('div'); page.className = 'pdf-page report-document'; page.style.border = '0'; page.style.borderRadius = '0';
      page.lang = state.reportLang; page.dir = stage.dir;
      body = document.createElement('div'); body.className = 'pdf-body'; page.append(body); stage.append(page); pages.push(page);
    }
    newPage();
    let forceNextPage = false;
    const overflowing=()=>body.scrollHeight>body.clientHeight+1;
    const checkFit=block=>{
      if(overflowing()) {
        const detail=`height ${block.offsetHeight}, page content ${body.scrollHeight}/${body.clientHeight}, ${block.textContent.slice(0,80)}`;
        stage.remove();throw Error('A report row exceeds a PDF page: '+detail);
      }
    };
    for(const entry of report.blocks) {
      if(forceNextPage&&body.children.length)newPage();
      forceNextPage=Boolean(entry.pageBreakAfter);
      const wrapper=document.createElement('div');wrapper.innerHTML=entry.html;
      let block=wrapper.firstElementChild;
      if(block.firstElementChild?.classList.contains('report-footer'))continue;
      const rows=block.querySelector('[data-page-rows]');
      if(!rows) { body.append(block);checkFit(block);continue; }
      const entries=[...rows.children];rows.replaceChildren();
      const template=block.cloneNode(true);
      body.append(block);
      let target=rows;
      for(const row of entries) {
        target.append(row);
        if(overflowing()&&target.children.length>1) {
          row.remove();newPage();block=template.cloneNode(true);
          block.dataset.reportContinuation='true';
          const title=block.querySelector('.sheet-header h1');
          if(title){const marker=document.createElement('small');marker.className='sheet-continuation';marker.textContent=state.reportLang==='ar'?'تابع':'Continued';title.append(marker);}
          body.append(block);target=block.querySelector('[data-page-rows]');target.append(row);
        }
        checkFit(block);
      }
      checkFit(block);
    }
    pages.forEach((node, index) => {
      const footer = document.createElement('div'); footer.className = 'pdf-footer';
      const name = document.createElement('span'); name.textContent = 'Ahmad Ghanem · Latakia - Syria · slp.ahmadghanem@gmail.com · +963 988 451 245';
      const number = document.createElement('span'); number.textContent = `${state.date} · ${index + 1} / ${pages.length}`;
      footer.append(name, number); node.append(footer);
    });
    return { stage, pages };
  }
  let busy = false;
  async function exportPDF(report, state, filename, progress) {
    if (busy) throw Error('An export is already running');
    if (!window.jspdf?.jsPDF || !window.html2canvas) throw Error('Local PDF libraries did not load');
    busy = true;
    let layout;
    try {
      await document.fonts?.ready;
      layout = paginate(report, state);
      const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      pdf.setProperties({ title: 'VB-MAPP Assessment Report', subject: state.reportLang === 'ar' ? 'تقرير تقييم VB-MAPP' : 'VB-MAPP assessment', author: 'Ahmad Ghanem', creator: 'VB-MAPP assessment workspace' });
      window.VBPDFData.attach(pdf, state, window.VB_DATA);
      for (let index = 0; index < layout.pages.length; index++) {
        progress?.(`${index + 1}/${layout.pages.length}`);
        const canvas = await window.html2canvas(layout.pages[index], { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: false, windowWidth: 1100, windowHeight: 1200 });
        if (index) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', .94), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        canvas.width = 1; canvas.height = 1;
      }
      pdf.save(filename);
    } finally { layout?.stage.remove(); busy = false; }
  }
  function preview(report,state,container) {
    const layout=paginate(report,state);
    container.replaceChildren(...layout.pages);layout.stage.remove();
  }
  window.VBPDF = { export: exportPDF, paginate, preview };
})();
