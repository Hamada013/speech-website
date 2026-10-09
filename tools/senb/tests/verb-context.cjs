const assert = require('node:assert/strict');
const vm = require('node:vm');
const { currentContext } = require('./regression.cjs');
const context = currentContext();
const run = code => vm.runInContext(code, context);
const verb = { id: 14, categoryId: '02 verbs', title: 'قعد' };
const modifiers = [null, { categoryId: '05 adjectives' }, { categoryId: '10 colors' }, { categoryId: '08 linking' }, { categoryId: '07 Pronoun', code: 'your_f' }];
let checks = 0;
for (const row of [1, 2]) {
    for (const candidate of [
        ...['01 subject', '03 object', '04 place'].flatMap(categoryId => [
            { slot: { categoryId, gender: 'male' }, expected: 'he' },
            { slot: { categoryId, gender: 'female' }, expected: 'she' },
            { slot: { categoryId, gender: 'female', genderCode: 'they' }, expected: 'they' }
        ]),
        ...['i', 'he', 'she', 'they', 'we', 'youfemale', 'youmale', 'youplural'].map(code => ({ slot: { categoryId: '07 Pronoun', code }, expected: code }))
    ]) {
        for (const modifier of modifiers) for (const tense of ['past', 'present', 'future']) {
            context.slots = [candidate.slot, modifier, null];
            context.item = { ...verb, verbTense: tense };
            run(`state.row${row}Slots = slots; state.row${row === 1 ? 2 : 1}Slots = [{ categoryId: '01 subject', genderCode: '${candidate.expected === 'she' ? 'he' : 'she'}' }];`);
            assert.equal(context.resolveAudioPath(context.item, row, 3), `sounds/verbs/${tense}/${candidate.expected}/14.m4a`);
            assert.equal(context.getDisplayedItemTitle(context.item, row, 3), run(`VERB_CONJUGATIONS[14]['${tense}']['${candidate.expected}']`));
            const segments = context.getSlotAudioSegments(context.item, row, 3);
            assert.equal(segments[0].path, `sounds/verbs/${tense === 'future' ? 'present' : tense}/${candidate.expected}/${tense === 'future' ? 15 : 14}.m4a`);
            if (tense === 'future') assert.equal(segments[1].path, `sounds/verbs/present/${candidate.expected}/14.m4a`);
            checks++;
        }
    }
    // The closest valid earlier subject wins; later nouns and the other row do not affect it.
    run(`state.row${row}Slots = [{ categoryId: '01 subject', genderCode: 'he' }, { categoryId: '07 Pronoun', code: 'she' }, null, { categoryId: '03 object', gender: 'male' }];`);
    assert.equal(context.resolveAudioPath({ ...verb, verbTense: 'present', conjugation: 'he' }, row, 2), 'sounds/verbs/present/she/14.m4a');
    run(`state.row${row}Slots = [null, { categoryId: '05 adjectives' }];`);
    assert.equal(context.resolveAudioPath({ ...verb, verbTense: 'past' }, row, 2), 'sounds/verbs/past/i/14.m4a');
    assert.equal(context.resolveAudioPath({ ...verb, verbTense: 'past', conjugation: 'they' }, row, 2), 'sounds/verbs/past/they/14.m4a');
}

const example = context.getAdvancedItemData(5, 8, 1);
context.example = example;
run('state.row1Slots = example.slots;');
assert.equal(example.title, 'ولد حزين يقعد على كرسي');
assert.equal(context.resolveAudioPath(example.slots[2], 1, 2), 'sounds/verbs/present/he/14.m4a');
assert.equal(context.getDisplayedItemTitle(example.slots[2], 1, 2), 'يقعد');

// Every subgroup-8 preset's annotated verb conjugation must match its audio context.
for (let folder = 2; folder <= 6; folder++) for (let item = 1; item <= 24; item++) {
    const preset = context.getAdvancedItemData(folder, 8, item);
    context.preset = preset;
    run('state.row1Slots = preset.slots;');
    preset.slots.forEach((slot, index) => {
        if (slot.categoryId !== '02 verbs') return;
        assert.equal(context.getContextVerbSubject(slot, 1, index), slot.conjugation, `${folder}/8/${item}`);
        assert.equal(context.getDisplayedItemTitle(slot, 1, index), slot.title, 'Preset title overrides must stay intact');
    });
}
console.log(`PASS: ${checks} verb-context cases across nouns/pronouns, gaps, modifiers, both rows, and all tenses; all 120 subgroup-8 presets use their intended conjugation.`);
