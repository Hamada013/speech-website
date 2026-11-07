// Read the authoritative Arabic labels from the existing app. Filenames alone
// cannot provide word labels or clinical norms. Never renumber around a gap.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
// Labels come from the Vocabulary Builder repository next to this one; pictures and recordings are
// this survey's own copies in media/, so the assessment never depends on another app at runtime.
const vocabulary = path.resolve(root, process.env.VOC_SOURCE || '../../../vocabulary-builder');
const source = fs.readFileSync(path.join(vocabulary, 'index.html'), 'utf8');
const start = source.indexOf('const RAW_CATEGORIES =');
const end = source.indexOf('const app =', start);
if (start < 0 || end < 0) throw new Error('Cannot locate vocabulary label definitions');
const categories = vm.runInNewContext(`${source.slice(start, end)}; JSON.parse(JSON.stringify(CATEGORIES));`, {}, { timeout: 1000 });
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const items = [], excluded = [];
for (const category of categories) for (const item of category.items) {
    const imageFile = `media/images/${category.id}/${item.id}.webp`;
    const audioFile = `media/sounds/${category.id}/${item.id}.m4a`;
    const missing = [imageFile, audioFile].filter(file => !fs.existsSync(path.join(root, file)));
    if (missing.length) { excluded.push({ id: `${category.id}-${item.id}`, label: item.name, missing }); continue; }
    const imageRevision = hash(fs.readFileSync(path.join(root, imageFile)));
    const audioRevision = hash(fs.readFileSync(path.join(root, audioFile)));
    items.push({ id: `${category.id}-${item.id}`, folder: category.id, number: item.id, category: category.name,
        label: item.name, image: imageFile, audio: audioFile, imageRevision,
        revision: hash(imageRevision + audioRevision + item.name) });
}
// The version changes only when words or media revisions change, not when files move,
// so an assessment in progress can still be resumed after a relocation.
const content = list => JSON.stringify(list.map(({ image, audio, ...item }) => item));
let previous; try { previous = JSON.parse(fs.readFileSync(path.join(root, 'data/vocabulary.json'), 'utf8')); } catch {}
const version = previous && content(previous.items) === content(items) ? previous.version : hash(JSON.stringify(items)).slice(0, 20);
const data = { schemaVersion: 1, locale: 'ar-SY', source: 'vocabulary-builder/index.html', version, items, excluded };
fs.writeFileSync(path.join(root, 'data/vocabulary.json'), JSON.stringify(data));
console.log(`${items.length} available vocabulary items; ${excluded.length} missing-media items excluded.`);
