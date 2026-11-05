(function () {
  'use strict';
  const D = window.VB_DATA, M = window.VBModel, R = window.VBReport, esc = R.esc;
  const KEY = 'vb-mapp-workspace-v2', $ = id => document.getElementById(id);
  const ui = { page: 'case', level: 1, category: 'all', view: 'grid', barrierView: 'grid', transitionView: 'grid', analysisView:'grid', analysisLevel:1, analysisCategory:'all', analysisSearch:'', filter:'all', search: '', group: 1, activeItem: null, imageId: '', imageIndex: 0 };
  let reportDate='all', lifecycleAction='', s = M.blank(), saveTimer, focusBefore = new Map(), loadMessage = '';
  const tr = (en, ar) => s.lang === 'ar' ? ar : en;
  const text = pair => pair ? (pair[s.lang] || pair.en || pair.ar || '').replace(/إكلينيكي/g, 'سريري').replace(/التنسيق التعليمي/g, 'التخطيط التعليمي').replace(/للأطباء/g, 'للفاحصين') : '';
  const typeNames = { milestones: ['Milestones', 'المعالم النمائية'], eesa: ['EESA', 'التقليد الصوتي المبكر'], barriers: ['Barriers', 'العوائق'], transitions: ['Transition', 'الانتقال'], tasks: ['Task Analysis', 'تحليل المهام'] };
  const getList = type => M.records(D, type);
  const getItem = (type, id) => getList(type).find(i => i.id === id);
  function read(key) { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
  try {
    const stored = localStorage.getItem(window.VBAccounts.KEY) ? null : read(KEY);
    if (stored) s = M.normalize(stored);
    else if (!localStorage.getItem(window.VBAccounts.KEY)) {
      const child = read('vb-mapp-child-info'), session = read('vb-mapp-session');
      if (child || session) s = M.migrate(child, session, localStorage.getItem('vb-mapp-notes'));
    }
  } catch (error) { loadMessage = 'load-error'; }
  let accountId = null;
  try {
    if (loadMessage) throw Error('Unreadable legacy data');
    window.VBAccounts.migrate(s);
    const child = window.VBAccounts.active();
    if (child) { accountId = child.id; s = child.workspace ? M.normalize(child.workspace) : M.blank(); s.child.name = child.name; }
  } catch (_) { loadMessage = 'load-error'; }

  const PAGES=['case','milestones','eesa','barriers','transitions','tasks','reference','report'];
  // Each section is a history entry, so Back, Forward and reload stay inside the app.
  const pageFromHistory=()=>PAGES.includes(history.state?.vbPage)?history.state.vbPage:null;
  ui.page=pageFromHistory()||ui.page;
  if(s.completedAt)ui.page='report';
  if (!loadMessage&&!s.completedAt) { M.syncEchoic(s, D); M.syncTransitionTotals(s,D); }
  function save() {
    clearTimeout(saveTimer);
    try { if (loadMessage) return false; if (!accountId) return true; window.VBAccounts.save(accountId, s); $('saveStatus').textContent='';$('saveStatus').parentElement.hidden=true; return true; }
    catch (error) { $('saveStatus').parentElement.hidden=false; $('saveStatus').textContent = tr('Could not save. Keep this window open and retry before switching accounts.', 'تعذر الحفظ. أبقِ هذه النافذة مفتوحة وأعد المحاولة قبل تبديل الحساب.'); return false; }
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
    document.querySelector('[data-install]')?.setAttribute('aria-label', tr('Add to Home Screen', 'إضافة إلى الشاشة الرئيسية'));
    document.querySelectorAll('[data-aria-en][data-aria-ar]').forEach(node => { const label=s.lang==='ar'?node.dataset.ariaAr:node.dataset.ariaEn; node.setAttribute('aria-label',label); if(node.hasAttribute('title'))node.title=label; });
    $('headerChild').textContent=s.child.name||tr('Assessment, learning profile and planning','التقييم وملف المهارات والتخطيط');
    $('caseBadge').textContent='';
  }
  function heading(en, ar, description = '') { return `<div class="page-intro"><h2>${tr(en, ar)}</h2>${description ? `<p class="muted">${description}</p>` : ''}</div>`; }
  function field(key, en, ar, value, kind = 'text', binding = 'child', wide = false) {
    const id = `${binding}-${key}`;
    return `<div class="${wide ? 'wide' : ''}"><label for="${id}">${tr(en, ar)}</label>${kind === 'textarea' ? `<textarea id="${id}" data-bind="${binding}" data-key="${key}" dir="auto">${esc(value)}</textarea>` : `<input id="${id}" data-bind="${binding}" data-key="${key}" type="${kind}" value="${esc(value)}" ${binding === 'child' && key === 'name' ? 'readonly' : ''} ${kind === 'text' ? 'maxlength="300"' : ''}>`}</div>`;
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
  function noteField(item, prefix='', compact=false) { return `<details><summary>${compact?tr('Note','ملاحظة'):tr('Response, prompts and evidence', 'الاستجابة والتلميحات والأدلة')}</summary><label class="sr-only" for="note-${prefix}${item.id}">${tr('Item note', 'ملاحظة البند')}</label><textarea class="compact" id="note-${prefix}${item.id}" data-bind="comment" data-key="${item.id}" dir="auto">${esc(s.comments[item.id] || '')}</textarea></details>`; }
  function stimulusButton(item) { return window.VB_STIMULI[item.id] && !window.VB_STIMULI[item.id].assessorOnly ? `<button type="button" data-stimulus="${item.id}">${tr('Show child image', 'عرض صورة للطفل')}</button>` : ''; }
  function pendingResult(type, item) {
    return M.own(s.scores[type], item.id) && !M.hasScore(s, type, item) ? `<p class="review-note" data-pending-score="${item.id}">${tr('Previous recorded result', 'النتيجة المسجلة سابقاً')}: <b dir="ltr">${s.scores[type][item.id]}</b>. ${tr('Preserved for review; excluded from scores and current goals until re-scored under valid criteria.', 'محفوظة للمراجعة؛ لا تدخل في الدرجات والأهداف الحالية حتى إعادة التسجيل وفق معايير صالحة.')}</p>` : '';
  }
  function earlierResult(type, item) {
    const old = M.previous(s); if (!old) return '';
    const c = M.comparison(s, type, item), raw = old.scores[type][item.id];
    const criterion=old.customCriteria[item.id], plan=old.goals[item.id];
    const previousCriterion=criterion ? `<details><summary>${tr('Previous task and criterion','المهمة والمعيار السابقان')}</summary><p dir="auto">${esc(criterion.text)}</p><p dir="auto">${esc(criterion.scoring)}</p></details>` : '';
    const previousPlan=plan?.selected ? `<details><summary>${tr('Previous goal plan','خطة الهدف السابقة')}</summary><p dir="auto"><strong>${tr('Goal','الهدف')}:</strong> ${esc(plan.goal)}</p><p dir="auto"><strong>${tr('Criterion','المعيار')}:</strong> ${esc(plan.criterion)}</p>${plan.review ? `<p><strong>${tr('Review date','تاريخ المراجعة')}:</strong> <bdi>${esc(plan.review)}</bdi></p>` : ''}</details>` : '';
    return `<div class="previous-result"><strong>${tr('Previous assessment', 'التقييم السابق')} <span dir="ltr">${esc(old.date)}</span>:</strong> <span dir="ltr">${M.own(old.scores[type], item.id) ? raw : '-'}</span>${raw !== undefined && c.before === null ? ` · ${tr('Re-scoring required', 'تحتاج إلى إعادة التسجيل')}` : ''}<p class="muted">${tr('Record a score for this visit after testing the child again. Previous results remain saved.', 'سجّل درجة لهذه الزيارة بعد إعادة تقييم الطفل. تبقى النتائج السابقة محفوظة.')}</p>${old.comments[item.id] ? `<details><summary>${tr('Previous response note', 'ملاحظة الاستجابة السابقة')}</summary><p dir="auto">${esc(old.comments[item.id])}</p></details>` : ''}${previousCriterion}${previousPlan}</div>`;
  }
  function workflowPanel() {
    const old = M.previous(s);
    if(!old&&!s.history.length)return '';
    return `<section class="panel followup-panel"><h3>${tr('Follow-up with the same child', 'متابعة الطفل نفسه')}</h3>${old ? `<p><strong>${tr('Previous assessment', 'التقييم السابق')}:</strong> <span dir="ltr">${esc(old.date)}</span> · ${tr('Assessment', 'التقييم')} ${esc(old.number)}${s.importSource ? ` · <bdi>${esc(s.importSource)}</bdi>` : ''}</p><p class="muted">${tr('Previous marks are visible in the grid. Only newly recorded scores count toward the current assessment.', 'تظهر الدرجات السابقة في الجدول. تدخل الدرجات المسجلة من جديد فقط في التقييم الحالي.')}</p>` : ''}${s.history.length ? `<details><summary>${tr('Previous visits and observations', 'الزيارات والملاحظات السابقة')} (${s.history.length})</summary>${s.history.map(record => `<div class="history-record"><h4>${esc(record.date)} · ${tr('Assessment', 'التقييم')} ${esc(record.number)}</h4><p>${tr('Milestones assessed', 'المعالم المقيمة')}: ${M.stats(record, getList('milestones'), 'milestones').assessed}/170</p><p dir="auto">${esc(record.clinical || tr('No observation summary recorded.', 'لم يُسجل ملخص للملاحظات.'))}</p>${record.recommendations ? `<p dir="auto">${esc(record.recommendations)}</p>` : ''}</div>`).join('')}</details>` : ''}</section>`;
  }
  function taskList() {
    const old = M.previous(s);
    return M.allMilestones(D).filter(i => i.level === ui.level && (ui.category === 'all' || i.category === ui.category) && (!ui.search || (M.itemText(i, s, s.lang) + ' ' + i.id).toLowerCase().includes(ui.search.toLowerCase())) &&
      (!old || ui.filter === 'all' || (ui.filter === 'previous' && M.own(old.scores.milestones,i.id)) || (ui.filter === 'new' && !M.own(old.scores.milestones,i.id)) || (ui.filter === 'retest' && M.own(old.scores.milestones,i.id) && !M.hasScore(s,'milestones',i))));
  }
  function milestoneGuidance(item, inDialog) {
    const guide = M.taskGuidance(item);
    const sections = [['objective','Objective','الهدف'],...(guide.materials ? [['materials','Materials','المواد']] : []),...(guide.examples ? [['examples','Examples','أمثلة']] : []),['application','Administration','طريقة التطبيق'],['scoring','Scoring criteria','معايير التسجيل']];
    const original = item.original ? `<details data-original-guidance="${item.id}"><summary>${tr('Original wording', 'الصياغة الأصلية')}</summary><div class="reference-text">${content(item.original.text)}${sections.map(([key,en,ar]) => `<section data-source-field="${key}"><h4>${tr(en,ar)}</h4>${content(item.original[key])}</section>`).join('')}</div></details>` : '';
    return `<details class="milestone-guidance" data-guidance-item="${item.id}" data-guidance-source="${item.guide ? 'task' : 'supplied'}" ${inDialog || M.needsCriteria(item) ? 'open' : ''}><summary>${tr('Objective, administration and scoring criteria', 'الهدف وطريقة التطبيق ومعايير التسجيل')}</summary><div class="reference-text">${sections.map(([key,en,ar]) => `<section data-guidance-field="${key}"><h4>${tr(en,ar)}</h4>${content(guide[key])}</section>`).join('')}</div></details>${item.sourceNote ? `<details class="manual-note"><summary>${tr('Guide edition note', 'ملاحظة طبعة الدليل')}</summary>${content(item.sourceNote)}</details>` : ''}${original}`;
  }
  function card(type, item, inDialog = false) {
    if (type === 'barriers') return barrierCard(item);
    if (type === 'transitions') return transitionCard(item);
    if (type === 'tasks') return analysisCard(item);
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
      ${stimulus ? `<div class="toolbar">${stimulusButton(item)}</div><details><summary>${tr('Stimulus preparation', 'تجهيز المثير')}</summary><p>${esc(stimulus.originalTask && !['li2-6'].includes(item.id) ? tr('Prepare images or materials for the current task using the arrays and trials specified in your guide.', 'جهّز الصور أو المواد للمهمة الحالية وفق المصفوفات والمحاولات المحددة في دليلك.') : stimulus.instruction[s.lang])}</p>${stimulus.prepared?`<p>${esc(text(stimulus.pictureNote||window.VB_PICTURE_DATA.support))}</p><p class="muted">${stimulus.boards.length} ${tr('prepared pages; use only the applicable trials.', 'صفحة جاهزة؛ استخدم المحاولات المناسبة للبند فقط.')}</p>`:''}</details>` : ''}
      ${!M.needsCriteria(item) ? milestoneSource : ''}${type === 'milestones' ? `<p class="small scoring-zero">${tr('0: Neither the full nor half-point criterion was demonstrated. Leave blank if not assessed.', '0: لم يتحقق معيار النقطة الكاملة أو نصف النقطة. اتركه فارغاً إذا لم يُقيّم.')}</p>` : ''}${guidance ? `<details ${inDialog ? 'open' : ''}><summary>${tr('Objective, administration and criteria', 'الهدف وطريقة التطبيق والمعايير')}</summary><div class="reference-text">${content(guidance)}</div></details>` : ''}${original}${noteField(item)}</article>`;
  }
  function casePage() {
    return heading('Case and assessment', 'بيانات الحالة والتقييم', tr('Complete only the assessment sections you need. Scores, notes and planning are saved on this device.', 'يمكنك إكمال القسم الذي تحتاجه فقط. تُحفظ الدرجات والملاحظات والتخطيط على هذا الجهاز.')) +
      workflowPanel() +
      (loadMessage ? `<div class="notice">${tr('Saved data could not be read. The original storage was not deleted. Keep this window open and retry.', 'تعذر قراءة البيانات المحفوظة. لم تُحذف البيانات الأصلية. أبقِ هذه النافذة مفتوحة وأعد المحاولة.')}</div>` : '') +
      (s.migration ? `<div class="notice">${tr('Review imported results against your observations before using them.', 'راجع النتائج المستوردة وفق ملاحظاتك قبل اعتمادها.')}</div>` : '') +
      `<section class="panel"><div class="form-grid">${field('name', 'Child name', 'اسم الطفل', s.child.name)}${field('dob', 'Date of birth', 'تاريخ الميلاد', s.child.dob, 'date')}${field('tester', 'Assessor', 'الفاحص', s.child.tester)}${field('guardian', 'Parent / caregiver', 'ولي الأمر / مقدم الرعاية', s.child.guardian)}${field('date', 'Assessment date', 'تاريخ التقييم', s.date, 'date', 'state')}${field('number', 'Assessment number', 'رقم التقييم', s.number, 'text', 'state')}${field('language', 'Language / dialect and communication modes', 'اللغة / اللهجة ووسائل التواصل', s.child.language)}${field('setting', 'Setting and information sources', 'البيئة ومصادر المعلومات', s.child.setting)}${field('reason', 'Reason for assessment', 'سبب التقييم', s.child.reason, 'textarea', 'child')}${field('relevant', 'Relevant background and supports', 'الخلفية ذات الصلة والدعم المستخدم', s.child.relevant, 'textarea', 'child')}</div></section>` +
      `<div class="stats-row">${Object.keys(typeNames).map(type => `<div class="stat"><p>${tr(...typeNames[type])}</p>${scopeSummary(type)}</div>`).join('')}</div>`;
  }
  function formLevelStyle(level) {
    const colors={1:['#e85773','#fff1f4','#f1a5b4'],2:['#268b74','#f0faf6','#97c9b9'],3:['#3186bf','#eef7fd','#99c5e4']}[level];
    return `--form-accent:${colors[0]};--form-tint:${colors[1]};--form-line:${colors[2]}`;
  }
  function formVisits() { return [...s.history.slice(-3),s]; }
  function visitMark(visit,type,item) {
    if(!visit)return '—';
    if(M.hasScore(visit,type,item))return String(visit.scores[type][item.id]);
    return M.own(visit.scores[type],item.id)?'!':'—';
  }
  function assessmentFill(type,value,visit) {
    const max=type==='barriers'?4:type==='transitions'?5:type==='tasks'?1:0,score=Number(value);
    return max&&visit&&value!==null&&value!==''&&Number.isFinite(score)&&score>0&&score<=max
      ? `--visit-fill:${M.validColor(visit.color)};--score-fill:${score/max*100}%` : '';
  }
  function fourScores(type,items,{item=null,total=false}={}) {
    const visits=formVisits(),labels=Array.from({length:4},(_,index)=>visits[index]?.number||String(index+1));
    return `<table class="four-scores" ${item?`data-four-item="${item.id}" data-four-type="${type}"`: ''} dir="ltr"><caption>${tr(total?'Total score':'Assessment',total?'مجموع الدرجات':'التقييم')}</caption><thead><tr>${labels.map(n=>`<th scope="col">${esc(n)}</th>`).join('')}</tr></thead><tbody><tr>${Array.from({length:4},(_,index)=>{
      const visit=visits[index],current=visit===s,st=visit?M.stats(visit,items,type):null,value=item?visitMark(visit,type,item):st?.assessed?String(st.score):'—';
      const label=visit?`${tr('Assessment','التقييم')} ${visit.number} · ${visit.date} · ${value}`:tr('No assessment','لا تقييم');
      const fill=item?assessmentFill(type,value,visit):'';
      return `<td data-visit-number="${esc(visit?.number||index+1)}" class="${current?'visit-current':''}${fill?' score-filled':''}" ${fill?`style="${fill}"`:''} title="${esc(label)}">${current&&item&&!item.derivedFrom?`<button type="button" ${type==='milestones'?`data-edit="${item.id}"`:type==='tasks'?`data-task-edit="${item.id}"`:type==='eesa'?`data-eesa-edit="${item.id}"`:`data-barrier-edit="${item.id}" data-assessment-type="${type}"`} aria-label="${esc(M.itemText(item,s,s.lang)+' · '+label)}">${esc(value)}</button>`:`<span aria-label="${esc(label)}">${esc(value)}</span>`}</td>`;
    }).join('')}</tr></tbody></table>`;
  }
  function metaOpen() { return ui.metaOpen??matchMedia('(min-width:701px)').matches; }
  function formHeading(title,type,items) {
    const visits=formVisits();
    return `<header class="protocol-heading" data-header-type="${type}"><h2>${title}</h2><details class="protocol-meta-toggle" ${metaOpen()?'open':''}><summary>${tr('Child and visits','الطفل والزيارات')}</summary><div class="protocol-meta"><dl><div><dt>${tr('Child','الطفل')}</dt><dd>${esc(s.child.name||'—')}</dd></div><div><dt>${tr('Date of birth','تاريخ الميلاد')}</dt><dd><bdi>${esc(s.child.dob||'—')}</bdi></dd></div><div><dt>${tr('Age at testing','العمر عند التقييم')}</dt><dd class="age-visits">${Array.from({length:4},(_,i)=>{const v=visits[i],age=v?M.ageOn(v.child.dob,v.date):null;return `<span><b>${esc(v?.number||i+1)}</b> ${age===null?'—':tr(Math.floor(age/12)+'y '+age%12+'m',Math.floor(age/12)+'س '+age%12+'ش')}</span>`;}).join('')}</dd></div></dl><div class="protocol-key-scroll"><table class="protocol-key"><thead><tr>${[tr('Assessment','التقييم'),tr('Score','الدرجة'),tr('Date','التاريخ'),tr('Color','اللون'),tr('Assessor','الفاحص')].map(t=>`<th scope="col">${t}</th>`).join('')}</tr></thead><tbody>${Array.from({length:4},(_,i)=>{
      const v=visits[i],st=v?M.stats(v,items,type):null;
      return `<tr><th scope="row">${esc(v?.number||i+1)}</th><td>${st?.assessed?st.score:'—'}</td><td><bdi>${esc(v?.date||'—')}</bdi></td><td>${v?`<span class="visit-color" style="background:${M.validColor(v.color)}" aria-label="${esc(v.color)}"></span>`:'—'}</td><td>${esc(v?.child.tester||'—')}</td></tr>`;
    }).join('')}</tbody></table></div></div></details></header>`;
  }
  function milestoneMaster() {
    const all=M.allMilestones(D),visits=formVisits(),order=['Mand','Tact','Listener','VP/MTS','Play','Social','Imitation','Echoic','Vocal','Reading','Writing','LRFFC','Intraverbal','Classroom','Linguistics','Math'];
    return `<div class="protocol-sheet master-sheet">${formHeading(tr('VB-MAPP Milestones Master Scoring Form','نموذج درجات معالم VB-MAPP'),'milestones',all)}${[3,2,1].map(level=>{
      const cats=order.filter(cat=>all.some(i=>i.level===level&&i.category===cat)),numbers=[5,4,3,2,1].map(n=>n+(level-1)*5);
      return `<section class="protocol-level" data-milestone-level="${level}" style="${formLevelStyle(level)}"><h3>${tr('Level','المستوى')} ${level}</h3><div class="protocol-grid-scroll"><table class="protocol-master" dir="ltr" style="width:${(cats.length/13*100).toFixed(2)}%;min-width:${cats.length*60+27}px"><caption class="sr-only">${tr('Level','المستوى')} ${level}</caption><thead><tr><th scope="col">#</th>${cats.map(cat=>`<th scope="col" dir="auto">${esc(R.label(D,cat,s.lang))}</th>`).join('')}</tr></thead><tbody>${numbers.map(n=>`<tr><th scope="row">${n}</th>${cats.map(cat=>{
        const item=all.find(i=>i.category===cat&&i.milestone===n),labels=visits.map(v=>`${tr('Assessment','التقييم')} ${v.number}: ${visitMark(v,'milestones',item)}`).join('; ');
        return `<td><span class="master-visits">${Array.from({length:4},(_,index)=>{
          const v=visits[index],mark=visitMark(v,'milestones',item),cls=mark==='1'?'met':mark==='0.5'?'half':mark==='0'?'zero':mark==='!'?'pending':'blank';
          const title=esc(v?tr('Assessment','التقييم')+' '+v.number+' · '+v.date:'—'),value=mark==='0.5'?'½':mark==='—'?'':mark;
          return v===s?`<button type="button" class="master-mark ${cls} current" data-edit="${item.id}" aria-label="${esc(R.label(D,cat,s.lang)+' '+n+' · '+labels)}" title="${title}"><span>${value}</span></button>`:`<span class="master-mark ${cls}" title="${title}"><span>${value}</span></span>`;
        }).join('')}</span></td>`;
      }).join('')}</tr>`).join('')}</tbody><tfoot><tr><td></td>${cats.map(()=>`<td><span class="master-column-key">${Array.from({length:4},(_,i)=>`<span>${esc(visits[i]?.number||i+1)}</span>`).join('')}</span></td>`).join('')}</tr></tfoot></table></div></section>`;
    }).join('')}</div>`;
  }
  function milestoneTaskForms(list) {
    const categories=D.categories.filter(cat=>list.some(i=>i.category===cat));
    return `<div class="protocol-sheet milestone-task-sheet" style="${formLevelStyle(ui.level)}"><h2 class="protocol-band">${tr('Milestones assessment','تقييم المعالم')} · ${tr('Level','المستوى')} ${ui.level}</h2>${categories.map(cat=>{
      const group=list.filter(i=>i.category===cat),domain=M.allMilestones(D).filter(i=>i.level===ui.level&&i.category===cat);
      return `<section class="protocol-domain"><header><h3>${esc(R.label(D,cat,s.lang))}</h3>${fourScores('milestones',domain,{total:true})}</header><div class="protocol-domain-body">${group.map(item=>`<div class="protocol-task-row" data-form-item="${item.id}">${fourScores('milestones',[item],{item})}<button type="button" class="protocol-task-text" data-edit="${item.id}"><bdi dir="${s.lang==='ar'?'rtl':'ltr'}">${item.milestone}.</bdi> ${esc(M.itemText(item,s,s.lang))}</button></div>`).join('')}<div class="protocol-domain-notes">${noteField({id:'domain-'+ui.level+'-'+cat.replace(/[^a-z]/gi,'')})}</div></div></section>`;
    }).join('')||`<p>${tr('No matching items.','لا توجد بنود مطابقة.')}</p>`}</div>`;
  }
  function eesaForm() {
    return heading('EESA','التقليد الصوتي المبكر')+`<div class="toolbar">${scopeSummary('eesa')}</div><div class="section-tabs">${[1,2,3,4,5].map(group=>`<button type="button" data-group="${group}" aria-pressed="${ui.group===group}">${tr('Group','المجموعة')} ${group}</button>`).join('')}</div><div class="protocol-sheet eesa-form">${formHeading(tr('Early Echoic Skills Assessment (EESA)','تقييم مهارات التقليد الصوتي المبكر (EESA)'),'eesa',D.eesa)}${[1,2,3,4,5].map(group=>{
      const list=D.eesa.filter(i=>i.group===group);
      return `<section class="eesa-form-group" id="eesa-form-group-${group}"><header><h3>${esc(text(D.eesaGroups[group]))}</h3>${fourScores('eesa',list,{total:true})}</header><details class="eesa-form-guide"><summary>${tr('Scoring guidance','إرشادات التسجيل')}</summary>${content(D.eesaScoringGuidance.common)}${content(D.eesaScoringGuidance[group<=3?1:group])}</details>${group===ui.group?`<p class="sr-only" data-eesa-group-summary>${M.stats(s,list,'eesa').score}</p>`:''}<div class="eesa-form-items">${list.map(item=>`<article class="eesa-form-item" data-card-id="${item.id}"><button type="button" class="eesa-form-stimulus" data-eesa-edit="${item.id}">${esc(M.itemText(item,s,s.lang))}${s.lang==='ar'&&item.text.en!==item.text.ar?`<small class="eesa-source-stimulus" dir="ltr">${esc(item.text.en)}</small>`:''}<span class="sr-only"> · ${item.id}</span></button><div class="eesa-four">${fourScores('eesa',[item],{item})}</div></article>`).join('')}</div></section>`;
    }).join('')}</div>`;
  }
  function milestonePage() {
    const list = taskList(), old = M.previous(s);
    return heading('Milestones', 'المعالم النمائية') +
      (old ? `<div class="followup-banner"><p><strong>${tr('Previous', 'السابق')}: ${esc(old.date)} · ${tr('Current', 'الحالي')}: ${esc(s.date)}</strong></p><details class="followup-help"><summary>${tr('How previous marks work','كيف تعمل الدرجات السابقة')}</summary><p>${tr('Earlier marks remain in the boxes as a reference. Tap a box to record a new result, including zero if the child no longer meets the criterion.', 'تبقى الدرجات السابقة في الخانات مرجعاً. المس الخانة لتسجيل نتيجة جديدة، بما فيها الصفر إذا لم يعد الطفل يحقق المعيار.')}</p></details><div class="section-tabs">${[['all','All tasks','كل البنود'],['previous','Previously scored','مقيم سابقاً'],['retest','Awaiting retest','بانتظار إعادة التقييم'],['new','New / previously unassessed','جديد / غير مقيم سابقاً']].map(([key,en,ar]) => `<button type="button" data-task-filter="${key}" aria-pressed="${ui.filter === key}">${tr(en,ar)}</button>`).join('')}</div></div>` : '') +
      `<div class="toolbar">${scopeSummary('milestones')}<button type="button" data-view="grid" aria-pressed="${ui.view === 'grid'}">${tr('Grid', 'جدول')}</button><button type="button" data-view="cards" aria-pressed="${ui.view === 'cards'}">${tr('Tasks', 'بنود')}</button></div>` +
      (ui.view === 'grid' ? `<div class="panel screen-grid">${milestoneMaster()}</div>` : `<div class="section-tabs">${[1,2,3].map(level => `<button type="button" class="level-tab" style="${formLevelStyle(level)}" data-level="${level}" aria-pressed="${ui.level === level}">${tr('Level', 'المستوى')} ${level}</button>`).join('')}</div><div class="section-tabs"><button type="button" data-category="all" aria-pressed="${ui.category === 'all'}">${tr('All domains', 'كل المجالات')}</button>${D.categories.map(cat => `<button type="button" data-category="${cat}" aria-pressed="${ui.category === cat}">${esc(R.label(D, cat, s.lang))}</button>`).join('')}</div><label for="taskSearch">${tr('Search tasks', 'البحث في البنود')}</label><input id="taskSearch" type="search" value="${esc(ui.search)}"><div class="protocol-task-list" id="taskCards">${milestoneTaskForms(list)}</div>`);
  }
  function formPrevious(type,item) {
    return M.previous(s)?`<details class="protocol-previous"><summary>${tr('Previous assessment details','تفاصيل التقييم السابق')}</summary>${earlierResult(type,item)}</details>`:'';
  }
  function barrierCard(item) {
    return `<article class="assessment-card barrier-task protocol-assessment-item" data-card-id="${item.id}"><header class="protocol-item-head"><h3><bdi dir="${s.lang==='ar'?'rtl':'ltr'}">${item.id.split('-').pop()}.</bdi> ${esc(text(item.name))}</h3>${fourScores('barriers',[item],{item})}</header><div class="protocol-item-body">${formPrevious('barriers',item)}${pendingResult('barriers',item)}<ol class="barrier-criteria" start="0">${item.criteria.map(c=>`<li value="${c.score}">${esc(text(c))}</li>`).join('')}</ol>${scoreControls('barriers',item)}${noteField(item)}</div></article>`;
  }
  function barrierVisits() { return [...s.history.slice(-3),s]; }
  function barrierGrid(type='barriers') {
    const visits=barrierVisits(),levels=type==='transitions'?[5,4,3,2,1]:[4,3,2,1];
    return `<div class="barrier-grid ${type==='transitions'?'transition-grid':''}">${getList(type).map(item=>`<section class="barrier-chart"><button type="button" class="barrier-open" data-barrier-edit="${item.id}" data-assessment-type="${type}">${esc(text(item.name))}</button><div class="barrier-plot" dir="ltr"><div class="barrier-axis" aria-hidden="true">${levels.map(n=>`<span>${n}</span>`).join('')}</div>${Array.from({length:4},(_,index)=>{
      const visit=visits[index],current=visit===s,valid=visit&&M.hasScore(visit,type,item),value=valid?visit.scores[type][item.id]:null,pending=visit&&M.own(visit.scores[type],item.id)&&!valid;
      const label=visit?`${tr('Assessment','التقييم')} ${visit.number} · ${visit.date} · ${value===null?pending?tr('Needs review','تحتاج مراجعة'):tr('Not assessed','غير مقيم'):tr('Score','الدرجة')+' '+value}`:tr('No assessment','لا تقييم');
      const cells=levels.map(n=>`<span class="${value!==null&&value>=n?'filled':''}"></span>`).join('');
      return `<div class="barrier-visit" style="--visit-fill:${M.validColor(visit?.color)}">${current?`<button type="button" class="barrier-column current" data-barrier-edit="${item.id}" data-assessment-type="${type}" aria-label="${esc(text(item.name)+' · '+label)}">${cells}</button>`:`<div class="barrier-column" role="img" aria-label="${esc(label)}">${cells}</div>`}<small title="${esc(label)}">${visit?esc(visit.number):'—'}</small><small class="barrier-result">${value===null?pending?'!':'—':value}</small></div>`;
    }).join('')}</div></section>`).join('')}</div>`;
  }
  function barriersPage() {
    const notesLabel=tr('Barriers assessment notes','ملاحظات تقييم العوائق');
    return heading('Barriers','العوائق')+`<div class="toolbar barrier-toolbar">${scopeSummary('barriers')}<button type="button" data-barrier-view="grid" aria-pressed="${ui.barrierView==='grid'}">${tr('Grid','جدول')}</button><button type="button" data-barrier-view="cards" aria-pressed="${ui.barrierView==='cards'}">${tr('Tasks','بنود')}</button><button type="button" class="barrier-notes-icon" data-barrier-notes aria-label="${notesLabel}" title="${notesLabel}" aria-haspopup="dialog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6"/></svg></button></div>${ui.barrierView==='grid'?`<div class="protocol-sheet barriers-task-sheet">${formHeading(tr('VB-MAPP Barriers Scoring Form','نموذج درجات عوائق VB-MAPP'),'barriers',D.barriers)}<div id="barrierGrid">${barrierGrid()}</div></div>`:`<div class="protocol-sheet barriers-task-sheet">${formHeading(tr('VB-MAPP Barriers Assessment','تقييم عوائق VB-MAPP'),'barriers',D.barriers)}${D.barriers.map(barrierCard).join('')}</div>`}`;
  }
  function showBarrierNotes(type='barriers') {
    $('barrierNotesTitle').textContent=type==='transitions'?tr('Transition assessment notes','ملاحظات تقييم الانتقال'):tr('Barriers assessment notes','ملاحظات تقييم العوائق');
    $('barrierNotesBody').innerHTML=(type==='transitions'?window.VB_TRANSITIONS:window.VB_BARRIERS).notes.map(n=>`<section><h3>${esc(text(n.title))}</h3><p>${esc(text(n.text))}</p></section>`).join('');
    $('barrierNotesClose').setAttribute('aria-label',tr('Close','إغلاق'));openDialog('barrierNotesDialog');
  }
  function transitionCard(item) {
    const setup=M.needsCriteria(item)?`<details class="transition-verify"><summary>${tr('Verify protocol criteria','التحقق من معايير البروتوكول')}</summary>${field(item.id,'Item description','وصف البند',s.customCriteria[item.id]?.text||text(item.name),'textarea','criterionText')}${field(item.id,'Verified Protocol criteria (1–5)','معايير البروتوكول المتحقق منها (1–5)',s.customCriteria[item.id]?.scoring||'','textarea','criterionScoring')}</details>`:'';
    return `<article class="assessment-card transition-task protocol-assessment-item" data-card-id="${item.id}"><header class="protocol-item-head"><h3><bdi dir="${s.lang==='ar'?'rtl':'ltr'}">${item.id.split('-').pop()}.</bdi> ${esc(text(item.name))}</h3>${fourScores('transitions',[item],{item})}</header><div class="protocol-item-body">${formPrevious('transitions',item)}${pendingResult('transitions',item)}<div class="transition-guidance">${item.guidance.map(g=>`<p class="transition-score-row" data-transition-score="${esc(g.label.en)}"><strong>${esc(text(g.label))}.</strong><span>${esc(text(g.text))}</span></p>`).join('')}</div>${setup}${item.derivedFrom?`<p class="derived-score-note">${tr('Calculated from this visit’s complete assessment.','تُحسب من التقييم المكتمل لهذه الزيارة.')}</p>`:scoreControls('transitions',item)}${noteField(item)}</div></article>`;
  }
  function transitionsPage() {
    const notesLabel=tr('Transition assessment notes','ملاحظات تقييم الانتقال');
    return heading('Transition','الانتقال')+`<div class="toolbar barrier-toolbar">${scopeSummary('transitions')}<button type="button" data-transition-view="grid" aria-pressed="${ui.transitionView==='grid'}">${tr('Grid','جدول')}</button><button type="button" data-transition-view="cards" aria-pressed="${ui.transitionView==='cards'}">${tr('Tasks','بنود')}</button><button type="button" class="barrier-notes-icon" data-transition-notes aria-label="${notesLabel}" title="${notesLabel}" aria-haspopup="dialog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6"/></svg></button></div>${ui.transitionView==='grid'?`<div class="protocol-sheet transitions-task-sheet">${formHeading(tr('VB-MAPP Transition Scoring Form','نموذج درجات انتقال VB-MAPP'),'transitions',D.transitions)}<div id="transitionGrid">${barrierGrid('transitions')}</div></div>`:`<div class="protocol-sheet transitions-task-sheet">${formHeading(tr('VB-MAPP Transition Assessment','تقييم انتقال VB-MAPP'),'transitions',D.transitions)}${D.transitions.map(transitionCard).join('')}</div>`}`;
  }
  function analysisItems() {
    const query=ui.analysisSearch.trim().toLocaleLowerCase();
    return D.tasks.filter(item=>item.level===ui.analysisLevel&&(ui.analysisCategory==='all'||item.category===ui.analysisCategory)&&(!query||[item.id,item.code,item.text.en,item.text.ar,R.label(D,item.category,'en'),R.label(D,item.category,'ar')].join(' ').toLocaleLowerCase().includes(query)));
  }
  function analysisCategories() {
    const order=['Mand','Tact','Listener','VP/MTS','Play','Social',...(ui.analysisLevel===3?['Writing','Reading']:['Imitation','Echoic','Vocal']),'LRFFC','Intraverbal','Classroom','Linguistics','Math'];
    return order.filter(cat=>M.allMilestones(D).some(i=>i.level===ui.analysisLevel&&i.category===cat));
  }
  function analysisMilestone(cat,n) { return M.allMilestones(D).find(i=>i.level===ui.analysisLevel&&i.category===cat&&i.milestone===n); }
  function analysisMatchesMilestone(item) {
    const q=ui.analysisSearch.trim().toLocaleLowerCase();
    return !q||[item.id,item.milestone+'-M',M.itemText(item,s,'en'),M.itemText(item,s,'ar'),item.category,R.label(D,item.category,'ar')].join(' ').toLocaleLowerCase().includes(q);
  }
  function analysisText(item) { return text(item.text).replace(/\s*\((?:T|O|E|TO:[^)]*)\)\s*$/, ''); }
  function analysisCard(item) {
    return `<article class="assessment-card analysis-card" data-card-id="${item.id}" style="${formLevelStyle(item.level)}"><h3>${esc(R.label(D,item.category,s.lang))} · <bdi>${item.code}</bdi></h3><p class="card-text" dir="auto">${esc(analysisText(item))}</p><p class="muted"><bdi>${esc(item.method)}</bdi> · ${tr('Source PDF page','صفحة المصدر')} <bdi>${item.sourcePage}</bdi></p>${s.lang==='ar'?`<details><summary>${tr('English wording','النص الإنجليزي')}</summary><p lang="en" dir="ltr">${esc(item.text.en)}</p></details>`:''}${fourScores('tasks',[item],{item})}${earlierResult('tasks',item)}${pendingResult('tasks',item)}${scoreControls('tasks',item)}<p class="small">${esc(text(item.scoring))}</p>${noteField(item,'',true)}</article>`;
  }
  function analysisTables() {
    const list=analysisItems(),cats=analysisCategories().filter(cat=>ui.analysisCategory==='all'||cat===ui.analysisCategory);
    return cats.map(cat=>{
      const groups=[1,2,3,4,5].map(n=>n+(ui.analysisLevel-1)*5).map(n=>{
        const milestone=analysisMilestone(cat,n),skills=list.filter(i=>i.category===cat&&i.milestone===n),showMilestone=milestone&&(skills.length||analysisMatchesMilestone(milestone));
        if(!skills.length&&!showMilestone)return '';
        const row=(type,item)=>`<tr class="protocol-task-row ${type==='milestones'?'analysis-linked':''}" data-analysis-item="${item.id}"><th scope="row"><bdi>${type==='milestones'?n+'-M':item.code}</bdi></th><td class="analysis-description"><button type="button" class="protocol-task-text" ${type==='milestones'?`data-edit="${item.id}"`:`data-task-edit="${item.id}"`}>${esc(type==='milestones'?M.itemText(item,s,s.lang):analysisText(item))}${type==='tasks'?` <small dir="ltr">(${esc(item.method)})</small>`:''}</button></td><td class="analysis-met">${fourScores(type,[item],{item})}</td></tr>`;
        return `<tbody class="analysis-skill-group">${skills.map(i=>row('tasks',i)).join('')}${showMilestone?row('milestones',milestone):''}</tbody>`;
      }).join('');
      return groups?`<section class="analysis-domain"><table class="analysis-table"><colgroup><col class="analysis-code-col"><col><col class="analysis-met-col"></colgroup><thead><tr><th scope="col">${tr('Skill','المهارة')}</th><th scope="col"><h3>${esc(R.label(D,cat,s.lang))} · ${tr('Level','المستوى')} ${ui.analysisLevel}</h3></th><th scope="col">${tr('Met','متحقق')}</th></tr></thead>${groups}</table></section>`:'';
    }).join('')||`<p>${tr('No matching items.','لا توجد بنود مطابقة.')}</p>`;
  }
  function analysisGrid() {
    const list=analysisItems(),visits=formVisits(),cats=analysisCategories().filter(cat=>ui.analysisCategory==='all'||cat===ui.analysisCategory);
    const numbers=[5,4,3,2,1].map(n=>n+(ui.analysisLevel-1)*5);
    const mark=(type,item)=>{
      const code=type==='milestones'?item.milestone+'-M':item.code;
      const description=type==='milestones'?M.itemText(item,s,s.lang):analysisText(item);
      const label=R.label(D,item.category,s.lang)+' · '+code+' · '+description;
      return `<button type="button" class="analysis-chart-skill ${type==='milestones'?'analysis-chart-milestone':''}" data-analysis-item="${item.id}" ${type==='milestones'?`data-edit="${item.id}"`:`data-task-edit="${item.id}"`} aria-label="${esc(label)}" title="${esc(description)}"><bdi class="analysis-chart-code">${code}</bdi><span class="analysis-chart-visits" dir="ltr">${Array.from({length:4},(_,i)=>{
        const visit=visits[i],value=visitMark(visit,type,item),fill=assessmentFill('tasks',value,visit);
        const visitLabel=visit?tr('Assessment','التقييم')+' '+visit.number+' · '+visit.date+' · '+value:tr('No assessment','لا تقييم');
        return `<span class="analysis-chart-mark ${visit===s?'visit-current':''} ${fill?'score-filled':''}" ${fill?`style="${fill}"`:''} aria-label="${esc(visitLabel)}" title="${esc(visitLabel)}">${value==='0.5'?'½':esc(value)}</span>`;
      }).join('')}</span></button>`;
    };
    const bands=numbers.map(n=>{
      const columns=cats.map(cat=>{
        const milestone=analysisMilestone(cat,n),skills=list.filter(i=>i.category===cat&&i.milestone===n).reverse();
        const showMilestone=milestone&&(skills.length||analysisMatchesMilestone(milestone));
        return `<td>${showMilestone?mark('milestones',milestone):''}${skills.map(item=>mark('tasks',item)).join('')}</td>`;
      });
      return columns.some(c=>c!=='<td></td>')?`<tbody data-analysis-band="${n}"><tr>${columns.join('')}</tr></tbody>`:'';
    }).join('');
    if(!bands)return `<p>${tr('No matching items.','لا توجد بنود مطابقة.')}</p>`;
    return `<div class="analysis-chart-scroll" role="region" aria-label="${tr('Task Analysis tracking chart','جدول تتبع تحليل المهام')}" tabindex="0"><table class="analysis-chart" dir="ltr" style="--analysis-columns:${cats.length}"><caption class="sr-only">${tr('Task Analysis and Skills Tracking · Level ','تحليل المهام وتتبع المهارات · المستوى ')}${ui.analysisLevel}</caption><thead><tr>${cats.map(cat=>`<th scope="col" dir="auto">${esc(R.label(D,cat,s.lang))}<span class="analysis-chart-visit-key" dir="ltr">${Array.from({length:4},(_,i)=>`<span>${esc(visits[i]?.number||i+1)}</span>`).join('')}</span></th>`).join('')}</tr></thead>${bands}</table></div>`;
  }
  function analysisTaskForms() { return analysisTables(); }
  function analysisContent() { return ui.analysisView==='grid'?analysisGrid():analysisTaskForms(); }
  function analysisPage() {
    return heading('Task Analysis and Skills Tracking','تحليل المهام وتتبع المهارات')+`<div class="toolbar">${scopeSummary('tasks')}<button type="button" data-analysis-view="grid" aria-pressed="${ui.analysisView==='grid'}">${tr('Grid','جدول')}</button><button type="button" data-analysis-view="cards" aria-pressed="${ui.analysisView==='cards'}">${tr('Tasks','بنود')}</button><button type="button" class="barrier-notes-icon" data-analysis-notes aria-label="${tr('Task Analysis notes','ملاحظات تحليل المهام')}" aria-haspopup="dialog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6"/></svg></button></div><div class="section-tabs">${[1,2,3].map(level=>`<button type="button" class="level-tab" style="${formLevelStyle(level)}" data-analysis-level="${level}" aria-pressed="${ui.analysisLevel===level}">${tr('Level','المستوى')} ${level}</button>`).join('')}</div><div class="section-tabs"><button type="button" data-analysis-category="all" aria-pressed="${ui.analysisCategory==='all'}">${tr('All domains','كل المجالات')}</button>${analysisCategories().map(cat=>`<button type="button" data-analysis-category="${cat}" aria-pressed="${ui.analysisCategory===cat}">${esc(R.label(D,cat,s.lang))}</button>`).join('')}</div><label for="analysisSearch">${tr('Search skills','البحث في المهارات')}</label><input id="analysisSearch" type="search" value="${esc(ui.analysisSearch)}"><div class="protocol-sheet analysis-sheet" style="${formLevelStyle(ui.analysisLevel)}">${formHeading(tr('Task Analysis · Level ','تحليل المهام · المستوى ')+ui.analysisLevel,'tasks',D.tasks)}<div id="analysisContent">${analysisContent()}</div></div>`;
  }
  function showAnalysisNotes() {
    $('barrierNotesTitle').textContent=tr('Task Analysis notes','ملاحظات تحليل المهام');
    const notes=[
      ['Scoring','التسجيل','Assess each lettered skill under its stated conditions: 1 = met, 0 = assessed but not met; leave unassessed skills blank. These counts track additional skills and are separate from the 170-point Milestones total.','قيّم كل مهارة ذات حرف بشروطها المذكورة: 1 = متحقق، 0 = قُيّم ولم يتحقق؛ واترك ما لم يُقيّم فارغاً. تتبع هذه الأعداد المهارات الإضافية بصورة منفصلة عن مجموع المعالم البالغ 170 نقطة.'],
      ['Linked milestones','المعالم المرتبطة','M rows show the actual milestone results for the same visit, including half points. Editing an M row updates the milestone itself. Completing a milestone does not automatically establish its lettered skills. Earlier visits remain read-only references.','تعرض بنود M درجات المعالم الفعلية للزيارة نفسها، بما فيها أنصاف النقاط. تعديل بند M يعدّل المعلم نفسه. تحقق المعلم لا يثبت تلقائياً تحقق المهارات ذات الحروف. تبقى الزيارات السابقة مراجع للقراءة فقط.'],
      ['Methods','طرق التقييم','T = direct testing; O = observation; E = either; TO = timed observation. Follow each item’s counts, timing and prompting conditions.','T = اختبار مباشر؛ O = ملاحظة؛ E = اختبار أو ملاحظة؛ TO = ملاحظة محددة الزمن. التزم بالأعداد والمدة وشروط التلقين لكل بند.'],
      ['Source coverage and language','تغطية المصدر واللغة','The supplied task analysis.pdf describes 740 lettered skills across Levels 1–3. All have Arabic translations and English wording. It provides no detailed lettered Echoic or Vocal tasks; those domains show linked milestones only. English letter, grammar and spelling requirements remain explicit. Record the language used; Arabic translations do not establish Arabic test norms.','يصف ملف task analysis.pdf المرفق 740 مهارة ذات حروف في المستويات 1–3، وجميعها مترجمة للعربية مع إتاحة النص الإنجليزي. لا يتضمن مهام مفصلة ذات حروف للترديد أو الأصوات العفوية؛ لذلك يعرض هذان المجالان المعالم المرتبطة فقط. تبقى شروط الحروف والقواعد والتهجئة الإنجليزية صريحة. سجّل لغة التطبيق؛ فالترجمة لا تنشئ معايير اختبار عربية.']
    ];
    $('barrierNotesBody').innerHTML=notes.map(([en,ar,bodyEn,bodyAr])=>`<section><h3>${tr(en,ar)}</h3><p>${esc(tr(bodyEn,bodyAr))}</p></section>`).join('');
    $('barrierNotesClose').setAttribute('aria-label',tr('Close','إغلاق'));openDialog('barrierNotesDialog');
  }

  function otherPage(type) {
    if (type === 'tasks') return analysisPage();
    if (type === 'barriers') return barriersPage();
    if (type === 'transitions') return transitionsPage();
    if (type === 'eesa') return eesaForm();
    const intro = type === 'eesa' ? tr('Select a group, present each stimulus and record the response.', 'اختر المجموعة، وقدّم كل مثير ثم سجّل الاستجابة.') : type === 'barriers' ? text(D.barrierGeneric.description) : type === 'transitions' ? text(D.transitionCategories.description) : tr('Record the supporting skills you assessed.', 'سجّل المهارات الداعمة التي قيّمتها.');
    let list = getList(type);
    const filter = type === 'eesa' ? `<div class="section-tabs">${[1,2,3,4,5].map(group => `<button type="button" data-group="${group}" aria-pressed="${ui.group === group}">${tr('Group', 'المجموعة')} ${group}</button>`).join('')}</div>` : '';
    if (type === 'eesa') list = list.filter(i => i.group === ui.group);
    const guidance = type === 'barriers' ? `<details class="panel"><summary>${tr('General scoring guidance', 'إرشادات التسجيل العامة')}</summary>${content(D.barrierGeneric.scoring)}</details>` : type === 'transitions' ? `<p class="notice">${tr('Rate each transition area using its assessment criteria.', 'قيّم كل مجال من مجالات الانتقال وفق معاييره.')}</p>` : type === 'eesa' ? `<section class="panel"><h3>${tr('Scoring guidance', 'إرشادات التسجيل')}</h3>${content(D.eesaScoringGuidance.common)}${content(D.eesaScoringGuidance[ui.group <= 3 ? 1 : ui.group])}</section>` : '';
    return heading(...typeNames[type], intro) + `<div class="toolbar">${scopeSummary(type)}</div>${guidance}${filter}${type === 'eesa' ? `<h3>${esc(text(D.eesaGroups[ui.group]))}</h3><p class="muted">${tr('Group recorded score', 'مجموع المجموعة المسجل')}: <b data-eesa-group-summary>${M.stats(s, list, type).score}</b></p>` : ''}<div class="cards-grid ${type === 'eesa' ? 'eesa-grid' : ''}">${list.map(item => card(type, item)).join('')}</div>`;
  }
  const goalIcons={bank:'<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4zM20 4h-4a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h3z"/>',edit:'<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14z"/>',remove:'<path d="m6 6 12 12M18 6 6 18"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',add:'<path d="M12 5v14M5 12h14"/>',check:'<path d="m5 12 4 4L20 5"/>'};
  const goalIcon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${goalIcons[name]}</svg>`;
  const bankFilters={query:'',level:0,category:'all',kind:'annual',page:0};
  let goalEditor=null;
  function referencePage() {
    const goals=window.VBGoalBank.childGoals(s,D);
    return `<div class="iep-simple"><header class="iep-simple-head"><div><h2>${tr('IEP goals','أهداف الخطة')}</h2><p>${esc(s.child.name||'')}</p></div><div class="iep-actions"><button type="button" class="iep-icon" data-goal-bank aria-label="${tr('Goal bank','بنك الأهداف')}" title="${tr('Goal bank','بنك الأهداف')}" aria-haspopup="dialog">${goalIcon('bank')}</button><button type="button" class="iep-icon" data-goals-copy aria-label="${tr('Copy child goals','نسخ أهداف الطفل')}" title="${tr('Copy child goals','نسخ أهداف الطفل')}" ${goals.length?'':'disabled'}>${goalIcon('copy')}</button></div></header>${goals.length?`<ol class="iep-child-goals">${goals.map(g=>`<li data-child-goal="${esc(g.key)}"><div><span class="iep-goal-domain">${esc(R.label(D,g.item.category,s.lang))}</span><p dir="auto">${esc(g.plan.goal)}</p></div><div class="iep-row-actions"><button type="button" class="iep-icon" data-goal-edit="${esc(g.key)}" aria-label="${esc(tr('Edit goal','تعديل الهدف')+' · '+g.plan.goal)}" aria-haspopup="dialog">${goalIcon('edit')}</button><button type="button" class="iep-icon" data-goal-remove="${esc(g.key)}" aria-label="${esc(tr('Remove goal','إزالة الهدف')+' · '+g.plan.goal)}">${goalIcon('remove')}</button></div></li>`).join('')}</ol>`:`<p class="iep-empty">${tr('Record assessed skills or choose a goal from the bank.','سجّل المهارات المقيمة أو اختر هدفاً من البنك.')}</p>`}</div>`;
  }
  function bankResults(){
    const found=window.VBGoalBank.filter(D,bankFilters),pages=Math.max(1,Math.ceil(found.length/15));bankFilters.page=Math.min(bankFilters.page,pages-1);
    const added=new Set(Object.values(s.goals).map(g=>g.bankId));
    return `<ul class="iep-bank-results">${found.slice(bankFilters.page*15,bankFilters.page*15+15).map(e=>`<li><div><small>${esc(R.label(D,e.category,s.lang))} · ${tr('Level','المستوى')} ${e.level}</small><p dir="auto">${esc(text(e.text))}</p></div><button type="button" class="iep-icon" data-bank-add="${esc(e.id)}" aria-label="${esc((added.has(e.id)?tr('Added','تمت الإضافة'):tr('Add goal','إضافة الهدف'))+' · '+text(e.text))}" ${added.has(e.id)?'disabled':''}>${goalIcon(added.has(e.id)?'check':'add')}</button></li>`).join('')||`<li>${tr('No matching goals.','لا توجد أهداف مطابقة.')}</li>`}</ul><div class="iep-bank-pages"><button type="button" class="iep-icon" data-bank-page="-1" aria-label="${tr('Previous page','الصفحة السابقة')}" ${bankFilters.page?'':'disabled'}>‹</button><span aria-live="polite"><bdi>${bankFilters.page+1} / ${pages} · ${found.length}</bdi></span><button type="button" class="iep-icon" data-bank-page="1" aria-label="${tr('Next page','الصفحة التالية')}" ${bankFilters.page+1<pages?'':'disabled'}>›</button></div>`;
  }
  function bankBody(){
    return `<label class="sr-only" for="goalBankSearch">${tr('Search goals','البحث في الأهداف')}</label><input id="goalBankSearch" type="search" placeholder="${tr('Search goals','البحث في الأهداف')}" value="${esc(bankFilters.query)}"><div class="section-tabs iep-bank-tabs">${[['annual','Examples','أمثلة'],['milestone','Milestones','معالم'],['skill','Supporting skills','مهارات داعمة'],['all','All goals','كل الأهداف']].map(([key,en,ar])=>`<button type="button" data-bank-kind="${key}" aria-pressed="${bankFilters.kind===key}">${tr(en,ar)}</button>`).join('')}</div><div class="section-tabs iep-bank-tabs">${[0,1,2,3].map(level=>`<button type="button" data-bank-level="${level}" aria-pressed="${bankFilters.level===level}">${level?tr('Level','المستوى')+' '+level:tr('All levels','كل المستويات')}</button>`).join('')}</div><details class="iep-bank-domains"><summary>${tr('Domains','المجالات')}${bankFilters.category==='all'?'':' · '+esc(R.label(D,bankFilters.category,s.lang))}</summary><div class="section-tabs"><button type="button" data-bank-category="all" aria-pressed="${bankFilters.category==='all'}">${tr('All domains','كل المجالات')}</button>${D.categories.map(cat=>`<button type="button" data-bank-category="${esc(cat)}" aria-pressed="${bankFilters.category===cat}">${esc(R.label(D,cat,s.lang))}</button>`).join('')}</div></details><div id="goalBankResults">${bankResults()}</div>`;
  }
  function openGoalBank(){
    Object.assign(bankFilters,{query:'',level:0,category:'all',kind:'annual',page:0});
    $('goalBankTitle').textContent=tr('Goal bank','بنك الأهداف');$('goalBankBody').innerHTML=bankBody();$('goalBankDialog').querySelector('[data-close]').setAttribute('aria-label',tr('Close','إغلاق'));openDialog('goalBankDialog');$('goalBankSearch').focus();
  }
  function editGoal(key){
    const entry=window.VBGoalBank.childGoals(s,D).find(g=>g.key===key);if(!entry)return;
    goalEditor={...entry,plan:{...entry.plan}};const plan=entry.plan;
    $('goalEditTitle').textContent=tr('Edit goal','تعديل الهدف');
    $('goalEditForm').innerHTML=`<label for="iepGoalText">${tr('Goal','الهدف')}</label><textarea id="iepGoalText" name="goal" required rows="5" dir="auto">${esc(plan.goal)}</textarea><details class="iep-edit-details"><summary>${tr('Measurement','القياس')}</summary><label for="iepGoalCriterion">${tr('Measurement criterion','معيار القياس')}</label><textarea id="iepGoalCriterion" name="criterion" dir="auto">${esc(plan.criterion||'')}</textarea><label for="iepGoalReview">${tr('Review date','تاريخ المراجعة')}</label><input id="iepGoalReview" name="review" type="date" value="${esc(plan.review||'')}"><label><input type="checkbox" name="reviewed" ${M.currentPlan(s,entry.item,plan)?'checked':''} ${M.hasScore(s,'milestones',entry.item)?'':'disabled'}> ${tr('Reviewed against this assessment','تمت المراجعة وفق هذا التقييم')}</label></details><label class="iep-report-choice"><input type="checkbox" name="selected" ${entry.generated||plan.selected?'checked':''}> ${tr('Include in report','تضمين في التقرير')}</label><div class="iep-edit-footer"><button type="submit" class="iep-icon primary" aria-label="${tr('Save goal','حفظ الهدف')}">${goalIcon('check')}</button></div>`;
    $('goalEditDialog').querySelector('[data-close]').setAttribute('aria-label',tr('Close','إغلاق'));openDialog('goalEditDialog');$('iepGoalText').focus();
  }
  function reportState() {
    if(reportDate==='all')return M.normalize(s);
    const record=[...s.history,s].find(v=>v.assessmentId===reportDate);
    if(!record)return M.normalize(s);
    return M.normalize({...record,history:[],baselineId:'',lang:s.lang,reportLang:s.lang,reportScope:s.reportScope,reportLayout:s.reportLayout,reportLayouts:s.reportLayouts,reportDetails:s.reportDetails,includeUnassessed:s.includeUnassessed});
  }
  function lifecycleControls() {
    const action=s.completedAt?'new':'finish',label=action==='new'?tr('Start new assessment','بدء تقييم جديد'):tr('Finish assessment','إنهاء التقييم');
    const path=action==='new'?'<path d="M12 5v14M5 12h14"/>':'<path d="m5 12 4 4L19 6"/>';
    return `<section class="panel assessment-lifecycle"><div class="assessment-lifecycle-head"><div><strong dir="auto">${esc(s.child.name)}</strong><span>${s.completedAt?tr('Completed','مكتمل'):tr('In progress','قيد التقييم')} · <bdi dir="ltr">${esc(s.date)}</bdi></span></div><button type="button" class="iep-icon" data-assessment-action="${action}" aria-label="${label}" title="${label}" aria-haspopup="dialog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${path}</svg></button></div><div class="assessment-dates" role="group" aria-label="${tr('Assessment dates','تواريخ التقييم')}"><button type="button" data-report-date="all" aria-pressed="${reportDate==='all'}">${tr('All dates','جميع التواريخ')}</button>${[...s.history,s].map(v=>`<button type="button" data-report-date="${esc(v.assessmentId)}" aria-pressed="${reportDate===v.assessmentId}"><bdi dir="ltr">${esc(v.date)}</bdi><small>${tr('Assessment','التقييم')} ${esc(v.number)}</small></button>`).join('')}</div></section>`;
  }
  function askLifecycle(action) {
    if((action==='new')!==Boolean(s.completedAt))return;
    lifecycleAction=action;
    $('assessmentLifecycleTitle').textContent=action==='new'?tr('New assessment','تقييم جديد'):tr('Finish assessment','إنهاء التقييم');
    $('assessmentLifecycleQuestion').textContent=action==='new'?tr(`Start a new assessment for ${s.child.name}? Previous results will stay in the report.`,`هل تريد بدء تقييم جديد للطفل ${s.child.name}؟ ستبقى النتائج السابقة في التقرير.`):tr(`Have you finished the assessment for ${s.child.name}?`,`هل انتهيت من تقييم الطفل ${s.child.name}؟`);
    $('assessmentLifecycleDialog').querySelector('[data-close]').setAttribute('aria-label',tr('Cancel','إلغاء'));
    $('assessmentLifecycleDialog').querySelector('[data-confirm-assessment]').setAttribute('aria-label',tr('Confirm','تأكيد'));
    openDialog('assessmentLifecycleDialog');
  }
  function reportPage() {
    const layouts=[['tables','Tables','جداول'],['tasks','Tasks','مهام']];
    const sections=Object.entries(typeNames).map(([type,name])=>`<div class="report-section-choice"><div class="report-layout-options" role="group" aria-label="${esc(tr(...name))}">${layouts.map(([key,en,ar])=>`<button type="button" data-report-section-layout="${type}" data-layout="${key}" aria-pressed="${(s.reportLayouts[type]||s.reportLayout)===key}">${tr(en,ar)}</button>`).join('')}</div><label><input type="checkbox" data-scope="${type}" ${s.reportScope[type]?'checked':''}> <span>${tr(...name)}</span></label></div>`).join('');
    return heading('Report','التقرير')+lifecycleControls()+`<section class="panel report-controls"><div class="toolbar report-controls-head"><button id="pdfExport" type="button" data-pdf class="primary">${tr('Download PDF','تنزيل PDF')}</button><div class="report-all-layouts"><span>${tr('All sections','كل الأقسام')}</span><div class="report-layout-options" role="group" aria-label="${tr('Report layout','تنسيق التقرير')}">${layouts.map(([key,en,ar])=>`<button type="button" data-report-layout="${key}" aria-pressed="${Object.keys(typeNames).every(type=>(s.reportLayouts[type]||s.reportLayout)===key)}">${tr(en,ar)}</button>`).join('')}</div></div></div><div class="scope-controls">${sections}</div><div class="toolbar report-detail-options"><label class="report-iep-choice"><input type="checkbox" data-scope="goals" ${s.reportScope.goals?'checked':''}> ${tr('IEP goals','أهداف الخطة')}</label><button type="button" data-report-option="reportDetails" aria-pressed="${s.reportDetails}">${tr('Include detailed item results','تضمين نتائج البنود التفصيلية')}</button><button type="button" data-report-option="includeUnassessed" aria-pressed="${s.includeUnassessed}">${tr('Include unassessed item details','تضمين تفاصيل البنود غير المقيمة')}</button></div></section><section id="reportPreview" class="report-document report-preview" tabindex="0" aria-label="${tr('A4 report preview','معاينة تقرير A4')}" lang="${s.lang}" dir="${s.lang==='ar'?'rtl':'ltr'}"></section>`;
  }
  function render() {
    s.reportLang=s.lang;
    if(s.completedAt)ui.page='report';
    if(!loadMessage&&!s.completedAt) M.syncTransitionTotals(s,D);
    translateShell();
    const pages = { case: ['Case', 'الحالة'], milestones: typeNames.milestones, eesa: typeNames.eesa, barriers: typeNames.barriers, transitions: typeNames.transitions, tasks: typeNames.tasks, reference: ['IEP', 'الخطة التربوية الفردية'], report: ['Report', 'التقرير'] };
    const navScroll=$('navigation').scrollLeft;
    $('navigation').hidden=Boolean(s.completedAt);
    $('navigation').innerHTML = Object.entries(s.completedAt?{report:pages.report}:pages).map(([page, names]) => `<button type="button" data-page="${page}" ${ui.page === page ? 'aria-current="page"' : ''}>${tr(...names)}</button>`).join('');
    $('main').innerHTML = ui.page === 'case' ? casePage() : ui.page === 'milestones' ? milestonePage() : ui.page === 'report' ? reportPage() : ui.page === 'reference' ? referencePage() : otherPage(ui.page);
    $('navigation').scrollLeft=navScroll;
    keepActiveTabsVisible();
    syncRoute();
    updatePreview();
  }
  // Scrolling tab rows are rebuilt on render, so bring the chosen tab back into view.
  function keepActiveTabsVisible() {
    const reveal=(row,tab)=>{
      if(!row)return;
      // Safari keeps an old offset after rotating, which can strand tabs off-screen.
      if(row.scrollWidth<=row.clientWidth){row.scrollLeft=0;return;}
      if(!tab)return;
      const r=row.getBoundingClientRect(),b=tab.getBoundingClientRect();
      if(b.left<r.left+8||b.right>r.right-8)row.scrollLeft+=(b.left+b.right)/2-(r.left+r.right)/2;
    };
    reveal($('navigation'),$('navigation').querySelector('[aria-current="page"]'));
    document.querySelectorAll('#main .section-tabs').forEach(row=>reveal(row,row.querySelector('[aria-pressed="true"]')));
  }
  function syncRoute(push=false) {
    // Browsers rate-limit history calls; that must never stop a section from opening.
    try{if(history.state?.vbPage!==ui.page)history[push?'pushState':'replaceState']({vbPage:ui.page},'');}catch{}
  }
  function renderFocus(attribute,value) {
    render();
    document.querySelector(`[${attribute}="${CSS.escape(String(value))}"]`)?.focus({preventScroll:true});
  }
  function updatePreview() {
    const preview=$('reportPreview');if(!preview)return;
    preview.dir=s.lang==='ar'?'rtl':'ltr';preview.lang=s.lang;
    try {const state=reportState();window.VBPDF.preview(R.make(state,D),state,preview);}
    catch(error) {preview.textContent=tr('Could not prepare the report.','تعذر تجهيز التقرير.');status(error.message);}
  }

  function openDialog(id) {
    const dialog = $(id); if (!dialog.open) focusBefore.set(id, { node: document.activeElement, itemId: document.activeElement?.dataset.edit, barrierId: document.activeElement?.dataset.barrierEdit, eesaId: document.activeElement?.dataset.eesaEdit, taskId:document.activeElement?.dataset.taskEdit });
    if (typeof dialog.showModal === 'function') { if (!dialog.open) dialog.showModal(); }
    else { dialog.setAttribute('open', ''); dialog.classList.add('fallback'); dialog.setAttribute('aria-modal', 'true'); }
    document.body.classList.add('modal-open'); dialog.querySelector('button,input,textarea')?.focus();
  }
  function closeDialog(id) {
    const dialog = $(id); if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
    const previous = focusBefore.get(id); if (previous?.node?.isConnected && !previous.node.closest('dialog:not([open])')) previous.node.focus(); else if (previous?.itemId) document.querySelector(`[data-edit="${previous.itemId}"]`)?.focus();
    else if(previous?.barrierId) document.querySelector(`[data-barrier-edit="${previous.barrierId}"]`)?.focus();
    else if(previous?.eesaId) document.querySelector(`[data-eesa-edit="${previous.eesaId}"]`)?.focus();
    else if(previous?.taskId) document.querySelector(`[data-task-edit="${previous.taskId}"]`)?.focus();
    if(id==='itemDialog')$('itemBody').replaceChildren();
    if(id==='goalBankDialog')document.querySelector('[data-goal-bank]')?.focus();
    if(id==='goalEditDialog')Array.from(document.querySelectorAll('[data-goal-edit]')).find(n=>n.dataset.goalEdit===goalEditor?.key)?.focus();
  }
  function itemOrder(type) {
    if(type==='milestones')return ui.page==='milestones'&&ui.view==='cards'?taskList():M.allMilestones(D);
    if(type==='tasks')return ui.page==='tasks'?analysisItems():getList('tasks');
    return getList(type);
  }
  function showItem(type,id) {
    const item=getItem(type,id);if(!item)return;
    ui.activeItem=id;ui.dialogItem={type,id};
    const titles={milestones:()=>`${R.label(D,item.category,s.lang)} ${item.milestone}`,eesa:()=>tr('EESA item','بند التقليد الصوتي')+' '+item.id,tasks:()=>tr('Task Analysis','تحليل المهام')+' · '+item.code,barriers:()=>text(item.name),transitions:()=>text(item.name)};
    const bodies={milestones:()=>card('milestones',item,true),eesa:()=>card('eesa',item,true),tasks:()=>analysisCard(item),barriers:()=>barrierCard(item),transitions:()=>transitionCard(item)};
    $('itemTitle').textContent=titles[type]();$('itemBody').innerHTML=bodies[type]();
    const list=itemOrder(type),index=list.findIndex(entry=>entry.id===id),step=$('itemStep');
    step.hidden=index<0||list.length<2;
    if(!step.hidden){
      $('itemCounter').textContent=`${index+1} / ${list.length}`;
      step.querySelector('[data-item-step="-1"]').disabled=index===0;
      step.querySelector('[data-item-step="1"]').disabled=index===list.length-1;
    }
    const dialog=$('itemDialog');
    if(dialog.open){
      // After stepping, closing the dialog should return to the item last shown.
      const key={milestones:'itemId',barriers:'barrierId',transitions:'barrierId',eesa:'eesaId',tasks:'taskId'}[type];
      focusBefore.set('itemDialog',{node:null,[key]:id});
      dialog.scrollTop=0;
      if(document.activeElement?.disabled||!document.activeElement?.closest('#itemStep'))step.querySelector('button:not(:disabled)')?.focus();
    } else openDialog('itemDialog');
  }
  function editItem(id) { showItem('milestones',id); }
  function refreshScores(type, id) {
    M.syncTransitionTotals(s,D);
    const item = getItem(type, id);
    document.querySelectorAll(`[data-card-id="${id}"] [data-score]`).forEach(button => { button.disabled = !M.eligible(item, s); button.setAttribute('aria-pressed', String(M.hasScore(s, type, item) && s.scores[type][id] === Number(button.dataset.score))); });
    document.querySelectorAll(`[data-pending-score="${id}"]`).forEach(node => node.remove());
    document.querySelectorAll(`[data-card-id="${id}"] .score-controls`).forEach(node => node.insertAdjacentHTML('beforebegin', pendingResult(type, item)));
    if (ui.page==='tasks' && $('analysisContent')) $('analysisContent').innerHTML=analysisContent();
    if (ui.page === 'milestones') { if(ui.view==='grid') render(); else if($('taskCards')) $('taskCards').innerHTML=milestoneTaskForms(taskList()); }
    document.querySelectorAll('[data-score-summary]').forEach(node => { node.outerHTML = scopeSummary(node.dataset.scoreSummary); });
    if (type === 'eesa' && ui.page==='eesa') { const scrollY=window.scrollY,active=document.activeElement,restore=active?.closest('#main')?{id:active.dataset.id,score:active.dataset.score}:null; $('main').innerHTML=eesaForm(); if(restore?.id&&restore.score!==undefined) document.querySelector(`.eesa-form-item [data-id="${restore.id}"][data-score="${restore.score}"]`)?.focus({preventScroll:true}); window.scrollTo(0,scrollY); }
    if (type === 'eesa') document.querySelectorAll('[data-eesa-group-summary]').forEach(node => { node.textContent = M.stats(s, D.eesa.filter(item => item.group === ui.group), 'eesa').score; });
    document.querySelectorAll(`[data-four-item="${id}"][data-four-type="${type}"]`).forEach(node=>{ node.outerHTML=fourScores(type,[item],{item}); });
    if (type==='transitions' && $('transitionGrid')) $('transitionGrid').innerHTML=barrierGrid('transitions');
    if (type==='barriers' && $('barrierGrid')) $('barrierGrid').innerHTML=barrierGrid();
    document.querySelectorAll('[data-header-type]').forEach(node=>{const t=node.dataset.headerType,title=node.querySelector('h2').textContent;node.outerHTML=formHeading(esc(title),t,getList(t));});
    updatePreview(); save();
  }
  let stimulusRequest=0,disposeStimulus=()=>{};
  async function showImage(id, index = 0) {
    const entry = window.VB_STIMULI[id],count=entry?.boards?.length||entry?.paths?.length||0;
    if(!entry||entry.assessorOnly||index<0||index>=count)return;
    const ticket=++stimulusRequest;
    ui.imageId=id;ui.imageIndex=index;
    $('imageDialog').setAttribute('aria-label',tr('Child-facing pictures','صور للطفل'));
    try{
      let element,dispose=()=>{};
      if(entry.boards){const prepared=window.VBPictureLibrary.prepare(entry.boards[index],{lang:s.lang,childName:s.child.name||''});await prepared.ready;element=prepared.element;dispose=prepared.dispose;}
      else{const image=new Image();image.alt=tr('Assessment stimulus','مثير التقييم');await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=entry.paths[index];});element=image;}
      if(ticket!==stimulusRequest){dispose();return;}
      disposeStimulus();disposeStimulus=dispose;
      $('imageBody').replaceChildren(element);$('stimulusCounter').textContent=count>1?`${index+1} / ${count}`:'';
      $('imageControls').innerHTML=count>1?`<button type="button" class="stimulus-nav" data-image-step="-1" aria-label="${tr('Previous picture','الصورة السابقة')}" title="${tr('Previous picture','الصورة السابقة')}" ${index===0?'disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><button type="button" class="stimulus-nav" data-image-step="1" aria-label="${tr('Next picture','الصورة التالية')}" title="${tr('Next picture','الصورة التالية')}" ${index===count-1?'disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>`:'';
      openDialog('imageDialog');
    }catch{if(ticket===stimulusRequest)status(tr('Could not load this picture. Try again or download the app content.','تعذر تحميل الصورة. أعد المحاولة أو نزّل محتوى التطبيق.'));}
  }
  $('imageDialog').addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();showImage(ui.imageId,ui.imageIndex+(event.key==='ArrowRight'?1:-1));}
  });
  $('imageDialog').addEventListener('close',()=>{++stimulusRequest;disposeStimulus();});
  function filename(suffix) { const name = s.child.name.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').slice(0, 70) || 'Assessment'; return `VB-MAPP-${name}-${s.date || M.today()}-${suffix}`; }
  function download(content, name, mime) {
    const url = URL.createObjectURL(new Blob([content], { type: mime })), link = document.createElement('a');
    link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function validateDates() {
    const date = s.date, parsed = new Date(date + 'T12:00:00');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(parsed) || parsed.toISOString().slice(0, 10) !== date || (s.child.dob && M.ageOn(s.child.dob, date) === null) || (M.previous(s)?.date && date < M.previous(s).date)) { status(tr('Correct the assessment date and date of birth. A follow-up date cannot precede its previous assessment.', 'صحّح تاريخ التقييم وتاريخ الميلاد. لا يمكن أن يسبق تاريخ المتابعة تاريخ التقييم السابق.')); return false; }
    return true;
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    const a = button.dataset;
    if(a.reportDate){reportDate=a.reportDate;render();document.querySelector(`[data-report-date="${reportDate}"]`)?.focus();return;}
    if(a.assessmentAction){button.focus();askLifecycle(a.assessmentAction);return;}
    if('confirmAssessment' in a){
      if(!validateDates()||!save())return;
      const original=M.normalize(s);
      if(lifecycleAction==='finish'&&!s.completedAt){
        M.syncEchoic(s,D);M.syncTransitionTotals(s,D);
        for(const g of window.VBGoalBank.childGoals(s,D))if(g.generated)s.goals[g.key]={...g.plan,itemId:g.item.id,selected:true};
        s.completedAt=new Date().toISOString();
      } else if(lifecycleAction==='new'&&s.completedAt){s=M.startFollowup(s);}
      else return;
      if(!save()){s=original;return;}
      const finished=lifecycleAction==='finish';lifecycleAction='';reportDate='all';ui.page=finished?'report':'case';
      closeDialog('assessmentLifecycleDialog');render();$('main').focus({preventScroll:true});return;
    }
    if(s.completedAt&&!('pdf' in a||a.reportSectionLayout||a.reportLayout||a.reportOption||a.close||a.page==='report'))return;
    if ('goalBank' in a) {button.focus();openGoalBank();return;}
    if (a.goalEdit) {button.focus();editGoal(a.goalEdit);return;}
    if (a.goalRemove) {const goal=window.VBGoalBank.childGoals(s,D).find(g=>g.key===a.goalRemove);if(goal){delete s.goals[goal.key];s.iepExcluded=[...new Set([...(s.iepExcluded||[]),goal.item.id])];save();render();}return;}
    if ('goalsCopy' in a) {const goals=window.VBGoalBank.childGoals(s,D);const value=[s.child.name,...goals.map((g,i)=>(i+1)+'. '+g.plan.goal)].join('\n\n');try{await navigator.clipboard.writeText(value);status(tr('Goals copied.','تم نسخ الأهداف.'));}catch(_){download('\ufeff'+value,filename('IEP.txt'),'text/plain;charset=utf-8');}return;}
    if (a.bankKind||'bankLevel' in a||a.bankCategory) {if(a.bankKind)bankFilters.kind=a.bankKind;if('bankLevel' in a)bankFilters.level=Number(a.bankLevel);if(a.bankCategory)bankFilters.category=a.bankCategory;bankFilters.page=0;$('goalBankBody').innerHTML=bankBody();const filter='bankKind' in a?'bankKind':'bankLevel' in a?'bankLevel':'bankCategory';Array.from($('goalBankBody').querySelectorAll('button')).find(n=>n.dataset[filter]===a[filter])?.focus();return;}
    if (a.bankPage) {bankFilters.page+=Number(a.bankPage);$('goalBankResults').innerHTML=bankResults();$('goalBankSearch').focus();return;}
    if (a.bankAdd) {const entry=window.VBGoalBank.entries(D).find(e=>e.id===a.bankAdd);if(entry&&!Object.values(s.goals).some(g=>g.bankId===entry.id)){const plan=window.VBGoalBank.fromEntry(s,D,entry);if(plan){s.goals['bank-'+entry.id]=plan;save();render();$('goalBankResults').innerHTML=bankResults();$('goalBankResults').querySelector('[data-bank-add]:not(:disabled)')?.focus();}}return;}
    if ('analysisNotes' in a) {button.focus();showAnalysisNotes();return;}
    if (a.analysisView) {ui.analysisView=a.analysisView;renderFocus('data-analysis-view',a.analysisView);return;}
    if (a.analysisLevel) {ui.analysisLevel=Number(a.analysisLevel);ui.analysisCategory='all';renderFocus('data-analysis-level',a.analysisLevel);return;}
    if (a.analysisCategory) {ui.analysisCategory=a.analysisCategory;renderFocus('data-analysis-category',a.analysisCategory);return;}
    if (a.itemStep) {const {type,id}=ui.dialogItem||{};if(!type)return;const list=itemOrder(type),next=list[list.findIndex(entry=>entry.id===id)+Number(a.itemStep)];if(next){showItem(type,next.id);if(button.disabled)$('itemStep').querySelector('button:not(:disabled)')?.focus();}return;}
    if (a.taskEdit) {button.focus();showItem('tasks',a.taskEdit);return;}
    if ('transitionNotes' in a) { button.focus(); showBarrierNotes('transitions'); return; }
    if (a.transitionView) { ui.transitionView=a.transitionView; renderFocus('data-transition-view',a.transitionView); return; }
    if ('barrierNotes' in a) { button.focus(); showBarrierNotes(); return; }
    if (a.barrierView) { ui.barrierView=a.barrierView; renderFocus('data-barrier-view',a.barrierView); return; }
    if (a.barrierEdit) { button.focus(); showItem(a.assessmentType||'barriers',a.barrierEdit); return; }
    if (a.close) { closeDialog(a.close); return; }
    if(a.taskFilter){ui.filter=a.taskFilter;ui.view='cards';renderFocus('data-task-filter',a.taskFilter);return;}
    if (a.page) { ui.page = a.page; status(''); syncRoute(true); render(); window.scrollTo({top:0,behavior:'instant'}); $('main').focus({ preventScroll: true }); return; }
    if (a.view) { ui.view = a.view; renderFocus('data-view',a.view); return; }
    if (a.level) { ui.level = Number(a.level); renderFocus('data-level',a.level); return; }
    if (a.category) { ui.category = a.category; renderFocus('data-category',a.category); return; }
    if (a.group) { ui.group = Number(a.group); renderFocus('data-group',a.group); if(ui.page==='eesa') $('eesa-form-group-'+ui.group)?.scrollIntoView({block:'start'}); return; }
    if (a.eesaEdit) { button.focus(); showItem('eesa',a.eesaEdit); return; }
    if (a.edit) { button.focus(); editItem(a.edit); return; }
    if (a.score !== undefined) { try { M.setScore(s, a.type, getItem(a.type, a.id), Number(a.score)); if (a.type === 'eesa') M.syncEchoic(s, D); refreshScores(a.type, a.id); } catch (error) { status(tr('Add and verify this item’s criteria before scoring.', 'أضف معايير هذا البند وتحقق منها قبل التسجيل.')); } return; }
    if (a.clearScore) { M.clearScore(s, a.type, a.clearScore); if (a.type === 'eesa') M.syncEchoic(s, D); refreshScores(a.type, a.clearScore); return; }
    if (a.stimulus) { showImage(a.stimulus); return; }
    if (a.imageStep) { showImage(ui.imageId, ui.imageIndex + Number(a.imageStep)); return; }
    if(a.reportSectionLayout){s.reportLayouts[a.reportSectionLayout]=a.layout;render();document.querySelector(`[data-report-section-layout="${a.reportSectionLayout}"][data-layout="${a.layout}"]`)?.focus();save();return;}
    if(a.reportLayout){s.reportLayouts={};s.reportLayout=a.reportLayout;render();document.querySelector(`[data-report-layout="${a.reportLayout}"]`)?.focus();save();return;}
    if(a.reportOption){s[a.reportOption]=!s[a.reportOption];render();document.querySelector(`[data-report-option="${a.reportOption}"]`)?.focus();save();return;}
    if ('pdf' in a) {
      if (!validateDates()) return; const exportState=reportState();button.disabled = true; status(tr('Preparing PDF…', 'جار تجهيز PDF…'));
      try { await window.VBPDF.export(R.make(exportState, D), exportState, `VB-MAPP-${exportState.child.name.replace(/[\\/:*?"<>|]/g,'-')}-${exportState.date}-${exportState.reportLang}.pdf`, progress => status(tr(`Preparing PDF: ${progress}`, `جار تجهيز PDF: ${progress}`))); status(tr('PDF downloaded.', 'تم تنزيل ملف PDF.')); }
      catch (error) { console.error(error); status(tr('PDF export could not finish. Try again.', 'تعذر إكمال تصدير PDF. أعد المحاولة.')); }
      finally { button.disabled = false; } return;
    }

  });
  document.addEventListener('input', event => {
    const node = event.target, binding = node.dataset.bind, key = node.dataset.key;
    if(s.completedAt&&binding)return;
    if(node.id==='goalBankSearch'){bankFilters.query=node.value;bankFilters.page=0;$('goalBankResults').innerHTML=bankResults();return;}
    if (binding === 'child') { if (key === 'name') return; s.child[key] = node.value; }
    else if (binding === 'state') s[key] = key === 'color' ? M.validColor(node.value) : node.value;
    else if (binding === 'comment') s.comments[key] = node.value;
    else if (binding === 'criterionText' || binding === 'criterionScoring') {
      const type = D.transitions.some(item => item.id === key) ? 'transitions' : 'milestones', item = getItem(type, key);
      s.customCriteria[key] ||= { text: item.requiresCriteria || item.guide ? M.itemText(item, s, s.lang) : '', scoring: '' };
      s.customCriteria[key][binding === 'criterionText' ? 'text' : 'scoring'] = node.value;
      delete s.scoreReviews[key];
      refreshScores(type, key);
    }
    else if (node.id === 'analysisSearch') {ui.analysisSearch=node.value;$('analysisContent').innerHTML=analysisContent();return;}
    else if (node.id === 'taskSearch') { ui.search = node.value; $('taskCards').innerHTML = milestoneTaskForms(taskList()); return; }
    else return;
    $('caseBadge').textContent=''; updatePreview(); delayedSave();
  });
  document.addEventListener('change', async event => {
    const node = event.target;
    if (node.dataset.scope) { s.reportScope[node.dataset.scope] = node.checked; render(); document.querySelector(`[data-scope="${node.dataset.scope}"]`)?.focus(); save(); }
    else if (node.id === 'includeUnassessed' || node.id === 'reportDetails') { s[node.id] = node.checked; updatePreview(); save(); }
  });
  $('goalEditForm').addEventListener('submit',event=>{
    event.preventDefault();if(!goalEditor)return;const form=new FormData(event.currentTarget),value=String(form.get('goal')||'').trim();if(!value)return;
    const {key,item,plan}=goalEditor;s.goals[key]={...plan,goal:value,criterion:String(form.get('criterion')||''),support:plan.support||'',review:String(form.get('review')||''),selected:form.has('selected'),criteriaReview:form.has('reviewed')&&M.hasScore(s,'milestones',item)?M.reviewKey(item,s):'',itemId:item.id};
    s.iepExcluded=(s.iepExcluded||[]).filter(id=>id!==item.id);save();render();closeDialog('goalEditDialog');Array.from(document.querySelectorAll('[data-goal-edit]')).find(n=>n.dataset.goalEdit===key)?.focus();goalEditor=null;
  });
  $('language').addEventListener('click', () => { s.lang = s.lang === 'ar' ? 'en' : 'ar'; s.reportLang=s.lang; render(); save(); });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('cancel', event => { if (dialog.id === 'accountDialog') return; event.preventDefault(); closeDialog(dialog.id); });
    dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open'); });
  });
  document.addEventListener('keydown', event => {
    const dialog = [...document.querySelectorAll('dialog[open]')].pop(); if (!dialog || !dialog.classList.contains('fallback')) return;
    if (event.key === 'Escape') closeDialog(dialog.id);
    if (event.key === 'Tab') { const controls = [...dialog.querySelectorAll('button:not(:disabled),input,textarea,select,a[href]')]; const first = controls[0], last = controls.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
  });
  window.addEventListener('popstate',()=>{
    const page=pageFromHistory();if(!page)return;
    document.querySelectorAll('dialog[open]').forEach(dialog=>{if(dialog.id!=='accountDialog'&&dialog.id!=='parent-gate')closeDialog(dialog.id);});
    if(page===ui.page)return;
    ui.page=page;status('');render();$('main').focus({preventScroll:true});
  });
  document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();$('main').focus();});
  document.addEventListener('toggle',event=>{if(event.target.matches?.('.protocol-meta-toggle'))ui.metaOpen=event.target.open;},true);
  // An installed app has no browser chrome to return from the forms directory.
  if(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true)$('backToForms').hidden=true;
  function viewport() { document.documentElement.style.setProperty('--app-height', `${window.visualViewport?.height || window.innerHeight}px`); }
  window.visualViewport?.addEventListener('resize', viewport); window.addEventListener('resize', viewport); viewport();
  window.addEventListener('resize', keepActiveTabsVisible);
  window.addEventListener('pagehide', save);
  render();
  if (!loadMessage) save();
  // Read-only developer diagnostics for content coverage and automated QA.
  window.VBApp = {
    snapshot: () => M.normalize(s), gridCount: () => M.allMilestones(D).length,
    selectAccount(id) { if (!save()) return; window.VBAccounts.select(id); location.reload(); },
    createAccount(name) { if (!save()) throw Error(tr('Could not save. Retry before switching.', 'تعذر الحفظ. أعد المحاولة قبل تبديل الحساب.')); window.VBAccounts.add(name, accountId ? null : s); location.reload(); }
  };
  window.addEventListener('storage', event => {
    if (event.key === window.VBAccounts.KEY || event.key === null) {
      clearTimeout(saveTimer);
      // Never let an old tab restore another account or a deleted child's data.
      loadMessage = 'account-changed'; location.reload();
    }
  });
})();
