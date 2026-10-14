# Vocabulary Clinic

The new app lives in `forms/vocabulary-survey/`. The Vocabulary Assessment card in `forms/language/index.html` points here. Existing language-development forms and the deleted files in `forms/language/Vocabulary-survey/` are preserved as found.

Serve the **repository root**, because the app reads media from `../../tools/voc/images/` and `../../tools/voc/sounds/`. For local development, run `python3 -m http.server 8000` at the repository root and open `http://localhost:8000/forms/vocabulary-survey/`. Production needs HTTPS. Deploy this app and the existing `tools/voc` media together at the same relative paths. No application backend, CDN or production build service is required.

## Modules

- `index.html` / `styles.css`: responsive dashboard, setup, four-card comprehension workspace, single-image naming workspace, local history, clinical reports and word tables.
- `validation.js`: explicit separate receptive/expressive folder maps for cohorts A (2–3), B (3–4), C (4–5), D (6+); word-level rules; clinician overrides; Arabic normalization; spelling-based sound candidates; semantic clusters; matrix coverage and randomization.
- `app.js`: trial state, audio gating, scoring, skip/pause/resume, word tables and report routing. Only one audio element and up to four images are loaded for a trial. Responses are saved before advancing.
- `reporting.js`: accuracy, expressive weighted index, choice-error proportions, matched-item deltas, defensive JSON/CSV parsing, export, charts and native print/PDF.
- `storage.js`: IndexedDB session and setting persistence. No child record is sent to a server. Export files are your portable copy; clearing browser storage removes local sessions.
- `offline.js`, `sw.js`, `manifest.json`: installation and a resumable, explicitly started offline download.
- `data/vocabulary.json`: generated labels, numbered paths, revisions and missing-media inventory. Labels come from the **current** `tools/voc/index.html` category definitions; numeric filenames cannot independently validate spoken content.

## Clinical interpretation

These are **provisional clinician-editable checklists**, not standardized diagnostic norms. [ASHA’s communication milestones](https://www.asha.org/public/developmental-milestones/communication-milestones/) explicitly are not a screening/diagnostic instrument. [ASHA’s 4–5-year guidance](https://www.asha.org/public/developmental-milestones/communication-milestones-4-to-5-years/) and [Kid Sense’s language-development chart](https://childdevelopment.com.au/resources/child-development-charts/stages-of-language-development-chart/) describe broad skills; they do not establish age of acquisition for every supplied Arabic term, validate recordings, or calibrate this word bank. Consulted on October 14, 2026.

The embedded milestone index supplies broad reference domains. Folder defaults and individual familiar/spatial/abstract/letter/number rules provide the runtime categorization framework. The **Word bank** page shows separate receptive and expressive tables with subgroup, age and eligible test words. These use the same full checklists as assessment setup: receptive words require a complete distractor matrix, while expressive words require a source image/audio pair. Existing saved clinician overrides still apply to future assessments; recorded trials retain their cohort and media revision. Configuration can be maintained in `validation.js`. A clinician-reviewed assignment is still not population-norm validation. There is no invented online “norms API,” word-frequency lookup, or diagnostic claim.

Unvowelled Arabic spelling cannot determine a precise phonemic relationship. Automatic sound candidates use normalized spelling similarity/rhyme and are explicitly identified as unreviewed. A reviewed pair replaces the automatic pool for that target. Each matrix requires four distinct normalized words and distinct image content: target, sound-similar candidate, same semantic cluster, and unrelated control from a different broad semantic family with low spelling similarity. Semantic cards require another source folder in the same semantic cluster, as specified. Targets without a cross-folder match are omitted. `REQUIRE_CROSS_FOLDER_SEMANTIC` is the explicit configuration switch; it is enabled by default. Targets without a complete matrix are excluded rather than assigned arbitrary distractors. The current bank has **994 usable source pairs**, **310 complete automatic receptive matrices under the strict cross-folder rule**, and **0 source entries excluded for missing media**. Review images, category meaning, label/audio agreement, dialect, and the suitability of each candidate for the child.

Expressive **audio-modeled naming** is the requested default. It plays the matching word before clinician grading. Select **unprompted naming** to withhold the model. Pressing Play is recorded per item, so prompted and unprompted responses are distinguishable in the report and comparison. Modeled performance does not measure independent naming.

A full, unsampled, complete assessment with no skips and at least five scored items in every cohort can display the highest **consecutive checklist band** achieving at least 80% fully correct/mastered items. This is a configurable local criterion, not a standardized language-age equivalent. A norm-referenced age in years/months is intentionally not fabricated (`languageAgeEquivalent` remains `null`). Cohorts do not include a separate 5–6-year block, and D is a local extension. Samples, partial assessments and skips do not produce an attainment-band estimate.

## Scoring and comparisons

Receptive accuracy = target selections / scored trials. Sound, semantic and unrelated error shares use **incorrect selections** as their denominator. Expressive mastery = mastered / scored trials; emergent is separate. The additional expressive weighted index assigns mastered 1, emergent 0.5, not mastered 0. Skipped items are excluded from accuracy and reported as not assessed.

JSON exports preserve raw session/trial data. CSV uses documented trial columns, RFC-style quoted fields, Unicode/BOM support, and spreadsheet-formula escaping. Session metadata and the full planned checklist appear in the first data row; later rows contain trial data. Import accepts this app’s schema, up to 5 MB / 5,000 trials, and rejects unsupported, malformed, duplicate or inconsistent data. Summary-only legacy spreadsheets cannot provide a matched-item comparison.

Historical deltas use only shared, scored items with the same child identifier, test module, audio mode, cohort, media/label revision and per-trial audio-prompt condition. Future-dated baselines and different children/modules/conditions are not compared. Changes are **absolute percentage points**. The matched-item charts and tables are separate from the all-items current-session chart, preventing a changed item set from masquerading as improvement. A same-date completed session of the other module is listed separately when available.

## Offline and updates

The service worker controls only this app’s path. It intercepts the exact same-origin media URLs requested by its controlled pages even though those media live outside the worker’s scope. It does **not** install a root-scoped worker or modify the vocabulary app’s worker/caches. Cache names are isolated by app scope.

Installation saves the small local shell. The header download icon offers home-screen installation (or browser instructions), followed by an opt-in offline-content dialog. Its download button saves **all 1,990 existing WebP/M4A files** in folders 1–40, including supplied assets not used by a current checklist. Three files are processed sequentially per message; per-file timeouts, SHA-256 integrity, one shared in-flight batch, revisioned keys and cache verification protect progress. No array of decoded images/audio and no mass `cache.addAll()` is used. Returned visits reuse stored files. The OS can suspend workers; keep the app visible while downloading. Storage persistence is requested without delaying download intent, but browsers can still clear/evict data. Readiness is rechecked against storage. M4A playback supports 206 byte ranges and 416 invalid ranges.

Updates activate when older app windows close, avoiding mixed shell versions. Unchanged media keys are reused. The entire app shell, data, icons and Arabic fonts are local. Reference links are optional online reading, never required during testing.

## Build, verify and print

After changing vocabulary labels or media, run from the repository root:

```sh
node forms/vocabulary-survey/scripts/build-data.cjs
node forms/vocabulary-survey/scripts/build-pwa.cjs
```

After editing any app source, styles, icons or worker, run the second command to regenerate the shell hashes. The generated release is already included for deployment. `npm run build` inside this directory runs both builders.

`npm test` validates cohort coverage/overrides, all four-card matrices, source availability, scores, error denominators, imports, CSV/JSON round trips, matched-item comparisons and media/shell integrity. For browser checks, install the declared development dependency (`npm install`), run `npx playwright install webkit`, and run `npm run test:browser`; the Chromium test uses the installed Chrome channel. Browser tests use synthetic records and cover both modules, actual M4A playback, pause/reload, exports/imports, word-table coverage, installation, print layout, all-media downloading, genuine offline operation and isolation from another app’s cache. Test screenshots and sample files are written to the operating system temporary directory on this workstation.

**Print / Save PDF** opens the native print dialog. Choose Save as PDF / platform sharing. The print stylesheet hides the app chrome, repeats table headings, preserves charts, avoids splitting item rows, and starts item-level tracking on a fresh page. It can produce multiple pages without an external PDF library. No file is silently saved or uploaded.

Arabic is the default throughout the interface and reports, with right-to-left layout and local Cairo fonts. The home screen contains only receptive, expressive and progress buttons; saved drafts can be resumed from Progress. The header and installation icons use the VOC `images/logo.webp` branding. Supplied word labels and recordings are unchanged.
