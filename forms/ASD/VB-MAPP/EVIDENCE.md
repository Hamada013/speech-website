# VB-MAPP revision review — 2026-10-08

## Assessment structure

The [publisher's VB-MAPP overview](https://marksundberg.com/vb-mapp/) describes 170 milestones across 16 domains and three developmental levels, 24 barriers, and 18 transition areas. Its task-analysis component is broader than the five supporting entries present in the supplied app. These public structure details were used to audit coverage; missing proprietary item criteria were not reconstructed from memory.

The [milestones workflow documentation](https://experience.ensorahealth.com/vb-mapp-92/milestones-section-workflow-6298) supports the item-based scoring and milestones chart presentation. The revision uses explicit 0, 0.5, and 1 milestone scores, subject to the supplied item-specific restriction on half points. The EESA group-5 controls also exclude half points.

## Preserved source content

The source was the existing compiled app `assets/index-eDcmZU0F.js`, loaded by the original `index.html`. The new data file was compared against extracted original data using deep equality for every original data field, including bilingual descriptions, objectives, administration instructions, and scoring criteria. The 31 longer bilingual interface guidance pairs were also preserved and compared. Historical automatic-scoring and generic-placement language remains in the reference section rather than becoming a conclusion in a child's report.

| Supplied component | Records retained | Review finding |
|---|---:|---|
| Milestones | 165 | Five Level 2 motor-imitation records missing; visible placeholders bring the grid to 170 boxes. |
| Barriers | 24 | Item names retained; detailed source guidance exists for a subset. |
| Transition | 18 | All entries retained; detailed item criteria are limited in the source. |
| EESA | 100 | All original English stimuli and supplied Arabic equivalents retained. |
| Supporting skills | 5 | Original subset retained and labeled as such. |
| IEP planning reference | 5 steps | Complete supplied guidance retained. |
| Source goal examples | 3 | Retained in the reference section. |

The source discrepancy at `s2-8` and conflicting higher-score guidance at `tr-6` are displayed without silently changing the criteria.

## Corrected behavior

- Removed automatic echoic milestone overwrites and automatic transition score injection. Explicit assessor scores now remain unchanged when another section is scored.
- Separated unassessed, zero, half, full, and missing-criterion states in calculations, grid boxes, summaries, and reports.
- Replaced a fixed placement statement and generic child-independent goals with recorded priorities, editable goal plans, and section-aware recommendations.
- Allowed reports from any selected section, including a single section; excluded sections do not contribute interpretation.
- Corrected Arabic domain wording, direction handling, numerical profile labels, mixed-language heading rendering, and narrow-screen table scrolling.
- Limited case reset to VB-MAPP storage keys and added guarded loading, legacy migration, editable JSON export/import, and save failure feedback.
- Added 62 explicit future image mappings with child-facing viewers, safe handling of unmapped images, and separate preparation notes.
- Added local Arabic/English PDF download, measured page layout, long-note splitting, print/text options, and Ahmad Ghanem's footer information.

## Verification performed

Model/report tests passed for exact original data preservation, 170 unique grid records, five source gaps, explicit score states and constraints, no cross-section score overwrite, partial report scope, legacy migration, age/date validation, escaped user text, data-based goal baselines, and bilingual report content.

An isolated headless Chrome browser passed interaction checks at 1024px, 768px, and 390px widths with touch enabled. Checks covered scoring and notes, missing-criterion completion, mapped and missing stimulus handling, scope selection, goal editing, report language switching, unrelated storage retention after reset, legacy import, no button audio, no JavaScript errors, and no external asset requests.

Actual Arabic and English PDF downloads were opened and rendered into page images for visual review. The sample milestone-only reports had four pages. The milestone boxes, half fills, Arabic headings, numerical profiles, pagination, and contact footers were inspected. Full-scope reports with long observations were checked for page overflow. Fixed A4 pagination was also checked at narrow screen widths.

These checks used synthetic data. They verify app behavior and supplied content preservation, rather than establish validity of a translated or incomplete clinical instrument. Native iPad Safari was not available for device testing; tablet behavior was checked through touch-enabled browser viewports.

## Online information audit — 2026-10-08

This follow-up checked the supplied content against the author/publisher overview, Kansas TASN assessment resources, publicly indexed PaTTAN milestone/protocol extracts, and the EESA provider's workflow. Public supplements identify skills and some numerical requirements, but do not replace the complete item-specific scoring guide. PaTTAN/PSU PDF endpoints could not be fully retrieved in this session; their indexed text was used only for the specific facts recorded below, with corroboration from the TASN data sheets where available. No protected resource PDF or complete form was added to the website.

Primary references:

- [Author/publisher overview](https://marksundberg.com/vb-mapp/): assessment structure and components.
- [Kansas TASN data-sheet resource](https://ksdetasn.org/resources/4157): task identity, arrays, stimulus type, and observed-skill distinctions. The linked supplement was read locally; it is a data-collection supplement, rather than the full scoring guide.
- [Kansas TASN scoring guidance](https://ksdetasn.org/resources/2330): criterion-based scoring, appropriate evidence sources, and avoiding guessed scores.
- [PaTTAN protocol extract](https://www.pattan.net/getmedia/fd334130-2873-4085-a266-86ebf981a4de/vb_mapp_docs): indexed listener-9 and matching-6 statements.
- [PaTTAN milestone alignment](https://storage.outreach.psu.edu/autism/46Handout10.pdf): indexed Level 2 linguistic-structure, play, and sorting statements.
- [EESA scoring workflow](https://experience.ensorahealth.com/vb-mapp-92/eesa-section-workflow-6301): distinctions between full, half, and zero phonetic responses.

| Records | Finding / revision |
|---|---|
| `l2-9` | Supplied noun/verb instruction count was 50; indexed protocol specifies 25. |
| `vp2-6` | Supplied non-identical matching was the wrong task; this item uses identical matching. |
| `vp2-7` | Replaced five-category sorting with model-based color/shape sorting. |
| `vp2-8`–`vp2-10` | Corrected task sequence: identical matching with similar distractors, non-identical matching, and object/picture matching. |
| `p2-7`–`p2-10` | Corrected functional use, creative use, playground activity, and multipart assembly summaries. The supplied assembly threshold of 10 sets was inconsistent with the indexed five-set task. |
| `lr2-6`, `lr2-7` | Corrected food/drink selection versus verbal-association selection, and their arrays. |
| `li2-6`–`li2-10` | Replaced unrelated word-class tasks with intelligibility, receptive vocabulary, spontaneous two-word utterances, functional prosody, and expressive vocabulary. |
| `s2-8` | Preserved its three-minute description and flagged the conflicting full-score duration. Complete guide criteria are still needed. |
| `tr-6` | Withheld the conflicting higher-score scale pending verified item-specific criteria; preserved the original scale for review. |

Seventeen milestone task summaries were corrected; `s2-8` is an additional criterion conflict, bringing the flagged milestone records to 18. Each requires verified guide criteria before a new score can be recorded. The five missing motor-imitation placeholders remain separate. Full and half-point thresholds were not invented for the corrected tasks. The rest of the supplied criteria are preserved without claiming that every condition was verified against the complete original guide.

EESA groups 1–3 now show phonetic scoring guidance. Groups 4–5 keep their separate prosody guidance, with no half score for group 5. English stimuli and supplied Arabic translations remain distinct language versions; the app does not treat translation as a validated equivalent stimulus set.

## Follow-up debugging and validation

Existing scores attached to changed tasks or criteria remain in saved/exported data, but are excluded from current totals, grid fills, goals, and recommendations until explicitly re-scored. Scoring review records include the exact entered task and criterion, so editing either field also invalidates prior approval after a JSON round trip. Half-point scores imported for items that prohibit them are retained as pending review and cannot affect totals or goal selection.

Previously selected plans remain editable. A plan written for a changed criterion is shown as historical until the assessor reviews it against the current scored task. Re-scoring a milestone alone cannot turn its old goal into a current recommendation. Historical plans and previous responses remain visible even when unassessed-item detail is hidden.

All 62 image numbers were retained. Reviewed descriptions replace the mismatched preparation tasks. Language-sample paths 30–31 are assessor-only, with their child-facing buttons disabled. Path 29 remains available for intelligibility naming stimuli, with a reminder that the judging listener must not see the items.

Follow-up model/report checks cover original content preservation through `VB_SUPPLIED_DATA`, all 170 unique slots, the 18 flagged milestones, scoring gates, stale and invalid imported scores, criteria/goal review persistence, historical plans, and section-aware recommendations. Follow-up browser checks passed at touch-enabled 1024px, 768px, and 390px widths. They covered pending old answers, re-scoring, criterion edits, historical goal review, transition scoring gates, group scoring guidance, and appropriate image buttons. Both actual Arabic and English PDFs downloaded successfully (four pages each); their rendered pages were inspected for shaping, grid states, profiles, historical-goal labels, pagination, and footers. The final PDFs also verify that unedited bilingual task summaries use the chosen report language. No JavaScript errors, button sounds, or external runtime requests occurred. Native iPad Safari remains untested.

## Previous-PDF import and repeated visits — 2026-10-08

Downloaded reports now contain a standard UTF-8 JSON file attachment named `vb-mapp-assessment.json`. It records the child, current assessment, selected-section scores, observations, criteria, goals, and flat prior-visit snapshots. Excluded report sections are removed from both the current and historical PDF payloads. Editable JSON retains the complete workspace. Browser printing remains a visual-only export. The local importer reads attachment data without executing PDF actions or uploading the report.

Importing a previous report starts a new visit for the same case. Previous scores remain reference marks in each milestone box; all current scores, response notes, observations, recommendations, and goal plans start blank. Previous criteria are copied for re-administration, with separate scoring review. Historical response notes, entered criteria, and selected goal plans are available on task cards. Re-testing can record a higher, unchanged, or lower score, including zero. New goals and recommendations use current recorded evidence. Score changes and paired totals require valid scores on both visits and the same criterion; changed criteria are labeled separately. Case IDs prevent combining unrelated histories. Import replacement keeps one recoverable local workspace copy.

Older image-only reports lack the structured attachment. A bounded visual recognizer recovers identifiable marks from this app's five-row, 9/12/13-domain grid layout, checking at most the first eight pages. Synthetic older Arabic PDFs recovered all six known full/half/zero marks correctly. Recovery is followed by an explicit review screen with source-page previews, 170 editable historical boxes, and child/date verification. Notes, goals, other sections, and unavailable guide criteria are not reconstructed from these images. Unknown layouts and ambiguous marks require manual entry. This does not provide general OCR or guaranteed import of arbitrary scanned assessment forms. PDF files are limited to 50 MB and attached JSON data to 8 MB.

The report uses a compact child-information table, separately labeled change counts and previous/current paired totals, a dated visit history, a master milestone grid with previous marks, an item comparison table, current priorities/recommendations, and detailed results. Numeric date/score runs use explicit left-to-right direction inside Arabic text. Table chunks repeat column labels; continuation grid pages repeat the legend; item descriptions stay with their previous-score line. A pagination defect that treated an entire milestone level as a heading was fixed, preventing grouped grids from overflowing A4 pages.

Technical references: [PDF.js API overview](https://mozilla.github.io/pdf.js/api/index.html), [PDF document and attachment API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentProxy.html), and [jsPDF API](https://parallax.github.io/jsPDF/docs/jspdf.js.html). PDF.js 6.4.299 and its worker/license are vendored locally; its attachment API uses a Map and retrieves bytes through `getAttachmentContent`. The download attachment is plain assessment data rather than PDF JavaScript.

Model/report checks cover immutable prior visits, blank new scores, increases/decreases/new items, criterion-aware comparisons, current-only goals, selected-section payloads, multi-visit JSON persistence, unrelated-case rejection, and invalid-data handling. Touch-enabled headless Chrome checks cover actual PDF attachment import, rescoring, changed criteria, task filters, previous-criterion display, Arabic/English downloads, re-import for a third visit, older-grid review and cancellation, failed-import preservation, local recovery, real drag/drop, reload, and 768px/390px layouts. Actual follow-up PDFs in both languages have six pages and were rendered for visual review of tables, grid marks, half fills, direction, pagination, and footers. Existing assessment regression checks also passed. All tests use synthetic child records. Native iPad Safari remains untested.

## Original milestone guidance display — 2026-10-08

A source audit found complete bilingual objective, administration, and scoring fields in all 165 supplied milestone records. The review layer intentionally removed the active objective and substituted guide-verification reminders for administration/scoring on 18 flagged records. This made their task cards appear incomplete even though their original data remained preserved.

The task-card renderer now reads the complete source guidance through `VBModel.milestoneGuidance`. Flagged cards show an open **الصياغة الأصلية / Original wording** panel with the original task and all three labeled source sections. Reviewed task wording and assessor-verified criteria remain separate from that reference panel. Normal milestone dialogs also show all three source sections. The five missing motor-imitation placeholders have the same section headings, with explicit unavailable-source messages rather than invented objectives, administration protocols, or score thresholds.

Model checks compare every supplied objective, application, and scoring field to the original extracted file in both languages and check that all 170 boxes have nonempty section text. Browser checks open all 23 questioned boxes in Arabic and English, verify the original 18 descriptions and all three source sections are visible and exact, verify missing-source labels for the other five, and confirm scoring still requires verified criteria. Existing assessment, score-review, follow-up, report, and touch-layout regression checks remain applicable. This is a display correction using existing user-supplied content; it does not establish that the original disputed wording is clinically correct.

## Final product styling and cleanup — 2026-10-08

Fixed milestone palettes: Level 1 orange `#f7cfa8`, Level 2 green `#c5e5c9`, and Level 3 blue `#c6ddf6`, with light matching backgrounds and dark readable text. The palette applies to grids, task cards, selected-score controls, level selectors, and PDF grids. Score state symbols and half fills remain distinct. Legacy assessment color metadata are preserved but no longer override the level palette.

Removed source-audit narratives from routine assessment screens and clinical reports, removed image filenames from task preparation and missing-image feedback, and shortened repeated implementation explanations. Original task guidance, review criteria, data/history, clinical interpretations, and pending-score safeguards are retained. Planning and assessment references remain optional. Short goal plans are grouped for pagination. PDF export uses the per-page contact footer and omits the duplicated content footer, fixing an otherwise nearly empty last page.

Model and full touch-browser regression checks cover original content, score/goal gates, partial scope, Arabic/English reports, all questioned source sections, level palettes, report audit-text removal, missing-image handling, long-note pagination, PDF attachment import, retest decreases, multiple visits, legacy-grid review, recovery, persistence, and narrow layouts. Actual Arabic/English PDFs and follow-up PDFs are rendered for final visual review. The older-grid reader recognizes pastel color fills; grids with taller previous-score strips are excluded from automatic visual recovery. Tests use synthetic records and do not alter patient data. Native iPad Safari remains untested.
# Milestone question-status removal and task explanations — 2026-10-08

Removed the question-mark state and "معيار يحتاج إلى تحقق" wording from milestone grids, their accessible names, legend, task cards, and clinical report descriptions. All unscored boxes use the normal unassessed state, including the 23 formerly marked records. Report completion counts include all unscored records without exposing a separate source-review count. Existing score validation, old-result exclusion, criterion-aware comparison, and goal safeguards remain in force.

Added bilingual current-task goals and practical application steps for the 18 reviewed milestones. Their complete original supplied descriptions, objectives, administration instructions and scoring criteria remain available in a separate original-wording section. Added specific task descriptions, goals and application steps for motor-imitation records `i2-6` through `i2-10`, replacing the visible missing-record messages. Full/half-point conditions are still assessor-entered where the supplied rules are unavailable or conflicting; the explanations do not invent an official scoring rubric.

The five motor-imitation task identities were cross-checked with [the author’s sample assessment report distributed by Kansas TASN](https://ksdetasn.s3.amazonaws.com/uploads/resource/upload/2315/Sundberg_Sample_VB-MAPP_Report-2.pdf) and [the published scoring excerpt distributed by PaTTAN/PSU](https://storage.outreach.psu.edu/autism/18%20and%2030%20Handout%204_0.pdf). The practical application prose is original explanatory text. No source PDF was added to the runtime.

Verification compares original content exactly, checks nonempty bilingual goal/application/scoring sections for all 170 boxes, opens all 23 updated boxes in both languages, confirms the question status is absent, checks preserved original text, scoring setup and invalidation, follow-up history, touch layouts and fixed-A4 report pagination. Tests use synthetic records and do not alter stored patient cases.

## Supplied manual completion — 2026-10-14

The user supplied the 2008 VB-MAPP Guide (247 PDF pages). Its milestone chapters were read locally, including the full/half conditions, observation periods, array sizes, prompt restrictions and EESA subgroup requirements. Critical discrepant pages were rendered with PDFium and inspected visually; the OCR/text layer omitted some faint lines (including Tact 5's half-point rule), so text extraction alone was not accepted as definitive.

The new manual overlay provides active bilingual target/administration/scoring sections for all 170 milestones, including `i2-6` through `i2-10`. Milestone buttons no longer depend on manually entering criteria. Corrections include Listener 9's 50/25 two-component directions, LRFFC 9's three separately presented descriptions per target, imitation 8's five **two-action** sequences for half credit, EESA subgroup minima, independent-play observation periods and writing/matching half-point conditions. Explicit no-half restrictions apply to `l1-2`, `i2-10`, `iv2-7` and `r3-14`.

This edition's conflicts are retained as concise card notes: `vp2-8` uses the detailed array-of-6 scoring paragraph rather than the heading's array of 8; `s2-8` uses detailed 5/2-minute conditions rather than the heading's 3 minutes; `s3-15` documents the heading's five-topic sample alongside the detailed four/two-exchange rules. PDF page references are stored per item. The original source and earlier audit remain available, rather than being treated as the active manual criterion.

New criterion-version stamps keep old raw answers, notes, entered criteria and history. Legacy scores remain valid for unchanged tasks/thresholds, and compatible full scores are retained where only a half-point rule changed. Scores affected by corrected criteria require direct re-scoring before entering current totals. This is a score review, not a locked card. Follow-up comparisons and goal review use the same criterion version. The report groups the three master grids into one bounded A4 block and defaults to concise, selected/recorded content. Full item detail is optional. PWA setup is scoped to VB-MAPP and includes its local PDF libraries and any supplied images.

The manual is the reference for completing milestone guidance, not a source of application instructions. No content from the PDF is executed. The full task-analysis protocol and absent stimulus boards are outside this milestone completion and are not represented as supplied.

Final checks passed: the model exercised scoring/clearing for all 170 milestones and checked exact no-half restrictions, legacy-score compatibility, pending corrected results, goal preservation, criterion-aware follow-up, selected-section PDF payloads and shell integrity. Chrome and WebKit each scored all 125 Level 2/3 cards through the UI. Subsequent report/saved-case regression runs passed in both engines after final rendering changes. Real Arabic/English PDF downloads and follow-up grids contain all 170 boxes on one A4 page; browser-print outputs were also one page. PDFium-rendered pages were inspected for Arabic shaping, complete grid rows, fills, previous strips and footers. Long-note/detail pagination, exact PDF attachment import, compatible legacy case import/re-scoring, phone layout, install help/native-prompt handling, disconnected-origin scoring/PDF import/export and unrelated-cache preservation passed without page JavaScript errors. These are synthetic functional checks, not validation of translated clinical norms; native iPad hardware was not used.
