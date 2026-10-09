/* Event behavior in a lightweight DOM harness; actual browser layout is separate QA. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const M = require('../assets/model.js');
const data = require('../assets/data.js');
const T = require('../assets/tasks.js');
const script = fs.readFileSync(require('node:path').join(__dirname, '../assets/app.js'), 'utf8');
const KEY = 'aghanem-acquired-aos-v1';

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
  const window = { AOSData: data, AOSModel: M, AOSTasks: T, addEventListener(type, fn) { events.set(`window:${type}`, fn); }, print() { printed++; events.get('window:beforeprint')?.(); } };
  vm.runInNewContext(script, {
    window, document, navigator: {}, location: { protocol: 'file:', search: '' }, console, URLSearchParams,
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
  const sampleClick = (kind, dataset = {}) => events.get('history:click')({ preventDefault() {}, target: { closest: selector => selector === `[data-${kind}]` ? { dataset } : null } });
  const trialInput = (id, part, value, type = 'text', checked = true) => { const node = el(`test-${id}-${part}`); node.dataset = { trial: String(id), trialPart: part }; node.value = value; node.type = type; node.checked = checked; events.get(type === 'text' ? 'history:input' : 'history:change')({ target: node }); };
  return { el, click, input, choose, toggle, action, navigate, sampleClick, trialInput, storage, document, events, downloads, blobs, failStorage: () => { storageFails = true; }, printed: () => printed };
}

test('native choices start blank and the form navigates and switches to Arabic', () => {
  const a = app();
  assert.equal(a.storage.size, 0); assert.equal(a.el('includeReferences').checked, true);
  assert.doesNotMatch(a.el('sections').innerHTML, /<select/);
  assert.doesNotMatch(a.el('sections').innerHTML, /value="not-observed" checked/);
  a.navigate(5); a.choose('phonetic', 'observed'); a.input('phoneticNote', 'Connected speech example');
  a.click('language'); assert.equal(a.document.documentElement.dir, 'rtl');
  assert.match(a.el('sections').innerHTML, /value="observed" checked/);
  assert.match(a.el('sections').innerHTML, /Connected speech example/);
  a.click('review'); assert.match(a.el('reportPreview').innerHTML, /لوحظ/);
  assert.doesNotMatch(a.el('reportPreview').innerHTML, /Pattern compatible with acquired AOS after differential assessment/);
});

test('Arabic targets survive interface changes, and newly added samples remain unassessed', () => {
  const a = app(); a.navigate(4);
  a.sampleClick('add-sample', { addSample: 'word', promptIndex: '0', promptLanguage: 'ar' });
  a.click('review'); assert.match(a.el('reportPreview').innerHTML, /باب/); assert.match(a.el('reportPreview').innerHTML, /Not assessed yet/);
  a.click('closeReport'); a.click('language'); a.click('review');
  assert.match(a.el('reportPreview').innerHTML, /باب/); assert.match(a.el('reportPreview').innerHTML, /لم تُقيّم بعد/);
  assert.doesNotMatch(a.el('reportPreview').innerHTML, />tea</);
});

test('repeated samples block completed status with missing attempts and preserve all productions', () => {
  const a = app(); a.navigate(4); a.sampleClick('add-sample', { addSample: 'repeated', promptIndex: '1', promptLanguage: 'ar' });
  a.trialInput(1, 'status', 'completed', 'radio'); a.click('review');
  assert.equal(a.el('reportDialog').open, false); assert.match(a.el('trial-error-1').textContent, /all three/);
  for (let i = 0; i < 3; i++) a.trialInput(1, 'attempt-' + i, 'Production ' + (i + 1));
  a.click('review'); assert.equal(a.el('reportDialog').open, true);
  for (let i = 1; i <= 3; i++) assert.match(a.el('reportPreview').innerHTML, new RegExp('Production ' + i));
});

test('SMR cycle rates, custom sequence length and invalid measurements reach the report correctly', () => {
  const a = app(); a.navigate(4); a.sampleClick('add-sample', { addSample: 'smr', promptIndex: '0', promptLanguage: 'ar' });
  a.trialInput(1, 'count', '١٢'); a.trialInput(1, 'seconds', '٦'); a.click('review');
  assert.equal(a.el('reportDialog').open, false);
  a.trialInput(1, 'status', 'completed', 'radio'); a.trialInput(1, 'syllablesPerCycle', '٤');
  assert.match(a.el('trial-rate-1').textContent, /2\.00 complete cycles\/s/);
  assert.match(a.el('trial-rate-1').textContent, /8\.00 syllables\/s/);
  a.click('review'); assert.match(a.el('reportPreview').innerHTML, /8\.00 syllables\/s/);
  a.click('closeReport'); a.trialInput(1, 'seconds', '0'); a.click('review');
  assert.equal(a.el('reportDialog').open, false); assert.match(a.el('trial-error-1').textContent, /duration greater than zero/);
});

test('sample removal has undo and preserves response data', () => {
  const a = app(); a.navigate(4); a.sampleClick('add-sample', { addSample: 'word', promptIndex: '1', promptLanguage: 'en' });
  a.trialInput(1, 'status', 'completed', 'radio'); a.trialInput(1, 'response', 'Exact observed response');
  a.sampleClick('remove-sample', { removeSample: '1' }); a.click('review');
  assert.doesNotMatch(a.el('reportPreview').innerHTML, /Exact observed response/);
  a.click('closeReport'); a.sampleClick('undo-sample'); a.click('review');
  assert.match(a.el('reportPreview').innerHTML, /Exact observed response/);
});

test('opt-in drafts restore observations, Arabic target language and sample details', () => {
  const a = app(); a.choose('variability', 'uncertain'); a.navigate(4);
  a.sampleClick('add-sample', { addSample: 'word', promptIndex: '2', promptLanguage: 'ar' });
  a.trialInput(1, 'status', 'completed', 'radio'); a.trialInput(1, 'response', 'استجابة أصلية');
  assert.equal(a.storage.size, 0); a.toggle('remember', true); a.click('language');
  const b = app(a.storage.get(KEY)); b.click('review');
  assert.equal(b.document.documentElement.lang, 'ar');
  assert.match(b.el('reportPreview').innerHTML, /قهوة/); assert.match(b.el('reportPreview').innerHTML, /استجابة أصلية/);
  assert.match(b.el('reportPreview').innerHTML, /غير مؤكد/);
  b.click('closeReport'); b.toggle('remember', false); assert.equal(b.storage.has(KEY), false);
});

test('intelligibility denominator errors prevent export without creating a severity rating', () => {
  const a = app(); a.input('understoodWords', '9'); a.input('totalWords', '8'); a.click('review');
  assert.equal(a.el('reportDialog').open, false); assert.equal(a.el('understoodWords').focused, true);
  a.input('totalWords', '10'); a.click('review');
  assert.match(a.el('reportPreview').innerHTML, /90\.0%/); assert.doesNotMatch(a.el('reportPreview').innerHTML, /mild AOS/i);
});

test('bilingual print and text exports contain research, findings and the clinician footer', () => {
  const a = app(); a.input('patientName', 'Example'); a.choose('segmentation', 'not-assessed'); a.click('review');
  a.toggle('bilingual', true); a.click('pdfExport');
  assert.equal(a.printed(), 1); assert.match(a.el('printArea').innerHTML, /Not assessed/); assert.match(a.el('printArea').innerHTML, /لم يُقيّم/);
  assert.match(a.el('printArea').innerHTML, /10\.1044\/2020_JSLHR-20-00061/);
  assert.match(a.el('printArea').innerHTML, /slp\.ahmadghanem@gmail\.com/);
  assert.doesNotMatch(a.document.title, /Example/);
  a.click('textExport'); assert.equal(a.downloads[0], 'Example-aos-assessment.txt'); assert.ok(a.blobs[0].startsWith('\ufeff'));
  a.toggle('includeReferences', false); assert.doesNotMatch(a.el('reportPreview').innerHTML, /class="report-section report-references"/);
});

test('storage failures preserve the saved case and clear confirmation resets samples after successful deletion', () => {
  const a = app(); a.input('patientName', 'Keep'); a.toggle('remember', true); a.failStorage(); a.click('clear'); a.click('confirmClear');
  assert.equal(a.el('clearDialog').open, true); assert.match(a.el('clearError').textContent, /could not be removed/);
  const b = app(a.storage.get(KEY)); b.navigate(4); b.sampleClick('add-sample', { addSample: 'word', promptIndex: '0', promptLanguage: 'ar' });
  b.click('clear'); b.click('confirmClear'); b.click('review');
  assert.equal(b.storage.has(KEY), false); assert.match(b.el('reportPreview').innerHTML, /No speech samples recorded/);
  assert.doesNotMatch(b.el('reportPreview').innerHTML, />Keep</);
});
