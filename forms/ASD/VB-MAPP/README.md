# VB-MAPP assessment workspace

This revision keeps the supplied assessment content and provides a bilingual, touch-friendly workspace with local saving, a milestones grid, child-facing image buttons, editable planning, and Arabic/English PDF reports. Open `index.html` through the existing website. There is no build step or external runtime dependency.

## Assess and report

1. Complete the case information and relevant assessment sections. A single section is sufficient.
2. Tap a milestone box to review its objective, administration, scoring criteria, notes, and available image button. Use the item-specific criteria. A blank item is unassessed; an explicit zero is a recorded result.
3. Use **Report** to select the sections to include and the report language. Review suggested priorities, select and edit goals, and enter clinical observations and recommendations.
4. Download the PDF, print, or download a text report. The same scores are used for both report languages. Written observations and edited goals remain in the language in which they were entered.
5. Export editable assessment JSON before starting another case. Import that JSON to resume the assessment later.

The master grid follows the three-level milestones layout with 170 boxes. Full scores fill the box; half scores fill its lower half. Unassessed items and missing criteria have separate visual and accessible labels. Each level can be swiped horizontally on a narrow screen. Controls have at least 46px touch targets. Button sounds are absent.

## Content requiring review

The original file contains **165 milestone records**. The five Level 2 motor-imitation records `i2-6` through `i2-10` were missing. Their boxes are visible, but scoring is disabled until the assessor supplies both an item description and scoring criteria from the appropriate guide. These additions are labeled as assessor-entered in reports.

All 24 barrier entries, 18 transition entries, 100 EESA entries, five supporting-skill entries, milestone criteria, and original planning/reference notes are retained. The five supporting entries are the original subset, rather than a complete task-analysis inventory. The original file supplies detailed guidance for some barriers and transitions only; the revision does not invent the absent item-specific criteria.

The online review identified **18 milestone records requiring correction or criterion verification**, plus the conflicting `tr-6` transition scale. Reviewed task summaries cover Level 2 matching, play, listener responding, and linguistic structure. The duration conflict in `s2-8` also remains flagged. See the in-app Reference section and [EVIDENCE.md](EVIDENCE.md) for the affected IDs and sources.

These flagged records require an assessor-entered description and full/half-point criteria from the guide before scoring. Public data sheets and indexed protocol extracts do not establish every administration or scoring condition. Other supplied criteria remain available, without certification against the complete guide. The original wording remains expandable beside the reviewed task; no original record is deleted.

Flagged milestone cards now open the **Original wording / الصياغة الأصلية** panel by default. It displays the complete supplied task, **Objective / الهدف**, **Administration / طريقة التطبيق**, and **Scoring criteria / معايير التسجيل** without replacing those sections with the review reminder. All 165 supplied milestone records retain their exact bilingual source sections. The reviewed task and editable verified criterion remain separate. All 170 boxes show the three section headings; for the five absent motor-imitation records, the sections explicitly identify the missing source information and direct the assessor to enter guide criteria. Original reference text does not automatically approve a score or change saved assessment data.

Existing scores on changed records are preserved but excluded from totals, goals, and recommendations until explicitly re-scored. Editing an entered criterion invalidates its score review, including after JSON import. Previously selected goals stay editable and appear as historical plans until the assessor reviews them against the current task and criterion. Invalid imported half points are also excluded from calculations without silently converting them to zero.

Original English EESA stimuli and their supplied Arabic equivalents remain available. Record the language actually administered and use its appropriate scoring guide. Translating an echoic stimulus changes its sound and syllable structure.

The EESA page now displays group-specific scoring guidance. Groups 1–3 distinguish correct responses, recognizable consonant errors/extra syllables, and responses with incorrect vowels/missing syllables. Groups 4–5 retain their separate prosody criteria; group 5 has no half-point option.

Scores are never automatically overwritten by EESA, barrier, or transition calculations. Goals are drafted from explicitly recorded milestone gaps. Unassessed items may be proposed for the next assessment, rather than interpreted as failed items. Recommendations reflect only selected report sections. Educational placement and age-equivalent results are not assigned automatically.

## Image mapping

See [images/IMAGE-MAP.md](images/IMAGE-MAP.md) and `assets/stimuli.js`. There are **62 reserved numbered image paths**, from `images/1.png` to `images/62.png`, each mapped to a task ID and bilingual description. For example, `images/1.png` maps to `m1-1`, and `images/2.png` maps to `t1-1`.

Add the PNGs later at those paths. No stimulus PNGs are included in this revision. Add further boards to a task's `paths` array when multiple arrays or exemplars are required. A missing image produces an assessor message and does not open an empty child-facing view. The child view displays the image without answers, assessment instructions, or scoring controls. Use physical materials for tasks requiring manipulation and auditory cues for auditory tasks.

The review preserves all image numbers while updating their task descriptions. `images/30.png` and `31.png` are reserved for assessor preparation/history, with child-view buttons disabled: the corrected tasks sample non-echoic utterances and functional prosody. There are 60 active child-view mappings. The intelligibility task retains `images/29.png` for child naming stimuli, with a reminder that the judging listener must not see the items. Rebuild any boards for changed tasks before using them; the old board may test the wrong skill.

## Saving and PDF behavior

The active case is stored in this browser's `localStorage` under `vb-mapp-workspace-v2`. The previous app's child, session, and notes keys are imported when the new key is absent. Original legacy data are retained in the editable export. Imported echoic/transition results may include the previous app's automatically generated scores, so the report flags them for review. Starting a new case clears only VB-MAPP keys.

The app runs entirely with local assets. PDF export uses vendored html2canvas and jsPDF. It renders the report to A4 pages to preserve Arabic shaping and diagrams. The resulting PDF content is rasterized; use the text download for searchable text, or editable JSON for continued assessment work. A print option remains available if direct PDF export fails.

The app and report footer contain Ahmad Ghanem's supplied name, Latakia location, email, and phone number.

## Code map

- `assets/data.js`: preserved bilingual assessment data and review metadata.
- `assets/stimuli.js`: editable task-to-image registry.
- `assets/review.js`: source-linked corrections, original record preservation, EESA guidance, and reviewed image mapping overrides. Loaded after the supplied data and registry.
- `assets/model.js`: score validation, coverage, legacy import, age calculation, and suggested priorities.
- `assets/app.js`: navigation, touch dialogs, saving, import/export, and image presentation.
- `assets/report.js`: bilingual report sections, milestone grid, profiles, goals, and recommendations.
- `assets/pdf.js`: A4 pagination and PDF download.
- `assets/styles.css`: responsive UI, RTL text, grid states, and print/PDF styles.

Original compiled assets remain present but are no longer referenced by `index.html`.

## Verification

See [EVIDENCE.md](EVIDENCE.md) for the content audit, publisher references, and checks performed. Development tests and PDF previews are kept in the development workspace, outside this website folder.

## PDF import and repeated follow-up

Use **Case → Follow-up with the same child** to drop or select a previous PDF. New PDFs downloaded by this revision automatically restore child details, criteria, previous scores, notes, goals, and earlier visits for the report sections included in that PDF. The importer starts a new assessment with today's date and the next assessment number. Previous observations and plans remain in history; they are not presented as new findings. Editable JSON can also be dropped in this panel. The existing JSON import below it resumes an assessment instead of starting a new visit.

The milestones grid shows **P: previous score** below the current mark. Earlier scored boxes have a separate background while awaiting re-testing. Tap a box to record a new result, including 0 if a skill is no longer demonstrated. Clearing the current score returns the item to awaiting retest; it does not erase its previous result. Task filters show previously scored items, items awaiting retest, and previously unassessed items. Earlier results, response notes, entered criteria, and selected goal plans are available on each task card.

Reports compare higher, lower, unchanged, and new scores. Comparisons and paired totals use only items with valid scores at both visits and the same criterion. Changed guide criteria are explicitly excluded from paired change calculations. Current totals, goals, and recommendations use only scores recorded in the current visit. The comparison grid and item table distinguish scores from the two dates. Use **Start next assessment from this case** to create another visit without importing a PDF again. Previous visits remain saved in the case's history and editable JSON.

Older PDFs from the previous revision contain images of the report, without editable assessment data. For a recognizable 9/12/13-domain milestone grid, the importer recovers identifiable 0/0.5/1 marks and opens a review screen. Child information and dates can be prefilled from a recognized app filename, but must be checked. Enter missing child details and date, compare the recovered marks to the source-page previews, and correct any marks before starting the follow-up. Notes, goals, criteria, and other sections cannot be recovered from these image-only reports. Unrecognized or ambiguous table marks remain blank. Unknown PDF layouts use the same review screen for manual entry; arbitrary scanned reports do not support guaranteed automatic extraction.

PDF import runs locally in the browser using vendored PDF.js. Nothing is uploaded. PDFs are limited to 50 MB; older-report recognition checks the first eight pages. Password-protected reports require an unlocked copy. Corrupt files, unsupported data versions, or invalid scores do not replace the active case. Importing a previous report saves a recoverable copy of the open workspace, accessible through **Restore workspace before import**. Starting a new case clears that VB-MAPP recovery copy too.

**Download PDF** stores a standard JSON attachment containing the selected report sections and their visit history. Excluded sections are omitted from both current and earlier snapshots in the PDF; export editable JSON to preserve the complete workspace. **Print** creates a visual report without the editable attachment. PDF attachments are plain editable data, not executable scripts. Host the app through the website or a local HTTP server so the browser can load its local PDF.js modules and worker.

Additional code: `assets/pdf-data.js` serializes selected-section report data and embeds the PDF attachment; `assets/import.js` reads attachments, validates imported data, and presents older-report review. PDF.js and its Apache 2.0 license are stored in `assets/vendor/`.

## Final interface

Milestone Level 1 uses pastel orange, Level 2 pastel green, and Level 3 pastel blue. Tables, task cards, selected scores, and level buttons use the same palette in both languages and downloaded PDFs. Full/half/zero/unassessed marks remain distinct; previous results keep their separate reference strip. Level colors are fixed, so the old per-assessment color picker is no longer shown. Existing saved color metadata remain intact.

Assessment screens and clinical reports omit development audit narratives, source-record counts, image filenames, and repeated implementation notes. Original milestone wording and all supplied guidance remain available on the task cards. The Reference page retains planning guidance and original examples in optional sections. Verification fields, unassessed states, pending scores, selected report scope, and follow-up distinctions remain available where they affect scoring or interpretation.

Short goal plans stay together during PDF pagination. PDF pages repeat the contact details, including Latakia - Syria; the duplicate end-of-report footer is omitted from PDF content to avoid an otherwise empty final page. Screen and browser-print reports retain the complete original footer. Visual recovery recognizes pastel fills in classic older grids; a printed grid with a previous-score strip requires manual review instead of interpreting the strip as a new result. Downloaded PDFs continue to use their exact data attachment.
# Milestone task guidance

The milestone grid uses ordinary unassessed boxes for every unscored item; the question-mark status and "معيار يحتاج إلى تحقق" label have been removed. The 23 formerly marked boxes have bilingual goal, application and scoring sections. The five Level 2 motor-imitation boxes now describe their specific tasks. Original supplied wording remains available in a separate expandable section on the 18 reviewed cards.

Item-specific full/half-point conditions that were absent or conflicted in the supplied file still have a scoring field. Enter these conditions from the assessment guide before recording a score. This preserves previously entered criteria, scores and visit history without treating old answers as results for a different task.
