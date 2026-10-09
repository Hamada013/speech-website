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
    const lang = s.reportLang, tr = (en, ar) => pick(lang, en, ar);
    const blocks = [];
    const add = (html, text) => blocks.push({ html: `<div class="report-block">${html}</div>`, text });
    const heading = (en, ar) => add(`<h2>${tr(en, ar)}</h2>`, '\n' + tr(en, ar));
    const table = (headers, rows, css = '') => {
      // Bounded table blocks keep rows together and repeat labels on new pages.
      for (let at=0;at<rows.length;at+=8) {
        const chunk=rows.slice(at,at+8);
        add(`<div class="report-table-scroll"><table class="report-table ${css}"><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${chunk.map(row=>`<tr>${row.map(cell=>`<td><bdi dir="${valueDirection(cell)}">${esc(cell)}</bdi></td>`).join('')}</tr>`).join('')}</tbody></table></div>`,[headers.join(' | '),...chunk.map(row=>row.join(' | '))].join('\n'));
      }
    };
    const paragraph = (title, value, related = null) => {
      const content = String(value || tr('Not recorded', 'غير مسجل'));
      // Keep user-entered notes in bounded blocks so long notes paginate safely.
      const chunks = content.match(/[\s\S]{1,700}(?:\s|$)|[\s\S]{1,700}/g) || [content];
      chunks.forEach((part, index) => {
        // Keep the previous result with its item description, including at page breaks.
        const tail = related && index === chunks.length - 1 ? related : null;
        add(`<p><strong>${esc(title)}${index ? ' ' + tr('(continued)', '(تابع)') : ''}:</strong> <bdi dir="${valueDirection(part)}">${esc(part)}</bdi></p>${tail ? `<p><strong>${esc(tail.title)}:</strong> <bdi dir="${valueDirection(tail.value)}">${esc(tail.value)}</bdi></p>` : ''}`, `${title}${index ? ' ' + tr('(continued)', '(تابع)') : ''}: ${part}${tail ? '\n\n' + tail.title + ': ' + tail.value : ''}`);
      });
    };
    const groupShortRecord = start => {
      const parts=blocks.slice(start), text=parts.map(block=>block.text).join('\n\n');
      // Keep short plans and item evidence together; long notes retain bounded chunks.
      if(parts.length>1 && text.length<=1400)blocks.splice(start,parts.length,{html:`<div class="report-block goal-plan">${parts.map(block=>block.html).join('')}</div>`,text});
    };
    // Separate direction runs so the canvas exporter retains Arabic shaping in the title.
    const reportTitle = lang === 'ar' ? '<span dir="rtl">تقرير تقييم</span><span dir="ltr">VB-MAPP</span>' : '<span>VB-MAPP Assessment Report</span>';
    add(`<header class="report-heading"><p>Ahmad Ghanem · ${tr('Speech and Language Pathology', 'اختصاص النطق واللغة')}</p><h1>${reportTitle}</h1></header>`, tr('VB-MAPP Assessment Report', 'تقرير تقييم VB-MAPP'));
    heading('Child and assessment information', 'معلومات الطفل والتقييم');
    const fields = { name: ['Child name', 'اسم الطفل'], dob: ['Date of birth', 'تاريخ الميلاد'], tester: ['Assessor', 'الفاحص'], guardian: ['Parent / caregiver', 'ولي الأمر / مقدم الرعاية'], language: ['Language / dialect and communication modes', 'اللغة / اللهجة ووسائل التواصل'], reason: ['Reason for assessment', 'سبب التقييم'], setting: ['Setting and sources of information', 'البيئة ومصادر المعلومات'], relevant: ['Relevant background / supports', 'الخلفية ذات الصلة / الدعم المستخدم'] };
    table([tr('Field','البيان'),tr('Details','التفاصيل')], [
      [tr('Child name','اسم الطفل'), s.child.name || tr('Not recorded','غير مسجل')],
      [tr('Date of birth','تاريخ الميلاد'), s.child.dob || tr('Not recorded','غير مسجل')],
      [tr('Assessment date / number','تاريخ التقييم / رقمه'), `${s.date} / ${s.number}`],
      [tr('Assessor','الفاحص'), s.child.tester || tr('Not recorded','غير مسجل')],
      [tr('Parent / caregiver','ولي الأمر / مقدم الرعاية'), s.child.guardian || tr('Not recorded','غير مسجل')],
      [tr('Language / communication modes','اللغة / وسائل التواصل'), s.child.language || tr('Not recorded','غير مسجل')]
    ],'child-table');
    for(const key of ['reason','setting','relevant']) if(s.child[key])paragraph(tr(...fields[key]),s.child[key]);
    const age = M.ageOn(s.child.dob, s.date);
    if (age !== null) paragraph(tr('Chronological age at assessment', 'العمر الزمني عند التقييم'), tr(`${Math.floor(age / 12)} years, ${age % 12} months`, `${Math.floor(age / 12)} سنة و${age % 12} شهر`));
    heading('Scope and completion', 'نطاق التقييم واكتماله');
    const typeNames = { milestones: ['Milestones', 'المعالم النمائية'], barriers: ['Barriers', 'العوائق'], transitions: ['Transition', 'الانتقال'], eesa: ['EESA', 'التقليد الصوتي المبكر EESA'], tasks: ['Supporting skills', 'المهارات الداعمة'] };
    const types = Object.keys(typeNames).filter(type => s.reportScope[type]);
    const old=M.previous(s);
    paragraph(tr('Sections included', 'الأقسام المشمولة'), types.length ? types.map(type => tr(...typeNames[type])).join(' / ') : tr('None selected', 'لم يُحدد أي قسم'));
    for (const type of types) {
      const st = M.stats(s, M.records(data, type), type);
      paragraph(tr(...typeNames[type]), tr(`${st.assessed}/${st.total} assessed; ${st.unassessed + st.missing} unassessed. Recorded score: ${st.assessed ? st.score : 'Not assessed'}.`, `مقيم: ${st.assessed}/${st.total}؛ غير مقيم: ${st.unassessed + st.missing}. مجموع الدرجات المسجلة: ${st.assessed ? st.score : 'غير مقيم'}.`));
      if (st.pending) paragraph(tr('Preserved results needing review', 'نتائج محفوظة تحتاج إلى مراجعة'), tr(`${st.pending} previous results are excluded from totals, current goals, and interpretation until re-scored under valid criteria.`, `لا تدخل ${st.pending} نتيجة سابقة في المجاميع والأهداف الحالية والتفسير حتى إعادة تسجيلها وفق معايير صالحة.`));
    }
    if(old) {
      heading('Follow-up and comparison','المتابعة والمقارنة');
      paragraph(tr('Previous assessment','التقييم السابق'), `${old.date} / ${old.number}`);
      paragraph(tr('Current assessment','التقييم الحالي'), `${s.date} / ${s.number}`);
      paragraph(tr('Comparison scope','نطاق المقارنة'),tr('Previous marks are reference results. Items not re-tested have no current score. Score changes are compared only when both assessments use the same item criterion.','الدرجات السابقة نتائج مرجعية. لا توجد درجة حالية للبنود التي لم تُعد معاينتها. تُقارن تغيّرات الدرجات عندما يستخدم التقييمان معيار البند نفسه.'));
      if(types.includes('milestones')) {
        const p=M.progress(s,data);
        table([tr('Measure','المؤشر'),tr('Count / score','العدد / الدرجة')],[
          [tr('Higher score','درجة أعلى'), String(p.higher)],
          [tr('Lower score','درجة أدنى'), String(p.lower)],
          [tr('Same score','درجة ثابتة'), String(p.same)],
          [tr('Newly assessed','مقيم لأول مرة'), String(p.new)],
          [tr('Awaiting retest','بانتظار إعادة التقييم'), String(p.retest)],
          [tr('Different criteria - not compared','معايير مختلفة - دون مقارنة'), String(p['criteria-changed'])],
          [tr('Same-item total: previous','مجموع البنود المشتركة: التقييم السابق'), String(p.pairedPrevious)],
          [tr('Same-item total: current','مجموع البنود المشتركة: التقييم الحالي'), String(p.pairedCurrent)]
        ]);
      }
      table([tr('Previous visit','الزيارة السابقة'),tr('Assessment','التقييم'),tr('Milestones recorded','المعالم المسجلة')],s.history.map(record=>[record.date,record.number,types.includes('milestones')?String(M.stats(record,M.allMilestones(data),'milestones').assessed):tr('Outside report scope','خارج نطاق التقرير')]));
    }
    paragraph(tr('Assessment status', 'حالة التقييم'), tr('A focused or partial assessment is permitted. Unassessed records are not zero scores. Only the selected sections are interpreted below.', 'يمكن إجراء تقييم جزئي أو لقسم واحد. البنود غير المقيمة لا تُعد درجات صفرية. يقتصر التحليل أدناه على الأقسام المحددة.'));
    if (types.includes('tasks')) paragraph(tr('Supporting-skills coverage', 'تغطية المهارات الداعمة'), tr('Only the five supporting-skill entries present in the original file are available; this is not the full task-analysis inventory.', 'تتوفر البنود الخمسة الموجودة في الملف الأصلي فقط؛ ولا تمثل القائمة الكاملة لتحليل المهام.'));
    if (s.migration) paragraph(tr('Imported results', 'النتائج المستوردة'), tr('Imported results require review against current observations.', 'تحتاج النتائج المستوردة إلى مراجعة وفق الملاحظات الحالية.'));
    heading('Clinical observations', 'الملاحظات السريرية'); paragraph(tr('Observation summary', 'ملخص الملاحظات'), s.clinical);
    if (types.includes('milestones')) {
      heading('Milestones master grid', 'جدول المعالم النمائية الرئيسي');
      add(legend(lang, s.color) + (old ? `<p class="comparison-key">${tr('Large mark = current score. P = previous score; ! = previous result requires re-scoring. A dot means no score recorded at this visit.','العلامة الكبيرة = الدرجة الحالية. P = الدرجة السابقة؛ ! = نتيجة سابقة تحتاج إلى إعادة التسجيل. النقطة تعني عدم تسجيل درجة في هذه الزيارة.')}</p>` : ''), tr('Grid: 1 = met; 0.5 = emerging; 0 = not met; dot = not assessed.', 'الجدول: 1 متحقق؛ 0.5 ناشئ؛ 0 غير متحقق؛ النقطة غير مقيم.'));
      grid(s, data, lang).forEach((html, i) => add(html, tr(`Level ${3 - i} grid`, `جدول المستوى ${3 - i}`)));
      for (const cat of data.categories) {
        const st = M.stats(s, M.allMilestones(data).filter(i => i.category === cat), 'milestones');
        add(`<div class="profile-row"><span>${esc(label(data, cat, lang))}</span><div class="profile-track"><i style="width:${st.score / st.total * 100}%;background:#6c99bd"></i></div><b dir="ltr">${st.assessed ? st.score : '-'} / ${st.total}</b><small>${st.assessed} ${tr('assessed', 'مقيم')}</small></div>`, `${label(data, cat, lang)}: ${st.assessed ? st.score : tr('Not assessed', 'غير مقيم')}/${st.total}; ${st.assessed} ${tr('assessed', 'مقيم')}`);
      }
      if(old) {
        heading('Milestone changes and items to re-test','تغيرات المعالم والبنود التي تحتاج إلى إعادة التقييم');
        const statusLabels={higher:['Higher score','درجة أعلى'],lower:['Lower score','درجة أدنى'],same:['Same score','درجة ثابتة'],new:['Newly assessed','مقيم لأول مرة'],retest:['Awaiting retest','بانتظار إعادة التقييم'],'criteria-changed':['Different criteria','معايير مختلفة'],unassessed:['Not assessed','غير مقيم']};
        const rows=M.allMilestones(data).filter(item=>M.own(old.scores.milestones,item.id)||M.own(s.scores.milestones,item.id)).map(item=>{
          const c=M.comparison(s,'milestones',item),raw=old.scores.milestones[item.id];
          return [`${item.id} · ${label(data,item.category,lang)} ${item.milestone}`,c.before===null?raw===undefined?'-':`${raw} !`:String(c.before),c.current===null?'-':String(c.current),tr(...statusLabels[c.status])];
        });
        if(rows.length)table([tr('Item','البند'),tr('Previous','السابق'),tr('Current','الحالي'),tr('Status','الحالة')],rows,'comparison-table');
        else paragraph(tr('Comparison','المقارنة'),tr('No milestone scores available for comparison.','لا تتوفر درجات معالم للمقارنة.'));
      }
    }
    for (const type of ['barriers', 'transitions', 'eesa']) {
      if (!types.includes(type)) continue;
      heading(`${typeNames[type][0]} - recorded profile`, `${typeNames[type][1]} - الملف المسجل`);
      if (type === 'eesa') {
        for (const group of [1, 2, 3, 4, 5]) {
          const st = M.stats(s, data.eesa.filter(i => i.group === group), 'eesa');
          const name = data.eesaGroups[group][lang];
          add(`<div class="profile-row"><span>${esc(name)}</span><div class="profile-track"><i style="width:${st.score / st.total * 100}%;background:#6a5685"></i></div><b dir="ltr">${st.assessed ? st.score : '-'} / ${st.total}</b><small>${st.assessed} ${tr('assessed', 'مقيم')}</small></div>`, `${name}: ${st.assessed ? st.score : tr('Not assessed', 'غير مقيم')}/${st.total}; ${st.assessed} ${tr('assessed', 'مقيم')}`);
        }
      } else {
        const max = type === 'barriers' ? 4 : 5;
        for (const item of data[type]) {
          const value = M.hasScore(s, type, item) ? s.scores[type][item.id] : null;
          const name = item.name[lang];
          add(`<div class="profile-row"><span>${esc(name)}</span><div class="profile-track"><i style="width:${(value || 0) / max * 100}%;background:${type === 'barriers' ? '#a94747' : '#477d62'}"></i></div><b dir="ltr">${value === null ? '-' : value} / ${max}</b><small>${value === null ? tr('Not assessed', 'غير مقيم') : tr('Recorded', 'مسجل')}</small></div>`, `${name}: ${value === null ? tr('Not assessed', 'غير مقيم') : value + '/' + max}`);
        }
      }
    }
    heading('Data-informed priorities and draft goals', 'أولويات وأهداف مقترحة مستندة إلى النتائج');
    const targets = M.goals(s, data);
    if (!targets.length) paragraph(tr('Priorities', 'الأولويات'), tr('No assessed milestone gap available within the report scope. Do not infer a deficit from unassessed items.', 'لا توجد صعوبة مقيمة في المعالم ضمن نطاق التقرير. لا تستنتج صعوبة من البنود غير المقيمة.'));
    for (const target of targets) {
      const planStart=blocks.length;
      const item = target.item, plan = s.goals[item.id];
      const name = `${label(data, item.category, lang)} ${item.milestone}`;
      if (target.nextProbe) { paragraph(tr('Next assessment probe', 'بند مقترح للفحص التالي'), `${name}: ${M.itemText(item, s, lang)}`); continue; }
      paragraph(tr('Recorded priority', 'أولوية مسجلة'), `${name}: ${scoreName(target.baseline, lang)} - ${M.itemText(item, s, lang)}`);
      if (plan?.selected && M.currentPlan(s, item, plan)) {
        paragraph(tr('Selected goal', 'الهدف المختار'), plan.goal || M.itemText(item, s, lang));
        paragraph(tr('Measurement / mastery criterion', 'معيار القياس / الإتقان'), plan.criterion || M.itemScoring(item, s, lang));
        paragraph(tr('Support and generalization plan', 'خطة الدعم والتعميم'), plan.support);
        paragraph(tr('Review date', 'تاريخ المراجعة'), plan.review);
        groupShortRecord(planStart);
      }
    }
    for (const [id, plan] of Object.entries(s.goals)) {
      const item = M.allMilestones(data).find(i => i.id === id);
      if (!item || !plan.selected || !s.reportScope.milestones || (targets.some(t => t.item.id === id && !t.nextProbe) && M.currentPlan(s, item, plan))) continue;
      const planStart=blocks.length;
      paragraph(!M.currentPlan(s, item, plan) ? tr('Historical goal - changed criteria; not a current recommendation', 'هدف سابق - تغيّرت المعايير؛ لا يُعد توصية حالية') : tr('Previously selected goal - reassess baseline', 'هدف مختار سابقاً - راجع خط الأساس'), plan.goal || M.itemText(item, s, lang)); paragraph(tr('Previously recorded goal criterion', 'معيار الهدف المسجل سابقاً'), plan.criterion); paragraph(tr('Support plan / review date', 'خطة الدعم / تاريخ المراجعة'), [plan.support, plan.review].filter(Boolean).join(' / '));
      groupShortRecord(planStart);
    }
    heading('Recommendations and follow-up', 'التوصيات والمتابعة');
    M.suggestedActions(s, data, lang).forEach(value => paragraph(tr('Suggested follow-up', 'متابعة مقترحة'), value));
    paragraph(tr('Assessor recommendations / placement decision', 'توصيات الفاحص / قرار البيئة التعليمية'), s.recommendations);
    paragraph(tr('Planning note', 'ملاحظة التخطيط'), tr('Priorities and goals are based on recorded results and require assessor / team review.', 'تستند الأولويات والأهداف إلى النتائج المسجلة وتحتاج إلى مراجعة الفاحص / الفريق.'));
    for (const type of types) {
      heading(`${typeNames[type][0]} - item results`, `${typeNames[type][1]} - نتائج البنود`);
      for (const item of M.records(data, type)) {
        const scored = M.hasScore(s, type, item), pending = M.own(s.scores[type], item.id) && !scored, comment = s.comments[item.id];
        const previousRecorded=old&&M.own(old.scores[type],item.id);
        if (!scored && !pending && !previousRecorded && !comment && !s.includeUnassessed) continue;
        const itemStart=blocks.length;
        const value = scored ? s.scores[type][item.id] : null;
        const name = type === 'milestones' ? `${label(data, item.category, lang)} ${item.milestone}` : item.id;
        const status = pending ? tr('Previous result requires review', 'نتيجة سابقة تحتاج إلى مراجعة') : type === 'milestones' ? scoreName(value, lang) : value === null ? tr('Not assessed', 'غير مقيم') : type === 'tasks' ? value === 1 ? tr('Demonstrated', 'متحقق') : tr('Not demonstrated', 'غير متحقق') : String(value);
        const previousLine = previousRecorded ? {title:tr('Previous result / date','النتيجة السابقة / التاريخ'),value:`${old.scores[type][item.id]} / ${old.date}${!M.hasScore(old,type,item)?' ! '+tr('Re-scoring required','تحتاج إلى إعادة التسجيل'):''}`} : null;
        paragraph(`${name} - ${status} [${item.id}]`, M.itemText(item, s, lang), previousLine);
        if (pending) paragraph(tr('Preserved previous score - excluded', 'الدرجة السابقة المحفوظة - مستبعدة'), String(s.scores[type][item.id]));
        if (pending && item.original) paragraph(tr('Previous task wording', 'صياغة المهمة السابقة'), item.original.text?.[lang] || item.original.name?.[lang]);
        if (M.needsCriteria(item) && s.customCriteria[item.id]) paragraph(`${tr('Assessor-entered criterion', 'معيار أدخله الفاحص')} [${item.id}]`, s.customCriteria[item.id].scoring);
        if (type !== 'milestones' && pending && data.contentReview[item.id]) paragraph(tr('Scoring note', 'ملاحظة التسجيل'), data.contentReview[item.id][lang]);
        if (comment) paragraph(`${tr('Response, prompts and evidence', 'الاستجابة والتلميحات والأدلة')} [${item.id}]`, comment);
        groupShortRecord(itemStart);
      }
    }
    if (types.includes('eesa')) paragraph(tr('Echoic stimulus language', 'لغة مثيرات التقليد الصوتي'), tr('The original English stimuli and supplied Arabic equivalents are retained. A translation changes sound and syllable patterns; record the administered language and interpret using the appropriate scoring guide.', 'احتُفظ بالمثيرات الإنجليزية الأصلية والمقابلات العربية المرفقة. تغيّر الترجمة أنماط الأصوات والمقاطع؛ سجّل لغة التطبيق وفسّر النتائج وفق دليل التصحيح المناسب.'));
    add(`<footer class="report-footer">SPEECH AND LANGUAGE PATHOLOGY · Ahmad Ghanem<br>${tr('Latakia - Syria', 'اللاذقية - سوريا')}<br><span dir="ltr">slp.ahmadghanem@gmail.com · +963 988 451 245</span></footer>`, 'SPEECH AND LANGUAGE PATHOLOGY · Ahmad Ghanem · Latakia - Syria\nslp.ahmadghanem@gmail.com · +963 988 451 245');
    return { blocks, html: blocks.map(b => b.html).join(''), text: blocks.map(b => b.text).join('\n\n') };
  }
  root.VBReport = { esc, label, grid, legend, make, levelStyle, levelColors };
})(window);
