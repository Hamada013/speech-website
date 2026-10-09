// Activity planning reads the original sentence library without changing its mappings.
const SENBActivities = (() => {
    function shuffle(items, random = Math.random) {
        const result = [...items];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    function sentences(folder, subgroup) {
        return Array.from({ length: 24 }, (_, index) => getAdvancedItemData(folder, subgroup, index + 1));
    }
    // Legacy spelling aliases are resolved on copies, never in the preset library.
    // Unassigned cards stay unassigned instead of guessing another image/recording.
    function normalizeSlot(slot) {
        const aliases = { '07 pronoun': '07 Pronoun', '08 conjunctions': '08 linking', '12 numbers': '11 numbers', '02 object': '03 object' };
        const categoryId = slot.categoryId === '07 pronouns' && slot.title === 'و'
            ? '08 linking' : aliases[slot.categoryId] || slot.categoryId;
        const id = slot.categoryId === '07 pronouns' && slot.title === 'و' ? 3 : slot.id;
        const base = ITEMS_DATABASE[categoryId]?.find(item => item.id === id);
        return { ...base, ...slot, categoryId, id };
    }
    function hasMappedCard(slot) {
        const item = normalizeSlot(slot);
        return Boolean(ITEMS_DATABASE[item.categoryId]?.some(base => base.id === item.id));
    }
    function imagePath(slot) {
        const item = normalizeSlot(slot);
        return (item.customImgPath || hasMappedCard(item)) ? getBasicImagePath(item) : 'assets/image-fallback.svg';
    }
    const key = sentence => `${sentence.folder}/${sentence.subCatId}/${sentence.itemNum}`;
    const signature = (sentence, presentation) => presentation === 'slots'
        ? sentence.slots.map(imagePath).join('|') : sentence.imgPath;
    function testPlan(folder, presentation = 'advanced', random = Math.random, selectedSubgroup = null) {
        const plan = [];
        const subgroups = selectedSubgroup === null ? Array.from({ length: 8 }, (_, index) => index + 1) : [selectedSubgroup];
        for (const subgroup of subgroups) {
            const pool = sentences(folder, subgroup);
            for (const target of shuffle(pool, random).slice(0, 3)) {
                const seen = new Set([signature(target, presentation)]);
                const distractors = shuffle(pool, random).filter(candidate => {
                    const visual = signature(candidate, presentation);
                    if (seen.has(visual)) return false;
                    seen.add(visual);
                    return true;
                }).slice(0, 3);
                if (distractors.length !== 3) throw new Error('Not enough distinct sentence choices');
                plan.push({ target, choices: shuffle([target, ...distractors], random) });
            }
        }
        return plan;
    }
    function gameBag(folder, random = Math.random) {
        return shuffle(Array.from({ length: 8 }, (_, index) => sentences(folder, index + 1)).flat(), random);
    }
    function gameRound(sentence, random = Math.random) {
        const eligible = sentence.slots.map((slot, index) => hasMappedCard(slot) ? index : -1).filter(index => index >= 0);
        const missingIndex = eligible[Math.floor(random() * eligible.length)];
        const wanted = normalizeSlot(sentence.slots[missingIndex]);
        const distractors = shuffle(ITEMS_DATABASE[wanted.categoryId], random)
            .filter(item => imagePath({ ...item, categoryId: wanted.categoryId }) !== imagePath(wanted))
            .slice(0, 2).map(item => ({ ...item, categoryId: wanted.categoryId, verbTense: wanted.verbTense, conjugation: wanted.conjugation, pronounModifier: wanted.pronounModifier }));
        return { sentence, missingIndex, choices: shuffle([wanted, ...distractors], random), solved: false, selected: null, attempts: 0, hintUsed: false };
    }
    // Grammar lookup is synchronous. Restore the manual board before any audio awaits.
    function inSentence(sentence, callback) {
        const row = state.row1Slots;
        try { state.row1Slots = sentence.slots; return callback(); }
        finally { state.row1Slots = row; }
    }
    function slotTitle(sentence, slot, index) {
        return inSentence(sentence, () => getDisplayedItemTitle(normalizeSlot(slot), 1, index));
    }
    function slotSegments(sentence, slot, index) {
        const item = normalizeSlot(slot);
        return inSentence(sentence, () => hasMappedCard(item)
            ? getSlotAudioSegments(item, 1, index) : [{ path: null, text: getDisplayedItemTitle(item, 1, index) }]);
    }
    return { shuffle, sentences, normalizeSlot, hasMappedCard, imagePath, key, signature, testPlan, gameBag, gameRound, slotTitle, slotSegments };
})();
