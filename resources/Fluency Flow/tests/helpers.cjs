const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../assets/practice.js'), 'utf8');
  const { splitPhrases, practiceItems, practiceTokens, parentScreen, categoriesByScreen } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  assert.deepEqual(splitPhrases('Hello, world! Last phrase'), ['Hello,', 'world!', 'Last phrase']);
  assert.deepEqual(splitPhrases('مرحباً، كيف حالك؟ بخير؛ شكراً'), ['مرحباً،', 'كيف حالك؟', 'بخير؛', 'شكراً']);
  const data = { words: [{ text: 'one' }, { text: 'two' }], stories: ['Hello, world! Last phrase'], letterWords: { A: ['apple'] } };
  assert.equal(practiceItems(data, 'practice', 'A')[0].text, 'apple');
  assert.deepEqual(practiceItems(data, 'practice', null), []);
  assert.deepEqual(practiceTokens(data.words, 'words', 0, 2).map(item => item.text), ['one', 'two']);
  assert.deepEqual(practiceTokens(data.stories, 'stories', 0, 1), [
    { text: 'Hello,', breath: true }, { text: 'world!', breath: true },
    { text: 'Last', breath: true }, { text: 'phrase', breath: false }
  ]);
  assert.ok(categoriesByScreen['light-contact-practice'].includes('sentences'));
  assert.ok(categoriesByScreen['cancellation-practice'].includes('words'));
  assert.equal(parentScreen('easy-onset-practice'), 'fluency-shaping');
  assert.equal(parentScreen('pull-out-practice'), 'stuttering-modification');
  assert.equal(parentScreen('breathing-practice'), 'breathing-techniques');
  console.log('PASS shared practice helpers: Arabic punctuation, trailing phrases, word batches, letter data and back navigation');
})().catch(error => { console.error(error); process.exitCode = 1; });
