// SENB interface, interaction, and audio playback.
let state = {
    currentView: 'home',
    slotCount: 4,
    isMultiline: false,
    showColoredCircles: true,
    isCoverMode: false,
    isAdvancedMode: false,
    isPlayingSequence: false, // Prevents duplicate sequence plays
    featuredAdvancedCard: null,
    row1Slots: [null, null, null, null, null, null],
    row2Slots: [null, null, null, null, null, null],
    row1Covered: [false, false, false, false, false, false],
    row2Covered: [false, false, false, false, false, false],
    activePickerSlot: { row: 1, index: 0 },
    activeCategory: '01 subject',
    selectedVerbTense: 'present',
    selectedPronounModifier: 'standard',
    advFolder: '6',
    advSubCatId: 1
};

function navigateTo(viewName) {
    if (typeof clearComprehensionHeader === 'function') clearComprehensionHeader();
    if (typeof stopActivityPlayback === 'function') stopActivityPlayback();
    else stopAllPlayback();
    state.currentView = viewName;
    document.getElementById('homeView').classList.toggle('hidden', viewName !== 'home');
    document.getElementById('workplaceView').classList.toggle('hidden', viewName !== 'workplace');
    document.getElementById('activityView').classList.toggle('hidden', viewName !== 'activity');
    document.getElementById('workplaceHeaderToolbar').classList.toggle('hidden', viewName !== 'workplace');
    document.getElementById('clearBoardBtn').classList.toggle('hidden', viewName !== 'workplace');
    document.getElementById('activityHomeBtn').classList.toggle('hidden', viewName !== 'activity');
    document.getElementById('homeHeaderTools').classList.toggle('hidden', viewName !== 'home');
    document.getElementById('pwaInstallHelp').hidden = true;
    document.getElementById('pwaInstallBtn').setAttribute('aria-expanded', 'false');
    if (viewName === 'workplace') renderWorkplace();
}

function toggleTemplateDropdown() {
    const dropdown = document.getElementById('templateDropdown');
    const hidden = dropdown.classList.toggle('hidden');
    document.getElementById('templateToggleBtn').setAttribute('aria-expanded', String(!hidden));
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('templateDropdown');
    if (!e.target.closest('#templateControl') && dropdown && !dropdown.classList.contains('hidden')) {
        dropdown.classList.add('hidden');
        document.getElementById('templateToggleBtn').setAttribute('aria-expanded', 'false');
    }
});

function setSlotCount(count) {
    state.slotCount = count;
    document.getElementById('templateDropdown').classList.add('hidden');
    document.getElementById('templateToggleBtn').setAttribute('aria-expanded', 'false');
    renderWorkplace();
}

function toggleMultilineRow() {
    state.isMultiline = !state.isMultiline;
    const btn = document.getElementById('multilineBtn');
    const container = document.getElementById('multilineRowContainer');
    if (state.isMultiline) {
        btn.classList.add('bg-sky-500', 'text-white');
        btn.classList.remove('bg-slate-100', 'text-slate-700');
        container.classList.remove('hidden');
    } else {
        btn.classList.remove('bg-sky-500', 'text-white');
        btn.classList.add('bg-slate-100', 'text-slate-700');
        container.classList.add('hidden');
    }
    renderWorkplace();
}

function toggleColoredCircles() {
    state.showColoredCircles = !state.showColoredCircles;
    document.getElementById('circlesToggleBtn').classList.toggle('bg-sky-100', state.showColoredCircles);
    renderWorkplace();
}

function toggleCoverMode() {
    state.isCoverMode = !state.isCoverMode;
    const btn = document.getElementById('coverModeBtn');
    if (state.isCoverMode) {
        btn.classList.add('bg-amber-500', 'text-white');
        btn.classList.remove('bg-slate-100', 'text-slate-700');
    } else {
        btn.classList.remove('bg-amber-500', 'text-white');
        btn.classList.add('bg-slate-100', 'text-slate-700');
    }
    renderWorkplace();
}

function toggleAdvancedMode() {
    state.isAdvancedMode = !state.isAdvancedMode;
    const btn = document.getElementById('advancedModeBtn');
    const container = document.getElementById('advancedCardContainer');

    if (state.isAdvancedMode) {
        btn.classList.add('bg-purple-600', 'text-white');
        btn.classList.remove('bg-purple-50', 'text-purple-700');
        container.classList.remove('hidden');
    } else {
        btn.classList.remove('bg-purple-600', 'text-white');
        btn.classList.add('bg-purple-50', 'text-purple-700');
        container.classList.add('hidden');
    }
    renderWorkplace();
}

function clearAllSlots() {
    state.row1Slots = Array(6).fill(null);
    state.row2Slots = Array(6).fill(null);
    state.row1Covered = Array(6).fill(false);
    state.row2Covered = Array(6).fill(false);
    state.featuredAdvancedCard = null;
    renderWorkplace();
}

function renderWorkplace() {
    syncToolbar();
    renderFeaturedCard();
    renderSlotRow('slotsRow1', 1);
    if (state.isMultiline) renderSlotRow('slotsRow2', 2);
}

function renderFeaturedCard() {
    const container = document.getElementById('featuredCard');
    const titleEl = document.getElementById('featuredTitle');
    if (!container) return;
    makeInteractiveCard(container, state.featuredAdvancedCard?.title || 'اختر جملة متكاملة');

    if (state.featuredAdvancedCard) {
        const item = state.featuredAdvancedCard;
        if (titleEl) titleEl.innerText = state.showColoredCircles ? item.title : '';
        container.className = 'featured-16-9-card relative rounded-2xl border-2 border-purple-400 bg-white p-1 flex items-center justify-center cursor-pointer overflow-hidden shadow-md hover:shadow-lg';

        // Play audio on click when filled instead of opening the modal
        container.onclick = async (e) => {
            if (e.target.closest('button') || state.isPlayingSequence) return;
            container.classList.add('playing-ring');
            await playAudioFilePath(item.soundPath, item.title);
            container.classList.remove('playing-ring');
        };

        container.innerHTML = `
            <button aria-label="مسح الجملة" onclick="clearFeaturedCard(event)" class="featured-clear absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-full bg-slate-100/90 hover:bg-rose-500 hover:text-white text-slate-500 flex items-center justify-center shadow-sm transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <span class="absolute top-1.5 right-1.5 text-[10px] font-black text-purple-600 bg-purple-50/90 px-1.5 py-0.5 rounded-md border border-purple-100/80 z-10">++</span>
            <div class="w-full h-full flex items-center justify-center p-1">
                <img src="${item.imgPath}" alt="${item.title}" class="w-full h-full object-contain filter drop-shadow-sm" onerror="this.onerror=null; this.src='assets/image-fallback.svg';">
            </div>
        `;
    } else {
        if (titleEl) titleEl.innerText = '';
        container.className = 'featured-16-9-card relative rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/60 hover:bg-purple-100/60 flex flex-col items-center justify-center p-2 text-center cursor-pointer overflow-hidden shadow-sm hover:shadow';

        // Re-enable opening modal when empty
        container.onclick = openAdvancedCategoryModal;

        container.innerHTML = `
            <div class="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-0.5">
                <span class="text-lg font-black">++</span>
            </div>
            <span class="text-xs font-extrabold text-purple-800">اختر جملة متكاملة ++</span>
        `;
    }
}

function clearFeaturedCard(e) {
    if (e) e.stopPropagation();
    state.featuredAdvancedCard = null;
    renderWorkplace();
}

function renderSlotRow(containerId, rowNumber) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const gridColsClass = {
        2: 'grid-cols-2 max-w-md',
        3: 'grid-cols-3 max-w-lg',
        4: 'grid-cols-4 max-w-2xl',
        5: 'grid-cols-5 max-w-4xl',
        6: 'grid-cols-6 max-w-5xl'
    }[state.slotCount];

    container.className = `grid ${gridColsClass} gap-1.5 sm:gap-3 w-full mx-auto justify-items-center h-full px-1 sm:px-0`;
    const slotsData = rowNumber === 1 ? state.row1Slots : state.row2Slots;
    const coveredData = rowNumber === 1 ? state.row1Covered : state.row2Covered;

    for (let i = 0; i < state.slotCount; i++) {
        const item = slotsData[i];
        const isCovered = coveredData[i];
        const colorHex = getSlotColorConfig(i, state.slotCount);

        const slotWrapper = document.createElement('div');
        slotWrapper.className = 'flex flex-col items-center gap-0.5 sm:gap-1 w-full justify-center min-w-0';

        const card = document.createElement('div');
        card.id = `slot-${rowNumber}-${i}`;
        makeInteractiveCard(card, item ? getDisplayedItemTitle(item, rowNumber, i) : `اختر رمزاً للخانة ${i + 1}`);
        const compactClass = state.isAdvancedMode ? 'slot-card-compact' : '';
        card.className = `slot-card ${compactClass} relative rounded-xl sm:rounded-3xl border sm:border-2 flex flex-col items-center justify-center p-1 text-center cursor-pointer overflow-hidden ${
            item ? 'bg-white border-sky-300 shadow-md shadow-sky-100 hover:shadow-lg' : 'bg-sky-50/60 border-dashed border-sky-300 hover:bg-sky-100/60'
        }`;

        card.onclick = (e) => {
            if (e.target.closest('.clear-card-btn')) return;
            if (state.isCoverMode) {
                if (rowNumber === 1) state.row1Covered[i] = !state.row1Covered[i];
                else state.row2Covered[i] = !state.row2Covered[i];
                renderWorkplace();
                return;
            }

            if (item) {
                if (state.isPlayingSequence) return;
                triggerCardAnimation(card);
                playSlotAudio(item, rowNumber, i);
            } else {
                openCategoryModal(rowNumber, i);
            }
        };

        if (item) {
            const imagePath = getBasicImagePath(item);

            const titleText = getDisplayedItemTitle(item, rowNumber, i);

            card.innerHTML = `
                <button onclick="clearSingleSlot(${rowNumber}, ${i}, event)" aria-label="مسح الخانة" class="clear-card-btn slot-clear absolute top-0.5 left-0.5 sm:top-1 sm:left-1 z-10"></button>
                <div class="w-full h-full flex items-center justify-center p-1 sm:p-2">
                    <img src="${imagePath}" alt="${titleText}" class="w-full h-full object-contain filter drop-shadow-sm" onerror="this.onerror=null; this.src='assets/image-fallback.svg';">
                </div>
                <div class="cover-overlay absolute inset-0 rounded-xl sm:rounded-3xl flex flex-col items-center justify-center text-white z-20 ${isCovered ? '' : 'cover-hidden'}" style="background-color: ${colorHex};">
                    <svg class="w-6 h-6 sm:w-7 sm:h-7 opacity-90 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="w-6 h-6 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-sky-100/70 text-sky-600 flex items-center justify-center">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </div>
                <div class="cover-overlay absolute inset-0 rounded-xl sm:rounded-3xl flex flex-col items-center justify-center text-white z-20 ${isCovered ? '' : 'cover-hidden'}" style="background-color: ${colorHex};">
                    <svg class="w-6 h-6 sm:w-7 sm:h-7 opacity-90 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
            `;
        }

        slotWrapper.appendChild(card);

        const titleEl = document.createElement('div');
        titleEl.className = 'slot-label text-[9px] sm:text-xs font-black text-slate-700 truncate w-full text-center h-3 sm:h-4 leading-tight px-0.5 mt-0.5 sm:mt-1';
        titleEl.innerText = (item && state.showColoredCircles) ? getDisplayedItemTitle(item, rowNumber, i) : '';
        if (!state.showColoredCircles) {
            titleEl.classList.add('invisible');
        }
        slotWrapper.appendChild(titleEl);

        if (state.showColoredCircles) {
            const circle = document.createElement('button');
            circle.className = `slot-cover-toggle w-3 h-3 sm:w-4.5 sm:h-4.5 rounded-full shadow-sm border border-white shrink-0 transition-transform active:scale-90 ${state.isCoverMode ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`;
            circle.style.setProperty('--slot-color', colorHex);
            circle.setAttribute('aria-label', `تغطية الخانة ${i + 1}`);
            circle.setAttribute('aria-pressed', String(isCovered));
            circle.onclick = () => {
                if (rowNumber === 1) state.row1Covered[i] = !state.row1Covered[i];
                else state.row2Covered[i] = !state.row2Covered[i];
                renderWorkplace();
            };
            slotWrapper.appendChild(circle);
        }

        container.appendChild(slotWrapper);
    }
}

function triggerCardAnimation(cardElem) {
    cardElem.classList.remove('pop-animation');
    void cardElem.offsetWidth;
    cardElem.classList.add('pop-animation');
}

function clearSingleSlot(rowNumber, index, e) {
    if (e) e.stopPropagation();
    if (rowNumber === 1) state.row1Slots[index] = null;
    else state.row2Slots[index] = null;
    renderWorkplace();
}

function openCategoryModal(rowNumber, index) {
    state.activePickerSlot = { row: rowNumber, index: index };
    openPicker('categoryModal');
    renderModalCategoriesList();
    selectCategory(state.activeCategory);
}

function closeCategoryModal() { closePicker('categoryModal'); }

function renderModalCategoriesList() {
    const listContainer = document.getElementById('categoriesList');
    listContainer.innerHTML = '';
    CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        const isSelected = cat.id === state.activeCategory;
        btn.className = `w-full text-right p-2 sm:p-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 ${isSelected ? 'bg-sky-500 text-white' : 'bg-white text-slate-700'}`;
        btn.onclick = () => selectCategory(cat.id);
        btn.innerHTML = `<span>${cat.icon}</span><span class="truncate">${cat.name}</span>`;
        listContainer.appendChild(btn);
    });
}

function selectCategory(categoryId) {
    state.activeCategory = categoryId;
    renderModalCategoriesList();
    const cat = CATEGORIES.find(c => c.id === categoryId);
    document.getElementById('modalCategoryTitle').innerText = cat.name;
    document.getElementById('modalCategoryBadge').className = `w-3 h-3 rounded-full ${cat.color}`;

    document.getElementById('verbTenseFilter').classList.toggle('hidden', categoryId !== '02 verbs');
    document.getElementById('pronounModifierFilter').classList.toggle('hidden', categoryId !== '07 Pronoun');

    renderModalItemsGrid(categoryId);
}

function setVerbTense(tense) {
    state.selectedVerbTense = tense;
    ['Past', 'Present', 'Future'].forEach(t => document.getElementById(`tense${t}Btn`).className = 'px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100');
    if (tense === 'past') document.getElementById('tensePastBtn').className = 'px-2 py-1 rounded-lg bg-rose-500 text-white font-bold';
    if (tense === 'present') document.getElementById('tensePresentBtn').className = 'px-2 py-1 rounded-lg bg-amber-400 text-slate-900 font-bold';
    if (tense === 'future') document.getElementById('tenseFutureBtn').className = 'px-2 py-1 rounded-lg bg-emerald-500 text-white font-bold';

    if (state.activeCategory === '02 verbs') {
        renderModalItemsGrid('02 verbs');
    }
}

function setPronounModifier(mod) {
    state.selectedPronounModifier = mod;
    ['Standard', 'Male', 'Female', 'Verb'].forEach(m => document.getElementById(`pronounMod${m}`).className = 'px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100');
    if (mod === 'standard') document.getElementById('pronounModStandard').className = 'px-2 py-1 rounded-lg bg-sky-500 text-white font-bold';
    if (mod === 'possessive_male') document.getElementById('pronounModMale').className = 'px-2 py-1 rounded-lg bg-blue-500 text-white font-bold';
    if (mod === 'possessive_female') document.getElementById('pronounModFemale').className = 'px-2 py-1 rounded-lg bg-pink-500 text-white font-bold';
    if (mod === 'possessive_verb') document.getElementById('pronounModVerb').className = 'px-2 py-1 rounded-lg bg-teal-500 text-white font-bold';
}

function renderModalItemsGrid(categoryId) {
    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = '';
    const items = ITEMS_DATABASE[categoryId] || [];
    const cat = CATEGORIES.find(c => c.id === categoryId);
    const slotInfo = state.activePickerSlot;

    items.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col items-center w-full';

        let displayTitle = item.title;

        // Preview conjugated verb OR dynamically map Adjectives/Colors right inside the modal
        if (categoryId === '02 verbs' || categoryId === '05 adjectives' || categoryId === '10 colors') {
            const simulatedItem = { ...item, categoryId, verbTense: state.selectedVerbTense };
            displayTitle = getDisplayedItemTitle(simulatedItem, slotInfo.row, slotInfo.index);
        } else if (!displayTitle) {
            // Safe fallback just in case 'title' is missing on standard items
            displayTitle = item.titleMale || '';
        }

        const card = document.createElement('div');
        makeInteractiveCard(card, displayTitle);
        card.className = 'picker-card slot-card !max-h-[130px] !max-w-[130px] rounded-2xl border bg-white p-1 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow';
        card.onclick = () => selectItemForSlot(item, categoryId);
        card.innerHTML = `
            <div class="w-full h-full flex items-center justify-center p-1">
                <img loading="lazy" decoding="async" alt="${displayTitle}" src="${getBasicImagePath({ ...item, categoryId: cat.id })}" class="w-full h-full object-contain" onerror="this.onerror=null; this.src='assets/image-fallback.svg';">
            </div>
        `;

        const titleEl = document.createElement('div');
        titleEl.className = 'text-[11px] sm:text-xs font-black text-slate-800 truncate w-full text-center mt-1 h-4';
        titleEl.innerText = displayTitle;

        wrapper.appendChild(card);
        wrapper.appendChild(titleEl);
        grid.appendChild(wrapper);
    });
}

function selectItemForSlot(item, categoryId) {
    const slotInfo = state.activePickerSlot;
    const itemCopy = { ...item, categoryId, verbTense: state.selectedVerbTense, pronounModifier: state.selectedPronounModifier };
    if (slotInfo.row === 1) state.row1Slots[slotInfo.index] = itemCopy;
    else state.row2Slots[slotInfo.index] = itemCopy;
    closeCategoryModal();
    renderWorkplace();
    playSlotAudio(itemCopy, slotInfo.row, slotInfo.index);
}

function openAdvancedCategoryModal() {
    openPicker('advancedModal');
    renderAdvMainCategoriesList();
    selectAdvFolder(state.advFolder);
}

function closeAdvancedModal() { closePicker('advancedModal'); }

function renderAdvMainCategoriesList() {
    const container = document.getElementById('advMainCatList');
    container.innerHTML = '';
    ADVANCED_CATEGORIES.forEach(cat => {
        const isSelected = cat.folder === state.advFolder;
        const btn = document.createElement('button');
        btn.className = `w-full text-right p-2.5 sm:p-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-between shrink-0 ${isSelected ? 'bg-purple-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-purple-50'}`;
        btn.onclick = () => selectAdvFolder(cat.folder);
        btn.innerHTML = `<span>${cat.name}</span><span class="text-[10px] opacity-80 px-1.5 py-0.5 rounded bg-black/10">${cat.folder} خانات</span>`;
        container.appendChild(btn);
    });
}

function selectAdvFolder(folder) {
    state.advFolder = folder;
    renderAdvMainCategoriesList();

    const cat = ADVANCED_CATEGORIES.find(c => c.folder === folder);
    state.advSubCatId = cat.subcategories[0].id;

    renderAdvSubCategoriesList(cat.subcategories);
    renderAdvItemsGrid(folder, state.advSubCatId);
}

function renderAdvSubCategoriesList(subcategories) {
    const container = document.getElementById('advSubCatList');
    container.innerHTML = '';
    subcategories.forEach(sub => {
        const isSelected = sub.id === state.advSubCatId;
        const btn = document.createElement('button');
        btn.className = `px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors shrink-0 ${isSelected ? 'bg-purple-100 text-purple-900 border-2 border-purple-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`;
        btn.onclick = () => {
            state.advSubCatId = sub.id;
            renderAdvSubCategoriesList(subcategories);
            renderAdvItemsGrid(state.advFolder, sub.id);
        };
        btn.innerText = `${sub.id}. ${sub.name}`;
        container.appendChild(btn);
    });
}

function renderAdvItemsGrid(folder, subCatId) {
    const grid = document.getElementById('advItemsGrid');
    grid.innerHTML = '';

    for (let i = 1; i <= 24; i++) {
        const item = getAdvancedItemData(folder, subCatId, i);

        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col items-center w-full';

        const card = document.createElement('div');
        makeInteractiveCard(card, item.title);
        card.className = 'picker-card featured-16-9-card rounded-2xl border bg-white p-1 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-shadow border-purple-100 hover:border-purple-300';
        card.onclick = () => selectAdvancedSentenceItem(item);

        card.innerHTML = `
            <div class="w-full h-full flex items-center justify-center p-1">
                <img loading="lazy" decoding="async" src="${item.imgPath}" alt="${item.title}" class="w-full h-full object-contain filter drop-shadow-sm" onerror="this.onerror=null; this.src='assets/image-fallback.svg';">
            </div>
        `;

        const titleEl = document.createElement('div');
        titleEl.className = 'text-[11px] sm:text-xs font-black text-purple-950 truncate w-full text-center mt-1 h-4';
        titleEl.innerText = item.title;

        wrapper.appendChild(card);
        wrapper.appendChild(titleEl);
        grid.appendChild(wrapper);
    }
}

function selectAdvancedSentenceItem(item) {
    state.featuredAdvancedCard = item;
    state.slotCount = parseInt(item.folder);

    state.row1Slots = Array(6).fill(null);
    item.slots.forEach((s, idx) => {
        if (idx < 6) state.row1Slots[idx] = s;
    });

    closeAdvancedModal();
    renderWorkplace();

    playAudioFilePath(item.soundPath, item.title);
}

// Fixed playAudioFilePath to ensure strict synchrony by preventing overlapping double-resolves if a file fails to load
function playAudioFilePath(path, fallbackSpeechText) {
    playbackRequestId++;
    // Stop a previous individual tap and settle its promise before reusing the element.
    if (finishActivePlayback) finishActivePlayback();
    playbackAudio.pause();
    window.speechSynthesis?.cancel();
    showAudioStatus('');

    return new Promise(resolve => {
        let finished = false;
        let handlingError = false;
        let speechTimer;
        const finish = (completed = false) => {
            if (finished) return;
            finished = true;
            clearTimeout(timeout);
            clearTimeout(speechTimer);
            playbackAudio.onended = null;
            playbackAudio.onerror = null;
            playbackAudio.pause();
            if (finishActivePlayback === finish) finishActivePlayback = null;
            resolve(completed);
        };
        // A missing or stalled media response must never leave the play button locked.
        const timeout = setTimeout(() => {
            window.speechSynthesis?.cancel();
            showAudioStatus('تعذر تشغيل الصوت. اضغط على البطاقة للمحاولة مجدداً.');
            finish();
        }, 45000);
        finishActivePlayback = finish;
        playbackAudio.onended = () => finish(true);

        const handleError = error => {
            if (finished || handlingError) return;
            handlingError = true;
            if (error?.name === 'NotAllowedError') {
                showAudioStatus('اضغط على البطاقة لتفعيل الصوت في المتصفح.');
                finish();
                return;
            }
            if ('speechSynthesis' in window && fallbackSpeechText) {
                const utterance = new SpeechSynthesisUtterance(fallbackSpeechText);
                utterance.lang = 'ar-SA';
                utterance.rate = 0.9;
                utterance.onend = () => finish(true);
                utterance.onerror = () => finish();
                speechTimer = setTimeout(() => {
                    if (!finished) window.speechSynthesis.speak(utterance);
                }, 50);
            } else {
                showAudioStatus('تعذر تشغيل الصوت. اضغط على البطاقة للمحاولة مجدداً.');
                finish();
            }
        };
        playbackAudio.onerror = handleError;
        if (!path) { handleError(); return; }
        playbackAudio.src = path;
        try {
            const playPromise = playbackAudio.play();
            if (playPromise) playPromise.catch(handleError);
        } catch (error) { handleError(error); }
    });
}

async function playSlotAudio(item, rowNumber, slotIndex) {
    if (!item) return;
    for (const segment of getSlotAudioSegments(item, rowNumber, slotIndex)) {
        const playback = playAudioFilePath(segment.path, segment.text);
        const requestId = playbackRequestId;
        const completed = await playback;
        // An interrupted tap must not resume its second clip over newer playback.
        if (!completed || requestId !== playbackRequestId) return;
    }
}

// Enforced strict awaiting sequences with play button locking
async function playSentenceSequence() {
    // Check state lock to prevent spamming
    if (state.isPlayingSequence) return;
    state.isPlayingSequence = true;
    const sequenceToken = ++sentencePlaybackToken;

    const playBtn = document.getElementById('sequencePlayBtn');
    if (playBtn) {
        playBtn.disabled = true;
        playBtn.setAttribute('aria-busy', 'true');
        playBtn.classList.add('opacity-75', 'cursor-not-allowed', 'scale-95');
    }

    try {
        // Wait for the complete execution of the Big Card first
        if (state.isAdvancedMode && state.featuredAdvancedCard) {
            const featCard = document.getElementById('featuredCard');
            if (featCard) featCard.classList.add('playing-ring');

            // Await fully ensures it blocks until completion
            await playAudioFilePath(state.featuredAdvancedCard.soundPath, state.featuredAdvancedCard.title);
            if (sequenceToken !== sentencePlaybackToken) return;

            if (featCard) featCard.classList.remove('playing-ring');
            await new Promise(res => setTimeout(res, 400)); // Natural pause before slot cards
        }

        // Play subsequent individual cards in sequence
        const rows = state.isMultiline ? [1, 2] : [1];
        for (const r of rows) {
            const slotsData = r === 1 ? state.row1Slots : state.row2Slots;
            for (let i = 0; i < state.slotCount; i++) {
                const item = slotsData[i];
                if (sequenceToken !== sentencePlaybackToken) return;
                if (!item) continue;

                const card = document.getElementById(`slot-${r}-${i}`);
                if (card) card.classList.add('playing-ring');

                // Wait for each individual card
                await playSlotAudio(item, r, i);
                if (sequenceToken !== sentencePlaybackToken) return;

                if (card) card.classList.remove('playing-ring');
                await new Promise(res => setTimeout(res, 150));
            }
        }
    } finally {
        // Free lock
        if (sequenceToken === sentencePlaybackToken) state.isPlayingSequence = false;
        if (playBtn) {
            playBtn.disabled = false;
            playBtn.setAttribute('aria-busy', 'false');
            playBtn.classList.remove('opacity-75', 'cursor-not-allowed', 'scale-95');
        }
    }
}

// A shared audio element retains the user's playback gesture on mobile browsers.
const playbackAudio = new Audio();
playbackAudio.crossOrigin = 'anonymous';
playbackAudio.preload = 'auto';
let finishActivePlayback = null;
let playbackRequestId = 0;
let sentencePlaybackToken = 0;
let pickerRestoreFocus = null;

function stopAllPlayback() {
    sentencePlaybackToken++;
    playbackRequestId++;
    finishActivePlayback?.();
    playbackAudio.pause();
    window.speechSynthesis?.cancel();
    state.isPlayingSequence = false;
    document.querySelectorAll('.playing-ring').forEach(card => card.classList.remove('playing-ring'));
    const playButton = document.getElementById('sequencePlayBtn');
    if (playButton) {
        playButton.disabled = false;
        playButton.setAttribute('aria-busy', 'false');
        playButton.classList.remove('opacity-75', 'cursor-not-allowed', 'scale-95');
    }
}

function updateViewportHeight() {
    // Preserve pinch zoom; only track browser-bar/orientation changes at normal scale.
    if (window.visualViewport && window.visualViewport.scale !== 1) return;
    const height = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${height}px`);
}

function openPicker(id) {
    pickerRestoreFocus = document.activeElement;
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    document.querySelector('header').inert = true;
    document.getElementById('homeView').inert = true;
    document.getElementById('workplaceView').inert = true;
    modal.querySelector('button[aria-label="إغلاق"]').focus();
}

function closePicker(id) {
    document.getElementById(id).classList.add('hidden');
    document.querySelector('header').inert = false;
    document.getElementById('homeView').inert = false;
    document.getElementById('workplaceView').inert = false;
    const previousFocus = pickerRestoreFocus;
    pickerRestoreFocus = null;
    requestAnimationFrame(() => {
        if (previousFocus?.isConnected) previousFocus.focus();
        else if (id === 'categoryModal') {
            document.getElementById(`slot-${state.activePickerSlot.row}-${state.activePickerSlot.index}`)?.focus();
        } else document.getElementById('featuredCard').focus();
    });
}

function makeInteractiveCard(card, label) {
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.setAttribute('aria-label', label);
}

function syncToolbar() {
    for (const [id, enabled] of [
        ['advancedModeBtn', state.isAdvancedMode],
        ['multilineBtn', state.isMultiline],
        ['circlesToggleBtn', state.showColoredCircles],
        ['coverModeBtn', state.isCoverMode]
    ]) document.getElementById(id).setAttribute('aria-pressed', String(enabled));
    document.querySelectorAll('#templateDropdown button').forEach(button => {
        const selected = Number(button.textContent) === state.slotCount;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('bg-sky-100', selected);
    });
}

function showAudioStatus(message) {
    document.getElementById('audioStatus').textContent = message;
}

// Native buttons already support Enter/Space. Supply the same interaction for cards.
document.addEventListener('keydown', event => {
    const modal = document.querySelector('[role="dialog"]:not(.hidden)');
    if (event.key === 'Escape') {
        if (modal) closePicker(modal.id);
        document.getElementById('templateDropdown').classList.add('hidden');
        document.getElementById('templateToggleBtn').setAttribute('aria-expanded', 'false');
        return;
    }
    if (event.key === 'Tab' && modal) {
        const controls = [...modal.querySelectorAll('button, [tabindex="0"]')]
            .filter(control => !control.disabled && control.getClientRects().length);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault(); first?.focus();
        }
    }
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role="button"]')) {
        event.preventDefault(); event.target.click();
    }
});

for (const id of ['categoryModal', 'advancedModal']) {
    document.getElementById(id).addEventListener('click', event => {
        if (event.target.id === id) closePicker(id);
    });
}
window.addEventListener('resize', updateViewportHeight, { passive: true });
window.visualViewport?.addEventListener('resize', updateViewportHeight, { passive: true });
updateViewportHeight();
navigateTo('home');
syncToolbar();
