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

const choiceKey = record => (record.options || []).map(o => `${o.id}:${o.role}`).sort().join('|');

export function compare(current, previous) {
    if (!previous) return { compatible: false, reason: 'لم يُحدد تقييم سابق للمقارنة.' };
    if (current.metadata.childId.trim().toLowerCase() !== previous.metadata.childId.trim().toLowerCase()) return { compatible: false, reason: 'رمز الطفل مختلف؛ لا يمكن مقارنة النتائج.' };
    if (current.mode !== previous.mode) return { compatible: false, reason: 'نوع التقييم مختلف؛ قارن تقييمين من النوع نفسه.' };
    if ((current.metadata.languages || '').trim().toLowerCase().replace(/\s+/g, ' ') !== (previous.metadata.languages || '').trim().toLowerCase().replace(/\s+/g, ' ')) return { compatible: false, reason: 'اللغة أو اللهجة مختلفة.' };
    if (current.audioMode !== previous.audioMode) return { compatible: false, reason: 'شروط الصوت مختلفة؛ لا يمكن مقارنة التسمية المستقلة بالتسمية بعد النموذج.' };
    if (previous.metadata.assessmentDate > current.metadata.assessmentDate) return { compatible: false, reason: 'التقييم المحدد للمقارنة أحدث من التقييم الحالي.' };
    const prior = new Map(previous.records.filter(r => r.outcome !== 'skip').map(r => [r.targetId, r]));
    const shared = current.records.filter(r => r.outcome !== 'skip' && prior.has(r.targetId)).filter(r => {
        const old = prior.get(r.targetId);
        return r.cohort === old.cohort && r.itemRevision === old.itemRevision && r.audioPlayed === old.audioPlayed && choiceKey(r) === choiceKey(old);
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
const childKey = session => session.metadata.childId.trim().toLowerCase();
const languageKey = session => (session.metadata.languages || '').trim().toLowerCase().replace(/\s+/g, ' ');
export function ageMonths(metadata) {
    if (!metadata.birthDate || metadata.birthDate > metadata.assessmentDate) return null;
    const birth = new Date(`${metadata.birthDate}T12:00:00Z`), date = new Date(`${metadata.assessmentDate}T12:00:00Z`);
    if (!Number.isFinite(+birth) || !Number.isFinite(+date)) return null;
    return (date.getUTCFullYear() - birth.getUTCFullYear()) * 12 + date.getUTCMonth() - birth.getUTCMonth() - Number(date.getUTCDate() < birth.getUTCDate());
}
export function progressSeries(current, sessions) {
    const history = sessions.filter(s => s.id !== current.id && s.status === 'complete' && childKey(s) === childKey(current) && s.mode === current.mode && s.audioMode === current.audioMode && languageKey(s) === languageKey(current) && s.metadata.assessmentDate <= current.metadata.assessmentDate && (s.metadata.assessmentDate !== current.metadata.assessmentDate || s.startedAt <= current.startedAt) && compare(current, s).compatible);
    const ordered = [...history, current].sort((a,b) => a.metadata.assessmentDate.localeCompare(b.metadata.assessmentDate) || a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id));
    // All plotted points use one identical intersection, including prompt conditions.
    const common = current.records.filter(r => r.outcome !== 'skip' && history.every(s => s.records.some(p => p.targetId === r.targetId && p.outcome !== 'skip' && p.cohort === r.cohort && p.itemRevision === r.itemRevision && p.audioPlayed === r.audioPlayed && choiceKey(p) === choiceKey(r))));
    if (!history.length || !common.length) return { points: [], count: 0, delta: null };
    const ids = new Set(common.map(r => r.targetId));
    const points = ordered.map(s => ({ id: s.id, date: s.metadata.assessmentDate, value: metric(s.records.filter(r => ids.has(r.targetId))).accuracy }));
    return { points, count: ids.size, delta: Math.round((points.at(-1).value - points[0].value) * 10) / 10 };
}
export function peerComparison(current, sessions) {
    const age = ageMonths(current.metadata);
    if (age === null) return { available: false, reason: 'أضف تاريخ الميلاد إلى التقييم لحساب العمر وقت الاختبار.' };
    if (!languageKey(current)) return { available: false, reason: 'أضف اللغة أو اللهجة إلى التقييم للمقارنة.' };
    if (current.status !== 'complete' || current.records.some(r => r.outcome === 'skip')) return { available: false, reason: 'أكمل التقييم دون تخطي لعرض مقارنة عادلة.' };
    const signature = s => s.records.map(r => `${r.targetId}:${r.itemRevision}:${r.cohort}:${r.audioPlayed}:${choiceKey(r)}`).sort().join('|');
    const target = signature(current), children = new Map();
    for (const session of [...sessions].sort((a,b) => b.metadata.assessmentDate.localeCompare(a.metadata.assessmentDate) || b.startedAt.localeCompare(a.startedAt))) {
        const key = childKey(session), otherAge = ageMonths(session.metadata);
        if (key === childKey(current) || children.has(key) || session.status !== 'complete' || session.mode !== current.mode || session.audioMode !== current.audioMode || languageKey(session) !== languageKey(current) || otherAge === null || Math.abs(otherAge - age) > 3 || session.metadata.assessmentDate > current.metadata.assessmentDate || session.records.some(r => r.outcome === 'skip') || signature(session) !== target) continue;
        children.set(key, analyze(session).overall.accuracy);
    }
    const values = [...children.values()].filter(v => v !== null).sort((a,b) => a-b);
    if (!values.length) return { available: false, reason: 'لا توجد على هذا الجهاز نتائج أطفال آخرين بعمر مقارب (±٣ أشهر) وبنفس الكلمات واللغة وشروط الصوت. يمكنك استيراد تقييمات محفوظة.' };
    const n = values.length, median = n % 2 ? values[(n-1)/2] : (values[n/2-1]+values[n/2])/2;
    return { available: true, count: n, median, min: values[0], max: values.at(-1), current: analyze(current).overall.accuracy, age };
}
function trendChart(series) {
    if (!series.points.length) return '<p class="empty-state">يظهر منحنى التقدم بعد حفظ تقييم آخر قابل للمقارنة لهذا الطفل. تُقارن الكلمات المشتركة وشروط الصوت نفسها.</p>';
    const width = 680, left = 48, right = 650, bottom = 200, top = 24;
    const points = series.points.map((p,i) => ({ ...p, x: left + i * (right-left) / (series.points.length-1), y: bottom - p.value * (bottom-top)/100 }));
    return `<div class="trend-summary ${series.delta < 0 ? 'decline' : ''}"><strong>${deltaText(series.delta)}</strong><span>${series.count} كلمة مشتركة في جميع النقاط</span></div><div class="trend-scroll"><svg class="trend-chart" viewBox="0 0 ${width} 255" role="img" aria-label="منحنى نتائج الطفل من الأقدم إلى الأحدث: ${escape(points.map(p=>`${p.date}: ${formatPercent(p.value)}`).join('، '))}"><title>التغير عبر التقييمات</title>${[0,25,50,75,100].map(v=>`<line x1="${left}" x2="${right}" y1="${bottom-v*(bottom-top)/100}" y2="${bottom-v*(bottom-top)/100}" stroke="#dceaf4"/><text x="38" y="${bottom-v*(bottom-top)/100+5}" text-anchor="end">${v}%</text>`).join('')}<polyline points="${points.map(p=>`${p.x},${p.y}`).join(' ')}" fill="none" stroke="${series.delta < 0 ? '#b4524b' : '#2d8c77'}" stroke-width="3"/>${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="5" fill="#22445a"><title>${escape(p.date)}: ${formatPercent(p.value)}</title></circle><text x="${p.x}" y="${p.y-13}" text-anchor="middle">${formatPercent(p.value)}</text>${points.length <= 6 || p === points[0] || p === points.at(-1) ? `<text x="${p.x}" y="225" text-anchor="${p === points[0] ? 'start' : p === points.at(-1) ? 'end' : 'middle'}">${escape(p.date)}</text>` : ''}`).join('')}</svg></div><div class="table-scroll"><table><caption>نتائج الكلمات المشتركة — من الأقدم إلى الأحدث</caption><thead><tr><th>التاريخ</th><th>النتيجة</th></tr></thead><tbody>${points.map(p=>`<tr><td>${escape(p.date)}</td><td>${formatPercent(p.value)}</td></tr>`).join('')}</tbody></table></div>`;
}
export function renderReport(container, session, baseline = null, companion = null, sessions = []) {
    const result = analyze(session), comparison = compare(session, baseline), series = progressSeries(session, sessions), peers = peerComparison(session, sessions);
    const name = session.mode === 'receptive' ? 'اللغة الاستقبالية' : 'اللغة التعبيرية';
    const heading = session.mode === 'receptive' ? 'الفهم الصحيح' : 'الكلمات المتقنة';
    const brackets = result.brackets.filter(b => b.planned);
    const words = outcomes => session.records.filter(r => outcomes.includes(r.outcome)).map(r=>r.label).join('، ') || '—';
    const panel = (id, content) => `<section id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}" data-report-panel="${id}"${id === 'summary' ? '' : ' hidden'}>${content}</section>`;
    container.innerHTML = `<article class="clinical-report"><header class="report-heading"><div><p class="eyebrow">تقييم المفردات</p><h1>${escape(session.metadata.childName || session.metadata.childId)}</h1><p>${name} · ${escape(session.metadata.assessmentDate)} · ${escape(({complete:'مكتمل',partial:'جزئي',draft:'قيد التنفيذ'})[session.status])}</p></div><span class="report-badge">${escape(chronologicalAge(session.metadata))}</span></header>
    ${panel('summary', `<dl class="metadata-grid"><div><dt>رمز الطفل</dt><dd>${escape(session.metadata.childId)}</dd></div><div><dt>اللغة / اللهجة</dt><dd>${escape(session.metadata.languages || 'غير مسجل')}</dd></div><div><dt>الفاحص</dt><dd>${escape(session.metadata.examiner || 'غير مسجل')}</dd></div><div><dt>شروط التقييم</dt><dd>${escape(({modeled:'تسمية بعد نموذج صوتي',unprompted:'تسمية مستقلة','spoken-prompt':'اختيار بعد سماع الكلمة'})[session.audioMode])}</dd></div></dl>
    <section class="report-section"><h2>ملخص الأداء</h2><div class="metric-grid"><div><strong>${formatPercent(result.overall.accuracy)}</strong><span>${heading}</span></div><div><strong><bdi dir="ltr">${result.overall.mastered} / ${result.overall.assessed}</bdi></strong><span>صحيح / كلمات مقيّمة</span></div><div><strong><bdi dir="ltr">${session.records.length} / ${session.plan.length}</bdi></strong><span>استجابات / كلمات مخططة</span></div><div><strong>${result.overall.skipped}</strong><span>لم تُقيّم</span></div></div>${session.mode === 'expressive' ? `<p>قيد التعلم: ${result.overall.learning} · غير متقن: ${result.overall.assessed-result.overall.mastered-result.overall.learning} · المؤشر الموزون: ${formatPercent(result.overall.weighted)} (قيد التعلم = نصف درجة).</p>` : ''}${companion ? `<div class="companion-result">${companion.mode === 'receptive' ? 'الفهم' : 'التعبير'} في اليوم نفسه: <strong>${formatPercent(analyze(companion).overall.accuracy)}</strong> · ${analyze(companion).overall.assessed} كلمة مقيّمة</div>` : ''}</section>
    <section class="report-section"><h2>الأداء حسب المجموعة</h2>${brackets.map(b=>bar(`${b.label} · ${b.mastered} من ${b.assessed}`,b.accuracy)).join('')}<div class="table-scroll"><table><caption>تغطية الكلمات</caption><thead><tr><th>المجموعة</th><th>المخطط</th><th>المقيّم</th><th>الصحيح</th><th>قيد التعلم</th><th>لم يُقيّم</th></tr></thead><tbody>${brackets.map(b=>`<tr><th>${b.label}</th><td>${b.planned}</td><td>${b.assessed}</td><td>${b.mastered}</td><td>${b.learning}</td><td>${b.skipped}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="report-section word-summary"><h2>ملف الكلمات</h2><details><summary>كلمات صحيحة أو متقنة (${result.overall.mastered})</summary><p>${escape(words(['target','mastered']))}</p></details>${session.mode==='expressive'?`<details open><summary>كلمات قيد التعلم (${result.overall.learning})</summary><p>${escape(words(['learning']))}</p></details>`:''}<details open><summary>كلمات تحتاج متابعة (${result.overall.assessed-result.overall.mastered-result.overall.learning})</summary><p>${escape(words(['phonological','semantic','unrelated','notMastered']))}</p></details></section>
    ${session.mode==='receptive'?`<section class="report-section error-profile"><h2>أنماط الاختيارات غير الصحيحة</h2><p>${result.errorTotal} اختيار. النسب من الأخطاء فقط؛ التشابه الصوتي مقترح من الكتابة.</p>${result.errors.map(e=>bar(`${OUTCOMES[e.type]} · ${e.count}`,e.percentage)).join('')}</section>`:''}
    ${session.metadata.notes?`<section class="report-section"><h2>ملاحظات</h2><p class="preserve-lines">${escape(session.metadata.notes)}</p></section>`:''}`)}
    ${panel('progress', `<section class="report-section"><h2>التقدم عبر التقييمات</h2>${trendChart(series)}</section><section class="report-section"><h2>مقارنة تقييمين</h2>${comparison.compatible?`<p><strong>${deltaText(comparison.delta)}</strong> على ${comparison.count} كلمة مشتركة · السابق ${escape(comparison.previousDate)}</p><div class="legend"><span>الأخضر: الحالي</span><span>الذهبي: السابق</span></div>${comparison.rows.filter(r=>r.count).map(r=>bar(`${r.label} · ${r.count} كلمة`,r.current,r.previous)).join('')}`:`<p>${escape(comparison.reason)}</p>`}</section>`)}
    ${panel('peers', `<section class="report-section"><h2>مقارنة مع أطفال بعمر مقارب</h2><p>نتائج محفوظة على هذا الجهاز · العمر وقت الاختبار ±٣ أشهر · الكلمات واللغة وشروط الصوت نفسها · تقييم واحد لكل طفل آخر.</p>${peers.available?`<div class="metric-grid"><div><strong>${peers.count}</strong><span>أطفال آخرون</span></div><div><strong>${formatPercent(peers.median)}</strong><span>وسيط المجموعة</span></div><div><strong>${formatPercent(peers.min)}–${formatPercent(peers.max)}</strong><span>نطاق النتائج</span></div></div>${bar('هذا الطفل',peers.current)}${bar('وسيط الأطفال الآخرين',peers.median)}<p>هذه عينة محلية صغيرة وليست معياراً عمرياً.</p>`:`<p class="empty-state">${escape(peers.reason)}</p>`}</section>`)}
    ${panel('words', `<section class="report-section item-records"><h2>الكلمات والاستجابات</h2><div class="table-scroll"><table><caption>${session.records.length} كلمة مسجلة</caption><thead><tr><th>#</th><th>الكلمة</th><th>المجموعة</th><th>الاستجابة</th><th>الاختيار</th><th>نموذج صوتي</th></tr></thead><tbody>${session.records.map((r,i)=>`<tr><td>${i+1}</td><td>${escape(r.label)}</td><td>${escape(COHORTS.find(c=>c.id===r.cohort)?.label)}</td><td>${escape(OUTCOMES[r.outcome])}</td><td>${escape(r.selectedLabel||'—')}</td><td>${r.audioPlayed?'نعم':'لا'}</td></tr>`).join('')}</tbody></table></div></section>`)}
    <footer class="report-footer">قائمة وصفية للمفردات العربية، وليست تشخيصاً أو عمراً لغوياً معيارياً. التسمية بعد النموذج لا تقيس التسمية المستقلة.</footer></article>`;
    return { result, comparison, series, peers };
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
        !['all', '5', '10', '20', '50', '100'].includes(String(raw.sampling)) || !['spoken-prompt', 'modeled', 'unprompted'].includes(raw.audioMode)) throw new Error('Unsupported assessment format.');
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
    const details = [...document.querySelectorAll('.clinical-report details')].map(element => ({ element, open: element.open }));
    details.forEach(({element}) => { element.open = true; });
    const cleanup = () => { details.forEach(({element,open}) => { element.open = open; }); document.body.classList.remove('printing-report'); window.removeEventListener('afterprint', cleanup); };
    window.addEventListener('afterprint', cleanup);
    // Browser print UI offers Save as PDF / platform sharing; never silently save PHI.
    window.print();
}
