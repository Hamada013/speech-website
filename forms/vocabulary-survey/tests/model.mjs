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
assert.ok(!release.shell.some(file => file.includes('media/images/1/')));
console.log(`PASS: ${data.items.length} source items, ${tested} complete receptive matrices, age overrides, scoring, safe imports, JSON/CSV round trips, matched-item deltas and PWA integrity.`);

// Fixed banks: exact counts, distinct words, stable membership and nested 50/100.
for (const mode of ['receptive','expressive']) {
    const full = await buildChecklist(index, mode, 'full', 'all');
    const short = await buildChecklist(index, mode, 'full', '50');
    const repeat = await buildChecklist(index, mode, 'full', '50');
    for (const cohort of COHORTS) {
        const ids = list => list.plan.filter(p=>p.cohort===cohort.id).map(p=>p.id).sort();
        assert.equal(ids(full).length, mode==='receptive'?50:100);
        assert.equal(ids(short).length, 50);
        assert.deepEqual(ids(short),ids(repeat));
        assert.ok(ids(short).every(id=>ids(full).includes(id)));
        assert.equal(new Set(ids(full).map(id=>normalizeWord(index.byId.get(id).label))).size,ids(full).length);
    }
}
const { progressSeries, peerComparison, ageMonths } = await import('../reporting.js');
const baseline = structuredClone(current); baseline.id='baseline'; baseline.metadata.assessmentDate='2026-09-01';
const newer = structuredClone(current); newer.records = newer.records.filter(r=>r.outcome!=='skip'); newer.plan=newer.plan.filter(p=>newer.records.some(r=>r.targetId===p.id));
const older = structuredClone(newer); older.id='older'; older.metadata.assessmentDate='2026-09-01'; older.records[1].outcome='target';
const series=progressSeries(newer,[older,newer]);
assert.equal(series.points.length,2); assert.equal(series.count,4); assert.equal(series.delta,-25);
const peer=structuredClone(newer); peer.id='peer';peer.metadata.childId='OTHER';peer.metadata.birthDate='2021-11-01';peer.records[1].outcome='target';
assert.equal(peerComparison(newer,[peer]).count,1);
assert.equal(peerComparison(newer,[peer]).median,50);
const duplicate=structuredClone(peer);duplicate.id='peer-repeat';
assert.equal(peerComparison(newer,[peer,duplicate]).count,1);
peer.metadata.birthDate='2015-01-01';assert.equal(peerComparison(newer,[peer]).available,false);
peer.metadata.birthDate='2021-11-01';peer.metadata.languages='Other language';assert.equal(peerComparison(newer,[peer]).available,false);
peer.metadata.languages=newer.metadata.languages;peer.records[0].audioPlayed=false;assert.equal(peerComparison(newer,[peer]).available,false);
assert.equal(ageMonths({birthDate:'2022-11-03',assessmentDate:'2026-11-02'}),47);
assert.equal(progressSeries(newer,[]).points.length,0);
assert.equal(peerComparison({...newer,status:'partial'},[peer]).available,false);
for (const sampling of ['50','100']) {
    const sample={...current,sampling}; assert.equal(validateSession(sample).sampling,sampling);
}
console.log('PASS: fixed 50/100 banks, nested retests, decline series, age matching, language/prompt exclusions and one result per peer.');

// Choice identities remain stable when retest positions shuffle.
for (const entry of receptive.plan) {
    const signature = options => options.map(o=>`${o.id}:${o.role}`).sort();
    assert.deepEqual(signature(index.matrix(entry.id)), signature(index.matrix(entry.id)));
}
const changedChoices = structuredClone(older);
changedChoices.records[0].options[1].id = '40-30';
assert.equal(compare(newer, changedChoices).count, 3);
changedChoices.metadata.childId='OTHER';
assert.equal(peerComparison(newer, [changedChoices]).available, false);
const manifest = JSON.parse(fs.readFileSync(path.join(root,'manifest.json')));
assert.equal(manifest.scope,'./'); assert.equal(manifest.display,'standalone');
for (const asset of [...manifest.icons,...manifest.screenshots]) {
    assert.ok(release.shell.includes(asset.src));
    const body=fs.readFileSync(path.join(root,asset.src));
    assert.equal(`${body.readUInt32BE(16)}x${body.readUInt32BE(20)}`,asset.sizes);
}
console.log('PASS: stable distractors, changed-choice exclusions and manifest screenshot/icon dimensions.');
