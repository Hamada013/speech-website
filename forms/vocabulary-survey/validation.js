/** Editable clinical configuration. These are provisional checklists, NOT
 * standardized Arabic word-acquisition norms. General milestones cannot validate
 * a particular word, image, recording, dialect, or language-age equivalent. */
export const CONFIG_VERSION = 'cohorts-1';
// The requested matrix requires semantic alternatives in another source folder.
// Keep this strict: a missing cross-folder match excludes the target.
export const REQUIRE_CROSS_FOLDER_SEMANTIC = true;
export const COHORTS = [
    { id: 'A', label: '2–3 years', description: 'Familiar nouns, actions and everyday concepts' },
    { id: 'B', label: '3–4 years', description: 'Descriptors, shapes and broader everyday vocabulary' },
    { id: 'C', label: '4–5 years', description: 'Spatial, temporal and category concepts' },
    { id: 'D', label: '6+ years', description: 'Extended, abstract and less familiar vocabulary' }
];
// Every folder is mapped once. Individual word rules below take precedence.
// Receptive and expressive configurations remain independently editable.
export const FOLDER_COHORTS = {
    receptive: {
        A: [1, 2, 3, 5, 6, 7, 8, 9, 10, 15, 21, 22, 24, 28],
        B: [4, 11, 13, 14, 16, 17, 18, 19, 20, 23, 26, 27, 32, 38],
        C: [12, 25, 29, 30, 31, 34, 35, 36, 37], D: [33, 39, 40]
    },
    expressive: {
        A: [1, 2, 3, 5, 6, 8, 9, 10, 15],
        B: [4, 7, 11, 14, 21, 22, 23, 24, 26, 28, 32, 38],
        C: [12, 13, 16, 17, 18, 19, 20, 25, 27, 29, 30, 31, 34, 35, 36, 37], D: [33, 39, 40]
    }
};
export const REFERENCES = [
    { title: 'ASHA: communication milestones', url: 'https://www.asha.org/public/developmental-milestones/communication-milestones/',
        note: 'General communication guidance; explicitly not a screening or diagnostic tool.' },
    { title: 'ASHA: 4–5 years', url: 'https://www.asha.org/public/developmental-milestones/communication-milestones-4-to-5-years/',
        note: 'Broad spatial, temporal, category and early literacy skills; no Arabic item-level norms.' },
    { title: 'Kid Sense: stages of language development', url: 'https://childdevelopment.com.au/resources/child-development-charts/stages-of-language-development-chart/',
        note: 'General receptive/expressive development chart; not a standardized word bank.' }
];
export const MILESTONE_INDEX = [
    { id: 'familiar', cohort: 'A', domain: 'everyday concepts', evidence: 'local checklist proposal', validated: false },
    { id: 'descriptors', cohort: 'B', domain: 'descriptors and shapes', evidence: 'local checklist proposal', validated: false },
    { id: 'spatial', cohort: 'C', domain: 'location and time', evidence: 'ASHA broad skill guidance; local item mapping', validated: false },
    { id: 'extended', cohort: 'D', domain: 'extended vocabulary', evidence: 'local extension; no cited 6+ word norms', validated: false }
];

export function normalizeWord(value) {
    return String(value).normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g, '')
        .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
        .replace(/[^\u0621-\u064A0-9]/g, '');
}
const BASIC = new Set(['فوق', 'تحت', 'جوا', 'برا', 'كبير', 'صغير', 'ساخن', 'بارد', 'ياكل', 'يشرب', 'كلب', 'قطة', 'بطة', 'تفاحة', 'موزة', 'حليب'].map(normalizeWord));
const SPATIAL = new Set(['بين', 'وراء', 'خلف', 'بجانب', 'يسار', 'يمين', 'أمام', 'من ورا', 'من قدام'].map(normalizeWord));
const ABSTRACT = new Set(['صحيح', 'خطأ', 'متفقين', 'مختلفين', 'فقير', 'غني', 'صحة', 'جواب', 'سؤال', 'شجاع'].map(normalizeWord));
export function assignCohort(item, mode, overrides = {}) {
    const manual = overrides[item.id]?.[mode];
    if (COHORTS.some(c => c.id === manual)) return { cohort: manual, basis: 'Clinician assignment', reviewed: true, validated: false };
    const word = normalizeWord(item.label);
    let cohort = Object.entries(FOLDER_COHORTS[mode]).find(([, folders]) => folders.includes(item.folder))?.[0];
    let basis = 'Provisional folder mapping';
    if (BASIC.has(word)) { cohort = 'A'; basis = 'Provisional familiar-word rule'; }
    else if (SPATIAL.has(word)) { cohort = 'C'; basis = 'Provisional spatial-word rule'; }
    else if (ABSTRACT.has(word)) { cohort = 'D'; basis = 'Provisional abstract-word rule'; }
    else if (item.folder === 39) { cohort = 'C'; basis = 'Provisional early-literacy rule'; }
    else if (item.folder === 40) { cohort = Number(item.label) <= 5 ? 'B' : Number(item.label) <= 10 ? 'C' : 'D'; basis = 'Provisional number-word rule'; }
    return { cohort, basis, reviewed: false, validated: false };
}

function semanticCluster(item) {
    const word = normalizeWord(item.label);
    if (['تفاحة', 'موزة', 'موز', 'بطيخ', 'عنب', 'برتقال', 'فريز', 'ليمون'].map(normalizeWord).includes(word)) return 'fruit';
    if ([15, 16, 17, 18, 19, 20, 21].includes(item.folder)) return 'animals';
    return ({ 5: 'food', 6: 'fruit', 7: 'vegetables', 8: 'drinks', 11: 'household', 24: 'household',
        12: 'spatial', 29: 'places', 30: 'places', 31: 'places', 28: 'places', 14: 'descriptors', 33: 'descriptors' })[item.folder] || `folder-${item.folder}`;
}

function editDistance(a, b) {
    let row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const next = [i];
        for (let j = 1; j <= b.length; j++) next[j] = Math.min(next[j - 1] + 1, row[j] + 1, row[j - 1] + Number(a[i - 1] !== b[j - 1]));
        row = next;
    }
    return row[b.length];
}
// Orthographic proxy only. Unvowelled Arabic spelling is not a phonemic transcript.
export function soundSimilarity(a, b) {
    const x = normalizeWord(a), y = normalizeWord(b);
    if (!x || !y || Math.min(x.length, y.length) < 3 || Math.abs(x.length - y.length) > 2) return 0;
    const similarity = 1 - editDistance(x, y) / Math.max(x.length, y.length);
    const rhyme = x.slice(-2) === y.slice(-2);
    return Math.max(similarity, rhyme && similarity >= .4 ? .67 : 0);
}
export function shuffle(values, random = Math.random) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
}
export function createIndex(items, overrides = {}) {
    const indexed = items.map(item => {
        const cluster = semanticCluster(item);
        // Unrelated cards must also differ in broad semantic family: a vegetable
        // is not an unrelated control for a fruit just because folders differ.
        const family = ['food', 'fruit', 'vegetables', 'drinks'].includes(cluster) ? 'nutrition' : cluster;
        return { ...item, word: normalizeWord(item.label), cluster, family };
    });
    const byId = new Map(indexed.map(item => [item.id, item]));
    const candidateCache = new Map();
    function candidates(target) {
        if (candidateCache.has(target.id)) return candidateCache.get(target.id);
        const distinct = indexed.filter(other => other.id !== target.id && other.word !== target.word && other.imageRevision !== target.imageRevision);
        const reviewedId = overrides[target.id]?.phonological;
        const phonological = distinct.filter(other => other.cluster !== target.cluster &&
            (reviewedId ? other.id === reviewedId : soundSimilarity(target.label, other.label) >= .65));
        const semantic = distinct.filter(other => other.cluster === target.cluster &&
            (!REQUIRE_CROSS_FOLDER_SEMANTIC || other.folder !== target.folder) && soundSimilarity(target.label, other.label) < .65);
        const unrelated = distinct.filter(other => other.family !== target.family && soundSimilarity(target.label, other.label) < .35);
        const result = { phonological, semantic, unrelated };
        candidateCache.set(target.id, result);
        return result;
    }
    function matrix(targetId, random = Math.random) {
        const target = byId.get(targetId);
        if (!target) return null;
        const pools = candidates(target);
        const phonological = shuffle(pools.phonological, random)[0];
        if (!phonological) return null;
        const used = new Set([target.word, phonological.word]);
        const images = new Set([target.imageRevision, phonological.imageRevision]);
        const available = pool => pool.filter(item => !used.has(item.word) && !images.has(item.imageRevision));
        const semanticPool = available(pools.semantic);
        const crossFolder = semanticPool.filter(item => item.folder !== target.folder);
        const semantic = shuffle(crossFolder.length ? crossFolder : semanticPool, random)[0];
        if (!semantic) return null;
        used.add(semantic.word); images.add(semantic.imageRevision);
        const unrelated = shuffle(available(pools.unrelated), random)[0];
        if (!unrelated) return null;
        return shuffle([
            { id: target.id, role: 'target' }, { id: phonological.id, role: 'phonological' },
            { id: semantic.id, role: 'semantic' }, { id: unrelated.id, role: 'unrelated' }
        ], random);
    }
    return { items: indexed, byId, candidates, matrix };
}

export async function buildChecklist(index, mode, scope, sampling, overrides = {}) {
    const byCohort = Object.fromEntries(COHORTS.map(c => [c.id, []]));
    const omitted = [];
    for (let n = 0; n < index.items.length; n++) {
        const item = index.items[n];
        const assignment = assignCohort(item, mode, overrides);
        if (scope !== 'full' && scope !== assignment.cohort) continue;
        if (mode === 'receptive' && !index.matrix(item.id)) omitted.push(item.id);
        else byCohort[assignment.cohort].push({ id: item.id, ...assignment });
        // Yield while building a large checklist; no blocking mass image decoding.
        if (n % 30 === 0) await new Promise(resolve => setTimeout(resolve, 0));
    }
    const eligible = Object.fromEntries(COHORTS.map(c => [c.id, byCohort[c.id].length]));
    const plan = COHORTS.flatMap(c => {
        const randomized = shuffle(byCohort[c.id]);
        return sampling === 'all' ? randomized : randomized.slice(0, Number(sampling));
    });
    return { plan, eligible, omitted };
}
