const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../assets/model.js');
const T = require('../assets/tasks.js');
const D = require('../assets/data.js');
const date = (year, month, day) => ({ year: String(year), month: String(month), day: String(day) });
const root = path.resolve(__dirname, '..');

test('clinical observations have explicit states, two labels, sources and no preset result', () => {
  assert.equal(D.sections.length, 9);
  assert.equal(new Set(M.fields.map(field => field.id)).size, M.fields.length);
  const observations = M.fields.filter(field => field.observation);
  assert.equal(observations.length, 14);
  for (const field of observations) {
    assert.deepEqual(field.options.map(option => option.key), ['observed', 'not-observed', 'uncertain', 'not-assessed', 'untestable']);
    assert.ok(field.refs.every(id => D.sources.some(source => source.id === id)));
    assert.ok(field.options.every(option => /[\u0600-\u06ff]/.test(option.label[1])));
  }
  assert.equal(M.countAnswers({}), 0);
});

test('calendar dates and age use Arabic digits, real dates and the recorded assessment', () => {
  assert.equal(M.parseDate({ day: '٢٩', month: '٠٢', year: '١٩٦٠' }).iso, '1960-02-29');
  assert.equal(M.parseDate(date(2025, 2, 29)).error, true);
  const a = { dob: date(1960, 10, 9), assessmentDate: date(2026, 10, 8) };
  assert.deepEqual(M.ageAt(a), { years: 65, months: 11 });
  assert.ok(M.dateError('onsetDate', { ...a, onsetDate: date(2026, 10, 9) }, new Date(2026, 9, 8)));
  assert.ok(M.dateError('followup', { ...a, followup: date(2026, 10, 7) }, new Date(2026, 9, 8)));
});

test('AMR and SMR use distinct count units and support a custom sequence length', () => {
  const amr = { ...T.createTrial(1, 'amr', 'ar', '/ba/'), status: 'completed', count: '١٢', seconds: '٣' };
  assert.equal(T.rate(amr).perSecond, 4);
  const smr = { ...T.createTrial(2, 'smr', 'ar', '/ba-ta-ka/'), status: 'completed', count: '١٢', seconds: '٦' };
  assert.equal(T.rate(smr).perSecond, 2); assert.equal(T.rate(smr).syllablesPerSecond, 6);
  assert.equal(T.rate({ ...smr, target: '/ba-ta-ka-ba/', syllablesPerCycle: '4' }).syllablesPerSecond, 8);
  assert.equal(T.rate({ ...amr, count: '٠', seconds: '۲٫۵' }).perSecond, 0);
  assert.equal(T.rate({ ...smr, count: '12.5' }), null);
  assert.equal(T.rate({ ...smr, seconds: '0' }), null);
  assert.equal(T.rate({ ...smr, syllablesPerCycle: '0' }), null);
  assert.equal(T.rate({ ...smr, status: 'not-assessed' }), null);
  assert.equal(T.number('9'.repeat(500)), null);
});

test('new targets are unassessed and completed repeated samples require all three productions', () => {
  const trial = T.createTrial(1, 'repeated', 'ar', 'مدرسة');
  assert.equal(trial.status, 'not-assessed'); assert.equal(T.trialError(trial), null);
  assert.ok(T.trialError({ ...trial, status: 'completed' }));
  assert.equal(T.trialError({ ...trial, status: 'limited', repetitions: ['مد...', '', ''] }), null);
  assert.equal(T.trialError({ ...trial, status: 'completed', repetitions: ['مدرسة', 'م...درسة', 'مدرسة'] }), null);
  assert.ok(T.trialError({ ...trial, flags: ['distortion'] }));
  assert.ok(T.trialError(T.createTrial(2, 'word', 'en', '')));
});

test('intelligibility requires valid whole-number counts and does not create severity', () => {
  assert.equal(M.intelligibility({ understoodWords: '٠', totalWords: '١٠' }), 0);
  assert.equal(M.intelligibility({ understoodWords: '۸', totalWords: '۱۰' }), 80);
  assert.ok(M.measurementError({ understoodWords: '11', totalWords: '10' }));
  assert.ok(M.measurementError({ understoodWords: '8.5', totalWords: '10' }));
  assert.ok(M.measurementError({ understoodWords: '0', totalWords: '0' }));
  assert.ok(M.measurementError({ understoodWords: '8', totalWords: '' }));
  assert.ok(M.measurementError({ understoodWords: '8', totalWords: '10', listener: 'not-sampled' }));
  assert.equal(M.intelligibility({}), null);
  assert.doesNotMatch(M.reportHTML({ understoodWords: '8', totalWords: '10' }), /mild AOS|severe AOS|moderate AOS/i);
});

test('draft sanitation rejects unknown keys while preserving targets and all attempts', () => {
  const a = M.sanitizeAnswers({ phonetic: 'not-assessed', segmentation: 'fake', phoneticNote: 'Context', medicalNotes: { invalid: true }, trials: [null, { task: 'fake' }, { ...T.createTrial(90, 'repeated', 'ar', 'مدرسة'), status: 'limited', repetitions: ['أ', 'ب', 'ج'], flags: ['timing', 'fake'] }] });
  assert.equal(a.phonetic, 'not-assessed'); assert.equal(a.segmentation, undefined);
  assert.equal(a.trials.length, 1); assert.equal(a.trials[0].target, 'مدرسة');
  assert.deepEqual(a.trials[0].repetitions, ['أ', 'ب', 'ج']); assert.deepEqual(a.trials[0].flags, ['timing']);
  assert.equal(a.medicalNotes, undefined);
});

test('blank reports do not infer negative findings, diagnosis or proprietary scores', () => {
  const html = M.reportHTML({}, { references: false });
  assert.match(html, /No speech samples recorded/);
  assert.doesNotMatch(html, /Not observed in the sample|Pattern compatible with acquired AOS after differential assessment/);
  assert.doesNotMatch(html, /Total score:|ASRS score:|AOS diagnosis:/);
  const explicit = M.reportHTML({ phonetic: 'not-assessed', stress: 'not-observed', variability: 'uncertain' });
  assert.match(explicit, /Not assessed/); assert.match(explicit, /Not observed in the sample/); assert.match(explicit, /Uncertain/);
});

test('bilingual reports retain original Arabic targets once and translate task status', () => {
  const a = { patientName: '<script>bad</script>', phonetic: 'observed', phoneticNote: 'عينة محددة', trials: [{ ...T.createTrial(1, 'smr', 'ar', '/ba-ta-ka/'), status: 'completed', count: '12', seconds: '6', note: 'ملاحظة أصلية' }] };
  const html = M.reportHTML(a, { lang: 1, bilingual: true }), text = M.reportText(a, { lang: 1, bilingual: true });
  assert.match(html, /&lt;script&gt;bad&lt;\/script&gt;/); assert.doesNotMatch(html, /<script>/);
  assert.equal((html.match(/ملاحظة أصلية/g) || []).length, 1);
  assert.match(html, /Sample completed/); assert.match(html, /اكتملت العينة/);
  assert.match(html, /2\.00 complete cycles\/s/); assert.match(html, /6\.00 syllables\/s/);
  assert.match(text, /\/ba-ta-ka\//); assert.match(text, /ملاحظة أصلية/);
  assert.match(html, /slp\.ahmadghanem@gmail\.com/);
  assert.ok(html.lastIndexOf('class="signature"') > html.lastIndexOf('report-references'));
});

test('references have verified primary links, DOI metadata and scope limitations', () => {
  assert.equal(D.sources.length, 9);
  assert.equal(D.sources.filter(source => source.doi).length, 6);
  assert.match(D.sources.find(source => source.id === 'R7').use[0], /not validation of an Arabic AOS/);
  assert.match(D.sources.find(source => source.id === 'R3').use[0], /does not reproduce ASRS/);
  for (const source of D.sources) assert.match(source.url, /^https:\/\/(www\.asha\.org|pmc\.ncbi\.nlm\.nih\.gov|pubmed\.ncbi\.nlm\.nih\.gov)\//);
  assert.doesNotMatch(M.reportHTML({}, { references: false }), /class="report-section report-references"/);
  assert.match(M.reportText({}), /10\.1044\/2020_JSLHR-20-00061/);
});

test('entry points, task script and offline assets resolve locally', () => {
  const form = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(form.indexOf('assets/tasks.js') < form.indexOf('assets/model.js'));
  for (const [, target] of form.matchAll(/(?:href|src)="(\.\.?\/[^"#]+)"/g)) assert.ok(fs.existsSync(path.resolve(root, decodeURIComponent(target))), target);
  const parentRoot = path.resolve(root, '..'), parent = fs.readFileSync(path.join(parentRoot, 'index.html'), 'utf8');
  for (const [, target] of parent.matchAll(/(?:href|src)="(\.\.?\/[^"#]+)"/g)) assert.ok(fs.existsSync(path.resolve(parentRoot, decodeURIComponent(target))), target);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.scope, './');
  assert.match(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), /assets\/tasks\.js/);
});
