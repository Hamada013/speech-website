const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../assets/practice.js'), 'utf8');
  const { splitPhrases, practiceItems, practiceTokens, parentScreen, categoriesByScreen, buildCues, countSyllables, syllablesPerMinute, breathingPresets, breathingLimits, lettersForScreen } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  assert.deepEqual(splitPhrases('Hello, world! Last phrase'), ['Hello,', 'world!', 'Last phrase']);
  assert.deepEqual(splitPhrases('مرحباً، كيف حالك؟ بخير؛ شكراً'), ['مرحباً،', 'كيف حالك؟', 'بخير؛', 'شكراً']);
  const data = { words: [{ text: 'one' }, { text: 'two' }], stories: ['Hello, world! Last phrase'], letterWords: { A: ['apple'] } };
  assert.equal(practiceItems(data, 'practice', 'A')[0].text, 'apple');
  assert.deepEqual(practiceItems(data, 'practice', null), []);
  assert.deepEqual(practiceTokens(data.words, 'words', 0, 2).map(item => item.text), ['one', 'two']);
  assert.deepEqual(practiceTokens(data.stories, 'stories', 0, 1).map(({ text, breath, phraseEnd }) => ({ text, breath, phraseEnd })), [
    { text: 'Hello,', breath: true, phraseEnd: true }, { text: 'world!', breath: true, phraseEnd: true },
    { text: 'Last', breath: true, phraseEnd: false }, { text: 'phrase', breath: false, phraseEnd: true }
  ]);
  // Rate runs from 40 to 200 syllables a minute.
  assert.equal(syllablesPerMinute(1), 40); assert.equal(syllablesPerMinute(10), 200);
  assert.equal(countSyllables('banana'), 3); assert.equal(countSyllables('cake'), 1); assert.equal(countSyllables('تفاحة'), 3);
  assert.equal(countSyllables('P - Pen'), 1); assert.equal(countSyllables('7'), 1);
  const phases = (screen, tokens, options) => buildCues(screen, tokens, options).map(cue => `${cue.index}:${cue.phase}`);
  const three = practiceTokens([{ text: 'sun' }, { text: 'moon' }, { text: 'star' }], 'words', 0, 3);
  // Every single word gets its own gentle breath.
  assert.deepEqual(phases('easy-onset-practice', three), ['0:breath', '0:vocalize', '1:breath', '1:vocalize', '2:breath', '2:vocalize']);
  // Slower Rate pauses at punctuation, but not after the last word.
  const story = practiceTokens(['One two, three.'], 'stories', 0, 1);
  assert.deepEqual(phases('slower-rate-practice', story), ['0:word', '1:word', '1:rest', '2:word']);
  // Word length changes the time: three syllables take three times as long as one.
  const timed = practiceTokens([{ text: 'sun' }, { text: 'banana' }], 'words', 0, 2);
  const say = buildCues('slower-rate-practice', timed, { speed: 5 }).filter(cue => cue.phase === 'word');
  assert.equal(say[1].duration, say[0].duration * 3);
  // Stuttering modification uses one target word in each phrase, not every word.
  const sentence = practiceTokens(['I like to eat apples.'], 'sentences', 0, 1);
  assert.deepEqual(sentence.filter(token => token.target).map(token => token.text), ['apples.']);
  assert.equal(buildCues('cancellation-practice', sentence).filter(cue => cue.phase === 'stutter').length, 1);
  const pause = options => buildCues('cancellation-practice', three, options).find(cue => cue.phase === 'pause').duration;
  assert.equal(pause(), 3000); assert.equal(pause({ pauseSeconds: 5 }), 5000);
  // Breathing: no held breath by default, and the fastest cycle is 4 seconds.
  assert.ok(breathingPresets.every(preset => preset.hold === 0));
  assert.deepEqual(breathingPresets[2], { inhale: 3, hold: 0, exhale: 6 });
  assert.equal(breathingLimits.inhale[0] + breathingLimits.hold[0] + breathingLimits.exhale[0], 4);
  // Stops are practiced in Light Contact; everything else in Easy Onset. ج stays with Easy Onset for /ʒ/.
  const bank = { 'أ': ['أرنب'], 'ب': ['باب'], 'ج': ['جمل'], 'A': ['apple'], 'B': ['ball'], 'H': ['hat'] };
  assert.deepEqual(lettersForScreen('easy-onset-practice', bank), ['أ', 'ج', 'A', 'H']);
  assert.deepEqual(lettersForScreen('light-contact-practice', bank), ['ب', 'B']);
  const mixed = { words: [{ text: 'Ball' }, { text: 'Cheese' }, { text: 'Sun' }] };
  assert.deepEqual(practiceItems(mixed, 'words', null, 'light-contact-practice').map(item => item.text), ['Ball']);
  assert.deepEqual(practiceItems(mixed, 'words', null, 'easy-onset-practice').map(item => item.text), ['Cheese', 'Sun']);
  assert.equal(practiceItems(mixed, 'words', null, 'slower-rate-practice').length, 3);
  assert.ok(categoriesByScreen['light-contact-practice'].includes('sentences'));
  assert.ok(categoriesByScreen['cancellation-practice'].includes('words'));
  assert.equal(parentScreen('easy-onset-practice'), 'fluency-shaping');
  assert.equal(parentScreen('pull-out-practice'), 'stuttering-modification');
  assert.equal(parentScreen('breathing-practice'), 'breathing-techniques');
  console.log('PASS shared practice helpers: Arabic punctuation, phrases, word batches, letter data, back navigation, pacing, pauses, targets, breathing limits and sound grouping');
})().catch(error => { console.error(error); process.exitCode = 1; });
