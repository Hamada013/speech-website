import { COHORTS, CONFIG_VERSION, createIndex, buildChecklist } from './validation.js';
import { saveSession, getSessions, getSetting, saveSetting } from './storage.js';
import { analyze, renderReport, parseHistory, downloadSession, printReport, formatPercent } from './reporting.js';

const $ = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const state = { data: null, index: null, overrides: {}, sessions: [], mode: 'receptive', session: null,
    phase: 'idle', prepared: null, report: null, baseline: null, trial: null, generation: 0, planning: 0 };
const audio = $('#word-audio');
const form = $('#setup-form');
const modeLabel = mode => mode === 'receptive' ? 'اللغة الاستقبالية' : 'اللغة التعبيرية';
const statusLabel = status => ({ draft: 'قيد التنفيذ', complete: 'مكتمل', partial: 'جزئي' })[status] || status;
const today = () => new Intl.DateTimeFormat('sv-SE').format(new Date());
function message(text, error = false) {
    $('#message').textContent = text; $('#message').hidden = false; $('#message').classList.toggle('error', error);
}
function view(name) {
    all('.view').forEach(element => { element.hidden = element.id !== `${name}-view`; });
    all('nav [data-route]').forEach(button => {
        if (button.dataset.route === name) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('#main').focus({ preventScroll: true });
}
function guard(action) {
    return (...args) => Promise.resolve().then(() => action(...args)).catch(error => message(/[\u0600-\u06ff]/.test(error.message || '') ? error.message : 'تعذر إتمام العملية. تحقق من الملف أو الاتصال وأعد المحاولة. السجلات المحفوظة ما زالت متاحة.', true));
}
function currentItem() { return state.index.byId.get(state.session?.plan[state.session.records.length]?.id); }
function updateDraftCard() {
    const draft = state.sessions.find(session => session.status === 'draft' && session.plan.length > session.records.length);
    $('#draft-card').hidden = !draft;
    if (draft) $('#draft-summary').textContent = `${draft.metadata.childId} · ${modeLabel(draft.mode)} · ${draft.records.length} من ${draft.plan.length} استجابة`;
}
async function refreshSessions() {
    state.sessions = (await getSessions()).sort((a, b) => (b.updatedAt || b.startedAt).localeCompare(a.updatedAt || a.startedAt));
    updateDraftCard();
}
async function persist() {
    state.session.updatedAt = new Date().toISOString();
    await saveSession(state.session);
}
function stopAudio() { audio.pause(); audio.currentTime = 0; }

async function route(name) {
    if (state.phase === 'trial' || state.phase === 'loading') await pause();
    $('#message').hidden = true;
    if (name === 'history') { await refreshSessions(); renderHistory(); }
    if (name === 'validation') await renderWordTables();
    if (name === 'dashboard') { await refreshSessions(); }
    view(name);
}

async function setup(mode) {
    if (!state.data) throw new Error('يرجى انتظار تحميل بنك الكلمات.');
    if (state.phase === 'trial' || state.phase === 'loading') await pause();
    state.mode = mode;
    $('#setup-title').textContent = mode === 'receptive' ? 'اللغة الاستقبالية' : 'اللغة التعبيرية';
    $('#audio-mode-field').hidden = mode !== 'expressive';
    $('#module-instructions').textContent = mode === 'receptive'
        ? 'شغّل الكلمة، ثم دع الطفل يختار صورة من أربع صور.'
        : 'اختر التسمية بعد سماع الكلمة أو التسمية المستقلة. يُسجّل تشغيل الصوت كنموذج للطفل.';
    form.elements.assessmentDate.value = today();
    view('setup');
    await preparePlan();
}
async function preparePlan() {
    const ticket = ++state.planning;
    state.prepared = null; $('#begin-test').disabled = true;
    $('#plan-summary').textContent = 'جاري إعداد الكلمات والصور…';
    const result = await buildChecklist(state.index, state.mode, form.elements.scope.value, form.elements.sampling.value, state.overrides);
    if (ticket !== state.planning) return;
    state.prepared = result;
    $('#plan-summary').textContent = `${result.plan.length} كلمة للاختبار · ${COHORTS.map(c => `${c.label}: ${result.eligible[c.id]}`).join(' · ')}`;
    $('#begin-test').disabled = !result.plan.length;
}
async function begin(event) {
    event.preventDefault();
    if (!form.reportValidity() || !state.prepared?.plan.length) return;
    const metadata = Object.fromEntries(['childId', 'childName', 'birthDate', 'assessmentDate', 'examiner', 'languages', 'notes'].map(key => [key, form.elements[key].value.trim()]));
    if (!metadata.childId) throw new Error('أدخل رمز الطفل.');
    if (metadata.assessmentDate > today()) throw new Error('لا يمكن أن يكون تاريخ التقييم في المستقبل.');
    if (metadata.birthDate && metadata.birthDate > metadata.assessmentDate) throw new Error('يجب أن يسبق تاريخ الميلاد تاريخ التقييم أو يوافقه.');
    $('#begin-test').disabled = true;
    // Preserve any previous draft; starting another assessment never erases it.
    const now = new Date().toISOString();
    state.session = { schemaVersion: 1, id: crypto.randomUUID(), metadata, mode: state.mode,
        scope: form.elements.scope.value, sampling: form.elements.sampling.value,
        audioMode: state.mode === 'receptive' ? 'spoken-prompt' : form.elements.audioMode.value,
        status: 'draft', startedAt: now, finishedAt: '', updatedAt: now,
        dataVersion: state.data.version, configVersion: `${CONFIG_VERSION}:${state.reviewRevision || 0}`,
        plan: state.prepared.plan, eligible: state.prepared.eligible, omitted: state.prepared.omitted,
        missingMediaCount: state.data.excluded.length, records: [], current: null };
    try {
        await persist();
        // Only non-child clinician preferences are reused on the next setup.
        await saveSetting('clinician', { examiner: metadata.examiner, languages: metadata.languages });
        await showTrial();
    } finally { $('#begin-test').disabled = false; }
}

function enableResponses() {
    const trial = state.trial;
    const allowed = state.phase === 'trial' && trial?.imagesReady && !trial.busy && !trial.playPending &&
        (state.session.audioMode === 'unprompted' || trial.audioPlays > 0);
    all('#workspace button, [data-grade]').forEach(button => { button.disabled = !allowed; });
    $('#skip-item').disabled = state.phase !== 'trial' || !!trial?.busy;
    $('#replay-audio').disabled = state.phase !== 'trial' || !!trial?.playPending || !!trial?.busy;
}
async function showTrial() {
    if (state.session.records.length >= state.session.plan.length) { await finish('complete'); return; }
    const generation = ++state.generation;
    stopAudio();
    state.phase = 'loading';
    const entry = state.session.plan[state.session.records.length];
    const item = state.index.byId.get(entry.id);
    if (!item) throw new Error('الكلمة المحفوظة غير موجودة في البنك الحالي. أنهِ التقرير الجزئي وابدأ تقييماً جديداً.');
    const previous = state.session.current?.targetId === item.id ? state.session.current : null;
    const options = previous?.options || (state.session.mode === 'receptive' ? state.index.matrix(item.id) : [{ id: item.id, role: 'target' }]);
    if (!options) throw new Error('لا تتوفر أربع صور مناسبة لهذه الكلمة. راجع بنك الكلمات.');
    state.trial = { targetId: item.id, options, audioPlays: previous?.audioPlays || 0,
        elapsedMs: previous?.elapsedMs || 0, started: performance.now(), imagesReady: false, busy: false, playPending: false };
    state.session.current = { targetId: item.id, options, audioPlays: state.trial.audioPlays, elapsedMs: state.trial.elapsedMs };
    $('#trial-heading').textContent = state.session.mode === 'receptive' ? 'استمع واختر الصورة المناسبة.' : 'سمِّ الصورة. سجّل استجابة الطفل.';
    $('#trial-cohort').textContent = COHORTS.find(c => c.id === entry.cohort).label;
    $('#trial-count').textContent = `الكلمة ${state.session.records.length + 1} من ${state.session.plan.length}`;
    $('#trial-progress').max = state.session.plan.length; $('#trial-progress').value = state.session.records.length;
    $('#trial-condition').textContent = state.session.mode === 'receptive' ? 'أربع صور بترتيب عشوائي'
        : state.session.audioMode === 'modeled' ? 'تسمية بعد سماع نموذج صوتي' : 'تسمية مستقلة · يُسجّل تشغيل الكلمة كنموذج صوتي';
    $('#audio-status').textContent = 'جاري تحميل الصور…';
    $('#grading-toolbar').hidden = state.session.mode !== 'expressive';
    $('#workspace').classList.toggle('expressive-workspace', state.session.mode === 'expressive');
    $('#workspace').replaceChildren();
    audio.src = item.audio;
    const loaded = options.map((option, position) => {
        const cardItem = state.index.byId.get(option.id);
        const card = document.createElement(state.session.mode === 'receptive' ? 'button' : 'div');
        card.className = 'picture-card';
        if (card.tagName === 'BUTTON') {
            card.type = 'button'; card.disabled = true; card.setAttribute('aria-label', `الصورة ${position + 1}: ${cardItem.label}`);
            card.addEventListener('click', guard(() => answer(option.role, option.id, generation)));
        }
        const image = document.createElement('img'); image.alt = cardItem.label; image.lang = 'ar'; image.decoding = 'async';
        const ready = new Promise(resolve => {
            const timer = setTimeout(() => resolve(false), 12000);
            image.onload = () => { clearTimeout(timer); resolve(true); };
            image.onerror = () => { clearTimeout(timer); resolve(false); };
        });
        image.src = cardItem.image; card.append(image); $('#workspace').append(card);
        return ready;
    });
    enableResponses(); view('trial');
    await persist(); // Restore this exact matrix after interruption.
    const results = await Promise.all(loaded); // At most four images, never the word bank.
    if (generation !== state.generation || state.phase === 'paused') return;
    state.phase = 'trial'; state.trial.imagesReady = results.every(Boolean); state.trial.started = performance.now();
    if (!state.trial.imagesReady) $('#audio-status').textContent = 'تعذر تحميل صورة. تحقق من الاتصال وأعد المحاولة، أو تخطَّ الكلمة.';
    else if (state.session.audioMode !== 'unprompted') await playWord(generation);
    else $('#audio-status').textContent = state.trial.audioPlays
        ? `سبق تشغيل النموذج الصوتي لهذه الكلمة (${state.trial.audioPlays} مرة).`
        : 'لم يُشغّل نموذج صوتي. راقب التسمية المستقلة.';
    enableResponses();
}
async function playWord(generation = state.generation) {
    if (generation !== state.generation || state.phase !== 'trial' || !state.trial || state.trial.playPending) return;
    const trial = state.trial;
    trial.playPending = true; enableResponses();
    let timer;
    try {
        audio.currentTime = 0;
        await Promise.race([audio.play(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Audio timed out')), 12000); })]);
        if (generation !== state.generation) return;
        trial.audioPlays++;
        state.session.current.audioPlays = trial.audioPlays;
        await persist(); // A manual cue must survive reload even in unprompted mode.
        $('#audio-status').textContent = `جاري تشغيل الكلمة · ${trial.audioPlays} مرة`;
    } catch {
        if (generation === state.generation) { audio.pause(); $('#audio-status').textContent = 'اضغط تشغيل الكلمة للبدء. إذا تعذر الصوت، تحقق من الاتصال أو تخطَّ الكلمة.'; }
    } finally {
        clearTimeout(timer);
        trial.playPending = false;
        if (generation === state.generation) enableResponses();
    }
}
async function answer(outcome, selectedId = '', generation = state.generation) {
    const trial = state.trial;
    if (generation !== state.generation || state.phase !== 'trial' || !trial || trial.busy) return;
    if (outcome !== 'skip' && (!trial.imagesReady || trial.playPending || (state.session.audioMode !== 'unprompted' && !trial.audioPlays))) return;
    trial.busy = true; enableResponses(); stopAudio();
    const item = currentItem(), entry = state.session.plan[state.session.records.length];
    const record = { targetId: item.id, label: item.label, itemRevision: item.revision, folder: item.folder,
        cohort: entry.cohort, outcome, selectedId, selectedLabel: selectedId ? state.index.byId.get(selectedId).label : '',
        latencyMs: Math.round(Math.min(86400000, trial.elapsedMs + performance.now() - trial.started)),
        audioPlays: trial.audioPlays, audioPlayed: trial.audioPlays > 0, options: trial.options };
    state.session.records.push(record); state.session.current = null;
    try { await persist(); }
    catch (error) { state.session.records.pop(); trial.busy = false; enableResponses(); throw new Error(`لم تُحفظ الاستجابة. وفر مساحة على الجهاز وأعد المحاولة. ${error.message}`); }
    if (state.phase === 'paused') return;
    await showTrial();
}
async function pause() {
    if (!state.session || !['trial', 'loading'].includes(state.phase)) return;
    const trial = state.trial;
    state.phase = 'paused'; ++state.generation; stopAudio();
    if (trial && !trial.busy) state.session.current = { targetId: trial.targetId, options: trial.options,
        audioPlays: trial.audioPlays, elapsedMs: trial.elapsedMs + performance.now() - trial.started };
    $('#paused-summary').textContent = `تم حفظ ${state.session.records.length} من ${state.session.plan.length} استجابة للطفل ${state.session.metadata.childId}.`;
    view('paused'); await persist(); await refreshSessions();
}
async function resume(session) {
    if (session.dataVersion !== state.data.version) throw new Error('تم تحديث بنك الكلمات. افتح التقرير الجزئي لهذا التقييم وابدأ تقييماً جديداً.');
    state.session = session; await showTrial();
}
async function finish(status) {
    if (!state.session) return;
    ++state.generation; stopAudio(); state.phase = 'idle';
    state.session.status = status; state.session.finishedAt = new Date().toISOString(); state.session.current = null;
    await persist(); await refreshSessions(); await openReport(state.session);
}

function renderHistory() {
    $('#session-list').replaceChildren();
    if (!state.sessions.length) { const p = document.createElement('p'); p.className = 'panel'; p.textContent = 'لا توجد تقييمات محفوظة بعد.'; $('#session-list').append(p); }
    for (const session of state.sessions) {
        const row = document.createElement('article'); row.className = 'session-row';
        const content = document.createElement('div'), title = document.createElement('h2'), detail = document.createElement('p');
        title.textContent = `${session.metadata.childId} · ${session.mode === 'receptive' ? 'اللغة الاستقبالية' : 'اللغة التعبيرية'}`;
        detail.textContent = `${session.metadata.assessmentDate} · ${statusLabel(session.status)} · ${session.records.length} استجابة · ${formatPercent(analyze(session).overall.accuracy)}`; detail.className = 'small';
        content.append(title, detail); row.append(content);
        const actions = document.createElement('div'); actions.className = 'button-row';
        const open = document.createElement('button'); open.className = 'secondary'; open.textContent = 'فتح التقرير'; open.addEventListener('click', guard(() => openReport(session))); actions.append(open);
        if (session.status === 'draft') {
            const continueButton = document.createElement('button'); continueButton.className = 'primary'; continueButton.textContent = 'استكمال'; continueButton.addEventListener('click', guard(() => resume(session))); actions.append(continueButton);
        }
        row.append(actions); $('#session-list').append(row);
    }
}
async function openReport(session) {
    state.report = session; state.baseline = null;
    await refreshSessions();
    const select = $('#baseline-select'); select.replaceChildren(new Option('دون مقارنة', ''));
    for (const previous of state.sessions.filter(s => s.id !== session.id && s.status !== 'draft')) {
        select.append(new Option(`${previous.metadata.assessmentDate} · ${previous.metadata.childId} · ${modeLabel(previous.mode)}`, previous.id));
    }
    drawReport(); view('report');
}
function drawReport() {
    const companion = state.sessions.find(s => s.id !== state.report.id && s.metadata.childId === state.report.metadata.childId &&
        s.metadata.assessmentDate === state.report.metadata.assessmentDate && s.mode !== state.report.mode && s.status === 'complete');
    renderReport($('#report-content'), state.report, state.baseline, companion);
}
async function importFile(input, baseline = false) {
    const file = input.files[0]; if (!file) return;
    try {
        if (file.size > 5 * 1024 * 1024) throw new Error('حجم الملف يتجاوز ٥ ميغابايت.');
        const session = parseHistory(await file.text(), file.name);
        if (!session.records.length) throw new Error('يجب أن يحتوي الملف على استجابة مسجلة واحدة على الأقل.');
        if (session.status === 'draft') { session.status = 'partial'; session.finishedAt ||= session.updatedAt; }
        const existing = state.sessions.find(s => s.id === session.id);
        if (existing && JSON.stringify(existing.records) !== JSON.stringify(session.records)) throw new Error('يوجد تقييم مختلف يحمل المعرف نفسه. استورد الملف بمعرفه الأصلي.');
        if (!existing) await saveSession(session);
        await refreshSessions();
        if (baseline && state.report) {
            if (session.id === state.report.id) throw new Error('اختر تقييماً آخر للمقارنة.');
            const current = state.report; await openReport(current); state.baseline = session;
            $('#baseline-select').value = session.id; drawReport();
        } else renderHistory();
        message('تم استيراد التقييم. تعتمد المقارنة على الكلمات وشروط الاختبار المتطابقة.');
    } finally { input.value = ''; }
}

async function renderWordTables() {
    const container = $('#word-tables');
    container.replaceChildren();
    if (!state.index) return;
    for (const mode of ['receptive', 'expressive']) {
        // Use the same full checklist as assessment setup, including saved
        // assignments and receptive targets with a complete distractor matrix.
        const checklist = await buildChecklist(state.index, mode, 'full', 'all', state.overrides);
        const cohorts = new Map(checklist.plan.map(entry => [entry.id, entry.cohort]));
        const panel = document.createElement('section'); panel.className = 'panel table-scroll';
        const table = document.createElement('table'); table.className = 'word-bank-table'; table.dataset.mode = mode;
        const caption = table.createCaption(); caption.textContent = mode === 'receptive' ? 'اللغة الاستقبالية' : 'اللغة التعبيرية';
        const header = table.createTHead().insertRow();
        for (const title of ['المجموعة الفرعية', 'العمر', 'الكلمات المختبرة']) {
            const th = document.createElement('th'); th.scope = 'col'; th.textContent = title; header.append(th);
        }
        const body = table.createTBody();
        for (const cohort of COHORTS) {
            const groups = new Map();
            for (const item of state.index.items) {
                if (cohorts.get(item.id) !== cohort.id) continue;
                if (!groups.has(item.category)) groups.set(item.category, []);
                groups.get(item.category).push(item);
            }
            for (const [category, items] of groups) {
                const row = body.insertRow(); row.dataset.cohort = cohort.id;
                const group = document.createElement('th'); group.scope = 'row'; group.textContent = category; row.append(group);
                row.insertCell().textContent = cohort.label;
                const words = row.insertCell(); words.className = 'bank-words';
                items.forEach((item, i) => {
                    if (i) words.append(document.createTextNode('، '));
                    const word = document.createElement('span'); word.textContent = item.label; word.dataset.item = item.id; words.append(word);
                });
            }
            if (!groups.size) {
                const row = body.insertRow(); row.dataset.cohort = cohort.id;
                row.insertCell().textContent = '—'; row.insertCell().textContent = cohort.label;
                row.insertCell().textContent = 'لا توجد كلمات متاحة للاختبار';
            }
        }
        panel.append(table); container.append(panel);
    }
}

all('[data-route]').forEach(button => button.addEventListener('click', guard(() => route(button.dataset.route))));
all('[data-start]').forEach(button => { button.disabled = true; button.addEventListener('click', guard(() => setup(button.dataset.start))); });
form.addEventListener('submit', event => { event.preventDefault(); void guard(begin)(event); });
for (const name of ['scope', 'sampling']) form.elements[name].addEventListener('change', guard(preparePlan));
$('#replay-audio').addEventListener('click', guard(() => playWord()));
audio.addEventListener('ended', () => { if (state.phase === 'trial') $('#audio-status').textContent = `تم تشغيل الكلمة · ${state.trial.audioPlays} مرة`; });
all('[data-grade]').forEach(button => button.addEventListener('click', guard(() => answer(button.dataset.grade))));
$('#skip-item').addEventListener('click', guard(() => answer('skip')));
$('#pause-test').addEventListener('click', guard(pause));
$('#continue-test').addEventListener('click', guard(() => resume(state.session)));
$('#finish-partial').addEventListener('click', guard(() => finish('partial')));
$('#resume-draft').addEventListener('click', guard(() => resume(state.sessions.find(s => s.status === 'draft'))));
$('#history-import').addEventListener('change', guard(event => importFile(event.target)));
$('#baseline-import').addEventListener('change', guard(event => importFile(event.target, true)));
$('#baseline-select').addEventListener('change', () => { state.baseline = state.sessions.find(s => s.id === $('#baseline-select').value) || null; drawReport(); });
$('#export-json').addEventListener('click', () => downloadSession(state.report, 'json'));
$('#export-csv').addEventListener('click', () => downloadSession(state.report, 'csv'));
$('#print-report').addEventListener('click', guard(printReport));
document.addEventListener('visibilitychange', () => { if (document.hidden) void guard(pause)(); });
window.addEventListener('pagehide', () => { audio.pause(); });

async function initialize() {
    const response = await fetch('data/vocabulary.json');
    if (!response.ok) throw new Error('تعذر تحميل بنك الكلمات. افتح التطبيق مع الاتصال بالإنترنت ونزّل المحتوى.');
    state.data = await response.json();
    const review = await getSetting('review');
    state.overrides = review?.overrides || {}; state.reviewRevision = review?.revision || 0;
    state.index = createIndex(state.data.items, state.overrides);
    const clinician = await getSetting('clinician');
    if (clinician) for (const key of ['examiner', 'languages']) form.elements[key].value = clinician[key] || '';
    form.elements.assessmentDate.value = today();
    await refreshSessions();
    all('[data-start]').forEach(button => { button.disabled = false; });
}
void guard(initialize)();
