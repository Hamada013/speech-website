/* Behavior checks in a lightweight DOM harness; these do not replace browser layout QA. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'assets/index-CO8PlA9M.js'), 'utf8');
const KEY = 'ag-oral-motor-draft-v1';

function app(storage = new Map(), unavailable = false) {
  const elements = new Map(), listeners = new Map();
  let printCount = 0;
  function el(id) {
    if (!elements.has(id)) elements.set(id, {
      id, textContent: '', innerHTML: '', value: '', checked: false, open: false, dataset: {}, attributes: {},
      classList: { toggle() {} },
      addEventListener(type, fn) { if (!listeners.has(id)) listeners.set(id, {}); listeners.get(id)[type] = fn; },
      setAttribute(key, value) { this.attributes[key] = value; }, removeAttribute(key) { delete this.attributes[key]; },
      showModal() { this.open = true; }, close() { this.open = false; },
      focus() { this.focused = true; }, getBoundingClientRect() { return { top: 10 }; },
      scrollIntoView() {}, replaceChildren() { this.innerHTML = ''; }, remove() {}, click() {}, appendChild() {},
      closest() { return null; }
    });
    return elements.get(id);
  }
  const translated = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((m, i) => {
    const node = el(`translated-${i}`); node.dataset.i18n = m[1]; return node;
  });
  const doc = {
    getElementById: el, documentElement: {}, title: '', body: el('body'), createElement: () => el('download'),
    querySelectorAll: selector => selector === '[data-i18n]' ? translated : [],
    querySelector: selector => {
      const id = selector.match(/\[data-count="([^"]+)"\]/)?.[1];
      return id && el('sectionNav').innerHTML.includes(`data-count="${id}"`) ? el(`count-${id}`) : null;
    }
  };
  class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : ['2026-10-08T12:00:00Z'])); } }
  const windowListeners = {};
  const context = {
    document: doc, navigator: { onLine: true }, location: { protocol: 'file:' }, Date: FixedDate,
    window: { innerWidth: 1024, addEventListener(type, fn) { windowListeners[type] = fn; }, print() { printCount++; } },
    localStorage: {
      getItem(key) { if (unavailable) throw Error('blocked'); return storage.get(key) || null; },
      setItem(key, value) { if (unavailable) throw Error('blocked'); storage.set(key, value); },
      removeItem(key) { if (unavailable) throw Error('blocked'); storage.delete(key); }
    }, Blob, URL, setTimeout, console
  };
  vm.runInNewContext(script, context, { filename: 'oral-motor-app.js' });
  const click = id => listeners.get(id).click({ target: el(id) });
  const input = (id, value) => {
    const node = el(id); node.value = value; node.dataset.field = id;
    listeners.get('examForm').input({ target: node });
  };
  const toggle = (id, checked) => { el(id).checked = checked; listeners.get(id).change({ target: el(id) }); };
  const choose = (key, value, multiple = true, checked = true) => {
    const node = el(`${key}_${value}`);
    node.dataset = { field: key, choice: multiple ? 'multi' : 'single' };
    node.value = value; node.checked = checked;
    listeners.get('examForm').input({ target: node });
  };
  const clearChoice = key => listeners.get('examForm').click({ target: { closest: () => ({ dataset: { clearChoice: key }, closest: () => null }) } });
  const navigate = index => listeners.get('sectionNav').click({ target: { closest: () => ({ dataset: { section: String(index) } }) } });
  const report = () => { click('openReport'); return el('reportPreview').innerHTML; };
  return { el, doc, storage, input, click, toggle, choose, clearChoice, navigate, report, translated, windowListeners, printCount: () => printCount };
}

test('all nine sections render in both languages without missing interface translations', () => {
  const a = app();
  assert.equal((a.el('sectionNav').innerHTML.match(/data-section=/g) || []).length, 9);
  assert.equal(a.el('progress').max, 28);
  assert.equal(a.el('progress').value, 0);
  assert.equal(a.storage.size, 0);
  for (let i = 0; i < 9; i++) { a.navigate(i); assert.match(a.el('sectionContent').innerHTML, /id="sectionTitle"/); }
  a.click('language');
  assert.equal(a.doc.documentElement.dir, 'rtl');
  assert.equal(a.doc.documentElement.lang, 'ar');
  assert.match(a.el('sectionContent').innerHTML, /الخلاصة السريرية والخطة/);
  a.translated.forEach(node => assert.notEqual(node.textContent, node.dataset.i18n));
  a.navigate(0);
  assert.match(a.el('sectionContent').innerHTML, /اسم المفحوص/);
});

test('reports retain findings and multiline notes, escape input, and omit unanswered items', () => {
  const a = app();
  a.input('clientName', '<script>alert("example")</script>');
  a.input('faceRest', 'concern');
  a.input('faceRest_note', 'First observation\nSecond observation');
  a.input('jawMovement', 'not-assessed');
  a.input('lipClosure_note', 'Note without a selected result');
  const report = a.report();
  assert.equal(a.el('progress').value, 2);
  assert.equal(a.el('count-face').textContent, '2/5');
  assert.match(report, /&lt;script&gt;alert\(&quot;example&quot;\)&lt;\/script&gt;/);
  assert.doesNotMatch(report, /<script>/);
  assert.match(report, /First observation\nSecond observation/);
  assert.match(report, /Not assessed/);
  assert.match(report, /Notes recorded; status not selected/);
  assert.doesNotMatch(report, /Tongue protrusion/);
  assert.match(report, /slp\.ahmadghanem@gmail\.com/);
  assert.ok(report.lastIndexOf('class="report-footer"') > report.lastIndexOf('</section>'));
  a.click('printReport');
  assert.equal(a.printCount(), 1);
  assert.equal(a.el('printArea').innerHTML, report);
});

test('bilingual and blank-form reports include both languages and all observation rows', () => {
  const a = app();
  a.report(); a.toggle('bilingualReport', true); a.toggle('includeEmpty', true);
  const report = a.el('reportPreview').innerHTML;
  assert.match(report, /Oral motor examination/);
  assert.match(report, /فحص الوظائف الحركية الفموية/);
  assert.equal((report.match(/class="report-observation"/g) || []).length, 28);
  assert.match(report, /Not recorded/);
  assert.match(report, /لم تُسجَّل|غير مسجّل/);
  assert.match(report, /sequences \/ second|Complete sequences/);
  a.click('closeReport'); a.click('language'); a.report();
  assert.equal(a.el('reportPreview').dir, 'rtl');
});

test('DDK counts distinguish sequences, accept zero, and reject zero duration / fractional counts', () => {
  const a = app(); a.navigate(6);
  a.input('ddk_pa_count', '15'); a.input('ddk_pa_seconds', '3');
  a.input('ddk_pataka_count', '4'); a.input('ddk_pataka_seconds', '2');
  assert.equal(a.el('rate_pa').textContent, 'Rate: 5.00 repetitions / second');
  assert.equal(a.el('rate_pataka').textContent, 'Rate: 2.00 sequences / second');
  a.input('ddk_ka_count', '0'); a.input('ddk_ka_seconds', '3');
  assert.equal(a.el('rate_ka').textContent, 'Rate: 0.00 repetitions / second');
  assert.match(a.report(), /2\.00 sequences \/ second/);
  a.click('closeReport'); a.input('ddk_pa_seconds', '0'); a.report();
  assert.equal(a.el('reportDialog').open, false);
  assert.match(a.el('sectionContent').innerHTML, /aria-invalid="true"/);
  a.input('ddk_pa_seconds', '3'); a.input('ddk_pa_count', '1.5'); a.report();
  assert.equal(a.el('reportDialog').open, false);
  a.input('ddk_pa_count', '15'); assert.match(a.report(), /5\.00 repetitions \/ second/);
});

test('partial DDK measurements preserve entered data without inventing a rate', () => {
  const a = app(); a.input('ddk_ta_count', '9');
  const report = a.report();
  assert.match(report, /DDK \/ta\//);
  assert.doesNotMatch(report, /Rate:|repetitions \/ second/);
});

test('age handles birthday and month-end boundaries and translates only calculated ages', () => {
  const a = app();
  a.input('dob', '2020-10-09'); a.input('examDate', '2026-10-08');
  assert.equal(a.el('age').value, '5 years, 11 months');
  a.input('dob', '2020-10-08');
  assert.equal(a.el('age').value, '6 years, 0 months');
  a.click('language');
  assert.match(a.report(), /6 سنة, 0 شهر/);
  a.click('closeReport');
  a.input('dob', '2024-01-31'); a.input('examDate', '2024-02-29');
  assert.equal(a.el('age').value, '0 سنة, 1 شهر');
  a.input('dob', '2024-02-29'); a.input('examDate', '2025-02-28');
  assert.equal(a.el('age').value, '1 سنة, 0 شهر');
  a.input('dob', ''); assert.equal(a.el('age').value, '');
  a.input('age', 'Age supplied by caregiver'); a.click('language');
  assert.match(a.report(), /Age supplied by caregiver/);
});

test('invalid, future and reversed dates block report export and focus the problem', () => {
  const a = app();
  a.input('dob', '2023-02-29'); a.report();
  assert.equal(a.el('reportDialog').open, false); assert.equal(a.el('dob').focused, true);
  a.input('dob', '2199-01-01'); a.report();
  assert.match(a.el('sectionContent').innerHTML, /cannot be in the future/);
  a.input('dob', '2020-01-01'); a.input('examDate', '2019-01-01'); a.report();
  assert.match(a.el('sectionContent').innerHTML, /cannot be before/);
  a.input('examDate', '2026-10-08'); a.report(); assert.equal(a.el('reportDialog').open, true);
});

test('draft opt-in restores language, section and answers; opt-out and new exam remove it', () => {
  const storage = new Map(); let a = app(storage);
  a.input('clientName', 'Example client');
  assert.equal(storage.size, 0);
  a.toggle('remember', true); a.click('language'); a.navigate(4);
  assert.equal(JSON.parse(storage.get(KEY)).data.clientName, 'Example client');
  a = app(storage);
  assert.equal(a.el('remember').checked, true); assert.equal(a.doc.documentElement.lang, 'ar');
  assert.match(a.el('sectionContent').innerHTML, /اللسان/);
  assert.match(a.report(), /Example client/);
  a.click('closeReport'); a.toggle('remember', false);
  assert.equal(storage.size, 0);
  a.toggle('remember', true); a.click('newExam'); a.click('cancelClear');
  assert.match(a.report(), /Example client/);
  a.click('closeReport'); a.click('newExam'); a.click('confirmClear');
  assert.equal(storage.size, 0); assert.equal(a.el('remember').checked, false);
  assert.equal(a.el('printArea').innerHTML, ''); assert.equal(a.el('progress').value, 0);
  assert.doesNotMatch(a.report(), /Example client/);
});

test('unavailable storage leaves report export working and reports failure honestly', () => {
  const a = app(new Map(), true);
  a.input('clientName', 'Temporary example'); a.toggle('remember', true);
  assert.equal(a.el('remember').checked, false);
  assert.match(a.el('saveStatus').textContent, /storage is unavailable/);
  assert.match(a.report(), /Temporary example/);
});

test('manifest and service worker shell are self-contained and scoped to the form', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest')));
  assert.equal(manifest.scope, './'); assert.equal(manifest.display, 'standalone');
  for (const icon of manifest.icons) assert.ok(fs.existsSync(path.join(root, icon.src)));
  const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const handlers = {}, scope = 'https://example.test/forms/speech/oral-motor-exam/';
  const self = { location: { origin: 'https://example.test' }, registration: { scope }, addEventListener(type, fn) { handlers[type] = fn; } };
  vm.runInNewContext(worker, { self, URL });
  const ignored = [
    { method: 'POST', url: scope },
    { method: 'GET', url: 'https://example.test/forms/child-case-history/' },
    { method: 'GET', url: scope + 'report.pdf' },
    { method: 'GET', url: 'https://thirdparty.test/asset.js' }
  ];
  for (const request of ignored) handlers.fetch({ request, respondWith() { assert.fail('Worker intercepted a non-shell request'); } });
  const shell = worker.match(/const SHELL = (\[[^;]+\]);/)[1];
  for (const resource of vm.runInNewContext(shell)) assert.ok(fs.existsSync(path.join(root, resource)), resource);
});

test('worker precaches the complete shell, preserves other forms, and serves offline navigation', async () => {
  const source = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const scope = 'https://example.test/forms/speech/oral-motor-exam/';
  const handlers = {}, records = new Map(), deleted = [], requested = [];
  let waitingSkipped = false, claimed = false, online = true;
  const cache = {
    async addAll(resources) { for (const resource of resources) records.set(new URL(resource, scope).pathname, { cached: resource }); },
    async match(request) {
      const resource = typeof request === 'string' ? request : request.url;
      return records.get(new URL(resource, scope).pathname);
    }
  };
  const self = {
    location: { origin: 'https://example.test' }, registration: { scope },
    addEventListener(type, fn) { handlers[type] = fn; },
    skipWaiting() { waitingSkipped = true; }, clients: { claim() { claimed = true; } }
  };
  const caches = {
    async open() { return cache; },
    async keys() { return ['ag-oral-motor-shell-v0', 'ag-oral-motor-shell-v1', 'ag-oral-motor-shell-v2', 'different-form-cache']; },
    async delete(key) { deleted.push(key); }
  };
  const fetch = async request => { requested.push(request.url); if (!online) throw Error('offline'); return { network: true }; };
  vm.runInNewContext(source, { self, caches, fetch, URL });
  let pending;
  handlers.install({ waitUntil(value) { pending = value; } }); await pending;
  assert.equal(records.size, 8); assert.equal(waitingSkipped, true);
  handlers.activate({ waitUntil(value) { pending = value; } }); await pending;
  assert.deepEqual(deleted, ['ag-oral-motor-shell-v0', 'ag-oral-motor-shell-v1']); assert.equal(claimed, true);
  const navigation = { method: 'GET', mode: 'navigate', url: scope };
  handlers.fetch({ request: navigation, respondWith(value) { pending = value; } });
  assert.equal((await pending).network, true);
  online = false;
  handlers.fetch({ request: navigation, respondWith(value) { pending = value; } });
  assert.equal((await pending).cached, './');
  handlers.fetch({ request: { method: 'GET', mode: 'same-origin', url: scope + 'assets/index-CO8PlA9M.js' }, respondWith(value) { pending = value; } });
  assert.equal((await pending).cached, './assets/index-CO8PlA9M.js');
  assert.equal(requested.length, 2, 'Cached JavaScript does not depend on a network connection');
});

test('all dropdowns become native visible radio groups; fields and observations have unique IDs', () => {
  const a = app();
  for (let section = 0; section < 9; section++) {
    a.navigate(section);
    const content = a.el('sectionContent').innerHTML;
    assert.doesNotMatch(content, /<select\b|<option\b/);
    const ids = [...content.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, `Duplicate control ID in section ${section}`);
  }
  a.navigate(0);
  assert.match(a.el('sectionContent').innerHTML, /type="radio"[^>]*name="setting"/);
  a.navigate(2);
  assert.equal((a.el('sectionContent').innerHTML.match(/type="radio"[^>]*name="faceRest"/g) || []).length, 4);
  assert.match(a.el('sectionContent').innerHTML, /type="checkbox"[^>]*name="faceRest_findings"/);
});

test('radio status remains one choice and clears back to unanswered', () => {
  const a = app(); a.navigate(2);
  a.choose('faceRest', 'concern', false); a.choose('faceRest', 'expected', false);
  a.navigate(2);
  assert.match(a.el('sectionContent').innerHTML, /value="expected" data-field="faceRest" data-choice="single" checked/);
  assert.doesNotMatch(a.el('sectionContent').innerHTML, /value="concern" data-field="faceRest" data-choice="single" checked/);
  assert.equal(a.el('progress').value, 1);
  a.clearChoice('faceRest'); assert.equal(a.el('progress').value, 0);
  assert.doesNotMatch(a.report(), /Facial appearance &amp; symmetry at rest/);
  a.click('closeReport'); a.choose('setting', 'clinic', false); a.choose('setting', 'remote', false);
  assert.match(a.report(), /Telepractice/);
  assert.doesNotMatch(a.el('reportPreview').innerHTML, /In person · clinic/);
});

test('multiple findings record and uncheck independently without setting a diagnosis or status', () => {
  const a = app(); a.navigate(2);
  a.choose('faceRest_findings', 'asymmetry'); a.choose('faceRest_findings', 'drooling');
  let report = a.report();
  assert.match(report, /Asymmetry/); assert.match(report, /Drooling/);
  assert.match(report, /Findings recorded; status not selected/);
  assert.equal(a.el('progress').value, 1);
  assert.doesNotMatch(report, /class="report-result concern"/);
  a.click('closeReport'); a.choose('faceRest_findings', 'drooling', true, false);
  report = a.report(); assert.match(report, /Asymmetry/); assert.doesNotMatch(report, />Drooling</);
  a.click('closeReport'); a.choose('faceRest_findings', 'asymmetry', true, false);
  assert.equal(a.el('progress').value, 0);
  assert.doesNotMatch(a.report(), /Facial appearance &amp; symmetry at rest/);
});

test('history and recommendations support multiple choices, exclusive none / unknown, and extra notes', () => {
  const a = app();
  a.choose('medical_choices', 'none-reported');
  a.choose('medical_choices', 'neurological'); a.choose('medical_choices', 'respiratory');
  a.input('medical', 'Additional reported context');
  a.choose('recommendations_choices', 'monitor'); a.choose('recommendations_choices', 'reassess');
  let report = a.report();
  assert.match(report, /Neurological history reported/); assert.match(report, /Respiratory history reported/);
  assert.doesNotMatch(report, /None reported/);
  assert.match(report, /Additional reported context/);
  assert.match(report, /Monitor documented findings/); assert.match(report, /Repeat assessment \/ follow-up/);
  a.click('closeReport'); a.choose('medical_choices', 'unknown');
  report = a.report();
  assert.match(report, /Unknown \/ not available/); assert.doesNotMatch(report, /Neurological history reported|Respiratory history reported/);
});

test('multiselect answers retain stable IDs through Arabic, bilingual reporting, draft restore, and clear', () => {
  const storage = new Map(); let a = app(storage);
  a.choose('faceRest_findings', 'asymmetry'); a.choose('faceRest_findings', 'drooling');
  a.choose('languages_choices', 'arabic'); a.choose('languages_choices', 'english');
  a.toggle('remember', true); a.click('language');
  const saved = JSON.parse(storage.get(KEY)).data;
  assert.deepEqual(saved.faceRest_findings, ['asymmetry', 'drooling']);
  a = app(storage); assert.equal(a.doc.documentElement.lang, 'ar');
  let report = a.report(); assert.match(report, /عدم تناظر/); assert.match(report, /سيلان اللعاب/);
  a.toggle('bilingualReport', true); report = a.el('reportPreview').innerHTML;
  assert.match(report, /Asymmetry/); assert.match(report, /Drooling/);
  a.click('closeReport'); a.navigate(2);
  assert.match(a.el('sectionContent').innerHTML, /value="drooling" data-field="faceRest_findings" data-choice="multi" checked/);
  a.click('newExam'); a.click('confirmClear');
  assert.equal(storage.size, 0); assert.doesNotMatch(a.report(), /Asymmetry|عدم تناظر/);
});

test('older text drafts remain readable, and malformed multiselect data is filtered', () => {
  const storage = new Map([[KEY, JSON.stringify({ version: 1, lang: 'en', active: 1, data: {
    medical: 'Existing history note', setting: 'home', faceRest: 'concern', faceRest_note: 'Existing examination note',
    faceRest_findings: ['drooling', 'drooling', '<script>', 123], medical_choices: 'incorrect-array-type'
  } })]]);
  const a = app(storage);
  assert.match(a.el('sectionContent').innerHTML, /<details class="extra-notes" open>/);
  const report = a.report();
  assert.match(report, /Existing history note/); assert.match(report, /Existing examination note/);
  assert.match(report, /In person · home/); assert.match(report, /Drooling/);
  assert.doesNotMatch(report, /incorrect-array-type|<script>/);
});
