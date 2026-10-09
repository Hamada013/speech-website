const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const { currentContext } = require('./regression.cjs');
const context = currentContext();
const originalPresets = vm.runInContext('JSON.stringify(ADVANCED_REFERENCE_DB)', context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/activities-model.js'), 'utf8'), context);
const model = vm.runInContext('SENBActivities', context);
function random(seed = 9) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
for (let folder = 2; folder <= 6; folder++) {
    for (const presentation of ['advanced', 'slots']) {
        const plan = model.testPlan(folder, presentation, random(folder));
        assert.equal(plan.length, 24);
        for (let subgroup = 1; subgroup <= 8; subgroup++) {
            const trials = plan.filter(trial => Number(trial.target.subCatId) === subgroup);
            assert.equal(trials.length, 3);
            assert.equal(new Set(trials.map(trial => trial.target.itemNum)).size, 3);
            for (const trial of trials) {
                assert.equal(trial.choices.length, 4);
                assert.equal(new Set(trial.choices.map(sentence => model.signature(sentence, presentation))).size, 4);
                assert.equal(trial.choices.filter(sentence => model.key(sentence) === model.key(trial.target)).length, 1);
                assert.ok(trial.choices.every(sentence => Number(sentence.folder) === folder && Number(sentence.subCatId) === subgroup));
            }
        }
        assert.notDeepEqual(plan.map(trial => model.key(trial.target)), model.testPlan(folder, presentation, random(folder + 20)).map(trial => model.key(trial.target)));
        for (let subgroup = 1; subgroup <= 8; subgroup++) {
            const selected = model.testPlan(folder, presentation, random(folder + subgroup), subgroup);
            assert.equal(selected.length, 3, 'A selected subgroup must have exactly three trials');
            assert.equal(new Set(selected.map(trial => trial.target.itemNum)).size, 3);
            assert.ok(selected.every(trial => Number(trial.target.subCatId) === subgroup));
            for (const trial of selected) {
                assert.equal(trial.choices.length, 4);
                assert.equal(new Set(trial.choices.map(sentence => model.signature(sentence, presentation))).size, 4);
                assert.ok(trial.choices.every(sentence => Number(sentence.subCatId) === subgroup && Number(sentence.folder) === folder));
                assert.equal(trial.choices.filter(sentence => model.key(sentence) === model.key(trial.target)).length, 1);
            }
        }
    }
    const bag = model.gameBag(folder, random());
    assert.equal(bag.length, 192);
    assert.equal(new Set(bag.map(model.key)).size, 192);
    for (const sentence of bag) {
        for (const slot of sentence.slots) assert.ok(fs.existsSync(path.join(__dirname, '..', model.imagePath(slot))), 'Activity image must exist, including a safe placeholder for unassigned slots');
        sentence.slots.forEach((slot, index) => {
            if (slot.categoryId !== '02 verbs' || !model.hasMappedCard(slot)) return;
            context.scenarioSentence = sentence;
            context.scenarioIndex = index;
            const originalSegments = vm.runInContext('(() => { const row = state.row1Slots; try { state.row1Slots = scenarioSentence.slots; return getSlotAudioSegments(scenarioSentence.slots[scenarioIndex], 1, scenarioIndex); } finally { state.row1Slots = row; } })()', context);
            assert.equal(JSON.stringify(model.slotSegments(sentence, slot, index)), JSON.stringify(originalSegments), 'Activity verbs must use the same tense/pronoun audio as the workplace');
        });
        const round = model.gameRound(sentence, random(sentence.itemNum));
        assert.ok(round.missingIndex >= 0 && round.missingIndex < folder);
        assert.equal(round.choices.length, 3);
        assert.equal(new Set(round.choices.map(model.imagePath)).size, 3);
        assert.equal(round.choices.filter(slot => model.imagePath(slot) === model.imagePath(sentence.slots[round.missingIndex])).length, 1);
        assert.ok(model.hasMappedCard(sentence.slots[round.missingIndex]), 'The missing game card must have a real mapping');
        assert.ok(round.choices.every(slot => slot.categoryId === model.normalizeSlot(sentence.slots[round.missingIndex]).categoryId));
    }
}
vm.runInContext("state.row1Slots = [{id:2,categoryId:'01 subject',genderCode:'she'}];", context);
const manualRow = vm.runInContext('state.row1Slots', context);
const sentence = context.getAdvancedItemData(5, 8, 1);
assert.equal(model.slotSegments(sentence, sentence.slots[2], 2)[0].path, 'sounds/verbs/present/he/14.m4a');
assert.equal(vm.runInContext('state.row1Slots', context), manualRow, 'Activity grammar must restore the manual board immediately');
assert.equal(model.slotTitle(sentence, sentence.slots[2], 2), 'يقعد');
assert.equal(vm.runInContext('state.row1Slots', context), manualRow);
assert.equal(model.normalizeSlot({ categoryId: '07 pronoun', id: 7, title: 'انت' }).code, vm.runInContext("ITEMS_DATABASE['07 Pronoun'].find(item => item.id === 7).code", context), 'Activity aliases must preserve the existing vocabulary codes');
assert.equal(model.imagePath({ categoryId: '07 pronouns', id: 2, title: 'و' }), 'images/08 linking/3.webp');
assert.equal(model.imagePath({ categoryId: 'UNKNOWN', id: 57, title: 'كتب' }), 'assets/image-fallback.svg');
assert.equal(model.slotSegments(sentence, { categoryId: 'UNKNOWN', id: 0, title: 'مبسوطة' }, 1)[0].path, null, 'An unassigned card must not play an unrelated subject recording');
assert.equal(vm.runInContext('JSON.stringify(ADVANCED_REFERENCE_DB)', context), originalPresets, 'Planning and grammar reads must leave every original preset unchanged');
console.log('PASS: 10 all-subgroup and 80 single-subgroup assessment plans have 3 distinct trials/subgroup and 4 unique choices; 960 game rounds have one mapped missing slot and 3 unique candidates; every mapped preset verb matches workplace grammar; original data and manual context are preserved.');
