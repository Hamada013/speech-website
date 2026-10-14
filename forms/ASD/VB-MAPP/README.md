# VB-MAPP assessment workspace

Arabic/English assessment with local saving, follow-up visits, stimulus presentation and PDF/print reports. Serve the repository through HTTPS or localhost and open `forms/ASD/VB-MAPP/`. Production uses only local static files.

## Milestones

All **170 milestones** are present: 45 in Level 1, 60 in Level 2 and 65 in Level 3. Each has a bilingual target, administration instructions and item-specific full/half-point conditions. The five Level 2 imitation items are included. All milestone score buttons work immediately; entering a separate criterion is no longer required.

The concise guidance was checked against the user's supplied **2008 VB-MAPP Guide**, a 247-page PDF. `assets/manual-data.js` records the source PDF page numbers. `assets/manual.js` applies those notes after the preserved source and earlier review layers. Original supplied data remain available as `VB_SUPPLIED_DATA`; original compiled files are retained. Instructions inside the PDF are assessment reference material, not application-control instructions.

The supplied edition has inconsistencies, documented on the affected cards:

- `vp2-8`: the heading specifies an array of 8; the detailed full/half scoring paragraph specifies 6. The app uses the detailed scoring paragraph: 25/15 matches, array of 6, three similar distractors.
- `s2-8`: the heading says 3 minutes; the detailed criteria say 5 minutes for full credit and 2 for half. The app uses 5/2 during a 30-minute observation and requires interactive peer play.
- `s3-15`: the heading specifies five topics; the scoring paragraphs specify four reciprocal exchanges for full credit and two for half without repeating the topic count. The full criterion includes the five-topic sample; sampled topics should be documented.

No half-point option is offered for `l1-2`, `i2-10`, `iv2-7` or `r3-14`. Echoic milestones retain their EESA total and group-specific minimums; EESA scores never automatically overwrite milestone scores. Reading/writing tasks that specify English uppercase/lowercase letters keep those conditions. Record the actual administered language; an Arabic interface does not establish translated test norms.

## Saved cases and follow-up

Data remain in `localStorage` under `vb-mapp-workspace-v2`. Export editable JSON before moving devices or starting another case. Existing answers, notes, custom criteria, goals and visit history are preserved.

The manual-backed criterion revision is recorded with new scores. Earlier scores remain valid where the task and thresholds are unchanged. Scores affected by corrected criteria remain visible as pending and can be re-scored directly using the enabled buttons. When only a half-point rule changed, compatible full scores are retained; earlier gaps need review. They are not silently converted to results under a different criterion. Unassessed is distinct from an explicit zero. Imported invalid half points are excluded until a valid score is recorded.

PDF downloads retain the standard `vb-mapp-assessment.json` attachment for exact local follow-up import. Excluded sections are omitted from both current and historical PDF payloads; editable JSON preserves the whole workspace. Importing a previous report starts a new visit with blank current scores and separate previous marks. Paired changes require valid scores under the same criterion. Prior cases and the recoverable pre-import copy remain supported.

## Reports

The default milestone report places the child/date/assessor header and **all three levels, all 170 boxes, on one portrait A4 page**, including previous-score strips for follow-up. Level 3 is above Level 2 and Level 1, matching the standard master-chart layout. Full, half, zero and blank states have distinct symbols and fills.

The concise report includes recorded selected sections, entered observations/recommendations and explicitly selected goals. Empty sections, repeated explanation, automatic generic recommendations and duplicated item narratives are omitted. Enable **Include detailed item results** or **Include unassessed item details** when those are needed. Long notes and optional detail continue on later pages; the milestone sheet stays together.

Both the download exporter and browser print use A4. Downloaded PDFs contain rasterized pages to preserve Arabic shaping plus the editable data attachment. Text export remains available. The repeated PDF footer preserves Ahmad Ghanem's contact details.

## Home-screen installation and offline use

The header download icon opens native installation where supported, or home-screen instructions for iPhone/iPad and other browsers. Its dialog reports offline readiness. The service worker downloads the assessment's local code, guide notes, report/PDF libraries, icons and any supplied stimulus images during setup. Keep the first visit connected until it reports ready.

The worker controls only this app's path and uses isolated caches. It does not cache child records or clear other apps' storage. Updates activate after existing app windows close. Visited stimulus images are also cached; add new image files before rebuilding the release to make them part of the installation inventory. Browser storage may be cleared by the device, so export case records separately.

The 62 reserved image mappings remain in `images/IMAGE-MAP.md`; no stimulus PNGs are currently supplied. Tasks needing physical materials or peers remain real assessment activities. The app does not invent missing boards or mark a task as passed because an image was shown.

## Other assessment sections

The 24 barriers, 18 transition areas, 100 EESA entries and five supplied supporting-skill entries remain available. The five supporting entries are a subset, not the full task-analysis inventory. The current change completes **milestones**; it does not reproduce all components of the separate protocol. Existing non-milestone criterion review remains where the supplied material is incomplete, including the conflicting transition item 6 scale.

## Development

- `assets/data.js`: preserved original bilingual source.
- `assets/review.js`: earlier public-source review and original-content snapshot.
- `assets/manual-data.js`, `assets/manual.js`: current manual-backed milestone notes and source pages.
- `assets/model.js`: criterion-aware scoring, saved cases and follow-up comparisons.
- `assets/app.js`: assessment UI, scoring, case files and planning.
- `assets/report.js`, `assets/pdf.js`, `assets/pdf-data.js`, `assets/import.js`: concise/detail reports, A4 pagination and attached-data import.
- `assets/install.js`, `sw.js`, `manifest.json`: home-screen installation and offline app shell.

After any application, icon or stimulus edit:

```sh
node forms/ASD/VB-MAPP/scripts/build-pwa.cjs
node forms/ASD/VB-MAPP/tests/model.cjs
```

For browser checks, install the declared Playwright development dependency and WebKit, then run `npm run test:browser` from this directory. `VBMAPP_PLAYWRIGHT` can point to an existing Playwright module; `VBMAPP_ENGINE=chromium` or `webkit` selects one engine. `VBMAPP_REPORT_ONLY=1` imports a synthetic scored fixture for faster report/saved-case regression checks. Chromium uses the installed Google Chrome channel. `npm run build:icons` regenerates PNGs from the SVG app mark; run the PWA builder afterward.

Tests use synthetic records. They check all 125 Level 2/3 cards through real UI scoring, all 170 records in the model, no-half restrictions, old-score preservation, follow-up, Arabic/English A4 geometry, actual PDF download and data import, long reports, phone layout, installation help/native-prompt handling, offline scoring/PDF export and cache isolation. Screenshots and synthetic PDFs are written under `/private/tmp/vbmapp-work` on this workstation.
