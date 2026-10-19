/* Adds profile persistence and the optional game flow to the existing workplace. */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    const P = window.VocProgress;
    window.VocHomeLesson.mount(CATEGORIES.flatMap(category => category.items.map(item => ({ key: P.key(item), name: item.name }))));
    const find = key => CATEGORIES.flatMap(category => category.items).find(item => P.key(item) === key);
    let changingProfile = false;
    let restoring = true;
    let practiced = P.active()?.workspace?.practiced || null;
    let worked = P.active()?.workspace?.worked || [];
    let lastResult = P.active()?.workspace?.lastResult || null;
    let learnedOnly = false;
    let records = [];
    let hadMistake = false;
    let promptQueue = [];
    let run = null;
    let startToken = 0;
    const keys = () => [...new Set(app.state.slotsData.filter(slot => slot.item).map(slot => P.key(slot.item)))];
    const signature = () => [...keys()].sort().join('|');
    const save = () => {
        if (restoring || changingProfile) return;
        if (practiced !== signature()) practiced = null;
        P.saveWorkspace({ slotsCount: app.state.slotsCount, slots: app.state.slotsData.map(slot => slot.item ? P.key(slot.item) : null), practiced, lastResult, worked });
    };
    const render = app.renderSlotsContent;
    app.renderSlotsContent = function() { render.call(this); save(); };
    const saved = P.active()?.workspace;
    if (saved && Number.isInteger(saved.slotsCount) && saved.slotsCount >= 1 && saved.slotsCount <= 9) {
        app.state.slotsCount = saved.slotsCount;
        app.state.slotsData = Array.from({ length: saved.slotsCount }, (_, id) => ({ id, item: find(saved.slots[id]) || null }));
        app.renderSlotsLayout();
    }
    app.state.stars = 0; app.renderStars(); restoring = false;
    window.addEventListener('voc-profile-beforechange', () => { if(app.state.deleteMode)app.setDeleteMode(false);save(); app.exitTestMode(false); changingProfile = true; });
    window.addEventListener('pagehide', () => { save(); logRun(true); });
    window.addEventListener('voc-profile-memorychange', () => { app.state.deleteMode=false;app.syncDeleteMode();changingProfile = false; practiced = null; lastResult = null; worked = []; app.resetSlots(); app.renderSlotsContent(); });
    if (new URLSearchParams(location.search).has('workplace')) app.switchView('workplace');

    const title = document.querySelector('#category-modal h2');
    const book = document.createElement('button'); book.type = 'button'; book.className = 'child-button voc-book'; book.id = 'learned-library';
    book.setAttribute('aria-label', 'البطاقات المتقنة'); book.title = 'البطاقات المتقنة'; book.setAttribute('aria-pressed', 'false'); book.innerHTML = '<i class="fas fa-book-open" aria-hidden="true"></i>';
    const titleGroup = document.createElement('div'); titleGroup.style.cssText = 'display:flex;align-items:center;gap:10px';
    title.before(titleGroup); titleGroup.append(title, book); book.hidden = P.isAdmin();
    book.addEventListener('click', () => {
        learnedOnly = !learnedOnly; book.setAttribute('aria-pressed', String(learnedOnly));
        title.textContent = learnedOnly ? 'البطاقات المتقنة' : 'اختر صورة للبطاقة';
        app.handleSearch(document.querySelector('#search-input').value);
    });
    const renderItems = app.renderItemsGrid;
    app.renderItemsGrid = function(items) { renderItems.call(this, items.filter(item => P.mastered(item) === learnedOnly)); };
    const open = app.modals.open;
    app.modals.open = function(id) { if (id === 'category-modal') app.handleSearch(document.querySelector('#search-input').value); open.call(this, id); };
    // Single-card browsing obeys the same learned-library filter as the picker.
    app.navigateTemplateOne = function(direction) {
        if (this.state.slotsCount !== 1 || this.state.testState.active || this.state.deleteMode) return;
        const slot = this.state.slotsData[0];
        const pool = CATEGORIES.find(c => c.id === (slot.item?.catId || this.state.activeCategory))?.items.filter(item => P.mastered(item) === learnedOnly) || [];
        if (!pool.length) return;
        const at = pool.findIndex(item => P.key(item) === P.key(slot.item || ''));
        slot.item = pool[(at + direction + pool.length) % pool.length];
        this.renderSlotsContent(); this.playAudioAndAnimate(slot, document.querySelector('#slot-0'));
    };

    const modal = document.createElement('dialog'); modal.id = 'automation-dialog'; modal.className = 'voc-dialog'; modal.setAttribute('aria-labelledby', 'automation-title');
    const iconButton = (attributes, icon, label, extra = '') => `<button type="button" class="voc-choice voc-icon" ${attributes} aria-label="${label}" title="${label}"><i class="fas fa-${icon}" aria-hidden="true"></i>${extra}</button>`;
    modal.innerHTML = `<h2 id="automation-title">نكمل بالألعاب؟</h2><div class="voc-choices" id="plan-levels" role="group" aria-label="المستوى">${iconButton('data-difficulty="easy" aria-pressed="true"', 'seedling', 'سهل')}${iconButton('data-difficulty="moderate" aria-pressed="false"', 'walking', 'متوسط')}${iconButton('data-difficulty="advanced" aria-pressed="false"', 'running', 'متقدم')}</div><div class="voc-choices" id="plan-games" role="group" aria-label="الألعاب التالية">${iconButton('data-mode="matching" aria-pressed="true"', 'puzzle-piece', 'المطابقة')}${iconButton('data-mode="memory" aria-pressed="true"', 'brain', 'الذاكرة')}${iconButton('data-mode="rapid" aria-pressed="true"', 'bolt', 'البطاقات السريعة')}${iconButton('data-mode="test" aria-pressed="true"', 'headphones', 'استمع واختر')}</div><footer class="suite-text-actions"><button type="button" id="start-plan">يلا نلعب</button><button type="button" id="dismiss-plan">عودة للتدريب</button></footer>`;
    document.body.append(modal);
    modal.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => modal.querySelectorAll('[data-difficulty]').forEach(b => b.setAttribute('aria-pressed', String(b === button)))));
    modal.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
        button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
        modal.querySelector('#start-plan').disabled = !modal.querySelector('[data-mode][aria-pressed=true]');
    }));
    modal.querySelector('#dismiss-plan').onclick = () => {modal.close();app.switchView('workplace');save();};
    modal.addEventListener('cancel',()=>{app.switchView('workplace');save();});
    modal.querySelector('#start-plan').onclick = () => {
        const modes = [...modal.querySelectorAll('[data-mode][aria-pressed=true]')].map(button => button.dataset.mode);
        const difficulty = modal.querySelector('[data-difficulty][aria-pressed=true]').dataset.difficulty;
        if (P.startPlan([...new Set([...worked,...keys()])], difficulty, modes) && P.storageOK()) { worked=[];save(); location.href = P.planURL(); }
    };
    function logRun(partial) {
        if (!run || run.logged || !records.length) return;
        run.logged = !partial;
        P.logSession({ id: run.id, started: run.started, source: 'workplace', domain: 'receptive', kind: run.mode === 'practice' ? 'practice' : 'assessment', partial,
            records: records.map(record => ({ key: record.key, correct: record.correct ? 1 : 0, total: 1 })) });
    }
    const exit = app.exitTestMode;
    app.exitTestMode = function(showMessage = true) { startToken++; window.VocCountdown.cancel(); if (this.state.testState.active) logRun(true); exit.call(this, showMessage); };
    const start = app.handleModeButtonClick;
    app.handleModeButtonClick = async function(type) {
        if(this.state.deleteMode)this.setDeleteMode(false);
        if (this.state.testState.active && this.state.mode === type) { start.call(this, type); return; }
        if (!keys().length) { this.showToast('أضف بطاقة للبدء', 'warning'); return; }
        this.exitTestMode(false);
        const token = ++startToken;
        if (!await window.VocCountdown.start() || token !== startToken) return;
        run = { id: `workplace-${Date.now()}-${Math.random().toString(36).slice(2)}`, started: new Date().toISOString(), mode: type, logged: false };
        records = []; hadMistake = false;
        const pool = this.state.slotsData.filter(slot => slot.item);
        promptQueue = [];
        while (promptQueue.length < 10) {
            const shuffled = [...pool].sort(() => Math.random() - .5);
            promptQueue.push(...shuffled.map(slot => P.key(slot.item)));
        }
        promptQueue.length = 10;
        this.state.stars = 0; this.renderStars(); start.call(this, type);
    };
    const next = app.nextTrial;
    app.nextTrial = function() {
        if (this.state.testState.active && this.state.testState.trialsLeft <= 0) {
            const mode = this.state.mode;
            const correct = records.filter(record => record.correct).length;
            const percentage = Math.round(correct / Math.max(1, records.length) * 100);
            if (mode === 'practice') practiced = signature();
            else { P.record('receptive', records); lastResult = { percentage, correct, total: records.length, date: new Date().toISOString() }; }
            logRun(false);
            this.exitTestMode(false); this.state.stars = 0; this.renderStars(); save();
            worked=[...new Set([...worked,...keys()])];save();
            if (mode === 'test' || mode === 'practice') {
                modal.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', 'true'));
                modal.querySelector('#start-plan').disabled = false; modal.showModal();
            } else this.showToast(mode === 'practice' ? 'اكتمل التدريب' : `نتيجة الاختبار: ${percentage}%`, 'success');
            return;
        }
        next.call(this);
        if (this.state.testState.active) {
            this.state.testState.targetItem = find(promptQueue[this.state.testState.completedTrials]) || this.state.testState.targetItem;
            document.querySelectorAll('.slot').forEach(el => el.classList.remove('animate-pulse-hint'));
            if (this.state.mode === 'practice') {
                const index = this.state.slotsData.findIndex(slot => slot.item && P.key(slot.item) === P.key(this.state.testState.targetItem));
                document.getElementById(`slot-${index}`)?.classList.add('animate-pulse-hint');
            }
        }
    };
    const answer = app.evaluateTestAnswer;
    app.evaluateTestAnswer = function(index) {
        const trial = this.state.testState, item = this.state.slotsData[index]?.item;
        if (!trial.active || trial.answering || !item || !trial.targetItem) return;
        const correct = P.key(item) === P.key(trial.targetItem);
        if (correct) { records.push({ key: P.key(trial.targetItem), correct: !hadMistake }); hadMistake = false; }
        else hadMistake = true;
        answer.call(this, index);
    };
    const setStars = app.setStars;
    app.setStars = function(count) {
        if (this.state.testState.active) { this.state.stars = Math.max(0, Math.min(10, count)); this.renderStars(); }
        else setStars.call(this, count);
    };
});
