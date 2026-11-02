(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VBModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);
  const safeText = value => typeof value === 'string' ? value : '';
  const validColor = color => /^#[0-9a-f]{6}$/i.test(color || '') ? color : '#246b86';
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const allowed = { milestones: [0, .5, 1], barriers: [0, 1, 2, 3, 4], transitions: [1, 2, 3, 4, 5], eesa: [0, .5, 1], tasks: [0, 1] };
  const newId = () => typeof globalThis.crypto?.randomUUID === 'function' ? globalThis.crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  function blank() {
    return { version: 2, child: { name: '', dob: '', tester: '', language: '', guardian: '', reason: '', setting: '', relevant: '' },
      date: today(), completedAt: '', number: '1', color: '#246b86', lang: 'ar', reportLang: 'ar',
      scores: { milestones: {}, barriers: {}, transitions: {}, eesa: {}, tasks: {} },
      comments: {}, clinical: '', recommendations: '', goals: {}, iepExcluded: [], customCriteria: {}, scoreReviews: {}, echoicModes: {},
      reportScope: { milestones: true, barriers: true, transitions: true, eesa: true, tasks: true, goals: true },
      includeUnassessed: false, reportDetails: false, reportLayout:'tables', reportLayouts: {}, migration: '', legacy: null,
      assessmentId: newId(), caseId: newId(), baselineId: '', history: [], importSource: '' };
  }
  function normalizeRecord(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('Invalid assessment data');
    const s = blank();
    for (const key of Object.keys(s.child)) s.child[key] = safeText(raw.child?.[key]);
    for (const key of ['clinical', 'recommendations', 'number', 'date', 'completedAt', 'migration', 'assessmentId', 'caseId', 'importSource']) if (typeof raw[key] === 'string') s[key] = raw[key];
    s.reportLayout=raw.reportLayout==='tasks'?'tasks':'tables';
    for (const type of Object.keys(allowed)) if (['tables','tasks'].includes(raw.reportLayouts?.[type])) s.reportLayouts[type]=raw.reportLayouts[type];
    if(typeof raw.reportScope?.goals==='boolean')s.reportScope.goals=raw.reportScope.goals;
    s.color = validColor(raw.color);
    s.lang = raw.lang === 'en' ? 'en' : 'ar'; s.reportLang = raw.reportLang === 'en' ? 'en' : 'ar';
    for (const type of Object.keys(allowed)) {
      const source = raw.scores?.[type];
      if (source && typeof source === 'object' && !Array.isArray(source)) for (const [id, value] of Object.entries(source)) {
        if (allowed[type].includes(value)) s.scores[type][id] = value;
        else if (type === 'tasks' && typeof value === 'boolean') s.scores.tasks[id] = value ? 1 : 0;
      }
      if (typeof raw.reportScope?.[type] === 'boolean') s.reportScope[type] = raw.reportScope[type];
    }
    for (const [key, value] of Object.entries(raw.comments || {})) if (typeof value === 'string') s.comments[key] = value;
    for (const [id, value] of Object.entries(raw.customCriteria || {})) if (value && typeof value === 'object') s.customCriteria[id] = { text: safeText(value.text), scoring: safeText(value.scoring) };
    for (const [id, value] of Object.entries(raw.goals || {})) if (value && typeof value === 'object') s.goals[id] = { selected: value.selected === true, goal: safeText(value.goal), criterion: safeText(value.criterion), review: safeText(value.review), support: safeText(value.support), criteriaReview: safeText(value.criteriaReview), itemId:safeText(value.itemId), bankId:safeText(value.bankId), sourceId:safeText(value.sourceId) };
    for (const [id, value] of Object.entries(raw.scoreReviews || {})) if (typeof value === 'string') s.scoreReviews[id] = value;
    for (const [id, mode] of Object.entries(raw.echoicModes || {})) if (/^e(?:1-[1-5]|2-(?:[6-9]|10))$/.test(id) && ['auto','manual'].includes(mode)) s.echoicModes[id] = mode;
    s.iepExcluded=Array.isArray(raw.iepExcluded)?[...new Set(raw.iepExcluded.filter(id=>typeof id==='string'))]:[];
    s.includeUnassessed = raw.includeUnassessed === true; s.reportDetails = raw.reportDetails === true; s.legacy = raw.legacy && typeof raw.legacy === 'object' ? raw.legacy : null;
    return s;
  }
  function snapshot(raw) { const copy = normalizeRecord(raw); delete copy.history; delete copy.baselineId; return copy; }
  function normalize(raw) {
    const s = normalizeRecord(raw), ids = new Set();
    if (Array.isArray(raw.history)) for (const record of raw.history) {
      if (!record || typeof record !== 'object' || !record.scores || record.caseId !== s.caseId || !record.assessmentId || record.assessmentId === s.assessmentId || ids.has(record.assessmentId)) continue;
      ids.add(record.assessmentId); s.history.push(snapshot(record));
    }
    s.baselineId = typeof raw.baselineId === 'string' && ids.has(raw.baselineId) ? raw.baselineId : '';
    return s;
  }
  function previous(s) { return s.history?.find(record => record.assessmentId === s.baselineId) || null; }
  function startFollowup(raw, date = today(), source = '') {
    const old = normalize(raw), s = blank();
    s.caseId = old.caseId; s.child = { ...old.child }; s.date = date;
    s.number = String(/^\d+$/.test(old.number) ? Number(old.number) + 1 : old.history.length + 2);
    s.lang = old.lang; s.reportLang = old.reportLang; s.reportScope = { ...old.reportScope }; s.reportLayout=old.reportLayout; s.reportLayouts={...old.reportLayouts};
    s.customCriteria = JSON.parse(JSON.stringify(old.customCriteria));
    s.history = old.history.concat(snapshot(old)); s.baselineId = old.assessmentId;
    s.color = ['#246b86', '#7656a1', '#387b56', '#a96a22'][s.history.length % 4];
    s.importSource = source || old.importSource;
    return s;
  }
  function comparison(s, type, item) {
    const old = previous(s), current = hasScore(s, type, item) ? s.scores[type][item.id] : null;
    const before = old && hasScore(old, type, item) ? old.scores[type][item.id] : null;
    const comparable = before !== null && current !== null && reviewKey(item, old) === reviewKey(item, s);
    return { before, current, comparable, change: comparable ? current - before : null,
      status: current === null ? (before === null ? 'unassessed' : 'retest') : before === null ? 'new' : !comparable ? 'criteria-changed' : current > before ? 'higher' : current < before ? 'lower' : 'same' };
  }
  function progress(s, data, type = 'milestones') {
    const result = { higher:0, lower:0, same:0, new:0, retest:0, unassessed:0, 'criteria-changed':0, pairedPrevious:0, pairedCurrent:0 };
    for (const item of records(data, type)) {
      const c = comparison(s, type, item); result[c.status]++;
      if (c.comparable) { result.pairedPrevious += c.before; result.pairedCurrent += c.current; }
    }
    return result;
  }
  function migrate(child, session, clinical) {
    const s = normalize({ child: child || {}, date: session?.date || today(), number: String(session?.id || '1'), color: session?.color, scores: session?.scores || {}, clinical: clinical || '' });
    s.legacy = { child: child || {}, session: session || {}, clinical: clinical || '' };
    s.migration = 'legacy-auto-scores';
    return s;
  }
  function allMilestones(data) {
    return data.milestones.concat(data.additionalMilestones || [6, 7, 8, 9, 10].map(n => ({ id: `i2-${n}`, category: 'Imitation', level: 2, milestone: n, missing: true,
      text: { en: 'Level 2 motor imitation', ar: 'التقليد الحركي - المستوى الثاني' } })));
  }
  function records(data, type) { return type === 'milestones' ? allMilestones(data) : data[type] || []; }
  function milestoneGuidance(item) {
    // Reviewed tasks retain the complete supplied guidance as source text.
    // Never substitute an old scoring rule for the verified current criterion.
    const source = item.original || item;
    return {
      text: source.text,
      objective: source.objective || {
        en: 'The original objective was not included in the supplied file. Enter the item description from your guide in the field below.',
        ar: 'الهدف الأصلي غير موجود في الملف المرفق. أدخل وصف البند من دليلك في الحقل أدناه.'
      },
      application: source.application || {
        en: 'The original administration instructions were not included in the supplied file. Use the materials, trials and prompting conditions specified for this item in your guide.',
        ar: 'طريقة التطبيق الأصلية غير موجودة في الملف المرفق. استخدم المواد والمحاولات وشروط تقديم المساعدة المحددة لهذا البند في دليلك.'
      },
      scoring: source.scoring || {
        en: 'The original scoring criteria were not included in the supplied file. Enter verified full and half-point criteria in the scoring field below before recording a result.',
        ar: 'معايير التسجيل الأصلية غير موجودة في الملف المرفق. أدخل معايير النقطة الكاملة ونصف النقطة المتحقق منها في حقل المعايير أدناه قبل تسجيل النتيجة.'
      }
    };
  }
  function taskGuidance(item) { return item.guide || milestoneGuidance(item); }
  function needsCriteria(item) { return Boolean(item.missing || item.requiresCriteria); }
  function eligible(item, s) { if(item.derivedFrom){const st=stats(s,item.derivedItems,item.derivedFrom);return st.total>0&&st.assessed===st.total;} return !needsCriteria(item) || Boolean(s.customCriteria[item.id]?.text.trim() && s.customCriteria[item.id]?.scoring.trim()); }
  function reviewKey(item, s) {
    if(item.derivedFrom){const st=stats(s,item.derivedItems,item.derivedFrom);return JSON.stringify(['transition-totals-v1',item.derivedFrom,st.assessed,st.score]);}
    if (item.manualRevision) return JSON.stringify(needsCriteria(item) ? [item.manualRevision, item.scoring.en, s.customCriteria[item.id]?.text || '', s.customCriteria[item.id]?.scoring || ''] : [item.manualRevision, item.scoring.en]);
    if (!needsCriteria(item)) return '';
    const criterion = s.customCriteria[item.id] || {};
    return JSON.stringify([item.revision || 'guide-criteria-v1', criterion.text || '', criterion.scoring || '']);
  }
  function currentPlan(s, item, plan) {
    if (!reviewKey(item, s)) return true;
    const legacy = !plan?.criteriaReview && !s.scoreReviews?.[item.id] && item.legacyScores?.includes(s.scores.milestones[item.id]);
    return Boolean(hasScore(s, 'milestones', item) && (plan?.criteriaReview === reviewKey(item, s) || legacy));
  }
  function validScore(type, item, value) {
    return Boolean(item && allowed[type]?.includes(value) && !(value === .5 && ((type === 'milestones' && !halfAllowed(item)) || (type === 'eesa' && item.group === 5))));
  }
  function hasScore(s, type, item) {
    return own(s.scores[type], item.id) && eligible(item, s) && validScore(type, item, s.scores[type][item.id]) && (!reviewKey(item, s) || s.scoreReviews?.[item.id] === reviewKey(item, s) || (item.manualRevision && !s.scoreReviews?.[item.id] && item.legacyScores?.includes(s.scores[type][item.id])));
  }
  function stats(s, list, type) {
    const result = { total: list.length, available: 0, assessed: 0, score: 0, full: 0, half: 0, zero: 0, unassessed: 0, missing: 0, pending: 0 };
    for (const item of list) {
      if (own(s.scores[type], item.id) && !hasScore(s, type, item)) result.pending++;
      if (!eligible(item, s)) { result.missing++; continue; }
      result.available++;
      if (!own(s.scores[type], item.id)) { result.unassessed++; continue; }
      const value = s.scores[type][item.id];
      if (!hasScore(s, type, item)) { result.unassessed++; continue; }
      result.assessed++; result.score += value;
      if (value === 0) result.zero++; if (value === .5) result.half++; if (value === 1) result.full++;
    }
    return result;
  }
  function itemText(item, s, lang) {
    const entered = needsCriteria(item) && s.customCriteria[item.id]?.text;
    // A prefilled reviewed summary keeps its bilingual source text. Actual edits
    // retain the assessor's language rather than being translated implicitly.
    if (entered && ((!item.requiresCriteria && !item.guide) || !Object.values(item.text || {}).includes(entered))) return entered;
    return item.text?.[lang] || item.name?.[lang] || item.id;
  }
  function itemScoring(item, s, lang) { return needsCriteria(item) ? s.customCriteria[item.id]?.scoring || '' : item.scoring?.[lang] || ''; }
  function halfAllowed(item) { return typeof item.allowHalf === 'boolean' ? item.allowHalf : !/no (?:1\/2|half)/i.test(item.scoring?.en || ''); }
  function setScore(s, type, item, value) {
    if (!validScore(type, item, value) || !eligible(item, s)) throw Error('Invalid score for item');
    if (type === 'milestones' && /^e(?:1-[1-5]|2-(?:[6-9]|10))$/.test(item.id)) { s.echoicModes ||= {}; s.echoicModes[item.id] = 'manual'; }
    s.scores[type][item.id] = value;
    if (reviewKey(item, s)) s.scoreReviews[item.id] = reviewKey(item, s);
  }
  function clearScore(s, type, id) { if (type === 'milestones' && /^e(?:1-[1-5]|2-(?:[6-9]|10))$/.test(id)) { s.echoicModes ||= {}; s.echoicModes[id] = 'manual'; } delete s.scores[type][id]; delete s.scoreReviews[id]; }
  // Only the current visit is synchronized. A manual score (including blank)
  // stays manual until the assessor explicitly restores its EESA link.
  function syncEchoic(s, data) {
    s.echoicModes ||= {};
    const entries = records(data, 'eesa'), scored = entries.filter(item => hasScore(s, 'eesa', item));
    const total = scored.reduce((sum,item) => sum + s.scores.eesa[item.id], 0);
    const group1 = scored.filter(item => item.group === 1).reduce((sum,item) => sum + s.scores.eesa[item.id], 0);
    const group2 = scored.filter(item => item.group === 2).reduce((sum,item) => sum + s.scores.eesa[item.id], 0);
    const group45 = scored.filter(item => item.group === 4 || item.group === 5).reduce((sum,item) => sum + s.scores.eesa[item.id], 0);
    const complete = entries.length > 0 && scored.length === entries.length;
    const thresholds = [[2,1],[5,3],[10,7],[15,12],[25,20],[50,40],[60,55],[70,65],[80,75],[90,85]];
    for (let n = 1; n <= 10; n++) {
      const id = n <= 5 ? `e1-${n}` : `e2-${n}`, item = allMilestones(data).find(entry => entry.id === id);
      if (!item) continue;
      // Existing assessments predate this feature: keep their entered marks.
      if (!s.echoicModes[id]) s.echoicModes[id] = own(s.scores.milestones,id) ? 'manual' : 'auto';
      if (s.echoicModes[id] === 'manual') continue;
      const [full,half] = thresholds[n-1];
      const fullGroup = n === 5 ? group1 >= 20 : n === 6 ? group2 >= 20 : n === 10 ? group45 >= 10 : true;
      const halfGroup = n === 5 ? group1 >= 15 : n === 6 ? group2 >= 15 : n === 10 ? group45 >= 10 : true;
      const value = total >= full && fullGroup ? 1
        : total >= half && halfGroup ? .5 : complete ? 0 : null;
      // Incomplete EESA evidence may establish a threshold, but missing items
      // never establish a failed milestone. Explicit all-zero EESA can do so.
      if (value === null) { delete s.scores.milestones[id]; delete s.scoreReviews[id]; }
      else { s.scores.milestones[id] = value; s.scoreReviews[id] = reviewKey(item,s); }
    }
    return { total, group1, group2, group45, complete };
  }
  function syncTransitionTotals(s,data) {
    for(const item of data.transitions.filter(i=>i.derivedFrom)){
      const st=stats(s,item.derivedItems,item.derivedFrom);
      if(st.total===0||st.assessed!==st.total)continue;
      const value=item.derivedFrom==='milestones' ? st.score<=25?1:st.score<=50?2:st.score<=100?3:st.score<=135?4:5
        : st.score>=56?1:st.score>=31?2:st.score>=21?3:st.score>=11?4:5;
      s.scores.transitions[item.id]=value;s.scoreReviews[item.id]=reviewKey(item,s);
    }
  }
  function restoreEchoic(s, data, id) {
    if (!/^e(?:1-[1-5]|2-(?:[6-9]|10))$/.test(id)) return;
    s.echoicModes ||= {}; s.echoicModes[id] = 'auto'; syncEchoic(s,data);
  }
  function goals(s, data) {
    const result = [];
    if (!s.reportScope.milestones) return result;
    for (const category of data.categories) {
      const list = allMilestones(data).filter(i => i.category === category && eligible(i, s)).sort((a, b) => a.milestone - b.milestone);
      const target = list.find(i => hasScore(s, 'milestones', i) && s.scores.milestones[i.id] < 1);
      if (target) result.push({ item: target, baseline: s.scores.milestones[target.id], nextProbe: false });
      else if (list.some(i => hasScore(s, 'milestones', i) && s.scores.milestones[i.id] === 1)) {
        const next = list.find(i => !hasScore(s, 'milestones', i));
        if (next) result.push({ item: next, baseline: null, nextProbe: true });
      }
    }
    return result;
  }
  function suggestedActions(s, data, lang) {
    const pick = (en, ar) => lang === 'ar' ? ar : en;
    const actions = [];
    const selectedTypes = Object.keys(allowed).filter(type => s.reportScope[type]);
    if (!selectedTypes.some(type => stats(s, records(data, type), type).assessed)) return [pick('No scored assessment data yet. Collect observations before selecting goals or placement.', 'لا توجد نتائج مسجلة بعد. اجمع الملاحظات قبل تحديد الأهداف أو البيئة التعليمية.')];
    if (s.reportScope.milestones) {
      const gaps = goals(s, data).filter(g => !g.nextProbe);
      if (gaps.length) actions.push(pick('Review the recorded emerging and not-met milestones below. Select functional priorities with the family and confirm the item-specific criteria before teaching.', 'راجع المهارات الناشئة والبنود غير المتحققة المسجلة أدناه. اختر الأولويات الوظيفية مع الأسرة وتحقق من معايير كل بند قبل التدريس.'));
      if (goals(s, data).some(g => g.nextProbe)) actions.push(pick('Some domains have recorded strengths but no assessed gap. Probe the next unassessed items before defining a new goal.', 'توجد نقاط قوة مسجلة في بعض المجالات دون صعوبة مُقيّمة. افحص البنود التالية غير المقيمة قبل تحديد هدف جديد.'));
    }
    if (s.reportScope.barriers) {
      const barriers = data.barriers.filter(i => hasScore(s, 'barriers', i) && s.scores.barriers[i.id] >= 2);
      if (barriers.length) actions.push(pick(`Further clinical / behavioral analysis is indicated for the ${barriers.length} recorded barriers rated 2 or higher. Plan support based on the observed function and learning context.`, `تحتاج العوائق المسجلة بدرجة 2 أو أكثر (${barriers.length}) إلى تحليل سريري / سلوكي إضافي. خطط للدعم وفق الوظيفة الملحوظة وسياق التعلم.`));
    }
    if (s.reportScope.transitions && data.transitions.some(i => hasScore(s, 'transitions', i) && s.scores.transitions[i.id] <= 2)) actions.push(pick('Review the lower-rated transition areas individually and collect observations in the proposed setting. Placement remains an individualized team decision.', 'راجع مجالات الانتقال ذات الدرجات المنخفضة كلّاً على حدة واجمع الملاحظات في البيئة المقترحة. يبقى اختيار البيئة التعليمية قراراً فردياً للفريق.'));
    if (!actions.length) actions.push(pick('Document generalization, independence, and participation across people and settings. Use the recorded profile and family priorities to plan follow-up.', 'وثّق التعميم والاستقلال والمشاركة عبر أشخاص وبيئات مختلفة. استخدم الملف المسجل وأولويات الأسرة لتخطيط المتابعة.'));
    return actions;
  }
  function ageOn(dob, date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const a = new Date(dob + 'T12:00:00'), b = new Date(date + 'T12:00:00');
    if (isNaN(a) || isNaN(b) || a > b || a.toISOString().slice(0, 10) !== dob || b.toISOString().slice(0, 10) !== date) return null;
    let months = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
    if (b.getDate() < a.getDate()) months--;
    return months;
  }
  return { syncEchoic, syncTransitionTotals, restoreEchoic, own, today, blank, normalize, snapshot, previous, startFollowup, comparison, progress, migrate, allMilestones, records, milestoneGuidance, taskGuidance, stats, goals, suggestedActions, itemText, itemScoring, halfAllowed, needsCriteria, eligible, reviewKey, currentPlan, validScore, hasScore, setScore, clearScore, ageOn, allowed, validColor };
});
