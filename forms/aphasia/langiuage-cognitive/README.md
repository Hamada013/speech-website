# Language and cognitive assessment

An independent Arabic-first PWA at `forms/aphasia/langiuage-cognitive/`. All 197 original scored/observation prompts, stimuli and English report translations are preserved. The calm card workspace uses a section picker and one assessment item per page. Case profiles live on this device only; they are not authenticated online user accounts. No Google login is needed to assess a case.

Each case supports multiple dated assessments, automatic local saving, JSON backups, compact Arabic/English subgroup reports, print-to-PDF, item notes and explicit support ratings. History contains descriptive accuracy graphs and domain bars. Reports show subgroup bar charts, correct/evaluated counts and percentages without listing individual tasks. Task responses and notes remain in the case workspace, backups and optional workbook upload. Comparison displays paired subgroup charts; paired change uses only the same assessed items with the same nonempty language/administration context and explicitly recorded support, excluding modified administration. This does not establish clinical equivalence between sessions. Observation items are not accuracy scores. Empty denominators stay blank.

The provisional aphasia profile uses **clinician-entered** fluency, comprehension, repetition, naming and confound review. It does not infer a diagnosis from screening percentages. Mixed ratings may produce multiple profiles; unknown ratings/confounds block suggestions. Clinical changes invalidate the review checkbox. Clinician impressions remain editable and authoritative. [ASHA](https://www.asha.org/practice-portal/clinical-topics/aphasia/) and [Merck](https://www.merckmanuals.com/professional/neurologic-disorders/function-and-dysfunction-of-the-cerebral-lobes/aphasia) inform the descriptive profiles; the [mixed transcortical pattern](https://pmc.ncbi.nlm.nih.gov/articles/PMC7880889/) is also supported in the literature. This custom assessment has no standardized diagnostic cutoffs.

Workbook and optional automatic upload: see [research/SETUP.md](research/SETUP.md). The workbook link is public configuration; its records remain private. The collector is prepared, not deployed. Deployment and a real upload receipt must be checked by the workbook owner before relying on delivery. Device keys stay out of source and backups. Backup files and device storage contain clinical records; safeguard them. A second tab is blocked from overwriting another tab's changes. Do not edit the same restored case independently on two devices.

## PWA release and checks

Run `node forms/aphasia/langiuage-cognitive/scripts/build-release.cjs` after changing public files. The scoped worker verifies every shell file by SHA-256 before installing, keeps the prior release if a download fails, and caches all 45 local image files. It never caches collector POST requests. Records stay in app-specific localStorage; uninstalling/clearing browser data may remove them. Download a backup before changing devices.

```
node forms/aphasia/langiuage-cognitive/tests/model.cjs
node forms/aphasia/langiuage-cognitive/tests/collector.cjs
SITE_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node forms/aphasia/langiuage-cognitive/tests/browser.cjs
APP_ENGINE=webkit SITE_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node forms/aphasia/langiuage-cognitive/tests/browser.cjs
node forms/aphasia/langiuage-cognitive/scripts/build-release.cjs --check
```

Manifest includes standalone display, stable identity/scope, 192/512 icons, a maskable icon, mobile/desktop screenshots, description and theme. Deploy to HTTPS, open the exact app URL in PWABuilder and run its current checks. A PWABuilder pass or packaged-store acceptance is **not certified by local tests**. Test Android installation and iOS Add to Home Screen, keyboard focus, offline cold opening, a stimulus image, report printing and an actual workbook upload on the target devices. A denied browser install option or managed-device policy cannot be fixed by the manifest alone.
