(function () {
  'use strict';
  const D = window.VB_DATA, M = window.VBModel, R = window.VBReport, esc = R.esc;
  const KEY = 'vb-mapp-workspace-v2', RECOVERY = 'vb-mapp-workspace-before-import', $ = id => document.getElementById(id);
  const ui = { page: 'case', level: 1, category: 'all', view: 'grid', filter:'all', search: '', group: 1, activeItem: null, imageId: '', imageIndex: 0 };
  let s = M.blank(), saveTimer, focusBefore = new Map(), loadMessage = '', pendingImport = null, importing = false, recoveryAvailable = false;
  const tr = (en, ar) => s.lang === 'ar' ? ar : en;
  const text = pair => pair ? (pair[s.lang] || pair.en || pair.ar || '').replace(/إكلينيكي/g, 'سريري').replace(/التنسيق التعليمي/g, 'التخطيط التعليمي').replace(/للأطباء/g, 'للفاحصين') : '';
  const typeNames = { milestones: ['Milestones', 'المعالم النمائية'], eesa: ['EESA', 'التقليد الصوتي المبكر'], barriers: ['Barriers', 'العوائق'], transitions: ['Transition', 'الانتقال'], tasks: ['Supporting skills', 'المهارات الداعمة'] };
  const getList = type => M.records(D, type);
  const getItem = (type, id) => getList(type).find(i => i.id === id);
  function read(key) { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
  try {
    const stored = read(KEY);
    if (stored) s = M.normalize(stored);
    else {
      const child = read('vb-mapp-child-info'), session = read('vb-mapp-session');
      if (child || session) s = M.migrate(child, session, localStorage.getItem('vb-mapp-notes'));
    }
  } catch (error) { loadMessage = 'load-error'; }
  try { recoveryAvailable = Boolean(localStorage.getItem(RECOVERY)); } catch (_) {}
  function save() {
    clearTimeout(saveTimer);
    try { localStorage.setItem(KEY, JSON.stringify(s)); $('saveStatus').textContent = tr('Saved on this device', 'محفوظ على هذا الجهاز'); }
    catch (error) { $('saveStatus').textContent = tr('Could not save. Export the assessment data to keep a copy.', 'تعذر الحفظ. صدّر بيانات التقييم للاحتفاظ بنسخة.'); }
  }
  function delayedSave() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 250); }
  function status(message) { $('appStatus').textContent = message; }
  function translateShell() {
    document.documentElement.lang = s.lang; document.documentElement.dir = s.lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach(node => node.textContent = node.dataset[s.lang]);
    $('language').textContent = s.lang === 'ar' ? 'English' : 'العربية';
    $('language').setAttribute('aria-label', tr('Switch to Arabic', 'التبديل إلى الإنجليزية'));
    $('navigation').setAttribute('aria-label', tr('Assessment sections', 'أقسام التقييم'));
    document.title = 'VB-MAPP · ' + tr('Ahmad Ghanem', 'أحمد غانم');
    $('caseBadge').textContent = [s.child.name, s.date].filter(Boolean).join(' · ');
  }
  function heading(en, ar, description = '') { return `<div class="page-intro"><h2>${tr(en, ar)}</h2>${description ? `<p class="muted">${description}</p>` : ''}</div>`; }
  function field(key, en, ar, value, kind = 'text', binding = 'child', wide = false) {
    const id = `${binding}-${key}`;
    return `<div class="${wide ? 'wide' : ''}"><label for="${id}">${tr(en, ar)}</label>${kind === 'textarea' ? `<textarea id="${id}" data-bind="${binding}" data-key="${key}" dir="auto">${esc(value)}</textarea>` : `<input id="${id}" data-bind="${binding}" data-key="${key}" type="${kind}" value="${esc(value)}" ${kind === 'text' ? 'maxlength="300"' : ''}>`}</div>`;
  }
  function content(value) {
    if (!value) return '';
    if (Array.isArray(value)) return `<ul>${value.map(v => `<li>${content(v)}</li>`).join('')}</ul>`;
    if (typeof value !== 'object') return esc(value);
    if (value.en || value.ar) return `<p>${value.score !== undefined ? `<strong dir="ltr">${esc(value.score)}: </strong>` : ''}${esc(text(value))}</p>`;
    const titles = { objective: ['Objective', 'الهدف'], application: ['Administration', 'طريقة التطبيق'], description: ['Description', 'الوصف'], scoring: ['Scoring criteria', 'معايير التسجيل'], title: ['Title', 'العنوان'], content: ['Guidance', 'الإرشادات'], points: ['Points', 'النقاط'], low: ['Lower scores', 'الدرجات المنخفضة'], high: ['Higher scores', 'الدرجات المرتفعة'], categories: ['Categories', 'الفئات'] };
    return Object.entries(value).map(([key, v]) => `<div>${titles[key] ? `<h4>${tr(...titles[key])}</h4>` : ''}${content(v)}</div>`).join('');
  }
  function scopeSummary(type) {
    const st = M.stats(s, getList(type), type), old=M.previous(s);
    return `<span data-score-summary="${type}">${old ? tr('Current recorded score','مجموع الدرجات الحالية') : tr('Recorded score', 'مجموع الدرجات المسجلة')}: <b dir="ltr">${st.assessed ? st.score : '-'}</b> · ${tr('Assessed', 'مقيم')}: <b dir="ltr">${st.assessed}/${st.total}</b>${old ? ` · ${tr('Previously assessed','مقيم سابقاً')}: ${M.stats(old,getList(type),type).assessed}/${st.total}` : ''}${st.pending ? ` · ${tr('Results needing review', 'نتائج تحتاج إلى مراجعة')}: ${st.pending}` : ''}</span>`;
  }
  function scoreControls(type, item) {
    let values = M.allowed[type];
    if ((type === 'milestones' && !M.halfAllowed(item)) || (type === 'eesa' && item.group === 5)) values = values.filter(v => v !== .5);
    return `<div class="score-controls" role="group" aria-label="${esc(tr('Score', 'الدرجة') + ' ' + item.id)}">${values.map(v => `<button type="button" data-score="${v}" data-type="${type}" data-id="${item.id}" aria-pressed="${M.hasScore(s, type, item) && s.scores[type][item.id] === v}" ${!M.eligible(item, s) ? 'disabled' : ''}>${v}</button>`).join('')}<button type="button" class="score-clear" data-clear-score="${item.id}" data-type="${type}">${tr('Clear / not assessed', 'إلغاء / غير مقيم')}</button></div>`;
  }
  function noteField(item) { return `<details><summary>${tr('Response, prompts and evidence', 'الاستجابة والتلميحات والأدلة')}</summary><label class="sr-only" for="note-${item.id}">${tr('Item note', 'ملاحظة البند')}</label><textarea class="compact" id="note-${item.id}" data-bind="comment" data-key="${item.id}" dir="auto">${esc(s.comments[item.id] || '')}</textarea></details>`; }
  function stimulusButton(item) { return window.VB_STIMULI[item.id] && !window.VB_STIMULI[item.id].assessorOnly ? `<button type="button" data-stimulus="${item.id}">${tr('Show child image', 'عرض صورة للطفل')}</button>` : ''; }
  function pendingResult(type, item) {
    return M.own(s.scores[type], item.id) && !M.hasScore(s, type, item) ? `<p class="review-note" data-pending-score="${item.id}">${tr('Previous recorded result', 'النتيجة المسجلة سابقاً')}: <b dir="ltr">${s.scores[type][item.id]}</b>. ${tr('Preserved for review; excluded from scores and current goals until re-scored under valid criteria.', 'محفوظة للمراجعة؛ لا تدخل في الدرجات والأهداف الحالية حتى إعادة التسجيل وفق معايير صالحة.')}</p>` : '';
  }
  function earlierResult(type, item) {
    const old = M.previous(s); if (!old) return '';
    const c = M.comparison(s, type, item), raw = old.scores[type][item.id];
    const criterion=old.customCriteria[item.id], plan=old.goals[item.id];
    const previousCriterion=criterion ? `<details><summary>${tr('Previous task and criterion','المهمة والمعيار السابقان')}</summary><p dir="auto">${esc(criterion.text)}</p><p dir="auto">${esc(criterion.scoring)}</p></details>` : '';
    const previousPlan=plan?.selected ? `<details><summary>${tr('Previous goal plan','خطة الهدف السابقة')}</summary><p dir="auto"><strong>${tr('Goal','الهدف')}:</strong> ${esc(plan.goal)}</p><p dir="auto"><strong>${tr('Criterion','المعيار')}:</strong> ${esc(plan.criterion)}</p>${plan.support ? `<p dir="auto">${esc(plan.support)}</p>` : ''}${plan.review ? `<p><strong>${tr('Review date','تاريخ المراجعة')}:</strong> <bdi>${esc(plan.review)}</bdi></p>` : ''}</details>` : '';
    return `<div class="previous-result"><strong>${tr('Previous assessment', 'التقييم السابق')} <span dir="ltr">${esc(old.date)}</span>:</strong> <span dir="ltr">${M.own(old.scores[type], item.id) ? raw : '-'}</span>${raw !== undefined && c.before === null ? ` · ${tr('Re-scoring required', 'تحتاج إلى إعادة التسجيل')}` : ''}<p class="muted">${tr('Record a score for this visit after testing the child again. Previous results remain saved.', 'سجّل درجة لهذه الزيارة بعد إعادة تقييم الطفل. تبقى النتائج السابقة محفوظة.')}</p>${old.comments[item.id] ? `<details><summary>${tr('Previous response note', 'ملاحظة الاستجابة السابقة')}</summary><p dir="auto">${esc(old.comments[item.id])}</p></details>` : ''}${previousCriterion}${previousPlan}</div>`;
  }
  function workflowPanel() {
    const old = M.previous(s);
    return `<section class="panel followup-panel"><h3>${tr('Follow-up with the same child', 'متابعة الطفل نفسه')}</h3><label class="report-drop" data-report-drop for="previousReport"><strong>${tr('Drop a previous PDF here, or choose a file', 'أفلت تقرير PDF سابقاً هنا أو اختر ملفاً')}</strong><span>${tr('Import the child details and previous marks, then record a new assessment. Editable JSON is also supported.', 'استورد بيانات الطفل والدرجات السابقة، ثم سجّل تقييماً جديداً. يمكن أيضاً استخدام ملف JSON القابل للتعديل.')}</span><input id="previousReport" type="file" accept="application/pdf,.pdf,application/json,.json"></label><div class="toolbar"><button type="button" data-followup-current>${tr('Start next assessment from this case', 'بدء التقييم التالي من هذه الحالة')}</button>${recoveryAvailable ? `<button type="button" data-restore-workspace>${tr('Restore workspace before import', 'استعادة الحالة التي سبقت الاستيراد')}</button>` : ''}</div>${old ? `<p><strong>${tr('Previous assessment', 'التقييم السابق')}:</strong> <span dir="ltr">${esc(old.date)}</span> · ${tr('Assessment', 'التقييم')} ${esc(old.number)}${s.importSource ? ` · <bdi>${esc(s.importSource)}</bdi>` : ''}</p><p class="muted">${tr('Previous marks are visible in the grid. Only newly recorded scores count toward the current assessment.', 'تظهر الدرجات السابقة في الجدول. تدخل الدرجات المسجلة من جديد فقط في التقييم الحالي.')}</p>` : ''}${s.history.length ? `<details><summary>${tr('Previous visits and observations', 'الزيارات والملاحظات السابقة')} (${s.history.length})</summary>${s.history.map(record => `<div class="history-record"><h4>${esc(record.date)} · ${tr('Assessment', 'التقييم')} ${esc(record.number)}</h4><p>${tr('Milestones assessed', 'المعالم المقيمة')}: ${M.stats(record, getList('milestones'), 'milestones').assessed}/170</p><p dir="auto">${esc(record.clinical || tr('No observation summary recorded.', 'لم يُسجل ملخص للملاحظات.'))}</p>${record.recommendations ? `<p dir="auto">${esc(record.recommendations)}</p>` : ''}</div>`).join('')}</details>` : ''}</section>`;
  }
  function taskList() {
    const old = M.previous(s);
    return M.allMilestones(D).filter(i => i.level === ui.level && (ui.category === 'all' || i.category === ui.category) && (!ui.search || (M.itemText(i, s, s.lang) + ' ' + i.id).toLowerCase().includes(ui.search.toLowerCase())) &&
      (!old || ui.filter === 'all' || (ui.filter === 'previous' && M.own(old.scores.milestones,i.id)) || (ui.filter === 'new' && !M.own(old.scores.milestones,i.id)) || (ui.filter === 'retest' && M.own(old.scores.milestones,i.id) && !M.hasScore(s,'milestones',i))));
  }
  function milestoneGuidance(item, inDialog) {
    const guide = M.taskGuidance(item);
    const sections = [['objective','Objective','الهدف'],['application','Administration','طريقة التطبيق'],['scoring','Scoring criteria','معايير التسجيل']];
    const original = item.original ? `<details data-original-guidance="${item.id}"><summary>${tr('Original wording', 'الصياغة الأصلية')}</summary><div class="reference-text">${content(item.original.text)}${sections.map(([key,en,ar]) => `<section data-source-field="${key}"><h4>${tr(en,ar)}</h4>${content(item.original[key])}</section>`).join('')}</div></details>` : '';
    return `<details class="milestone-guidance" data-guidance-item="${item.id}" data-guidance-source="${item.guide ? 'task' : 'supplied'}" ${inDialog || M.needsCriteria(item) ? 'open' : ''}><summary>${tr('Objective, administration and scoring criteria', 'الهدف وطريقة التطبيق ومعايير التسجيل')}</summary><div class="reference-text">${sections.map(([key,en,ar]) => `<section data-guidance-field="${key}"><h4>${tr(en,ar)}</h4>${content(guide[key])}</section>`).join('')}</div></details>${original}`;
  }
  function card(type, item, inDialog = false) {
    const title = type === 'milestones' ? `${R.label(D, item.category, s.lang)} ${item.milestone}` : type === 'eesa' ? `${tr('Item', 'البند')} ${item.id.split('-').pop()}` : type === 'tasks' ? item.milestoneId : '';
    const review = D.contentReview[item.id];
    const guidance = type === 'barriers' ? D.barrierGuidance[item.id] || (item.id === 'bar-1' ? D.transitionGuidance.negative : item.id === 'bar-2' ? D.transitionGuidance.instructional : null) : type === 'transitions' ? { objective: item.objective, application: item.application, scoring: item.scoring } : null;
    const milestoneSource = type === 'milestones' ? milestoneGuidance(item, inDialog) : '';
    const criterion = M.needsCriteria(item) ? `<section class="scoring-setup" data-scoring-setup="${item.id}">${field(item.id, 'Item description', 'وصف البند', s.customCriteria[item.id]?.text || (item.requiresCriteria || item.guide ? M.itemText(item, s, s.lang) : ''), 'textarea', 'criterionText')}${field(item.id, 'Full / half-point conditions from the assessment guide', 'شروط النقطة الكاملة / نصف النقطة من دليل التقييم', s.customCriteria[item.id]?.scoring || '', 'textarea', 'criterionScoring')}</section>` : '';
    const previous = pendingResult(type, item);
    const original = item.original && type !== 'milestones' ? `<details><summary>${tr('Original wording before review', 'الصياغة الأصلية قبل المراجعة')}</summary><div class="reference-text">${content(item.original.text || item.original.name)}${content({ objective:item.original.objective, application:item.original.application, scoring:item.original.scoring })}</div></details>` : '';
    const stimulus = window.VB_STIMULI[item.id];
    return `<article class="assessment-card${type === 'milestones' ? ' milestone-card level-' + item.level : ''}" data-card-id="${item.id}" ${type === 'milestones' ? `style="${R.levelStyle(item.level)}"` : ''}><div class="card-title"><div><span class="item-code">${item.id}</span>${title ? `<h3>${esc(title)}</h3>` : ''}</div></div>
      ${type === 'milestones' && item.original ? `<p class="muted">${tr('Current task', 'المهمة الحالية')}</p>` : ''}<p class="${type === 'eesa' ? 'eesa-stimulus' : 'card-text'}" dir="auto">${esc(M.itemText(item, s, s.lang))}</p>${type === 'eesa' ? `<p class="muted" dir="ltr">${esc(item.text.en)}</p>` : ''}${M.needsCriteria(item) ? milestoneSource : ''}${criterion}
      ${type !== 'milestones' && review && !M.hasScore(s, type, item) ? `<p class="review-note">${esc(review[s.lang])}</p>` : ''}
      ${earlierResult(type, item)}${previous}${scoreControls(type, item)}<p class="score-label">${tr('Blank means not assessed; zero is a recorded result.', 'الفراغ يعني غير مقيم؛ الصفر نتيجة مسجلة.')}</p>
      ${stimulus ? `<div class="toolbar">${stimulusButton(item)}</div><details><summary>${tr('Stimulus preparation', 'تجهيز المثير')}</summary><p>${esc(stimulus.originalTask && !['li2-6'].includes(item.id) ? tr('Prepare images or materials for the current task using the arrays and trials specified in your guide.', 'جهّز الصور أو المواد للمهمة الحالية وفق المصفوفات والمحاولات المحددة في دليلك.') : stimulus.instruction[s.lang])}</p></details>` : ''}
      ${!M.needsCriteria(item) ? milestoneSource : ''}${guidance ? `<details ${inDialog ? 'open' : ''}><summary>${tr('Objective, administration and criteria', 'الهدف وطريقة التطبيق والمعايير')}</summary><div class="reference-text">${content(guidance)}</div></details>` : ''}${original}${noteField(item)}</article>`;
  }
  function casePage() {
    return heading('Case and assessment', 'بيانات الحالة والتقييم', tr('Complete only the assessment sections you need. Scores, notes and planning are saved on this device.', 'يمكنك إكمال القسم الذي تحتاجه فقط. تُحفظ الدرجات والملاحظات والتخطيط على هذا الجهاز.')) +
      workflowPanel() +
      (loadMessage ? `<div class="notice">${tr('Saved data could not be read. The original storage was not deleted. Import a saved assessment file or begin a new case.', 'تعذر قراءة البيانات المحفوظة. لم تُحذف البيانات الأصلية. استورد ملف تقييم محفوظاً أو ابدأ حالة جديدة.')}</div>` : '') +
      (s.migration ? `<div class="notice">${tr('Review imported results against your observations before using them.', 'راجع النتائج المستوردة وفق ملاحظاتك قبل اعتمادها.')}</div>` : '') +
      `<section class="panel"><div class="form-grid">${field('name', 'Child name', 'اسم الطفل', s.child.name)}${field('dob', 'Date of birth', 'تاريخ الميلاد', s.child.dob, 'date')}${field('tester', 'Assessor', 'الفاحص', s.child.tester)}${field('guardian', 'Parent / caregiver', 'ولي الأمر / مقدم الرعاية', s.child.guardian)}${field('date', 'Assessment date', 'تاريخ التقييم', s.date, 'date', 'state')}${field('number', 'Assessment number', 'رقم التقييم', s.number, 'text', 'state')}${field('language', 'Language / dialect and communication modes', 'اللغة / اللهجة ووسائل التواصل', s.child.language)}${field('setting', 'Setting and information sources', 'البيئة ومصادر المعلومات', s.child.setting)}${field('reason', 'Reason for assessment', 'سبب التقييم', s.child.reason, 'textarea', 'child')}${field('relevant', 'Relevant background and supports', 'الخلفية ذات الصلة والدعم المستخدم', s.child.relevant, 'textarea', 'child')}</div></section>` +
      `<div class="stats-row">${Object.keys(typeNames).map(type => `<div class="stat"><p>${tr(...typeNames[type])}</p>${scopeSummary(type)}</div>`).join('')}</div><section class="panel"><h3>${tr('Assessment files', 'ملفات التقييم')}</h3><div class="toolbar"><button type="button" data-export-data>${tr('Export editable assessment', 'تصدير بيانات تقييم قابلة للتعديل')}</button><label for="importFile">${tr('Import assessment file', 'استيراد ملف تقييم')}</label><input id="importFile" type="file" accept="application/json,.json"><button type="button" data-new-case class="danger">${tr('Start new case', 'بدء حالة جديدة')}</button></div><p class="muted">${tr('Export before moving to another device. Only this assessment’s data is cleared when starting a new case.', 'صدّر البيانات قبل الانتقال إلى جهاز آخر. بدء حالة جديدة يمسح بيانات هذا التقييم فقط.')}</p></section>`;
  }
  function milestonePage() {
    const list = taskList(), old = M.previous(s);
    return heading('Milestones', 'المعالم النمائية', tr('Tap a grid box to open its task, criteria, image and scoring. Only record scores for items actually assessed.', 'المس خانة في الجدول لفتح البند ومعاييره وصورته وخيارات التسجيل. سجّل درجات البنود التي قيّمتها فعلاً فقط.')) +
      (old ? `<div class="followup-banner"><p><strong>${tr('Previous', 'السابق')}: ${esc(old.date)} · ${tr('Current', 'الحالي')}: ${esc(s.date)}</strong></p><p>${tr('Earlier marks remain in the boxes as a reference. Tap a box to record a new result, including zero if the child no longer meets the criterion.', 'تبقى الدرجات السابقة في الخانات مرجعاً. المس الخانة لتسجيل نتيجة جديدة، بما فيها الصفر إذا لم يعد الطفل يحقق المعيار.')}</p><div class="section-tabs">${[['all','All tasks','كل البنود'],['previous','Previously scored','مقيم سابقاً'],['retest','Awaiting retest','بانتظار إعادة التقييم'],['new','New / previously unassessed','جديد / غير مقيم سابقاً']].map(([key,en,ar]) => `<button type="button" data-task-filter="${key}" aria-pressed="${ui.filter === key}">${tr(en,ar)}</button>`).join('')}</div></div>` : '') +
      `<div class="toolbar">${scopeSummary('milestones')}<button type="button" data-view="grid" aria-pressed="${ui.view === 'grid'}">${tr('Grid', 'جدول')}</button><button type="button" data-view="cards" aria-pressed="${ui.view === 'cards'}">${tr('Tasks', 'بنود')}</button></div>` +
      (ui.view === 'grid' ? `<div class="panel screen-grid"><p class="muted">${tr('On narrow screens, swipe each table horizontally to see all domains.', 'على الشاشات الضيقة، اسحب كل جدول أفقياً لرؤية جميع المجالات.')}</p>${R.legend(s.lang)}${old ? `<p class="comparison-key">${tr('Large mark = current score; P = previous score. A dot means not yet re-tested. ! means the previous criterion needs review.', 'العلامة الكبيرة = الدرجة الحالية؛ P = الدرجة السابقة. النقطة تعني عدم إعادة التقييم بعد. ! تعني أن المعيار السابق يحتاج إلى مراجعة.')}</p>` : ''}${R.grid(s, D, s.lang, true).join('')}</div>` : `<div class="section-tabs">${[1,2,3].map(level => `<button type="button" class="level-tab" style="${R.levelStyle(level)}" data-level="${level}" aria-pressed="${ui.level === level}">${tr('Level', 'المستوى')} ${level}</button>`).join('')}</div><div class="section-tabs"><button type="button" data-category="all" aria-pressed="${ui.category === 'all'}">${tr('All domains', 'كل المجالات')}</button>${D.categories.map(cat => `<button type="button" data-category="${cat}" aria-pressed="${ui.category === cat}">${esc(R.label(D, cat, s.lang))}</button>`).join('')}</div><label for="taskSearch">${tr('Search tasks', 'البحث في البنود')}</label><input id="taskSearch" type="search" value="${esc(ui.search)}"><div class="cards-grid" id="taskCards">${list.map(item => card('milestones', item)).join('') || `<p>${tr('No matching items.', 'لا توجد بنود مطابقة.')}</p>`}</div>`);
  }
  function otherPage(type) {
    const intro = type === 'eesa' ? tr('Select a group, present each stimulus and record the response.', 'اختر المجموعة، وقدّم كل مثير ثم سجّل الاستجابة.') : type === 'barriers' ? text(D.barrierGeneric.description) : type === 'transitions' ? text(D.transitionCategories.description) : tr('Record the supporting skills you assessed.', 'سجّل المهارات الداعمة التي قيّمتها.');
    let list = getList(type);
    const filter = type === 'eesa' ? `<div class="section-tabs">${[1,2,3,4,5].map(group => `<button type="button" data-group="${group}" aria-pressed="${ui.group === group}">${tr('Group', 'المجموعة')} ${group}</button>`).join('')}</div>` : '';
    if (type === 'eesa') list = list.filter(i => i.group === ui.group);
    const guidance = type === 'barriers' ? `<details class="panel"><summary>${tr('General scoring guidance', 'إرشادات التسجيل العامة')}</summary>${content(D.barrierGeneric.scoring)}</details>` : type === 'transitions' ? `<p class="notice">${tr('Rate each transition area using its assessment criteria.', 'قيّم كل مجال من مجالات الانتقال وفق معاييره.')}</p>` : type === 'eesa' ? `<section class="panel"><h3>${tr('Scoring guidance', 'إرشادات التسجيل')}</h3>${content(D.eesaScoringGuidance.common)}${content(D.eesaScoringGuidance[ui.group <= 3 ? 1 : ui.group])}</section>` : '';
    return heading(...typeNames[type], intro) + `<div class="toolbar">${scopeSummary(type)}</div>${guidance}${filter}${type === 'eesa' ? `<h3>${esc(text(D.eesaGroups[ui.group]))}</h3><p class="muted">${tr('Group recorded score', 'مجموع المجموعة المسجل')}: ${M.stats(s, list, type).score}</p>` : ''}<div class="cards-grid ${type === 'eesa' ? 'eesa-grid' : ''}">${list.map(item => card(type, item)).join('')}</div>`;
  }
  function referencePage() {
    return heading('Assessment reference', 'مرجع التقييم') +
      `<section class="panel"><h3>${tr('Planning and IEP goals', 'التخطيط وأهداف الخطة التربوية الفردية')}</h3>${D.reference.map(entry => `<details><summary>${entry.step}. ${esc(text(entry.title))}</summary>${content(entry.content)}${content(entry.points)}</details>`).join('')}</section>` +
      `<details class="panel"><summary>${tr('Developmental levels', 'المستويات النمائية')}</summary>${content(D.levelDescriptions)}</details>` +
      `<details class="panel"><summary>${tr('Goal examples', 'أمثلة الأهداف')}</summary>${content(Object.values(D.goals))}</details>` +
      `<details class="panel"><summary>${tr('Transition and behavior', 'الانتقال والسلوك')}</summary>${content(D.transitionCategories)}${content(D.transitionGuidance)}</details>` +
      `<details class="panel"><summary>${tr('Additional reference notes', 'ملاحظات مرجعية إضافية')}</summary><p class="muted">${tr('Reference examples; individual recommendations are based on the current assessment.', 'أمثلة مرجعية؛ تُبنى التوصيات الفردية على التقييم الحالي.')}</p>${D.additionalGuidance.map(pair => `<details><summary>${esc(text(pair).slice(0, 100))}…</summary>${content(pair)}</details>`).join('')}</details>` +
      `<details class="panel"><summary>${tr('Assessment resources', 'مصادر التقييم')}</summary><ul>${['publisher','scoring','eesa'].map(key=>D.reviewAudit.sources[key]).map(source=>`<li><a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.title)}</a></li>`).join('')}</ul></details>`;
  }
  function goalCards() {
    if (!s.reportScope.milestones) return '';
    const targets = M.goals(s, D);
    for (const [id, plan] of Object.entries(s.goals)) {
      if (!plan.selected || targets.some(target => target.item.id === id)) continue;
      const item = getItem('milestones', id);
      if (item) targets.push({ item, baseline: M.hasScore(s, 'milestones', item) ? s.scores.milestones[id] : null, historical: true });
    }
    return targets.map(({ item, baseline, nextProbe, historical }) => {
      if (nextProbe && !s.goals[item.id]?.selected) return `<div class="panel"><p>${tr('Next assessment probe', 'مقترح للفحص التالي')}: ${esc(R.label(D, item.category, s.lang))} ${item.milestone} - ${esc(M.itemText(item, s, s.lang))}</p></div>`;
      const plan = s.goals[item.id] || {};
      const needsReview = plan.selected && !M.currentPlan(s, item, plan);
      return `<div class="panel goal-card"><label><input type="checkbox" data-goal-selected="${item.id}" ${plan.selected ? 'checked' : ''}> ${tr('Include this goal in the report', 'تضمين هذا الهدف في التقرير')}</label><h3>${esc(R.label(D, item.category, s.lang))} ${item.milestone} <span dir="ltr">(${baseline === null ? '-' : baseline})</span></h3><p>${esc(M.itemText(item, s, s.lang))}</p>${needsReview || historical ? `<p class="review-note">${tr('Previously selected plan. Recheck the task, baseline and goal criterion; until reviewed it is reported as a historical plan.', 'خطة مختارة سابقاً. راجع البند وخط الأساس ومعيار الهدف؛ تُعرض الخطة السابقة التي تحتاج إلى مراجعة بوصفها خطة سابقة.')}</p>` : ''}<div class="form-grid">${field(item.id, 'Draft goal', 'الهدف المقترح', plan.goal || '', 'textarea', 'goalText')}${field(item.id, 'Measurement / mastery criterion', 'معيار القياس / الإتقان', plan.criterion || '', 'textarea', 'goalCriterion')}${field(item.id, 'Support and generalization plan', 'خطة الدعم والتعميم', plan.support || '', 'textarea', 'goalSupport')}${field(item.id, 'Review date', 'تاريخ المراجعة', plan.review || '', 'date', 'goalReview')}</div>${M.needsCriteria(item) ? `<label><input type="checkbox" data-goal-reviewed="${item.id}" ${M.currentPlan(s, item, plan) ? 'checked' : ''} ${!M.hasScore(s, 'milestones', item) ? 'disabled' : ''}> ${tr('I reviewed this goal against the current task and scoring criterion', 'راجعت هذا الهدف وفق البند ومعيار التسجيل الحاليين')}</label>` : ''}</div>`;
    }).join('');
  }
  function reportPage() {
    return heading('Report and planning', 'التقرير والتخطيط', tr('Choose the sections you want to report. A single assessment section is enough. English and Arabic reports use the same recorded scores.', 'اختر الأقسام التي تريد تضمينها. يكفي قسم واحد من التقييم. يستخدم التقريران العربي والإنجليزي الدرجات المسجلة نفسها.')) +
      `<section class="panel"><div class="toolbar"><button type="button" data-report-lang="ar" aria-pressed="${s.reportLang === 'ar'}">العربية</button><button type="button" data-report-lang="en" aria-pressed="${s.reportLang === 'en'}">English</button><button id="pdfExport" type="button" data-pdf class="primary">${tr('Download PDF', 'تنزيل PDF')}</button><button type="button" data-print>${tr('Print', 'طباعة')}</button><button type="button" data-text-report>${tr('Download text', 'تنزيل النص')}</button></div><div class="scope-controls">${Object.keys(typeNames).map(type => `<label><input type="checkbox" data-scope="${type}" ${s.reportScope[type] ? 'checked' : ''}> ${tr(...typeNames[type])}</label>`).join('')}</div><label><input type="checkbox" id="includeUnassessed" ${s.includeUnassessed ? 'checked' : ''}> ${tr('Include unassessed item details', 'تضمين تفاصيل البنود غير المقيمة')}</label></section>` +
      `<p class="muted">${tr('Download PDF to keep the report ready for your next follow-up.', 'نزّل التقرير باستخدام زر تنزيل PDF لتتمكن من استيراده في المتابعة القادمة.')}</p><section class="panel">${field('clinical', 'Clinical observations and summary', 'الملاحظات السريرية والملخص', s.clinical, 'textarea', 'state')}${field('recommendations', 'Assessor recommendations / placement decision', 'توصيات الفاحص / قرار البيئة التعليمية', s.recommendations, 'textarea', 'state')}</section><details><summary>${tr('Review suggested priorities and edit goals', 'مراجعة الأولويات المقترحة وتعديل الأهداف')}</summary><div id="goalCards">${goalCards() || `<p>${tr('Record assessed milestone gaps to propose goals.', 'سجّل صعوبات المعالم المقيمة لاقتراح أهداف.')}</p>`}</div></details><section id="reportPreview" class="report-document" lang="${s.reportLang}" dir="${s.reportLang === 'ar' ? 'rtl' : 'ltr'}">${R.make(s, D).html}</section>`;
  }
  function render() {
    translateShell();
    const pages = { case: ['Case', 'الحالة'], milestones: typeNames.milestones, eesa: typeNames.eesa, barriers: typeNames.barriers, transitions: typeNames.transitions, tasks: typeNames.tasks, reference: ['Reference', 'المرجع'], report: ['Report', 'التقرير'] };
    $('navigation').innerHTML = Object.entries(pages).map(([page, names]) => `<button type="button" data-page="${page}" ${ui.page === page ? 'aria-current="page"' : ''}>${tr(...names)}</button>`).join('');
    $('main').innerHTML = ui.page === 'case' ? casePage() : ui.page === 'milestones' ? milestonePage() : ui.page === 'report' ? reportPage() : ui.page === 'reference' ? referencePage() : otherPage(ui.page);
  }
  function updatePreview() { if ($('reportPreview')) { $('reportPreview').innerHTML = R.make(s, D).html; $('reportPreview').dir = s.reportLang === 'ar' ? 'rtl' : 'ltr'; $('reportPreview').lang = s.reportLang; } }
  function openDialog(id) {
    const dialog = $(id); if (!dialog.open) focusBefore.set(id, { node: document.activeElement, itemId: document.activeElement?.dataset.edit });
    if (typeof dialog.showModal === 'function') { if (!dialog.open) dialog.showModal(); }
    else { dialog.setAttribute('open', ''); dialog.classList.add('fallback'); dialog.setAttribute('aria-modal', 'true'); }
    document.body.classList.add('modal-open'); dialog.querySelector('button,input,textarea')?.focus();
  }
  function closeDialog(id) {
    const dialog = $(id); if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
    const previous = focusBefore.get(id); if (previous?.node.isConnected && !previous.node.closest('dialog:not([open])')) previous.node.focus(); else if (previous?.itemId) document.querySelector(`[data-edit="${previous.itemId}"]`)?.focus();
    if(id==='itemDialog')$('itemBody').replaceChildren();
    if(id==='importDialog'){$('importBody').replaceChildren();pendingImport=null;}
  }
  function editItem(id) {
    const item = getItem('milestones', id); if (!item) return;
    ui.activeItem = id; $('itemTitle').textContent = `${R.label(D, item.category, s.lang)} ${item.milestone}`;
    $('itemBody').innerHTML = card('milestones', item, true); openDialog('itemDialog');
  }
  function refreshScores(type, id) {
    const item = getItem(type, id);
    document.querySelectorAll(`[data-card-id="${id}"] [data-score]`).forEach(button => { button.disabled = !M.eligible(item, s); button.setAttribute('aria-pressed', String(M.hasScore(s, type, item) && s.scores[type][id] === Number(button.dataset.score))); });
    document.querySelectorAll(`[data-pending-score="${id}"]`).forEach(node => node.remove());
    document.querySelectorAll(`[data-card-id="${id}"] .score-controls`).forEach(node => node.insertAdjacentHTML('beforebegin', pendingResult(type, item)));
    if (ui.page === 'milestones' && ui.view === 'grid') render();
    document.querySelectorAll('[data-score-summary]').forEach(node => { node.outerHTML = scopeSummary(node.dataset.scoreSummary); });
    updatePreview(); save();
  }
  function showImage(id, index = 0) {
    const entry = window.VB_STIMULI[id]; if (!entry?.paths.length || entry.assessorOnly) return;
    ui.imageId = id; ui.imageIndex = index;
    const image = new Image(); image.alt = tr('Assessment stimulus', 'مثير التقييم');
    image.onload = () => {
      $('imageBody').replaceChildren(image); $('stimulusCounter').textContent = entry.paths.length > 1 ? `${index + 1} / ${entry.paths.length}` : '';
      $('imageControls').innerHTML = entry.paths.length > 1 ? `<button type="button" data-image-step="-1" ${index === 0 ? 'disabled' : ''}>${tr('Previous', 'السابق')}</button><button type="button" data-image-step="1" ${index === entry.paths.length - 1 ? 'disabled' : ''}>${tr('Next', 'التالي')}</button>` : '';
      openDialog('imageDialog');
    };
    image.onerror = () => status(tr('The image for this task is not available yet. Prepare the task materials before presenting it.', 'صورة هذا البند غير متوفرة بعد. جهّز مواد المهمة قبل تقديمها للطفل.'));
    image.src = entry.paths[index];
  }
  function filename(suffix) { const name = s.child.name.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').slice(0, 70) || 'Assessment'; return `VB-MAPP-${name}-${s.date || M.today()}-${suffix}`; }
  function download(content, name, mime) {
    const url = URL.createObjectURL(new Blob([content], { type: mime })), link = document.createElement('a');
    link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function preparePrint() { const report = R.make(s, D); $('printArea').innerHTML = report.html; $('printArea').lang = s.reportLang; $('printArea').dir = s.reportLang === 'ar' ? 'rtl' : 'ltr'; }
  function validateDates() {
    const date = s.date, parsed = new Date(date + 'T12:00:00');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(parsed) || parsed.toISOString().slice(0, 10) !== date || (s.child.dob && M.ageOn(s.child.dob, date) === null) || (M.previous(s)?.date && date < M.previous(s).date)) { status(tr('Correct the assessment date and date of birth. A follow-up date cannot precede its previous assessment.', 'صحّح تاريخ التقييم وتاريخ الميلاد. لا يمكن أن يسبق تاريخ المتابعة تاريخ التقييم السابق.')); return false; }
    return true;
  }
  function storeRecovery() {
    if (!s.child.name && !Object.values(s.scores).some(values => Object.keys(values).length) && !s.clinical) return;
    localStorage.setItem(RECOVERY, JSON.stringify(s)); recoveryAvailable = true;
  }
  function applyPrevious(decoded) {
    try { storeRecovery(); } catch (_) { status(tr('The current workspace could not be saved. Export its editable data before importing.', 'تعذر حفظ الحالة الحالية. صدّر بياناتها القابلة للتعديل قبل الاستيراد.')); return false; }
    const language = s.lang;
    s = M.startFollowup(decoded.state, M.today(), decoded.name); s.lang = language;
    ui.page='milestones';ui.view='grid';ui.filter='all';loadMessage='';render();save();
    status(tr('Previous assessment loaded. Child details and earlier marks are ready; record new scores for this visit.', 'حُمّل التقييم السابق. بيانات الطفل والدرجات السابقة جاهزة؛ سجّل درجات جديدة لهذه الزيارة.'));
    return true;
  }
  function showImportReview(decoded) {
    pendingImport=decoded;
    $('importBody').innerHTML=`<p class="notice">${tr('This older PDF has no editable assessment data. Recognized milestone marks were recovered, but child details, dates, notes and other sections need review or manual entry. Check the marks against the original pages before continuing.', 'لا يحتوي هذا التقرير القديم على بيانات تقييم قابلة للاستيراد الكامل. استُعيدت علامات المعالم التي أمكن التعرف عليها، وتحتاج بيانات الطفل والتواريخ والملاحظات والأقسام الأخرى إلى المراجعة أو الإدخال اليدوي. طابق العلامات مع الصفحات الأصلية قبل المتابعة.')}</p><p>${tr('Recovered milestone marks', 'علامات المعالم المستعادة')}: <b>${Object.keys(decoded.state.scores.milestones).length}</b> · <bdi>${esc(decoded.name)}</bdi></p><div class="form-grid">${field('name','Child name from report','اسم الطفل من التقرير',decoded.state.child.name,'text','importChild')}${field('dob','Date of birth','تاريخ الميلاد',decoded.state.child.dob,'date','importChild')}${field('tester','Previous assessor','الفاحص السابق',decoded.state.child.tester,'text','importChild')}${field('date','Previous assessment date','تاريخ التقييم السابق',decoded.state.date,'date','importState')}${field('number','Previous assessment number','رقم التقييم السابق',decoded.state.number,'text','importState')}</div><details><summary>${tr('Original report pages','صفحات التقرير الأصلي')}</summary>${(decoded.previews||[]).map(preview=>`<img class="import-page-preview" src="${preview.url}" alt="${tr('Original report page','صفحة التقرير الأصلي')} ${preview.page}">`).join('')}</details><h3>${tr('Review or enter previous milestone marks','مراجعة درجات المعالم السابقة أو إدخالها')}</h3><p class="muted">${tr('Tap a box to cycle through blank, 0, 0.5 and 1. Blank is unassessed. These are historical results, not scores for today.', 'المس الخانة للتنقل بين الفراغ و0 و0.5 و1. الفراغ يعني غير مقيم. هذه نتائج سابقة وليست درجات لليوم.')}</p><div id="legacyGrid" class="screen-grid">${R.grid(decoded.state,D,s.lang,true,{raw:true}).join('')}</div><label class="review-check"><input id="importReviewed" type="checkbox"> ${tr('I checked the child, date and milestone marks against the previous report','طابقت بيانات الطفل والتاريخ وعلامات المعالم مع التقرير السابق')}</label><button type="button" class="primary" data-import-followup>${tr('Start follow-up with these previous results','بدء المتابعة بهذه النتائج السابقة')}</button>`;
    openDialog('importDialog');
  }
  async function importPrevious(file) {
    if(importing||!file)return;importing=true;status(tr('Reading previous report…','جار قراءة التقرير السابق…'));
    try {
      const decoded=await window.VBImport.read(file,D,progress=>status(tr(`Reading previous report: ${progress}`,`جار قراءة التقرير السابق: ${progress}`)));
      if(decoded.exact)applyPrevious(decoded);else{showImportReview(decoded);status('');}
    } catch(error) {
      const messages={'too-large':['Use a PDF smaller than 50 MB, or an editable JSON export.','استخدم تقريراً بحجم أقل من 50 ميغابايت أو ملف JSON القابل للتعديل.'],'password-pdf':['Open an unlocked copy of this PDF.','استخدم نسخة غير محمية بكلمة مرور من هذا التقرير.'],'unsupported-schema':['This report uses an unsupported data version. Current answers were kept.','يستخدم التقرير إصدار بيانات غير مدعوم. احتُفظ بالإجابات الحالية.']};
      status(messages[error.code]?tr(...messages[error.code]):tr('Could not read a valid assessment from this file. Current answers were kept.','تعذر قراءة تقييم صالح من هذا الملف. احتُفظ بالإجابات الحالية.'));
    } finally {importing=false;const input=$('previousReport');if(input)input.value='';}
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    const a = button.dataset;
    if (a.close) { closeDialog(a.close); return; }
    if ('followupCurrent' in a) {
      if(!Object.values(s.scores).some(values=>Object.keys(values).length)||!validateDates()){status(tr('Record this assessment before starting the next visit.','سجّل هذا التقييم قبل بدء الزيارة التالية.'));return;}
      s=M.startFollowup(s);ui.page='milestones';ui.view='grid';ui.filter='all';render();save();return;
    }
    if ('restoreWorkspace' in a) {
      try{const saved=M.normalize(read(RECOVERY));localStorage.setItem(RECOVERY,JSON.stringify(s));s=saved;ui.page='case';render();save();status(tr('Previous workspace restored.','استُعيدت الحالة السابقة.'));}catch(_){status(tr('Could not restore the saved workspace.','تعذرت استعادة الحالة المحفوظة.'));}return;
    }
    if(a.taskFilter){ui.filter=a.taskFilter;ui.view='cards';render();return;}
    if(a.importScore && pendingImport) {
      const item=getItem('milestones',a.importScore),values=[undefined,...M.allowed.milestones.filter(v=>v!==.5||M.halfAllowed(item))];
      const next=values[(values.indexOf(pendingImport.state.scores.milestones[item.id])+1)%values.length];
      if(next===undefined)delete pendingImport.state.scores.milestones[item.id];else pendingImport.state.scores.milestones[item.id]=next;
      $('legacyGrid').innerHTML=R.grid(pendingImport.state,D,s.lang,true,{raw:true}).join('');return;
    }
    if('importFollowup' in a && pendingImport) {
      const draft=pendingImport.state;
      if(!$('importReviewed').checked||!draft.child.name.trim()||M.ageOn(draft.child.dob||draft.date,draft.date)===null){status(tr('Enter the child name and valid previous date, then check the review box.','أدخل اسم الطفل وتاريخ التقييم السابق الصحيح ثم حدد خانة المراجعة.'));return;}
      if(applyPrevious(pendingImport)){pendingImport=null;closeDialog('importDialog');}return;
    }
    if (a.page) { ui.page = a.page; status(''); render(); $('main').focus({ preventScroll: true }); return; }
    if (a.view) { ui.view = a.view; render(); return; }
    if (a.level) { ui.level = Number(a.level); render(); return; }
    if (a.category) { ui.category = a.category; render(); return; }
    if (a.group) { ui.group = Number(a.group); render(); return; }
    if (a.edit) { editItem(a.edit); return; }
    if (a.score !== undefined) { try { M.setScore(s, a.type, getItem(a.type, a.id), Number(a.score)); refreshScores(a.type, a.id); } catch (error) { status(tr('Add and verify this item’s criteria before scoring.', 'أضف معايير هذا البند وتحقق منها قبل التسجيل.')); } return; }
    if (a.clearScore) { M.clearScore(s, a.type, a.clearScore); refreshScores(a.type, a.clearScore); return; }
    if (a.stimulus) { showImage(a.stimulus); return; }
    if (a.imageStep) { showImage(ui.imageId, ui.imageIndex + Number(a.imageStep)); return; }
    if (a.reportLang) { s.reportLang = a.reportLang; render(); save(); return; }
    if ('textReport' in a) { if (validateDates()) download('\ufeff' + R.make(s, D).text, filename(`${s.reportLang}.txt`), 'text/plain;charset=utf-8'); return; }
    if ('print' in a) { if (validateDates()) { preparePrint(); window.print(); } return; }
    if ('pdf' in a) {
      if (!validateDates()) return; button.disabled = true; status(tr('Preparing PDF…', 'جار تجهيز PDF…'));
      try { await window.VBPDF.export(R.make(s, D), M.normalize(s), filename(`${s.reportLang}.pdf`), progress => status(tr(`Preparing PDF: ${progress}`, `جار تجهيز PDF: ${progress}`))); status(tr('PDF downloaded.', 'تم تنزيل ملف PDF.')); }
      catch (error) { console.error(error); status(tr('PDF export could not finish. Use Print to save a PDF instead.', 'تعذر إكمال تصدير PDF. استخدم الطباعة لحفظ ملف PDF.')); }
      finally { button.disabled = false; } return;
    }
    if ('exportData' in a) { save(); download(JSON.stringify(s, null, 2), filename('editable.json'), 'application/json'); return; }
    if ('newCase' in a && confirm(tr('Start a new case? Export this assessment first if you need it. Only VB-MAPP data on this device will be cleared.', 'بدء حالة جديدة؟ صدّر هذا التقييم أولاً إذا كنت تحتاجه. ستُمسح بيانات VB-MAPP على هذا الجهاز فقط.'))) {
      try { for (const key of [KEY, RECOVERY, 'vb-mapp-child-info', 'vb-mapp-session', 'vb-mapp-notes']) localStorage.removeItem(key); }
      catch (error) { status(tr('Could not clear the saved assessment. Export it before clearing browser data.', 'تعذر مسح التقييم المحفوظ. صدّره قبل مسح بيانات المتصفح.')); return; }
      s = M.blank(); recoveryAvailable=false; loadMessage = ''; ui.page = 'case'; render(); save(); return;
    }
  });
  document.addEventListener('input', event => {
    const node = event.target, binding = node.dataset.bind, key = node.dataset.key;
    if ((binding === 'importChild' || binding === 'importState') && pendingImport) {if(binding==='importChild')pendingImport.state.child[key]=node.value;else pendingImport.state[key]=node.value;return;}
    if (binding === 'child') s.child[key] = node.value;
    else if (binding === 'state') s[key] = key === 'color' ? M.validColor(node.value) : node.value;
    else if (binding === 'comment') s.comments[key] = node.value;
    else if (binding === 'criterionText' || binding === 'criterionScoring') {
      const type = D.transitions.some(item => item.id === key) ? 'transitions' : 'milestones', item = getItem(type, key);
      s.customCriteria[key] ||= { text: item.requiresCriteria || item.guide ? M.itemText(item, s, s.lang) : '', scoring: '' };
      s.customCriteria[key][binding === 'criterionText' ? 'text' : 'scoring'] = node.value;
      delete s.scoreReviews[key];
      refreshScores(type, key);
    }
    else if (binding?.startsWith('goal')) { s.goals[key] ||= { selected: false, goal: '', criterion: '', support: '', review: '' }; s.goals[key][{ goalText: 'goal', goalCriterion: 'criterion', goalSupport: 'support', goalReview: 'review' }[binding]] = node.value; }
    else if (node.id === 'taskSearch') { ui.search = node.value; $('taskCards').innerHTML = taskList().map(i => card('milestones', i)).join(''); return; }
    else return;
    $('caseBadge').textContent = [s.child.name, s.date].filter(Boolean).join(' · '); updatePreview(); delayedSave();
  });
  document.addEventListener('change', async event => {
    const node = event.target;
    if (node.id === 'previousReport') {await importPrevious(node.files?.[0]);return;}
    if (node.dataset.scope) { s.reportScope[node.dataset.scope] = node.checked; render(); save(); }
    else if (node.id === 'includeUnassessed') { s.includeUnassessed = node.checked; updatePreview(); save(); }
    else if (node.dataset.goalSelected) {
      const id = node.dataset.goalSelected, item = getItem('milestones', id);
      const newPlan = !s.goals[id];
      s.goals[id] ||= { selected: false, goal: M.itemText(item, s, s.lang), criterion: M.itemScoring(item, s, s.lang), support: '', review: '' };
      s.goals[id].selected = node.checked;
      if (newPlan && M.needsCriteria(item) && M.hasScore(s, 'milestones', item)) s.goals[id].criteriaReview = M.reviewKey(item, s);
      // Preserve any existing edited goal text; populate only newly selected empty templates.
      if (!s.goals[id].goal) s.goals[id].goal = M.itemText(item, s, s.lang);
      if (!s.goals[id].criterion) s.goals[id].criterion = M.itemScoring(item, s, s.lang);
      const details = node.closest('details'); $('goalCards').innerHTML = goalCards(); if (details) details.open = true; updatePreview(); save();
    } else if (node.dataset.goalReviewed) {
      const id = node.dataset.goalReviewed, item = getItem('milestones', id);
      if (s.goals[id]) s.goals[id].criteriaReview = node.checked && M.hasScore(s, 'milestones', item) ? M.reviewKey(item, s) : '';
      updatePreview(); save();
    } else if (node.id === 'importFile' && node.files?.[0]) {
      try {
        const raw = JSON.parse(await node.files[0].text()); if (raw.version !== 2 || !raw.child || !raw.scores) throw Error('Unsupported assessment format'); const imported = M.normalize(raw);
        if (!confirm(tr('Replace the current assessment with this file? Export the current assessment first if needed.', 'استبدال التقييم الحالي بهذا الملف؟ صدّر التقييم الحالي أولاً إذا كنت تحتاجه.'))) return;
        s = imported; loadMessage = ''; render(); save(); status(tr('Assessment imported.', 'تم استيراد التقييم.'));
      } catch (error) { status(tr('This file is not a valid assessment JSON file. Current answers were kept.', 'هذا ليس ملف JSON صالحاً للتقييم. احتُفظ بالإجابات الحالية.')); }
    }
  });
  document.addEventListener('dragover',event=>{const zone=event.target.closest('[data-report-drop]');if(zone){event.preventDefault();zone.classList.add('drag-over');}});
  document.addEventListener('dragleave',event=>{event.target.closest('[data-report-drop]')?.classList.remove('drag-over');});
  document.addEventListener('drop',event=>{const zone=event.target.closest('[data-report-drop]');if(zone){event.preventDefault();zone.classList.remove('drag-over');importPrevious(event.dataTransfer?.files?.[0]);}});
  $('language').addEventListener('click', () => { s.lang = s.lang === 'ar' ? 'en' : 'ar'; render(); save(); });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog.id); });
    dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open'); });
  });
  document.addEventListener('keydown', event => {
    const dialog = [...document.querySelectorAll('dialog[open]')].pop(); if (!dialog || !dialog.classList.contains('fallback')) return;
    if (event.key === 'Escape') closeDialog(dialog.id);
    if (event.key === 'Tab') { const controls = [...dialog.querySelectorAll('button:not(:disabled),input,textarea,select,a[href]')]; const first = controls[0], last = controls.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
  });
  function viewport() { document.documentElement.style.setProperty('--app-height', `${window.visualViewport?.height || window.innerHeight}px`); }
  window.visualViewport?.addEventListener('resize', viewport); window.addEventListener('resize', viewport); viewport();
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('pagehide', save);
  render();
  if (!loadMessage) save();
  // Read-only developer diagnostics for content coverage and automated QA.
  window.VBApp = { snapshot: () => M.normalize(s), gridCount: () => M.allMilestones(D).length };
})();
