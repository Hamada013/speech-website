import { COHORTS } from './validation.js';

export const OUTCOMES = {
    target: 'الكلمة المستهدفة', phonological: 'مشتت صوتي', semantic: 'مشتت دلالي', unrelated: 'مشتت غير مرتبط',
    notMastered: 'غير متقن', learning: 'قيد التعلم', mastered: 'متقن', skip: 'لم يُقيّم'
};
const scoreOf = record => record.outcome === 'target' || record.outcome === 'mastered' ? 1 : record.outcome === 'learning' ? .5 : 0;
const percent = (part, total) => total ? Math.round(part / total * 1000) / 10 : null;
export const formatPercent = value => value === null ? '—' : `${value.toFixed(1)}%`;
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const deltaText = value => value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(1)} نقطة مئوية`;

function metric(records) {
    const scored = records.filter(r => r.outcome !== 'skip');
    const mastered = scored.filter(r => scoreOf(r) === 1).length;
    const learning = scored.filter(r => r.outcome === 'learning').length;
    return { assessed: scored.length, skipped: records.length - scored.length, mastered, learning,
        accuracy: percent(mastered, scored.length), weighted: percent(scored.reduce((sum, r) => sum + scoreOf(r), 0), scored.length) };
}
export function analyze(session) {
    const overall = metric(session.records);
    const brackets = COHORTS.map(cohort => ({ ...cohort, ...metric(session.records.filter(r => r.cohort === cohort.id)),
        eligible: session.eligible[cohort.id] || 0, planned: session.plan.filter(item => item.cohort === cohort.id).length }));
    const errors = ['phonological', 'semantic', 'unrelated'].map(type => ({ type,
        count: session.records.filter(r => r.outcome === type).length }));
    const errorTotal = errors.reduce((sum, error) => sum + error.count, 0);
    for (const error of errors) error.percentage = percent(error.count, errorTotal);
    // A transparent criterion band, never a manufactured age in months. Samples,
    // partial sessions, skipped items, or single-cohort tests cannot establish it.
    let attainment = 'غير مقدّر — يلزم إكمال جميع الكلمات في الفئات الأربع دون تخطي.';
    if (session.scope === 'full' && session.sampling === 'all' && session.status === 'complete' &&
        brackets.every(b => b.assessed >= 5 && b.assessed === b.eligible && b.skipped === 0)) {
        let highest = null;
        for (const bracket of brackets) { if (bracket.accuracy < 80) break; highest = bracket; }
        attainment = highest ? `${highest.label} (٨٠٪ على الأقل في هذه الفئة وكل الفئات السابقة)` : 'لم تحقق أي فئة معيار ٨٠٪ المتتالي.';
    }
    return { overall, brackets, errors, errorTotal, attainment, languageAgeEquivalent: null,
        prompted: session.records.filter(r => r.audioPlayed).length };
}

export function compare(current, previous) {
    if (!previous) return { compatible: false, reason: 'لم يُحدد تقييم سابق للمقارنة.' };
    if (current.metadata.childId.trim().toLowerCase() !== previous.metadata.childId.trim().toLowerCase()) return { compatible: false, reason: 'رمز الطفل مختلف؛ لا يمكن مقارنة النتائج.' };
    if (current.mode !== previous.mode) return { compatible: false, reason: 'نوع التقييم مختلف؛ قارن تقييمين من النوع نفسه.' };
    if (current.audioMode !== previous.audioMode) return { compatible: false, reason: 'شروط الصوت مختلفة؛ لا يمكن مقارنة التسمية المستقلة بالتسمية بعد النموذج.' };
    if (previous.metadata.assessmentDate > current.metadata.assessmentDate) return { compatible: false, reason: 'التقييم المحدد للمقارنة أحدث من التقييم الحالي.' };
    const prior = new Map(previous.records.filter(r => r.outcome !== 'skip').map(r => [r.targetId, r]));
    const shared = current.records.filter(r => r.outcome !== 'skip' && prior.has(r.targetId)).filter(r => {
        const old = prior.get(r.targetId);
        return r.cohort === old.cohort && r.itemRevision === old.itemRevision && r.audioPlayed === old.audioPlayed;
    });
    if (!shared.length) return { compatible: false, reason: 'لا توجد كلمات مشتركة تتطابق في الفئة العمرية والصور وشروط الصوت.' };
    const rows = COHORTS.map(cohort => {
        const now = shared.filter(r => r.cohort === cohort.id);
        const before = now.map(r => prior.get(r.targetId));
        const a = metric(now), b = metric(before);
        return { ...cohort, count: now.length, current: a.accuracy, previous: b.accuracy,
            delta: a.accuracy === null ? null : Math.round((a.accuracy - b.accuracy) * 10) / 10,
            weightedDelta: a.weighted === null ? null : Math.round((a.weighted - b.weighted) * 10) / 10 };
    });
    const now = metric(shared), before = metric(shared.map(r => prior.get(r.targetId)));
    return { compatible: true, rows, count: shared.length, current: now.accuracy, previous: before.accuracy,
        delta: Math.round((now.accuracy - before.accuracy) * 10) / 10,
        days: Math.round((Date.parse(current.metadata.assessmentDate) - Date.parse(previous.metadata.assessmentDate)) / 86400000), previousDate: previous.metadata.assessmentDate };
}

function bar(label, current, previous = null) {
    return `<div class="chart-row"><div class="chart-label">${escape(label)} <span>${formatPercent(current)}${previous === null ? '' : ` / ${formatPercent(previous)} سابقاً`}</span></div>
        <div class="bar-track"><div class="bar-current" style="width:${current ?? 0}%"></div></div>
        ${previous === null ? '' : `<div class="bar-track baseline"><div class="bar-previous" style="width:${previous}%"></div></div>`}</div>`;
}
function chronologicalAge(metadata) {
    if (!metadata.birthDate) return 'غير مسجل';
    const birth = new Date(`${metadata.birthDate}T12:00:00`), evaluation = new Date(`${metadata.assessmentDate}T12:00:00`);
    let months = (evaluation.getFullYear() - birth.getFullYear()) * 12 + evaluation.getMonth() - birth.getMonth();
    if (evaluation.getDate() < birth.getDate()) months--;
    return `${Math.floor(months / 12)} سنة و${months % 12} شهر`;
}
export function renderReport(container, session, baseline = null, companion = null) {
    const result = analyze(session), comparison = compare(session, baseline);
    const name = session.mode === 'receptive' ? 'اللغة الاستقبالية' : 'اللغة التعبيرية';
    const heading = session.mode === 'receptive' ? 'الاختيارات الصحيحة' : 'الكلمات المتقنة';
    container.innerHTML = `<article class="clinical-report">
        <header class="report-heading"><div><p class="eyebrow">تقييم المفردات</p><h1>${name}</h1><p>${escape(session.metadata.assessmentDate)} · ${escape(({ complete: "مكتمل", partial: "جزئي", draft: "قيد التنفيذ" })[session.status])} · ${escape(session.id)}</p></div><span class="report-badge">تقييم وصفي</span></header>
        <dl class="metadata-grid">
            <div><dt>الطفل / الرمز</dt><dd>${escape(session.metadata.childName || 'غير مسجل')} / ${escape(session.metadata.childId)}</dd></div>
            <div><dt>العمر الزمني</dt><dd>${escape(chronologicalAge(session.metadata))}</dd></div>
            <div><dt>الفاحص</dt><dd>${escape(session.metadata.examiner || 'غير مسجل')}</dd></div>
            <div><dt>اللغة / اللهجة</dt><dd>${escape(session.metadata.languages || 'غير مسجل')}</dd></div>
            <div><dt>الفئة / العينة</dt><dd>${escape(session.scope === 'full' ? 'جميع الفئات' : COHORTS.find(c => c.id === session.scope)?.label)} / ${escape(session.sampling === 'all' ? 'جميع الكلمات' : `${session.sampling} كلمة لكل فئة`)}</dd></div>
            <div><dt>شروط الصوت</dt><dd>${escape(({ modeled: "بعد نموذج صوتي", unprompted: "تسمية مستقلة", "spoken-prompt": "كلمة مسموعة" })[session.audioMode])} · ${result.prompted} كلمة مع نموذج صوتي</dd></div>
        </dl>
        <section class="report-section"><h2>نتائج التقييم</h2><div class="metric-grid">
            <div><strong>${formatPercent(result.overall.accuracy)}</strong><span>${heading}</span></div>
            <div><strong>${result.overall.assessed}</strong><span>كلمات مقيّمة / ${session.plan.length} مخططة</span></div>
            <div><strong>${result.overall.skipped}</strong><span>لم تُقيّم (لا تدخل في الدقة)</span></div>
            ${session.mode === 'expressive' ? `<div><strong>${formatPercent(result.overall.weighted)}</strong><span>المؤشر الموزون: متقن ١، قيد التعلم ٠٫٥</span></div>` : ''}
        </div>
        ${companion ? `<p>التقييم الآخر في هذا التاريخ: ${companion.mode === "receptive" ? "اللغة الاستقبالية" : "اللغة التعبيرية"} — ${formatPercent(analyze(companion).overall.accuracy)} (${analyze(companion).overall.assessed} كلمة مقيّمة؛ تقييم منفصل).</p>` : ''}
        <div class="interpretation"><strong>الفئة المحققة في القائمة:</strong> ${escape(result.attainment)}<br><strong>العمر اللغوي المعياري:</strong> غير متاح. هذه قوائم وصفية وليست اختباراً معيارياً للعمر اللغوي. التسمية بعد سماع الكلمة لا تقيس التسمية المستقلة.</div></section>
        <section class="report-section"><h2>الأداء حسب الفئة العمرية</h2><p>تُحسب الدقة من الكلمات الصحيحة أو المتقنة. تُعرض الكلمات قيد التعلم بشكل منفصل.</p>
        <div class="charts" aria-label="الأداء حسب العمر">${result.brackets.map(b => bar(b.label, b.accuracy)).join('')}</div>
        <div class="table-scroll"><table><caption>النتائج وتغطية الاختبار</caption><thead><tr><th>الفئة العمرية</th><th>المقيّم / المتاح</th><th>صحيح / متقن</th><th>قيد التعلم</th><th>لم يُقيّم</th><th>${heading} %</th></tr></thead><tbody>${result.brackets.map(b => `<tr><th>${b.label}</th><td>${b.assessed} / ${b.eligible}</td><td>${b.mastered}</td><td>${b.learning}</td><td>${b.skipped}</td><td>${formatPercent(b.accuracy)}</td></tr>`).join('')}</tbody></table></div></section>
        <section class="report-section error-profile"><h2>${session.mode === 'receptive' ? 'تحليل الاختيارات' : 'درجات اللغة التعبيرية'}</h2>
        ${session.mode === 'receptive' ? `<p>${result.errorTotal} اختيار غير صحيح. تُحسب النسب التالية من الأخطاء فقط وهي وصف للاختيارات. المشتتات الصوتية التلقائية مبنية على التشابه الكتابي.</p>${result.errors.map(error => bar(`${OUTCOMES[error.type]}: ${error.count}`, error.percentage)).join('')}`
            : `<p>متقن: ${result.overall.mastered} · قيد التعلم: ${result.overall.learning} · غير متقن: ${result.overall.assessed - result.overall.mastered - result.overall.learning}. يُسجل الفاحص الدرجات.</p>`}</section>
        <section class="report-section"><h2>المقارنة بالتقييم السابق</h2>${baseline ? `<p>التقييم السابق: ${escape(baseline.metadata.assessmentDate)} · ${escape(baseline.id)}</p>` : ''}
        ${comparison.compatible ? `<p><strong>${deltaText(comparison.delta)}</strong> خلال ${comparison.days} يوم على ${comparison.count} كلمة مشتركة قابلة للمقارنة. التغير محسوب بالنقاط المئوية.</p><div class="legend"><span>● الكلمات المشتركة الحالية</span><span>▰ الكلمات المشتركة السابقة</span></div>${comparison.rows.map(row => bar(`${row.label} · العدد ${row.count} · ${deltaText(row.delta)}`, row.current, row.previous)).join('')}
            <table><caption>تقدم الكلمات المشتركة</caption><thead><tr><th>الفئة العمرية</th><th>الكلمات المشتركة</th><th>السابق</th><th>الحالي</th><th>التغير</th></tr></thead><tbody>${comparison.rows.map(row => `<tr><th>${row.label}</th><td>${row.count}</td><td>${formatPercent(row.previous)}</td><td>${formatPercent(row.current)}</td><td>${deltaText(row.delta)}</td></tr>`).join('')}</tbody></table>` : `<p>${escape(comparison.reason)}</p>`}</section>
        <section class="report-section"><h2>ملاحظات التقييم</h2><p class="preserve-lines">${escape(session.metadata.notes || 'لا توجد ملاحظات.')}</p><p>إصدار المفردات: ${escape(session.dataVersion)}. قواعد الفئات: ${escape(session.configVersion)}. ${session.omitted.length} كلمة غير متاحة للاختبار الاستقبالي لعدم اكتمال صور الخيارات. ${session.missingMediaCount} كلمة مستبعدة لنقص الصور أو الأصوات.</p></section>
        <section class="report-section item-records"><h2>تتبع الكلمات</h2><table><caption>الكلمات التي تم اختبارها</caption><thead><tr><th>#</th><th>الكلمة / الرمز</th><th>الفئة العمرية</th><th>الاستجابة</th><th>الكلمة المختارة</th><th>مرات تشغيل الصوت</th><th>الوقت (ث)</th></tr></thead><tbody>${session.records.map((r, i) => `<tr><td>${i + 1}</td><td lang="ar" dir="rtl">${escape(r.label)} <small><bdi dir="ltr">${escape(r.targetId)}</bdi></small></td><td>${escape(COHORTS.find(c => c.id === r.cohort)?.label)}</td><td>${escape(OUTCOMES[r.outcome])}</td><td lang="ar" dir="rtl">${escape(r.selectedLabel || '—')}</td><td>${r.audioPlays}</td><td>${(r.latencyMs / 1000).toFixed(1)}</td></tr>`).join('')}</tbody></table></section>
        <footer class="report-footer">أُنشئ على هذا الجهاز · ${escape(new Date().toISOString())} · لا يُستنتج عمر لغوي معياري أو تشخيص من هذا التقرير.</footer>
    </article>`;
    return { result, comparison };
}

const CSV_COLUMNS = ['schemaVersion', 'id', 'childId', 'childName', 'birthDate', 'assessmentDate', 'examiner', 'languages', 'notes',
    'mode', 'scope', 'sampling', 'audioMode', 'status', 'dataVersion', 'configVersion', 'startedAt', 'finishedAt', 'eligibleJson',
    'planJson', 'omittedJson', 'missingMediaCount', 'targetId', 'label', 'itemRevision', 'folder', 'cohort', 'outcome',
    'selectedId', 'selectedLabel', 'latencyMs', 'audioPlays', 'audioPlayed', 'optionsJson'];
const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
export function toCSV(session) {
    return '\uFEFF' + [CSV_COLUMNS.join(','), ...session.records.map((record, index) => {
        const row = { ...session, ...session.metadata, ...record, schemaVersion: 1,
            eligibleJson: index ? '' : JSON.stringify(session.eligible), planJson: index ? '' : JSON.stringify(session.plan), omittedJson: index ? '' : JSON.stringify(session.omitted),
            optionsJson: JSON.stringify(record.options || []) };
        // Prefix spreadsheet formulas without changing the raw JSON export. The
        // parser removes this escape only for text fields exported by this app.
        return CSV_COLUMNS.map((key, column) => {
            // Session metadata appears once, so a full checklist and long notes
            // still fit comfortably inside the import size limit.
            const value = index && column < CSV_COLUMNS.indexOf('targetId') ? '' : row[key];
            return csvCell(typeof value === 'string' && /^[=+@\-\t\r\n']/.test(value) ? `'${value}` : value);
        }).join(',');
    })].join('\r\n');
}
export function parseCSV(text) {
    const rows = []; let row = [], cell = '', quoted = false, afterQuote = false;
    const input = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < input.length; i++) {
        const c = input[i];
        if (quoted) {
            if (c === '"' && input[i + 1] === '"') { cell += '"'; i++; }
            else if (c === '"') { quoted = false; afterQuote = true; }
            else cell += c;
        } else if (c === '"' && !cell && !afterQuote) quoted = true;
        else if (c === ',') { row.push(cell); cell = ''; afterQuote = false; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && input[i + 1] === '\n') i++;
            row.push(cell); if (row.some(value => value !== '')) rows.push(row);
            row = []; cell = ''; afterQuote = false;
        } else if (afterQuote) throw new Error('Invalid CSV: characters after a closing quote.');
        else cell += c;
    }
    if (quoted) throw new Error('Invalid CSV: unclosed quote.');
    if (cell || row.length) { row.push(cell); rows.push(row); }
    if (rows.length < 2 || rows.length > 5001) throw new Error('CSV needs a header and 1–5000 trial rows.');
    const headers = rows.shift();
    if (headers.length !== CSV_COLUMNS.length || headers.some((value, i) => value !== CSV_COLUMNS[i])) throw new Error('Use an exported assessment CSV with the documented columns.');
    return rows.map(values => {
        if (values.length !== headers.length) throw new Error('CSV row has the wrong number of columns.');
        return Object.fromEntries(headers.map((key, i) => [key, values[i].replace(/^'(?=[=+@\-\t\r\n'])/, '')]));
    });
}

function validDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function validateSession(raw) {
    if (!raw || raw.schemaVersion !== 1 || !['receptive', 'expressive'].includes(raw.mode) ||
        !['complete', 'partial', 'draft'].includes(raw.status) || !['full', 'A', 'B', 'C', 'D'].includes(raw.scope) ||
        !['all', '5', '10', '20'].includes(String(raw.sampling)) || !['spoken-prompt', 'modeled', 'unprompted'].includes(raw.audioMode)) throw new Error('Unsupported assessment format.');
    if (!raw.metadata || typeof raw.metadata.childId !== 'string' || !raw.metadata.childId.trim() || !validDate(raw.metadata.assessmentDate)) throw new Error('Missing child identifier or valid evaluation date.');
    if (raw.metadata.birthDate && (!validDate(raw.metadata.birthDate) || raw.metadata.birthDate > raw.metadata.assessmentDate)) throw new Error('Invalid date of birth.');
    if (!Array.isArray(raw.records) || raw.records.length > 5000 || !Array.isArray(raw.plan) || raw.plan.length > 5000 || !raw.eligible || !Array.isArray(raw.omitted)) throw new Error('Invalid trial data.');
    const string = (value, max = 500) => {
        if (typeof value !== 'string' || value.length > max) throw new Error('Invalid or oversized text field.');
        return value;
    };
    const cohort = value => { if (!['A', 'B', 'C', 'D'].includes(value)) throw new Error('Invalid cohort.'); return value; };
    const id = value => { if (!/^([1-9]|[1-3]\d|40)-[1-9]\d{0,2}$/.test(value)) throw new Error('Invalid vocabulary item identifier.'); return value; };
    const numeric = (value, max) => { const n = Number(value); if (!Number.isFinite(n) || n < 0 || n > max) throw new Error('Invalid numeric field.'); return n; };
    if (raw.mode === 'receptive' && raw.audioMode !== 'spoken-prompt' || raw.mode === 'expressive' && raw.audioMode === 'spoken-prompt') throw new Error('شروط الصوت does not match the test module.');
    const plan = raw.plan.map(item => ({ id: id(item.id), cohort: cohort(item.cohort),
        ...(item.basis ? { basis: string(item.basis), reviewed: item.reviewed === true, validated: false } : {}) }));
    if (new Set(plan.map(item => item.id)).size !== plan.length) throw new Error('Duplicate planned items.');
    const records = raw.records.map(record => {
        const allowed = raw.mode === 'receptive' ? ['target', 'phonological', 'semantic', 'unrelated', 'skip'] : ['mastered', 'learning', 'notMastered', 'skip'];
        if (!allowed.includes(record.outcome) || typeof record.audioPlayed !== 'boolean') throw new Error('Invalid response value.');
        const item = plan.find(item => item.id === record.targetId);
        if (!item || item.cohort !== record.cohort) throw new Error('Trial is not in its planned cohort.');
        const options = Array.isArray(record.options) ? record.options.map(option => ({ id: id(option.id), role: string(option.role, 30) })) : [];
        if (!/^[a-f0-9]{64}$/.test(record.itemRevision)) throw new Error('Missing or invalid media/label revision.');
        if (Number(record.folder) !== Number(record.targetId.split('-')[0]) || !Number.isInteger(Number(record.audioPlays))) throw new Error('Invalid trial folder or play count.');
        if (raw.mode === 'receptive' && record.outcome !== 'skip') {
            if (options.length !== 4 || new Set(options.map(option => option.id)).size !== 4 ||
                [...options.map(option => option.role)].sort().join(',') !== 'phonological,semantic,target,unrelated' ||
                options.find(option => option.role === 'target')?.id !== record.targetId ||
                options.find(option => option.id === record.selectedId)?.role !== record.outcome) throw new Error('Receptive choice does not match its four-card matrix.');
        }
        return { targetId: id(record.targetId), label: string(record.label), itemRevision: string(record.itemRevision, 64),
            folder: numeric(record.folder, 40), cohort: cohort(record.cohort), outcome: record.outcome,
            selectedId: record.selectedId ? id(record.selectedId) : '', selectedLabel: string(record.selectedLabel || ''),
            latencyMs: numeric(record.latencyMs, 86400000), audioPlays: numeric(record.audioPlays, 1000), audioPlayed: record.audioPlayed,
            options: options.slice(0, 4) };
    });
    if (new Set(records.map(record => record.targetId)).size !== records.length) throw new Error('Duplicate scored items.');
    if (raw.status === 'complete' && records.length !== plan.length) throw new Error('A complete session must contain every planned trial.');
    if (records.some(r => r.audioPlayed !== (r.audioPlays > 0) || (r.outcome !== 'skip' && raw.audioMode !== 'unprompted' && !r.audioPlayed))) throw new Error('Trial audio-prompt data is inconsistent.');
    const metadata = Object.fromEntries(['childId', 'childName', 'birthDate', 'assessmentDate', 'examiner', 'languages', 'notes'].map(key => [key, string(raw.metadata[key] || '', key === 'notes' ? 5000 : 500)]));
    return { schemaVersion: 1, id: string(raw.id, 100), metadata, mode: raw.mode, scope: raw.scope, sampling: String(raw.sampling),
        audioMode: raw.audioMode, status: raw.status, dataVersion: string(raw.dataVersion, 100), configVersion: string(raw.configVersion, 100),
        startedAt: string(raw.startedAt || '', 50), finishedAt: string(raw.finishedAt || '', 50),
        eligible: Object.fromEntries(COHORTS.map(c => [c.id, numeric(raw.eligible[c.id] || 0, 5000)])),
        plan, records, omitted: raw.omitted.map(id), missingMediaCount: numeric(raw.missingMediaCount || 0, 5000), updatedAt: new Date().toISOString() };
}
export function parseHistory(text, filename) {
    if (text.length > 5 * 1024 * 1024) throw new Error('History file exceeds the 5 MB limit.');
    if (/\.csv$/i.test(filename)) {
        const rows = parseCSV(text), first = rows[0];
        const metaKeys = CSV_COLUMNS.slice(0, CSV_COLUMNS.indexOf('targetId')).filter(key => !['eligibleJson', 'planJson', 'omittedJson'].includes(key));
        for (const row of rows) if (metaKeys.some(key => row[key] !== '' && row[key] !== first[key])) throw new Error('CSV rows contain inconsistent session metadata.');
        return validateSession({ ...first, schemaVersion: Number(first.schemaVersion),
            metadata: Object.fromEntries(['childId', 'childName', 'birthDate', 'assessmentDate', 'examiner', 'languages', 'notes'].map(key => [key, first[key]])),
            eligible: JSON.parse(first.eligibleJson), plan: JSON.parse(first.planJson), omitted: JSON.parse(first.omittedJson),
            records: rows.map(row => ({ ...row, audioPlayed: row.audioPlayed === 'true', options: JSON.parse(row.optionsJson) })) });
    }
    const data = JSON.parse(text.replace(/^\uFEFF/, ''));
    return validateSession(data.session || data);
}
export function downloadSession(session, format) {
    const body = format === 'csv' ? toCSV(session) : JSON.stringify({ schemaVersion: 1, session }, null, 2);
    const blob = new Blob([body], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `vocabulary-${session.mode}-${session.metadata.assessmentDate}-${session.id.slice(0, 8)}.${format}`;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export async function printReport() {
    await document.fonts.ready;
    document.body.classList.add('printing-report');
    const cleanup = () => { document.body.classList.remove('printing-report'); window.removeEventListener('afterprint', cleanup); };
    window.addEventListener('afterprint', cleanup);
    // Browser print UI offers Save as PDF / platform sharing; never silently save PHI.
    window.print();
}
