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
    for (let index = 0; index < report.blocks.length; index++) {
      const wrapper = document.createElement('div'); wrapper.innerHTML = report.blocks[index].html; const block = wrapper.firstElementChild;
      // PDF pages already repeat the complete contact footer below their content.
      if(block.firstElementChild?.classList.contains('report-footer'))continue;
      body.append(block);
      const overflow = body.scrollHeight > body.clientHeight + 1;
      if (overflow && body.children.length > 1) {
        body.removeChild(block);
        // Keep a heading with the following block when it is the last block on a page.
        const carried = [];
        while (body.lastElementChild) {
          const last = body.lastElementChild;
          const keepWithNext = (last.firstElementChild?.matches('h2,h3') && last.children.length === 1) || last.querySelector('.grid-legend');
          if (!keepWithNext) break;
          carried.unshift(last); body.removeChild(last);
        }
        const gridLegend = block.querySelector('.milestone-grid') && !carried.some(node=>node.querySelector('.grid-legend')) ? stage.querySelector('.grid-legend')?.closest('.report-block')?.cloneNode(true) : null;
        newPage(); carried.forEach(node => body.append(node)); if(gridLegend)body.append(gridLegend); body.append(block);
      }
      if (body.scrollHeight > body.clientHeight + 1) {
        const detail = `block ${index}, height ${block.offsetHeight}, page content ${body.scrollHeight}/${body.clientHeight}, ${block.textContent.slice(0,80)}`;
        stage.remove(); throw Error('A report block exceeds a PDF page: ' + detail);
      }
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
  window.VBPDF = { export: exportPDF, paginate };
})();
