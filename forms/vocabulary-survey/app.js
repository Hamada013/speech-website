import { COHORTS, CONFIG_VERSION, FOLDER_COHORTS, REFERENCES, assignCohort, createIndex, buildChecklist } from './validation.js';
import { saveSession, getSessions, getSetting, saveSetting } from './storage.js';
import { analyze, renderReport, parseHistory, downloadSession, printReport, formatPercent } from './reporting.js';

const $ = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const state = { data: null, index: null, overrides: {}, sessions: [], mode: 'receptive', session: null,
    phase: 'idle', prepared: null, report: null, baseline: null, trial: null, generation: 0, planning: 0, reviewPage: 0 };
const audio = $('#word-audio');
const form = $('#setup-form');
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
    return (...args) => Promise.resolve().then(() => action(...args)).catch(error => message(error.message || 'The action could not be completed. Your saved records remain available.', true));
}
function currentItem() { return state.index.byId.get(state.session?.plan[state.session.records.length]?.id); }
function updateDraftCard() {
    const draft = state.sessions.find(session => session.status === 'draft' && session.plan.length > session.records.length);
    $('#draft-card').hidden = !draft;
    if (draft) $('#draft-summary').textContent = `${draft.metadata.childId} · ${draft.mode} · ${draft.records.length} of ${draft.plan.length} items recorded`;
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
    if (name === 'validation') renderReview();
    if (name === 'dashboard') { await refreshSessions(); }
    view(name);
}

async function setup(mode) {
    if (!state.data) throw new Error('Wait for the word bank to finish loading.');
    if (state.phase === 'trial' || state.phase === 'loading') await pause();
    state.mode = mode;
    $('#setup-title').textContent = mode === 'receptive' ? 'Receptive comprehension' : 'Expressive naming';
    $('#audio-mode-field').hidden = mode !== 'expressive';
    $('#module-instructions').textContent = mode === 'receptive'
        ? 'Play the word, then let the child select one of four pictures. No target label or correctness feedback is shown to the child.'
        : 'Audio-modeled naming plays the word before grading. Choose unprompted naming if you need to observe independent naming; replaying audio is recorded as a model.';
    form.elements.assessmentDate.value = today();
    view('setup');
    await preparePlan();
}
async function preparePlan() {
    const ticket = ++state.planning;
    state.prepared = null; $('#begin-test').disabled = true;
    $('#plan-summary').textContent = 'Checking distractor coverage and preparing the checklist…';
    const result = await buildChecklist(state.index, state.mode, form.elements.scope.value, form.elements.sampling.value, state.overrides);
    if (ticket !== state.planning) return;
    state.prepared = result;
    $('#plan-summary').textContent = `${result.plan.length} planned trials · ${COHORTS.map(c => `${c.id}: ${result.eligible[c.id]} eligible`).join(' · ')}. ${result.omitted.length} targets omitted for incomplete four-card matrices.`;
    $('#begin-test').disabled = !result.plan.length;
}
async function begin(event) {
    event.preventDefault();
    if (!form.reportValidity() || !state.prepared?.plan.length) return;
    const metadata = Object.fromEntries(['childId', 'childName', 'birthDate', 'assessmentDate', 'examiner', 'languages', 'notes'].map(key => [key, form.elements[key].value.trim()]));
    if (!metadata.childId) throw new Error('Enter a child identifier.');
    if (metadata.assessmentDate > today()) throw new Error('Evaluation date cannot be in the future.');
    if (metadata.birthDate && metadata.birthDate > metadata.assessmentDate) throw new Error('Date of birth must be on or before the evaluation date.');
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
    if (!item) throw new Error('This saved trial is not in the current word bank. Finish a partial report and begin a new assessment.');
    const previous = state.session.current?.targetId === item.id ? state.session.current : null;
    const options = previous?.options || (state.session.mode === 'receptive' ? state.index.matrix(item.id) : [{ id: item.id, role: 'target' }]);
    if (!options) throw new Error('This target has no complete distractor matrix. Review the word bank before continuing.');
    state.trial = { targetId: item.id, options, audioPlays: previous?.audioPlays || 0,
        elapsedMs: previous?.elapsedMs || 0, started: performance.now(), imagesReady: false, busy: false, playPending: false };
    state.session.current = { targetId: item.id, options, audioPlays: state.trial.audioPlays, elapsedMs: state.trial.elapsedMs };
    $('#trial-heading').textContent = state.session.mode === 'receptive' ? 'Listen and choose the matching picture.' : 'Name the picture. Clinician: record the response.';
    $('#trial-cohort').textContent = `COHORT ${entry.cohort} · ${COHORTS.find(c => c.id === entry.cohort).label.toUpperCase()}`;
    $('#trial-count').textContent = `Item ${state.session.records.length + 1} of ${state.session.plan.length}`;
    $('#trial-progress').max = state.session.plan.length; $('#trial-progress').value = state.session.records.length;
    $('#trial-condition').textContent = state.session.mode === 'receptive' ? 'Four distinct pictures · Positions randomized · No correctness cues'
        : state.session.audioMode === 'modeled' ? 'Audio-modeled naming · Score describes performance after a spoken model' : 'Unprompted naming · Playing the word will be recorded as a model';
    $('#audio-status').textContent = 'Loading pictures…';
    $('#grading-toolbar').hidden = state.session.mode !== 'expressive';
    $('#workspace').classList.toggle('expressive-workspace', state.session.mode === 'expressive');
    $('#workspace').replaceChildren();
    audio.src = item.audio;
    const loaded = options.map((option, position) => {
        const cardItem = state.index.byId.get(option.id);
        const card = document.createElement(state.session.mode === 'receptive' ? 'button' : 'div');
        card.className = 'picture-card';
        if (card.tagName === 'BUTTON') {
            card.type = 'button'; card.disabled = true; card.setAttribute('aria-label', `Picture ${position + 1}: ${cardItem.label}`);
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
    if (!state.trial.imagesReady) $('#audio-status').textContent = 'A picture could not load. Reconnect, pause and retry, or mark this item not assessable.';
    else if (state.session.audioMode !== 'unprompted') await playWord(generation);
    else $('#audio-status').textContent = state.trial.audioPlays
        ? `A spoken model was previously played for this item (${state.trial.audioPlays} play(s)).`
        : 'No model played. Observe independent naming.';
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
        $('#audio-status').textContent = `Word playing · ${trial.audioPlays} play${trial.audioPlays === 1 ? '' : 's'}`;
    } catch {
        if (generation === state.generation) { audio.pause(); $('#audio-status').textContent = 'Tap Play word to begin. If audio is unavailable, pause/reconnect or mark the item not assessable.'; }
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
    catch (error) { state.session.records.pop(); trial.busy = false; enableResponses(); throw new Error(`Response not saved: ${error.message}. Free device storage and try again.`); }
    if (state.phase === 'paused') return;
    await showTrial();
}
async function pause() {
    if (!state.session || !['trial', 'loading'].includes(state.phase)) return;
    const trial = state.trial;
    state.phase = 'paused'; ++state.generation; stopAudio();
    if (trial && !trial.busy) state.session.current = { targetId: trial.targetId, options: trial.options,
        audioPlays: trial.audioPlays, elapsedMs: trial.elapsedMs + performance.now() - trial.started };
    $('#paused-summary').textContent = `${state.session.records.length} of ${state.session.plan.length} responses saved for ${state.session.metadata.childId}.`;
    view('paused'); await persist(); await refreshSessions();
}
async function resume(session) {
    if (session.dataVersion !== state.data.version) throw new Error('The vocabulary bank has changed. Open this session’s partial report and begin a new assessment rather than mixing revisions.');
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
    if (!state.sessions.length) { const p = document.createElement('p'); p.className = 'panel'; p.textContent = 'No local assessments yet. Start a test or import an exported session.'; $('#session-list').append(p); }
    for (const session of state.sessions) {
        const row = document.createElement('article'); row.className = 'session-row';
        const content = document.createElement('div'), title = document.createElement('h2'), detail = document.createElement('p');
        title.textContent = `${session.metadata.childId} · ${session.mode === 'receptive' ? 'Receptive comprehension' : 'Expressive naming'}`;
        detail.textContent = `${session.metadata.assessmentDate} · ${session.status} · ${session.records.length} recorded · ${formatPercent(analyze(session).overall.accuracy)}`; detail.className = 'small';
        content.append(title, detail); row.append(content);
        const actions = document.createElement('div'); actions.className = 'button-row';
        const open = document.createElement('button'); open.className = 'secondary'; open.textContent = 'Open report'; open.addEventListener('click', guard(() => openReport(session))); actions.append(open);
        if (session.status === 'draft') {
            const continueButton = document.createElement('button'); continueButton.className = 'primary'; continueButton.textContent = 'Resume'; continueButton.addEventListener('click', guard(() => resume(session))); actions.append(continueButton);
        }
        row.append(actions); $('#session-list').append(row);
    }
}
async function openReport(session) {
    state.report = session; state.baseline = null;
    await refreshSessions();
    const select = $('#baseline-select'); select.replaceChildren(new Option('No baseline', ''));
    for (const previous of state.sessions.filter(s => s.id !== session.id && s.status !== 'draft')) {
        select.append(new Option(`${previous.metadata.assessmentDate} · ${previous.metadata.childId} · ${previous.mode}`, previous.id));
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
        if (file.size > 5 * 1024 * 1024) throw new Error('File exceeds the 5 MB limit.');
        const session = parseHistory(await file.text(), file.name);
        if (!session.records.length) throw new Error('Import needs at least one recorded trial.');
        if (session.status === 'draft') { session.status = 'partial'; session.finishedAt ||= session.updatedAt; }
        const existing = state.sessions.find(s => s.id === session.id);
        if (existing && JSON.stringify(existing.records) !== JSON.stringify(session.records)) throw new Error('A different local record already uses this session ID. Import a file with its original unique session ID.');
        if (!existing) await saveSession(session);
        await refreshSessions();
        if (baseline && state.report) {
            if (session.id === state.report.id) throw new Error('Select a different session as the historical baseline.');
            const current = state.report; await openReport(current); state.baseline = session;
            $('#baseline-select').value = session.id; drawReport();
        } else renderHistory();
        message('Session imported. Comparisons use matching scored items and compatible test conditions.');
    } finally { input.value = ''; }
}

function renderReview() {
    // One shared suggestion list, rather than hundreds of options per row.
    const suggestions = $('#sound-pair-options'); suggestions.replaceChildren();
    for (const item of state.index.items) suggestions.append(new Option(item.label, item.id));
    $('#reference-list').replaceChildren();
    for (const reference of REFERENCES) {
        const li = document.createElement('li'), link = document.createElement('a'); link.href = reference.url; link.target = '_blank'; link.rel = 'noopener'; link.textContent = reference.title;
        li.append(link, document.createTextNode(` — ${reference.note}`)); $('#reference-list').append(li);
    }
    $('#folder-mapping').replaceChildren();
    for (const [mode, mapping] of Object.entries(FOLDER_COHORTS)) for (const cohort of COHORTS) {
        const p = document.createElement('p'); p.textContent = `${mode} · ${cohort.id} (${cohort.label}): folders ${mapping[cohort.id].join(', ')}`; $('#folder-mapping').append(p);
    }
    $('#excluded-list').textContent = state.data.excluded.map(item => `${item.id} (${item.label}): ${item.missing.join(', ')}`).join(' · ') || 'All listed items have source media.';
    renderReviewRows();
}
function renderReviewRows() {
    const query = $('#bank-search').value.trim().toLowerCase(), filter = $('#bank-filter').value;
    const items = state.index.items.filter(item => (!query || `${item.id} ${item.label} ${item.category}`.toLowerCase().includes(query)) &&
        (!filter || assignCohort(item, 'receptive', state.overrides).cohort === filter));
    const pageSize = 12, pages = Math.max(1, Math.ceil(items.length / pageSize)); state.reviewPage = Math.min(state.reviewPage, pages - 1);
    $('#review-count').textContent = `${items.length} matching words · Page ${state.reviewPage + 1} of ${pages} · ${Object.keys(state.overrides).length} clinician-reviewed entries`;
    $('#bank-prev').disabled = state.reviewPage === 0; $('#bank-next').disabled = state.reviewPage >= pages - 1;
    $('#word-review').replaceChildren();
    for (const item of items.slice(state.reviewPage * pageSize, (state.reviewPage + 1) * pageSize)) {
        const row = document.createElement('article'); row.className = 'review-row';
        const word = document.createElement('div'), label = document.createElement('span'), basis = document.createElement('small');
        label.textContent = item.label; label.lang = 'ar'; label.dir = 'rtl'; label.className = 'review-word';
        basis.textContent = `${item.id} · ${item.category} · ${assignCohort(item, 'receptive', state.overrides).basis}`; word.append(label, basis); row.append(word);
        const controls = {};
        for (const mode of ['receptive', 'expressive']) {
            const field = document.createElement('label'); field.textContent = mode;
            const select = document.createElement('select'); select.setAttribute('aria-label', `${mode} cohort for ${item.label}`);
            select.append(new Option(`Automatic (${assignCohort(item, mode).cohort})`, ''));
            for (const cohort of COHORTS) select.append(new Option(`${cohort.id} · ${cohort.label}`, cohort.id));
            select.value = state.overrides[item.id]?.[mode] || ''; field.append(select); row.append(field); controls[mode] = select;
        }
        const field = document.createElement('label'); field.textContent = 'Reviewed sound pair (item ID)';
        const pairInput = document.createElement('input'); pairInput.setAttribute('aria-label', `Phonological pair for ${item.label}`);
        pairInput.setAttribute('list', 'sound-pair-options'); pairInput.placeholder = 'Automatic / e.g. 15-3'; pairInput.maxLength = 8;
        pairInput.value = state.overrides[item.id]?.phonological || ''; field.append(pairInput); row.append(field);
        const save = document.createElement('button'); save.className = 'secondary'; save.textContent = 'Save';
        save.addEventListener('click', guard(async () => {
            const pair = pairInput.value.trim(), candidate = state.index.byId.get(pair);
            if (pair && (!candidate || candidate.cluster === item.cluster || candidate.word === item.word || candidate.imageRevision === item.imageRevision)) throw new Error('Choose an existing, distinct word from a different semantic cluster with different artwork.');
            const value = { receptive: controls.receptive.value, expressive: controls.expressive.value, phonological: pair, reviewedAt: new Date().toISOString() };
            const overrides = { ...state.overrides }, revision = (state.reviewRevision || 0) + 1;
            if (value.receptive || value.expressive || value.phonological) overrides[item.id] = value; else delete overrides[item.id];
            await saveSetting('review', { overrides, revision });
            state.overrides = overrides; state.reviewRevision = revision;
            state.index = createIndex(state.data.items, state.overrides); renderReviewRows(); message('Assignment saved for future assessments.');
        }));
        row.append(save); $('#word-review').append(row);
    }
}

all('[data-route]').forEach(button => button.addEventListener('click', guard(() => route(button.dataset.route))));
all('[data-start]').forEach(button => { button.disabled = true; button.addEventListener('click', guard(() => setup(button.dataset.start))); });
form.addEventListener('submit', event => { event.preventDefault(); void guard(begin)(event); });
for (const name of ['scope', 'sampling']) form.elements[name].addEventListener('change', guard(preparePlan));
$('#replay-audio').addEventListener('click', guard(() => playWord()));
audio.addEventListener('ended', () => { if (state.phase === 'trial') $('#audio-status').textContent = `Word played · ${state.trial.audioPlays} play(s)`; });
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
for (const selector of ['#bank-search', '#bank-filter']) $(selector).addEventListener('input', () => { state.reviewPage = 0; renderReviewRows(); });
$('#bank-prev').addEventListener('click', () => { state.reviewPage--; renderReviewRows(); });
$('#bank-next').addEventListener('click', () => { state.reviewPage++; renderReviewRows(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) void guard(pause)(); });
window.addEventListener('pagehide', () => { audio.pause(); });

async function initialize() {
    const response = await fetch('data/vocabulary.json');
    if (!response.ok) throw new Error('The word bank could not load. Open the app online once and download the content.');
    state.data = await response.json();
    const review = await getSetting('review');
    state.overrides = review?.overrides || {}; state.reviewRevision = review?.revision || 0;
    state.index = createIndex(state.data.items, state.overrides);
    const clinician = await getSetting('clinician');
    if (clinician) for (const key of ['examiner', 'languages']) form.elements[key].value = clinician[key] || '';
    form.elements.assessmentDate.value = today();
    await refreshSessions();
    $('#bank-count').textContent = `${state.data.items.length} available words · 40 source folders`;
    all('[data-start]').forEach(button => { button.disabled = false; });
}
void guard(initialize)();
