const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../assets/model.js');
const { sections } = require('../assets/data.js');
const field = id => M.fields.find(f => f.id === id);
const date = (year, month, day) => ({ year: String(year), month: String(month), day: String(day) });
const now = new Date(2026, 9, 8, 12);

test('all nine sections and every option have unique stable keys and two labels', () => {
  assert.equal(sections.length, 9);
  assert.equal(M.fields.length, 71);
  assert.equal(new Set(M.fields.map(f => f.id)).size, M.fields.length);
  for (const f of M.fields) {
    assert.equal(f.label.length, 2);
    assert.ok(f.label.every(v => v.trim()));
    if (f.options) {
      assert.equal(new Set(f.options.map(o => o.key)).size, f.options.length);
      assert.ok(f.options.every(o => o.label.length === 2 && /[\u0600-\u06ff]/.test(o.label[1])));
    }
  }
  assert.equal(field('foodTexture').type, 'radio');
  assert.equal(field('liquids').type, 'radio');
  assert.equal(field('medications').type, 'textarea');
});

test('dates accept English, Arabic and Persian digits and reject impossible or partial dates', () => {
  assert.equal(M.parseDate({ day: '٢٩', month: '٠٢', year: '٢٠٢٤' }).iso, '2024-02-29');
  assert.equal(M.parseDate({ day: '۰۸', month: '۱۰', year: '۲۰۲۶' }).iso, '2026-10-08');
  assert.equal(M.parseDate(date(2025, 2, 29)).error, true);
  assert.equal(M.parseDate(date(2026, 4, 31)).error, true);
  assert.equal(M.parseDate({ year: '2026' }).error, true);
  assert.equal(M.parseDate({ year: '', month: '', day: '' }).empty, true);
  assert.equal(M.parseDate(date(2026, 0, 8)).error, true);
  assert.equal(M.parseDate('2026-10-08').error, true);
});

test('history chronology is enforced while future follow-up dates are allowed', () => {
  const a = { dob: date(1960, 1, 31), assessmentDate: date(2026, 10, 8) };
  assert.equal(M.dateError('dob', a, now), null);
  assert.equal(M.dateError('assessmentDate', a, now), null);
  assert.ok(M.dateError('dob', { ...a, dob: date(2026, 10, 9) }, now));
  assert.ok(M.dateError('assessmentDate', { ...a, assessmentDate: date(2026, 10, 9) }, now));
  assert.ok(M.dateError('onsetDate', { ...a, onsetDate: date(1959, 12, 1) }, now));
  assert.ok(M.dateError('hearingDate', { ...a, hearingDate: date(2026, 10, 9) }, now));
  assert.ok(M.dateError('followup', { ...a, followup: date(2026, 10, 7) }, now));
  assert.equal(M.dateError('followup', { ...a, followup: date(2027, 1, 1) }, now), null);
});

test('age uses the assessment date and handles birthdays and month ends', () => {
  assert.deepEqual(M.ageAt({ dob: date(1960, 10, 9), assessmentDate: date(2026, 10, 8) }), { years: 65, months: 11 });
  assert.deepEqual(M.ageAt({ dob: date(1960, 10, 8), assessmentDate: date(2026, 10, 8) }), { years: 66, months: 0 });
  assert.deepEqual(M.ageAt({ dob: date(1960, 1, 31), assessmentDate: date(2026, 2, 28) }), { years: 66, months: 1 });
  assert.deepEqual(M.ageAt({ dob: date(1960, 2, 29), assessmentDate: date(2025, 2, 28) }), { years: 65, months: 0 });
  assert.equal(M.ageAt({}), null);
  assert.equal(M.ageAt({ dob: date(2026, 10, 9), assessmentDate: date(2026, 10, 8) }), null);
});

test('multiple choices support deselection; none and unknown replace conflicting answers', () => {
  const f = field('diagnoses');
  let values = M.choiceChange(f, [], 'stroke', true);
  values = M.choiceChange(f, values, 'tbi', true);
  assert.deepEqual(values, ['stroke', 'tbi']);
  assert.deepEqual(M.choiceChange(f, values, 'stroke', false), ['tbi']);
  assert.deepEqual(M.choiceChange(f, values, 'none', true), ['none']);
  assert.deepEqual(M.choiceChange(f, ['none'], 'stroke', true), ['stroke']);
  assert.deepEqual(M.choiceChange(f, ['stroke'], 'unknown', true), ['unknown']);
  assert.deepEqual(M.choiceChange(f, ['stroke'], 'invalid-key', true), ['stroke']);
  assert.equal(M.choiceChange(field('intelligibility'), 'usually', 'often', true), 'often');
});

test('drafts keep known answers and notes, reject malformed values, and normalize exclusivity', () => {
  const a = M.sanitizeAnswers({ patientName: 'أحمد', unknownField: 'discard', diagnoses: ['stroke', 'none', 'invalid'], voice: ['hoarse', 'hoarse'], sex: ['female'], voiceNote: 'Line 1\nLine 2', dob: { year: '1960', day: 3, month: '2' }, sources: null, medications: { invalid: true } });
  assert.deepEqual(a.diagnoses, ['none']);
  assert.deepEqual(a.voice, ['hoarse']);
  assert.equal(a.voiceNote, 'Line 1\nLine 2');
  assert.deepEqual(a.dob, { day: '', month: '2', year: '1960' });
  assert.equal(a.patientName, 'أحمد');
  assert.equal(a.sex, undefined); assert.equal(a.unknownField, undefined); assert.equal(a.medications, undefined);
  assert.deepEqual(M.sanitizeAnswers(null), {});
});

test('blank reports never invent normal findings or a clinical summary', () => {
  const html = M.reportHTML({});
  assert.equal((html.match(/class="report-section"/g) || []).length, 9);
  assert.doesNotMatch(html, /Normal quality|Usually understood|No concern reported/);
  assert.doesNotMatch(html, /Clinician’s synthesis of relevant history/);
  assert.match(html, /71 fields not recorded/);
  assert.match(html, /Unanswered items are not negative findings/);
});

test('reports include selections, note-only answers, exact medications and the final signature', () => {
  const a = { patientName: '<script>test</script>', diagnoses: ['stroke'], diagnosesNote: 'Source: medical record', voiceNote: 'Only a note\nNo selected finding', medications: 'Medication A\nDose per record', summary: 'Clinical synthesis' };
  const html = M.reportHTML(a), text = M.reportText(a);
  assert.match(html, /&lt;script&gt;test&lt;\/script&gt;/); assert.doesNotMatch(html, /<script>/);
  assert.match(html, /Stroke/); assert.match(html, /Only a note\nNo selected finding/);
  assert.match(html, /Medication A\nDose per record/);
  assert.match(html, /Clinical synthesis/);
  assert.match(html, /class="report-row long-row"/);
  assert.doesNotMatch(html, /Food feels stuck/);
  assert.match(text, /Clinical synthesis/); assert.match(text, /slp\.ahmadghanem@gmail\.com/);
  assert.ok(html.lastIndexOf('class="signature"') > html.lastIndexOf('</section>'));
});

test('bilingual reports translate labels and options, retaining free text only once', () => {
  const a = { diagnoses: ['stroke'], diagnosesNote: 'تفاصيل خاصة', foodTexture: 'soft' };
  const html = M.reportHTML(a, { lang: 1, bilingual: true, includeEmpty: true });
  const text = M.reportText(a, { lang: 1, bilingual: true });
  assert.match(html, /lang="ar" dir="rtl"/); assert.match(html, /lang="en" dir="ltr"/);
  assert.match(html, /Stroke/); assert.match(html, /سكتة دماغية/);
  assert.match(html, /Not recorded/); assert.match(html, /غير مسجل/);
  assert.equal((html.match(/تفاصيل خاصة/g) || []).length, 1);
  assert.equal((text.match(/تفاصيل خاصة/g) || []).length, 1);
  assert.match(text, /سكتة دماغية \/ Stroke/);
  assert.equal((html.match(/class="report-row(?: long-row)?"/g) || []).length, M.fields.length);
});

test('the entry point and offline manifest reference existing local files in load order', () => {
  const root = path.resolve(__dirname, '..'), html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.indexOf('assets/data.js') < html.indexOf('assets/model.js'));
  assert.ok(html.indexOf('assets/model.js') < html.indexOf('assets/app.js'));
  for (const [, target] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) assert.ok(fs.existsSync(path.join(root, target)));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.scope, './');
  for (const icon of manifest.icons) assert.ok(fs.existsSync(path.join(root, icon.src)));
});
