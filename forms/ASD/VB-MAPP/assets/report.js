(function (root) {
  'use strict';
  const M = root.VBModel;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = (lang, en, ar) => lang === 'ar' ? ar : en;
  const valueDirection = value => /^[\d\s.,:/+\-]+$/.test(String(value)) ? 'ltr' : 'auto';
  const levelColors = {
    1: { fill:'#f7cfa8', tint:'#fff7ee', line:'#e8bb90', ink:'#744315' },
    2: { fill:'#c5e5c9', tint:'#f2faf3', line:'#abd5b2', ink:'#2d5937' },
    3: { fill:'#c6ddf6', tint:'#f2f7fe', line:'#aac8e9', ink:'#284f79' }
  };
  function levelStyle(level) {
    const c=levelColors[level] || levelColors[1];
    return `--score-color:${c.fill};--level-tint:${c.tint};--level-line:${c.line};--score-ink:${c.ink}`;
  }
  function label(data, category, lang) { return lang === 'ar' ? data.arabicLabels[category] || data.categoryLabels[category]?.ar || category : data.categoryLabels[category]?.en || category; }
  const gridLabelsAr = { Mand: 'طلب', Tact: 'تسمية', Listener: 'استماع', 'VP/MTS': 'بصري / مطابقة', Play: 'لعب', Social: 'اجتماعي', Imitation: 'تقليد حركي', Echoic: 'تقليد صوتي', Vocal: 'أصوات تلقائية', LRFFC: 'وظيفة / صفة / فئة', Intraverbal: 'حوار', Classroom: 'مجموعة', Linguistics: 'بنية لغوية', Reading: 'قراءة', Writing: 'كتابة', Math: 'حساب' };
  const gridLabelsEn = { Listener: 'Listener', 'VP/MTS': 'VP/MTS', Intraverbal: 'IV', Classroom: 'Group', Linguistics: 'Lang.', Imitation: 'Imitation', Vocal: 'Vocal', LRFFC: 'LRFFC' };
  function gridLabel(category, lang) { return lang === 'ar' ? gridLabelsAr[category] : gridLabelsEn[category] || category; }
  function scoreName(value, lang) { return value === null ? pick(lang, 'Not assessed', 'غير مقيم') : value === 1 ? pick(lang, 'Met (1)', 'متحقق (1)') : value === .5 ? pick(lang, 'Emerging (0.5)', 'ناشئ (0.5)') : pick(lang, 'Not met (0)', 'غير متحقق (0)'); }
  function grid(s, data, lang, interactive = false, options = {}) {
    const all = M.allMilestones(data), old = options.raw ? null : M.previous(s);
    const tables = [];
    for (const level of [3, 2, 1]) {
      const categories = data.categories.filter(cat => all.some(i => i.level === level && i.category === cat));
      const rows = [5, 4, 3, 2, 1].map(n => n + (level - 1) * 5);
      const title = pick(lang, `Level ${level}`, `المستوى ${level}`);
      let html = `<section class="milestone-level level-${level}" data-milestone-level="${level}" style="${levelStyle(level)}"><h3>${title} <span class="age-band" dir="auto">${['', '0-18', '18-30', '30-48'][level]} ${pick(lang, 'months (reference)', 'شهراً (مرجعي)')}</span></h3>`;
      html += `<div class="grid-table-scroll"><table class="milestone-grid" dir="ltr"><caption class="sr-only">${title}</caption><thead><tr><th scope="col">#</th>${categories.map(cat => `<th scope="col" dir="auto" title="${esc(label(data, cat, lang))}">${esc(gridLabel(cat, lang))}</th>`).join('')}</tr></thead><tbody>`;
      for (const number of rows) {
        html += `<tr><th scope="row">${number}</th>`;
        for (const category of categories) {
          const item = all.find(i => i.category === category && i.milestone === number);
          if (!item) { html += '<td class="cell-na">-</td>'; continue; }
          const value = (options.raw ? M.validScore('milestones', item, s.scores.milestones[item.id]) : M.hasScore(s, 'milestones', item)) ? s.scores.milestones[item.id] : null;
          const c = old ? M.comparison(s,'milestones',item) : null;
          const cls = (value === null ? c?.before !== null && c?.before !== undefined ? 'cell-previous' : 'cell-unassessed' : value === 1 ? 'cell-full' : value === .5 ? 'cell-half' : 'cell-zero') + (c?.status === 'lower' ? ' cell-lower' : '');
          const content = value === null ? '·' : value === .5 ? '½' : value;
          const rawBefore = old && M.own(old.scores.milestones,item.id) ? old.scores.milestones[item.id] : null;
          const previousMark = old ? `<small class="grid-before" dir="ltr">P: ${c.before === null ? rawBefore === null ? '-' : rawBefore + '!' : c.before}</small>` : '';
          const name = `${label(data, category, lang)} ${number}: ${scoreName(value, lang)}${old ? '; ' + pick(lang,'Previous score','الدرجة السابقة') + ': ' + (rawBefore === null ? '-' : rawBefore) : ''}`;
          html += `<td class="${cls}${old ? ' has-previous' : ''}">${interactive ? `<button type="button" ${options.raw ? 'data-import-score' : 'data-edit'}="${item.id}" aria-label="${esc(name)}"><span class="grid-value">${content}</span>${previousMark}</button>` : `<span aria-label="${esc(name)}"><span class="grid-value">${content}</span>${previousMark}</span>`}</td>`;
        }
        html += '</tr>';
      }
      html += '</tbody></table></div></section>';
      tables.push(html);
    }
    return tables;
  }
  function legend(lang) {
    return `<div class="grid-legend" style="${levelStyle(3)}">${[['cell-full', '1', 'Met', 'متحقق'], ['cell-half', '½', 'Emerging', 'ناشئ'], ['cell-zero', '0', 'Not met', 'غير متحقق'], ['cell-unassessed', '·', 'Not assessed', 'غير مقيم']].map(([cls, symbol, en, ar]) => `<span><i class="${cls}">${symbol}</i>${pick(lang, en, ar)}</span>`).join('')}</div>`;
  }
  function make(s, data) {
    const lang = s.reportLang, tr = (en, ar) => pick(lang, en, ar), old = M.previous(s), blocks = [];
    const all = M.allMilestones(data), types = Object.keys(s.reportScope).filter(type => s.reportScope[type]);
    const typeNames = { milestones:['Milestones','المعالم'], barriers:['Barriers','العوائق'], transitions:['Transition','الانتقال'], eesa:['EESA','التقليد الصوتي المبكر'], tasks:['Supporting skills','المهارات الداعمة'] };
    const add = (html, text, sheet = false) => blocks.push({ html:`<div class="report-block${sheet ? ' milestone-sheet-block' : ''}">${html}</div>`, text, pageBreakAfter:sheet });
    const heading = (en, ar) => add(`<h2>${tr(en, ar)}</h2>`, tr(en, ar));
    function table(headers, rows) {
      for (let at=0; at<rows.length; at+=8) {
        const part=rows.slice(at,at+8);
        add(`<div class="report-table-scroll"><table class="report-table"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${part.map(row=>`<tr>${row.map(cell=>`<td><bdi dir="${valueDirection(cell)}">${esc(cell)}</bdi></td>`).join('')}</tr>`).join('')}</tbody></table></div>`,[headers.join(' | '),...part.map(row=>row.join(' | '))].join('\n'));
      }
    }
    function note(title, value) {
      if (!value?.trim()) return;
      const parts=value.match(/[\s\S]{1,650}(?:\s|$)|[\s\S]{1,650}/g) || [value];
      parts.forEach((part,i)=>add(`<p><strong>${esc(title)}${i ? ' '+tr('(continued)','(تابع)') : ''}:</strong> <bdi dir="auto">${esc(part)}</bdi></p>`,`${title}: ${part}`));
    }
    const child = `${tr('Child','الطفل')}: ${s.child.name || tr('Not recorded','غير مسجل')}`;
    const visit = `${tr('Date','التاريخ')}: ${s.date} · ${tr('Assessment','التقييم')}: ${s.number}`;
    const age=M.ageOn(s.child.dob,s.date);
    const caseLine=[s.child.dob ? `${tr('Birth','الميلاد')}: ${s.child.dob}` : '',age===null?'':tr(`Age: ${Math.floor(age/12)}y ${age%12}m`,`العمر: ${Math.floor(age/12)} سنة و${age%12} شهر`),s.child.tester ? `${tr('Assessor','الفاحص')}: ${s.child.tester}` : ''].filter(Boolean).join(' · ');
    const caseHTML=[
      s.child.dob ? `<span>${tr('Birth','الميلاد')}: <bdi dir="ltr">${esc(s.child.dob)}</bdi></span>` : '',
      age===null ? '' : `<span>${tr('Age','العمر')}: <bdi dir="ltr">${Math.floor(age/12)}</bdi> ${tr('y','سنة')} <bdi dir="ltr">${age%12}</bdi> ${tr('m','شهر')}</span>`,
      s.child.tester ? `<span>${tr('Assessor','الفاحص')}: <bdi dir="auto">${esc(s.child.tester)}</bdi></span>` : ''
    ].filter(Boolean).join('');
    if (types.includes('milestones')) {
      const st=M.stats(s,all,'milestones'), p=old ? M.progress(s,data) : null;
      const summary=tr(`Score: ${st.assessed ? st.score : '-'} / 170 · Assessed: ${st.assessed}/170`,`الدرجة: ${st.assessed ? st.score : '-'} / 170 · المقيم: ${st.assessed}/170`);
      const comparison=old ? tr(`Previous: ${old.date} · P = previous; large mark = current; ! = review needed.`,`السابق: ${old.date} · P = السابق؛ العلامة الكبيرة = الحالي؛ ! = يحتاج إلى مراجعة.`) : '';
      const changes=old ? tr(`Higher ${p.higher} · Lower ${p.lower} · Same ${p.same} · New ${p.new} · Awaiting retest ${p.retest}`,`أعلى ${p.higher} · أدنى ${p.lower} · ثابتة ${p.same} · جديدة ${p.new} · بانتظار إعادة التقييم ${p.retest}`) : '';
      const text=[tr('VB-MAPP milestones','معالم VB-MAPP'),child,visit,caseLine,summary,comparison,changes,...all.map(item=>`${item.id} ${label(data,item.category,lang)} ${item.milestone}: ${M.hasScore(s,'milestones',item) ? s.scores.milestones[item.id] : '-'}${old ? ' / P: '+(M.hasScore(old,'milestones',item)?old.scores.milestones[item.id]:'-') : ''}`)].filter(Boolean).join('\n');
      add(`<section class="milestone-sheet" aria-label="${tr('All milestone levels','جميع مستويات المعالم')}"><header class="sheet-header"><h1><span dir="ltr">VB-MAPP</span><span dir="${lang==='ar'?'rtl':'ltr'}">${tr('Milestones','المعالم النمائية')}</span></h1><div class="sheet-case"><strong dir="auto">${esc(child)}</strong><span>${tr('Date','التاريخ')}: <bdi dir="ltr">${esc(s.date)}</bdi> · ${tr('Assessment','التقييم')}: <bdi dir="ltr">${esc(s.number)}</bdi></span></div>${caseHTML?`<div class="sheet-meta">${caseHTML}</div>`:''}<p class="sheet-score"><span>${tr('Score','الدرجة')}:</span> <bdi dir="ltr">${st.assessed ? st.score : '-'} / 170</bdi><span>${tr('Assessed','المقيم')}:</span> <bdi dir="ltr">${st.assessed} / 170</bdi></p>${old?`<p class="comparison-key"><span>${tr('Previous','السابق')}: <bdi dir="ltr">${esc(old.date)}</bdi></span><span>${tr('White strip: previous score.','الدرجة السابقة في الشريط الأبيض')}</span></p>`:''}</header>${legend(lang)}${grid(s,data,lang).join('')}${old?`<p class="sheet-changes">${[['Higher','أعلى',p.higher],['Lower','أدنى',p.lower],['Same','ثابتة',p.same],['New','جديدة',p.new],['Awaiting retest','بانتظار إعادة التقييم',p.retest]].map(([en,ar,value])=>`<span>${tr(en,ar)} <bdi dir="ltr">${value}</bdi></span>`).join('')}</p>`:''}${st.pending?`<p class="sheet-changes"><span>${tr('Saved scores requiring re-scoring','درجات محفوظة تحتاج إلى إعادة التسجيل')}: <bdi dir="ltr">${st.pending}</bdi></span></p>`:''}<div class="sheet-contact" dir="ltr">Ahmad Ghanem · SLP · Latakia - Syria · slp.ahmadghanem@gmail.com · +963 988 451 245</div></section>`,text,true);
    } else {
      add(`<header class="report-heading"><h1><span dir="ltr">VB-MAPP</span><span dir="${lang==='ar'?'rtl':'ltr'}">${tr('Assessment','التقييم')}</span></h1><p dir="auto">${esc(child)}</p><p dir="auto">${esc(visit)}</p>${caseHTML?`<div class="sheet-meta">${caseHTML}</div>`:''}</header>`,[child,visit,caseLine].join('\n'));
    }
    if (!types.length) note(tr('Report','التقرير'),tr('No sections selected.','لم يُحدد أي قسم.'));
    // Only recorded sections and entered notes appear in the concise report.
    for (const type of ['barriers','transitions','eesa','tasks']) {
      if (!types.includes(type)) continue;
      const items=M.records(data,type).filter(item=>M.hasScore(s,type,item));
      if (!items.length) continue;
      heading(...typeNames[type]);
      if (type==='eesa') {
        const rows=[1,2,3,4,5].map(group=>{const stats=M.stats(s,data.eesa.filter(item=>item.group===group),'eesa');return [data.eesaGroups[group][lang],`${stats.assessed?stats.score:'-'} / ${stats.total}`,String(stats.assessed)];});
        table([tr('Group','المجموعة'),tr('Score','الدرجة'),tr('Assessed','المقيم')],rows);
      } else table([tr('Item','البند'),tr('Score','الدرجة')],items.map(item=>[M.itemText(item,s,lang),String(s.scores[type][item.id])]));
    }
    for (const [title,value] of [[tr('Language / communication','اللغة / التواصل'),s.child.language],[tr('Parent / caregiver','ولي الأمر / مقدم الرعاية'),s.child.guardian],[tr('Reason for assessment','سبب التقييم'),s.child.reason],[tr('Setting and sources','البيئة ومصادر المعلومات'),s.child.setting],[tr('Relevant background','الخلفية ذات الصلة'),s.child.relevant]]) note(title,value);
    for (const [title,value] of [[tr('Observations','الملاحظات'),s.clinical],[tr('Recommendations','التوصيات'),s.recommendations]]) note(title,value);
    const plans=types.includes('milestones') ? Object.entries(s.goals).filter(([id,plan])=>plan.selected&&all.some(item=>item.id===id)) : [];
    if (plans.length) {
      heading('Goals','الأهداف');
      for (const [id,plan] of plans) {
        const item=all.find(item=>item.id===id), valid=M.currentPlan(s,item,plan), start=blocks.length;
        note(`${label(data,item.category,lang)} ${item.milestone}${valid?'':' - '+tr('previous plan; review needed','خطة سابقة تحتاج إلى مراجعة')}`,plan.goal||M.itemText(item,s,lang));
        note(tr('Criterion','المعيار'),plan.criterion); note(tr('Support','الدعم'),plan.support); note(tr('Review date','تاريخ المراجعة'),plan.review);
        const parts=blocks.slice(start), length=parts.reduce((n,b)=>n+b.text.length,0);
        if(parts.length>1&&length<1100)blocks.splice(start,parts.length,{html:`<div class="report-block goal-plan">${parts.map(b=>b.html).join('')}</div>`,text:parts.map(b=>b.text).join('\n')});
      }
    }
    if (s.reportDetails || s.includeUnassessed) {
      for (const type of types) {
        const items=M.records(data,type).filter(item=>s.includeUnassessed||M.own(s.scores[type],item.id)||s.comments[item.id]||(old&&M.own(old.scores[type],item.id)));
        if (!items.length) continue;
        heading(`${typeNames[type][0]} - details`,`${typeNames[type][1]} - التفاصيل`);
        for(const item of items) {
          const score=M.hasScore(s,type,item)?s.scores[type][item.id]:null;
          const status=score===null?tr('Not assessed','غير مقيم'):type==='milestones'?scoreName(score,lang):String(score);
          note(`${item.id} · ${status}`,M.itemText(item,s,lang));
          if(old&&M.own(old.scores[type],item.id))note(tr('Previous result','النتيجة السابقة'),`${old.date}: ${old.scores[type][item.id]}`);
          if(M.own(s.scores[type],item.id)&&score===null)note(tr('Saved score requiring review','درجة محفوظة تحتاج إلى مراجعة'),String(s.scores[type][item.id]));
          note(tr('Response note','ملاحظة الاستجابة'),s.comments[item.id]);
        }
      }
    }
    // The sheet uses the repeated PDF footer; avoid an extra page for a footer.
    if(blocks.length>1)blocks[0].pageBreakAfter=types.includes('milestones');
    else blocks[0].pageBreakAfter=false;
    return {blocks,html:blocks.map(b=>b.html).join(''),text:blocks.map(b=>b.text).join('\n\n')};
  }
  root.VBReport = { esc, label, grid, legend, make, levelStyle, levelColors };
})(window);
