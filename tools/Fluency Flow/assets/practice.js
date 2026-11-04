// Pure practice helpers shared by the visual guide and navigation.
export const singleItemCategories = new Set(['numbers', 'letters', 'colors', 'animals', 'food', 'words', 'plosives', 'practice']);
export const categoriesByScreen = {
  'slower-rate-practice': ['numbers', 'letters', 'colors', 'animals', 'food', 'words', 'sentences', 'stories', 'conversation', 'situations'],
  'easy-onset-practice': ['numbers', 'letters', 'words', 'practice', 'sentences', 'stories', 'conversation', 'situations'],
  'light-contact-practice': ['plosives', 'words', 'practice', 'sentences', 'conversation', 'situations'],
  'cancellation-practice': ['words', 'sentences', 'stories', 'conversation', 'situations'],
  'pull-out-practice': ['words', 'sentences', 'stories', 'conversation', 'situations'],
  'prep-set-practice': ['words', 'sentences', 'stories', 'conversation', 'situations']
};
// Speaking prompts have no word-by-word guide: the person talks freely for a set time.
export const freeCategories = new Set(['conversation', 'situations']);
export const FREE_SPEECH_MS = 60000;
const WORD_STEP = ['numbers', 'letters', 'colors', 'animals', 'food', 'words', 'plosives', 'practice'];
const PATH = [
  { key: 'words', categories: WORD_STEP },
  { key: 'sentences', categories: ['sentences'] },
  { key: 'stories', categories: ['stories'] },
  { key: 'conversation', categories: ['conversation'] },
  { key: 'situations', categories: ['situations'] }
];
// The speaking path for one exercise, from single words to real situations.
export function pathSteps(screen) {
  const available = categoriesByScreen[screen] || [];
  return PATH.filter(step => step.categories.some(category => available.includes(category))).map(step => ({
    ...step,
    category: step.key === 'words' ? screenDefaults[screen].category : step.key
  }));
}
export function stepOf(category) {
  return PATH.find(step => step.categories.includes(category))?.key || 'words';
}
// Each exercise opens the same way, so nothing carries over from the previous one.
export const screenDefaults = {
  'slower-rate-practice': { category: 'words', itemCount: 1, speed: 5 },
  'easy-onset-practice': { category: 'words', itemCount: 3, speed: 5 },
  'light-contact-practice': { category: 'plosives', itemCount: 3, speed: 5 },
  'cancellation-practice': { category: 'words', itemCount: 3, speed: 7 },
  'pull-out-practice': { category: 'words', itemCount: 3, speed: 7 },
  'prep-set-practice': { category: 'words', itemCount: 3, speed: 7 }
};
// Holding the breath is off by default, and the limits keep a cycle at 4 seconds or longer.
export const breathingPresets = [
  { inhale: 4, hold: 0, exhale: 6 },
  { inhale: 3, hold: 0, exhale: 4 },
  { inhale: 3, hold: 0, exhale: 6 }
];
export const breathingLimits = { inhale: [2, 6], hold: [0, 5], exhale: [2, 10] };
export const breathingCycles = { min: 1, max: 10, initial: 5 };
export const cancellationPause = { min: 1, max: 5, initial: 3 };
const REST_MS = 800;
const STOP_LETTERS = new Set([...'بتدضطقك', ...'BCDGKPQT']);
// Spellings whose first sound is not a stop, despite the first letter.
const NOT_STOP_SPELLING = /^(ch|ce|ci|cy|ge|gi|gy|kn|ph|th)/i;

export function startsWithStop(text) {
  const clean = text.trim().replace(/^ال/u, '');
  return STOP_LETTERS.has(clean[0]?.toUpperCase()) && !NOT_STOP_SPELLING.test(clean);
}
// Easy Onset suits vowels and continuants; stop consonants belong to Light Contact.
export function lettersForScreen(screen, letterWords) {
  const stop = letter => STOP_LETTERS.has(letter.toUpperCase());
  return Object.keys(letterWords).filter(letter => screen === 'light-contact-practice' ? stop(letter) : !stop(letter));
}
function textOf(item) { return typeof item === 'string' ? item : item.text; }
function fitsScreen(screen, category, item) {
  if (!['words', 'practice'].includes(category)) return true;
  if (screen === 'light-contact-practice') return startsWithStop(textOf(item));
  if (screen === 'easy-onset-practice') return !startsWithStop(textOf(item));
  return true;
}
export function splitPhrases(text) {
  // Include Arabic punctuation and retain an unfinished final phrase.
  return text.match(/[^,.!?،؛؟。\n]+[,.!?،؛؟。\n]*/gu)?.map(s => s.trim()).filter(Boolean) || [];
}
export function practiceItems(data, category, letter, screen) {
  const items = category === 'practice' ? (data.letterWords[letter] || []).map(text => ({ text, icon: null })) : data[category] || [];
  return items.filter(item => fitsScreen(screen, category, item));
}
// An estimate for pacing. Arabic practice text has no vowel marks, so its count
// comes from word length and can differ from the true count by one.
export function countSyllables(text) {
  const word = text.split(/\s+-\s+/u).pop();
  const arabic = word.replace(/[^ء-ي]/gu, '');
  if (arabic) return Math.max(1, Math.round(arabic.length / 2));
  const latin = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!latin) return 1;
  const groups = latin.replace(/([^aeiouy])e$/, '$1').match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}
// Speed 1 is 40 syllables a minute (1500 ms each); speed 10 is 200 (300 ms each).
export function syllableMs(speed) { return Math.round(1500 - (speed - 1) * (1200 / 9)); }
export function syllablesPerMinute(speed) { return Math.round(60000 / syllableMs(speed)); }

export function practiceTokens(items, category, pageIndex, itemCount) {
  if (freeCategories.has(category)) {
    return items[pageIndex] ? [{ text: items[pageIndex], breath: false, phraseEnd: true, target: false, syllables: 1, free: true }] : [];
  }
  if (singleItemCategories.has(category)) {
    return items.slice(pageIndex, pageIndex + itemCount).map(item => ({
      text: item.text, breath: true, phraseEnd: true, target: true, syllables: countSyllables(item.text)
    }));
  }
  return splitPhrases(items[pageIndex] || '').flatMap(phrase => {
    const words = phrase.split(/\s+/u);
    const counts = words.map(countSyllables);
    // One target word in each phrase: the longest, and the first if lengths tie.
    const target = counts.reduce((best, count, index) => count > counts[best] || (count === counts[best] && words[index].length > words[best].length) ? index : best, 0);
    return words.map((text, index) => ({
      text, breath: index === 0, phraseEnd: index === words.length - 1, target: index === target, syllables: counts[index]
    }));
  });
}
export function buildCues(screen, tokens, { speed = 5, pauseSeconds = cancellationPause.initial } = {}) {
  const perSyllable = syllableMs(speed);
  const easyOnset = screen === 'easy-onset-practice';
  const cues = [];
  tokens.forEach((token, index) => {
    const push = (phase, duration) => cues.push({ index, phase, duration });
    const say = token.syllables * perSyllable;
    if (token.free) { push('talk', FREE_SPEECH_MS); return; }
    if (easyOnset) {
      if (token.breath) push('breath', 1000);
      push('vocalize', say);
    } else if (token.target && screen === 'cancellation-practice') {
      push('stutter', 1500); push('pause', pauseSeconds * 1000); push('repeat', Math.max(1500, say));
    } else if (token.target && screen === 'pull-out-practice') {
      push('stutter', 1500); push('transition', Math.max(2000, say));
    } else if (token.target && screen === 'prep-set-practice') {
      push('prepare', 1500); push('smooth', Math.max(1500, say));
    } else push('word', say);
    if (!easyOnset && token.phraseEnd && index < tokens.length - 1) push('rest', REST_MS);
  });
  return cues;
}
export function parentScreen(screen) {
  if (['slower-rate-practice', 'easy-onset-practice', 'light-contact-practice'].includes(screen)) return 'fluency-shaping';
  if (['cancellation-practice', 'pull-out-practice', 'prep-set-practice'].includes(screen)) return 'stuttering-modification';
  if (screen === 'breathing-practice') return 'breathing-techniques';
  return 'home';
}
export function readLanguage() {
  try { return localStorage.getItem('fluency-flow-language') === 'en' ? 'en' : 'ar'; } catch { return 'ar'; }
}
