// Pure practice helpers shared by the visual guide and navigation.
export const singleItemCategories = new Set(['numbers', 'letters', 'colors', 'animals', 'food', 'words', 'plosives', 'practice']);
export const categoriesByScreen = {
  'slower-rate-practice': ['numbers', 'letters', 'colors', 'animals', 'food', 'words', 'sentences', 'stories'],
  'easy-onset-practice': ['numbers', 'letters', 'words', 'practice', 'sentences', 'stories'],
  'light-contact-practice': ['plosives', 'words', 'sentences'],
  'cancellation-practice': ['words', 'sentences', 'stories'],
  'pull-out-practice': ['words', 'sentences', 'stories'],
  'prep-set-practice': ['words', 'sentences', 'stories']
};
export function splitPhrases(text) {
  // Include Arabic punctuation and retain an unfinished final phrase.
  return text.match(/[^,.!?،؛؟。\n]+[,.!?،؛؟。\n]*/gu)?.map(s => s.trim()).filter(Boolean) || [];
}
export function practiceItems(data, category, letter) {
  return category === 'practice' ? (data.letterWords[letter] || []).map(text => ({ text, icon: null })) : data[category] || [];
}
export function practiceTokens(items, category, pageIndex, itemCount) {
  if (singleItemCategories.has(category)) return items.slice(pageIndex, pageIndex + itemCount).map(item => ({ text: item.text, breath: false }));
  return splitPhrases(items[pageIndex] || '').flatMap(phrase => phrase.split(/\s+/u).map((text, index) => ({ text, breath: index === 0 })));
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
