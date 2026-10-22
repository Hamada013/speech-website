import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FOLDER_COHORTS, COHORTS, assignCohort, createIndex, buildChecklist, normalizeWord, soundSimilarity } from '../validation.js';
import { analyze, compare, parseHistory, toCSV, validateSession } from '../reporting.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/vocabulary.json')));
for (const mapping of Object.values(FOLDER_COHORTS)) {
    const folders = Object.values(mapping).flat();
    assert.equal(folders.length, 40);
    assert.equal(new Set(folders).size, 40);
    assert.deepEqual([...folders].sort((a, b) => a - b), Array.from({ length: 40 }, (_, i) => i + 1));
}
for (const item of data.items) {
    assert.ok(fs.existsSync(path.resolve(root, item.image)));
    assert.ok(fs.existsSync(path.resolve(root, item.audio)));
    assert.ok(COHORTS.some(c => c.id === assignCohort(item, 'receptive').cohort));
    assert.equal(assignCohort(item, 'receptive').validated, false);
}
const item = data.items[0];
assert.equal(assignCohort(item, 'receptive', { [item.id]: { receptive: 'D' } }).cohort, 'D');
assert.equal(normalizeWord('أَسْوَد'), normalizeWord('اسود'));
assert.equal(soundSimilarity('قطة', 'بطة') >= .65, true);
const index = createIndex(data.items);
const receptive = await buildChecklist(index, 'receptive', 'full', '5');
assert.ok(receptive.plan.length >= 15);
let tested = 0;
for (const target of index.items) {
    const options = index.matrix(target.id);
    if (!options) continue;
    const values = options.map(option => index.byId.get(option.id));
    assert.deepEqual(options.map(option => option.role).sort(), ['phonological', 'semantic', 'target', 'unrelated']);
    assert.equal(new Set(values.map(value => value.word)).size, 4);
    assert.equal(new Set(values.map(value => value.imageRevision)).size, 4);
    const sound = index.byId.get(options.find(o => o.role === 'phonological').id);
    const semantic = index.byId.get(options.find(o => o.role === 'semantic').id);
    const unrelated = index.byId.get(options.find(o => o.role === 'unrelated').id);
    assert.ok(soundSimilarity(target.label, sound.label) >= .65);
    assert.notEqual(sound.cluster, target.cluster);
    assert.equal(semantic.cluster, target.cluster);
    assert.notEqual(semantic.folder, target.folder);
    assert.notEqual(unrelated.cluster, target.cluster);
    assert.ok(soundSimilarity(target.label, unrelated.label) < .35);
    tested++;
}
assert.ok(tested > 100);
function fixture(outcomes = ['target', 'semantic', 'phonological', 'unrelated', 'skip']) {
    const plan = receptive.plan.slice(0, outcomes.length);
    return { schemaVersion: 1, id: 'test-session', mode: 'receptive', scope: 'full', sampling: '5', audioMode: 'spoken-prompt', status: 'complete',
        metadata: { childId: 'C-1', childName: '"Arabic, name"', birthDate: '2021-10-01', assessmentDate: '2026-10-14', examiner: 'Clinician', languages: 'Arabic', notes: 'First line\nSecond, line' },
        startedAt: '2026-10-14T08:00:00Z', finishedAt: '2026-10-14T08:10:00Z', dataVersion: data.version, configVersion: 'cohorts-1:0',
        eligible: receptive.eligible, omitted: receptive.omitted, missingMediaCount: data.excluded.length, plan,
        records: plan.map((p, i) => {
            const options = index.matrix(p.id), selected = options.find(option => option.role === outcomes[i]);
            return { targetId: p.id, label: index.byId.get(p.id).label, itemRevision: index.byId.get(p.id).revision,
            folder: index.byId.get(p.id).folder, cohort: p.cohort, outcome: outcomes[i], selectedId: selected?.id || '', selectedLabel: selected ? index.byId.get(selected.id).label : '',
            latencyMs: 1200, audioPlays: 1, audioPlayed: true, options };
        }) };
}
const current = fixture();
assert.equal(analyze(current).overall.accuracy, 25);
assert.equal(analyze(current).overall.skipped, 1);
assert.equal(analyze(current).errorTotal, 3);
assert.equal(analyze(current).errors[0].percentage, 33.3);
assert.equal(analyze(current).languageAgeEquivalent, null);
assert.match(analyze(current).attainment, /غير مقدّر/);
const json = parseHistory(JSON.stringify({ session: current }), 'history.json');
const csv = parseHistory(toCSV(current), 'history.csv');
assert.deepEqual(csv.records, json.records);
assert.deepEqual(csv.metadata, json.metadata);
assert.deepEqual(csv.plan, json.plan);
const prior = structuredClone(current); prior.id = 'previous'; prior.metadata.assessmentDate = '2026-09-14'; prior.records[1].outcome = 'target';
assert.equal(compare(current, prior).delta, -25);
assert.equal(compare(current, prior).count, 4);
prior.metadata.childId = 'OTHER'; assert.equal(compare(current, prior).compatible, false);
prior.metadata.childId = 'C-1'; prior.audioMode = 'modeled'; assert.equal(compare(current, prior).compatible, false);
const expressive = structuredClone(current); expressive.mode = 'expressive'; expressive.audioMode = 'modeled';
expressive.records = expressive.records.slice(0, 3).map((r, i) => ({ ...r, outcome: ['mastered', 'learning', 'notMastered'][i] }));
assert.equal(analyze(expressive).overall.accuracy, 33.3);
assert.equal(analyze(expressive).overall.weighted, 50);
assert.throws(() => parseHistory('{"session":{"schemaVersion":200}}', 'bad.json'));
assert.throws(() => parseHistory('name,score\nchild,50', 'bad.csv'));
assert.throws(() => parseHistory(toCSV(current).replace('"target"', '"wrongOutcome"'), 'bad.csv'));
assert.throws(() => validateSession({ ...current, records: [current.records[0], current.records[0]] }));
const inconsistent = structuredClone(current); inconsistent.records[0].outcome = 'semantic';
assert.throws(() => validateSession(inconsistent), /does not match/);

const releaseContext = { self: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/pwa-release.js'), 'utf8'), releaseContext);
const release = releaseContext.self.SURVEY_RELEASE;
assert.equal(release.media.length, 40);
for (const asset of release.media.flat()) {
    const body = fs.readFileSync(path.resolve(root, asset.url));
    assert.equal(asset.revision, crypto.createHash('sha256').update(body).digest('hex'));
}
for (const file of release.shell) assert.equal(release.integrity[file], `sha256-${crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('base64')}`);
const expectedVersion = crypto.createHash('sha256').update(JSON.stringify({ integrity: release.integrity, media: release.media,
    worker: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'sw.js'))).digest('hex') })).digest('hex').slice(0, 20);
assert.equal(release.version, expectedVersion, 'Rebuild the PWA release after editing worker/app files');
assert.ok(!release.shell.some(file => file.includes('tools/VSS/voc/images/1/')));
console.log(`PASS: ${data.items.length} source items, ${tested} complete receptive matrices, age overrides, scoring, safe imports, JSON/CSV round trips, matched-item deltas and PWA integrity.`);
