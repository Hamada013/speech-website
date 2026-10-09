/* Event behavior in a lightweight DOM harness; actual browser layout is separate QA. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const M = require('../assets/model.js');
const data = require('../assets/data.js');
const script = fs.readFileSync(require('node:path').join(__dirname, '../assets/app.js'), 'utf8');
const KEY = 'aghanem-adult-history-v1';

function app(initial = null) {
  const elements = new Map(), events = new Map(), storage = new Map();
  let storageFails = false, printed = 0, downloads = [], blobs = [];
  if (initial) storage.set(KEY, initial);
  const el = id => {
    if (!elements.has(id)) elements.set(id, {
      id, innerHTML: '', textContent: '', checked: false, value: '', hidden: true, open: false, style: {}, dataset: {}, attributes: {},
      classList: { toggle() {} }, addEventListener(type, fn) { events.set(`${id}:${type}`, fn); },
      setAttribute(key, value) { this.attributes[key] = value; }, removeAttribute(key) { delete this.attributes[key]; },
      showModal() { this.open = true; }, close() { this.open = false; }, focus() { this.focused = true; }, scrollIntoView() {},
      querySelectorAll() { return []; }, closest(selector) { return selector === 'label' ? el('label-' + id) : null; },
      append() {}, remove() {}, click() { if (id === 'download') downloads.push(this.download); }
    });
    return elements.get(id);
  };
  const document = { getElementById: el, documentElement: {}, body: el('body'), title: '', createElement: () => el('download') };
  const window = { AdultHistoryData: data, AdultHistoryModel: M, addEventListener(type, fn) { events.set(`window:${type}`, fn); }, print() { printed++; events.get('window:beforeprint')?.(); } };
  vm.runInNewContext(script, {
    window, document, navigator: {}, location: { protocol: 'file:' }, console,
    localStorage: {
      getItem(key) { if (storageFails) throw Error('unavailable'); return storage.get(key); },
      setItem(key, value) { if (storageFails) throw Error('unavailable'); storage.set(key, value); },
      removeItem(key) { if (storageFails) throw Error('unavailable'); storage.delete(key); }
    },
    Blob: class { constructor(parts) { blobs.push(parts.join('')); } }, URL: { createObjectURL: () => 'blob:local', revokeObjectURL() {} },
    setTimeout: fn => fn()
  });
  const click = id => el(id).onclick();
  const toggle = (id, checked) => { el(id).checked = checked; el(id).onchange(); };
  const input = (id, value, part) => {
    const node = el(part ? `${id}-${part}` : id); node.value = value; node.type = 'text'; node.dataset = { field: id, ...(part ? { part } : {}) };
    events.get('history:input')({ target: node });
  };
  const choose = (id, key, checked = true) => {
    const node = el(id + '-' + key); node.dataset = { field: id }; node.type = M.fields.find(f => f.id === id).type === 'radio' ? 'radio' : 'checkbox'; node.value = key; node.checked = checked;
    events.get('history:change')({ target: node });
  };
  const action = (kind, id) => { events.get('history:click')({ target: { closest(selector) { return selector === `[data-${kind}]` ? { dataset: kind === 'note-toggle' ? { noteToggle: id } : { clearChoice: id } } : null; } } }); };
  const navigate = step => events.get('nav:click')({ target: { closest: () => ({ dataset: { step } }) } });
  return { el, click, input, choose, toggle, action, navigate, storage, document, events, downloads, blobs, failStorage: () => { storageFails = true; }, printed: () => printed };
}

test('the form starts with no clinical selections or saved draft and navigates in both directions', () => {
  const a = app();
  assert.equal(a.storage.size, 0); assert.equal(a.el('remember').checked, false);
  assert.doesNotMatch(a.el('sections').innerHTML, /<select/);
  assert.match(a.el('sections').innerHTML, /type="checkbox"/); assert.match(a.el('sections').innerHTML, /type="radio"/);
  assert.doesNotMatch(a.el('sections').innerHTML, /value="stroke" checked/);
  assert.equal(a.el('previous').disabled, true);
  a.click('next'); assert.match(a.el('stepStatus').textContent, /Section 2/);
  a.navigate(8); assert.equal(a.el('next').disabled, true);
  a.click('previous'); assert.match(a.el('stepStatus').textContent, /Section 8/);
});

test('choice state, notes and Arabic free text survive language switching and navigation', () => {
  const a = app();
  a.input('patientName', 'اسم المريض'); a.choose('diagnoses', 'stroke'); a.choose('diagnoses', 'tbi');
  a.choose('diagnoses', 'none'); assert.equal(a.el('diagnoses-stroke').checked, false);
  a.choose('diagnoses', 'stroke'); assert.equal(a.el('diagnoses-none').checked, false);
  a.choose('diagnoses', 'other'); assert.equal(a.el('note-panel-diagnoses').hidden, false);
  a.input('diagnosesNote', 'مصدر المعلومات'); a.click('language');
  assert.equal(a.document.documentElement.dir, 'rtl');
  assert.match(a.el('sections').innerHTML, /value="stroke" checked/);
  assert.match(a.el('sections').innerHTML, /مصدر المعلومات/);
  a.navigate(2); a.click('review');
  assert.match(a.el('reportPreview').innerHTML, /سكتة دماغية/);
  assert.match(a.el('reportPreview').innerHTML, /اسم المريض/);
  assert.equal(a.el('reportPreview').dir, 'rtl');
});

test('clearing choices retains the note and collapsed notes remain collapsed after navigation', () => {
  const a = app(); a.choose('voice', 'other'); a.input('voiceNote', 'Important detail');
  a.action('note-toggle', 'voice');
  a.navigate(4);
  assert.match(a.el('sections').innerHTML, /id="note-panel-voice" class="note-panel" hidden/);
  a.action('clear-choice', 'voice'); a.click('review');
  assert.match(a.el('reportPreview').innerHTML, /Important detail/);
  assert.doesNotMatch(a.el('reportPreview').innerHTML, /Other — add a note/);
});

test('invalid date blocks export and focuses its section; Arabic digits work after correction', () => {
  const a = app();
  a.input('dob', '٣١', 'day'); a.input('dob', '٠٢', 'month'); a.input('dob', '١٩٦٠', 'year');
  a.navigate(7); a.click('review');
  assert.equal(a.el('reportDialog').open, false); assert.equal(a.el('dob-day').focused, true);
  assert.match(a.el('dob-error').textContent, /valid date/);
  a.input('dob', '٢٩', 'day'); a.click('review');
  assert.equal(a.el('reportDialog').open, true); assert.match(a.el('reportPreview').innerHTML, /1960-02-29/);
});

test('opt-in saving restores exact answers, notes, language, section and intentionally blank dates', () => {
  const a = app(); a.input('patientName', 'Example'); a.choose('voice', 'hoarse'); a.input('voiceNote', 'Two\nlines');
  a.input('assessmentDate', '', 'day'); a.input('assessmentDate', '', 'month'); a.input('assessmentDate', '', 'year');
  assert.equal(a.storage.size, 0);
  a.toggle('remember', true); a.click('language'); a.navigate(4);
  const b = app(a.storage.get(KEY));
  assert.equal(b.el('remember').checked, true); assert.equal(b.document.documentElement.lang, 'ar');
  assert.match(b.el('stepStatus').textContent, /القسم 5/); assert.match(b.el('sections').innerHTML, /Two\nlines/);
  assert.equal(JSON.parse(b.storage.get(KEY)).answers.assessmentDate.year, '');
  b.toggle('remember', false); assert.equal(b.storage.has(KEY), false);
  b.click('review'); assert.match(b.el('reportPreview').innerHTML, /Example/);
});

test('malformed storage does not crash and failed saving or deletion is reported', () => {
  const a = app('{broken'); assert.match(a.el('saveStatus').textContent, /could not be restored/);
  a.input('patientName', 'Retain this'); a.failStorage(); a.toggle('remember', true);
  assert.match(a.el('saveStatus').textContent, /could not be saved/);
  a.toggle('remember', false); assert.equal(a.el('remember').checked, true);
  a.click('clear'); a.click('confirmClear');
  assert.equal(a.el('clearDialog').open, true); assert.match(a.el('clearError').textContent, /could not be removed/);
  a.click('review'); assert.match(a.el('reportPreview').innerHTML, /Retain this/);
});

test('new history removes the saved case and clears cached report contents', () => {
  const a = app(); a.input('patientName', 'Previous case'); a.toggle('remember', true);
  a.click('review'); a.click('closeReport'); a.click('clear'); a.click('cancelClear');
  a.click('review'); assert.match(a.el('reportPreview').innerHTML, /Previous case/);
  a.click('closeReport'); a.click('clear'); a.click('confirmClear');
  assert.equal(a.storage.size, 0); assert.equal(a.el('remember').checked, false);
  assert.equal(a.el('reportPreview').innerHTML, ''); assert.equal(a.el('printArea').innerHTML, '');
  a.click('review'); assert.doesNotMatch(a.el('reportPreview').innerHTML, /Previous case/);
});

test('bilingual PDF and text exports use the reviewed data, and print title excludes patient details', () => {
  const a = app(); a.input('patientName', 'Person'); a.choose('diagnoses', 'stroke'); a.click('review');
  a.toggle('bilingual', true); a.toggle('includeEmpty', true);
  a.click('pdfExport'); assert.equal(a.printed(), 1);
  assert.match(a.el('printArea').innerHTML, /Stroke/); assert.match(a.el('printArea').innerHTML, /سكتة دماغية/);
  assert.match(a.el('printArea').innerHTML, /غير مسجل/);
  assert.doesNotMatch(a.document.title, /Person/);
  a.click('textExport'); assert.equal(a.downloads[0], 'Person-case-history.txt');
  assert.ok(a.blobs[0].startsWith('\ufeff')); assert.match(a.blobs[0], /Stroke \/ سكتة دماغية/);
  a.events.get('window:afterprint')(); assert.equal(a.el('printArea').innerHTML, '');
});
