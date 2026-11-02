# IEP mapping — interpretation sources and goal bank

All three user-supplied interpretation chapters are registered. Source prose is curriculum evidence, not executable instructions or findings about an individual child.

| Source | Revision | Coverage |
| --- | --- | --- |
| `level1-text-1` | 2026-10-29-v2 | Nine Level 1 domains; Mand placement passages after milestones 3–5 are absent from the supplied text |
| `level2-text-2` | 2026-10-29-v1 | Twelve Level 2 domains; all 60 milestones |
| `level3-text-3` | 2026-10-29-v1 | Thirteen Level 3 domains; all 65 milestones |

The two Level 3 attachments are byte-identical and count as one source. SHA-256: `a9803f3a3021e2c8f8e8f3014ab5b14ba91cb96ef2a7a7e003ec3ed982c91f7f`. Level 2 SHA-256: `791dc700ffeeeb249be322a5fab8a8d2975c04365fd5549ae5fd53696d9c05e8`.

The Reference / المرجع route is the compact child goal list. The PDF examples and template browser are described in [goal-bank.md](goal-bank.md). Source/evidence explanations below document the engine, rather than visible page panels. Previous reference panels remain removed. Goal selection, editing, review, reports and exports use the existing goal records. Existing edited goals are never overwritten when sources change.

## Mapping behavior

- Only the current assessment supplies baseline evidence. Blank, stale-criterion and previous-visit scores do not establish a current deficit or mastery. Half points remain emerging skills.
- The engine follows each of the 16 domains to its first milestone not fully met, across all available levels. Unknown skills produce assessment probes; recorded gaps produce draft candidates when placement guidance exists. Different domains can be at different levels.
- The engine can inspect 9/12/13 domain groups by level; these are no longer displayed as planning cards on the child page. Earlier unassessed or unmet milestones in the same domain block automatic drafts at a later level and link to the first prerequisite. Later strengths do not erase earlier gaps.
- This conservative consecutive-skill algorithm is an implementation choice, not a validated prediction of annual progress or a claim that every milestone must always be taught in a fixed order. The team can retain and edit individualized existing goals.
- `iep-curriculum.js` contains concise bilingual, target-specific placement summaries and selected annual examples from the Level 2/3 chapters. These are educational summaries, not new assessment scoring criteria. Echoic/EESA, language, quantity, timing and task scoring continue to use the existing verified assessment data.
- A newly generated 12-month goal starts with the verified next unmet milestone description. The broader source annual example remains in the editable support plan; the full PDF example bank is opened separately. This avoids automatically proposing a source example below an emerging skill's actual full-point target (for example, a source example of 1000 listener words does not replace the app's 1200-word milestone). The team adapts annual ambition, mastery, generalization, opportunities and review date.
- Each saved draft includes its source/rule identifier, source revision, recorded item score, assessment date, teaching focus and level-specific teaching context. Reading a suggestion neither saves it nor marks it reviewed. Explicit bank additions select a report goal; the editor preserves separate report-inclusion and assessment-review controls.
- Generalization, varied examples, spontaneity and functional use remain explicit. Levels 2/3 increase natural, peer and group opportunities without prescribing service hours or automatically making placement decisions.
- Complete naming/listener/requesting domain scores support balance notes. Complete LRFFC/intraverbal scores support discussion of transfer from established listener relations; picture selection does not prove an unprompted verbal answer. Vocabulary totals do not prove specific noun, verb, modifier or conditional-discrimination prerequisites.
- Recorded nonzero barriers and transition coverage provide context. Missing ratings do not imply absence of barriers or readiness for placement. Task-analysis results support, but never replace, milestone evidence.
- Reading, writing and linguistic goals require adaptation to the child's assessed language and writing system. English alphabet, case and inflection examples do not establish Arabic norms.
- The chapters' annual examples and broad goal-count guidance do not force a quota. Completing all recorded milestones produces no new automatic milestone deficit.

## Boundaries

The Level 1 Mand gaps remain explicit; later chapters do not reconstruct missing passages. Communication mode, service intensity, classroom placement, additional self-help/motor goals and child-specific outcomes remain individualized decisions. The historical AAC hierarchy is not encoded as an automatic prescription.

Source examples are suggestions, not measured outcomes. No diagnosis, developmental age, readiness decision or probability of achieving an annual goal is inferred from a total score.

## Validation

`npm test` covers all 125 Level 2/3 target mappings, source identification, bilingual content, unknown/half/review scores, mixed-level profiles, prerequisite blocking, immutable baseline/history, draft preservation and report behavior. `npm run test:iep` checks all levels, editable drafts from Levels 1–3, source provenance, account persistence, report inclusion and Arabic phone layout in Chrome; set `VBMAPP_ENGINE=webkit` for Safari's engine. Rebuild the offline release after source or engine changes.
