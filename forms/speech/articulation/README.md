# اختبار النطق

A standalone Arabic speech sound screening PWA. Serve the complete folder over HTTPS, or localhost during development. The manifest supports installation under a nested path and includes regular/maskable icons and phone/desktop screenshots. The offline assessment needs no external fonts or runtime CDN. Optional Google account sync loads the Firebase SDK when needed. Local workbook updates use a loopback service.

## Child accounts and assessment history

The home screen opens the accounts dialog. Enter a child's name to create a local case, or select an existing child to resume. Names and assessments live in this app's `articulation-cases-v2` localStorage entry, independently of VSS accounts. Progress, notes, clinical fields, reference edits and the current item save automatically. Storage failures are reported and block case switching and updates when the current assessment cannot be saved.

The plus icon starts a new assessment for the selected child. It preserves the previous assessment and carries over identifying information, birth date, clinician and language/dialect, with a fresh date and no previous judgments or conclusions. Date/time buttons in reports open earlier assessments without replacing or editing the active assessment. The former opt-in draft migrates once; its old duplicate is removed only after the new child record saves successfully.

Child deletion requires confirmation and removes that child's assessments. It never clears another app's storage or downloaded assets. Other open tabs follow the current case and cannot resurrect a deleted child by saving stale state. Guest records stay on this device. Optional Google sign-in syncs cases in that account’s private Firebase space. Clearing site data removes local accounts and results; saved PDF reports remain independent.

## Assessment workplace

The screener retains 28 written-letter groups, 84 editable word-position probes and 69 local pictures. Entering the test opens a viewport-fitted workplace. Its corner expand/shrink icon toggles between the focused stage and the surrounding form. The sound, word position and picture index stay at the right.

- Under the picture: correct, substitution, omission, distortion and addition.
- Physical right: independent naming, imitation, contextual elicitation and reference editor.
- Physical left: dialect-appropriate, not elicited/unfamiliar and skipped.
- Lower left: note and clear-recording icons. Navigation arrows remain below the picture.
- Info icon: the workplace symbols and meanings, including stimulability controls.

Controls retain accessible names, keyboard focus and pressed states. Sound/phoneme choices retain their actual letter/IPA content. Form menus use styled comboboxes with keyboard navigation. Reduced-motion, visual viewport, short landscape and safe-area handling are included. Changing a word/reference invalidates its previous judgment. Substitution/addition saves after choosing a phoneme; cancelling preserves the preceding record.

## PDF reports and comparison

The download icon opens the browser's native **Print / Save PDF** interface with A4 print styles. There is no text-download action. Each report includes all 84 items, unrecorded statuses, identifying details, notes, elicitation, references and productions, automatic candidate patterns, an editable diagnostic impression and its clinician review status. Charts show counts and denominators. Arabic and English reports retain original names, Arabic words, IPA and free-text notes when no authored English version is supplied.

The comparison icon opens date cards to select two assessments. Blue identifies the earlier date and green the later date, with written labels. The report includes result distributions, per-sound accuracy, all item records side by side, and both assessments' clinical fields and process analysis. Paired accuracy change uses only items scored at both dates with the same word, reference, target phoneme and elicitation method. A dash means no scored items, rather than assumed zero accuracy.

This remains an informal, non-standardized descriptive screener. Target accuracy is not PCC, a whole-word score, standardized severity or a diagnosis. The clinician supplies the conclusion. Dialect differences are not automatically treated as errors. Automatic indicators retain their original opportunity counts and separation of naming, imitation and context. See [LEVANTINE-REFERENCE.md](assets/LEVANTINE-REFERENCE.md) and [IMAGE-LIST.md](assets/images/IMAGE-LIST.md).

## Offline installation and updates

The home download icon opens a compact dialog with progress, installation and update controls. The worker verifies/caches a complete release before activating. Explicit downloading verifies cached files and repairs missing entries. Once complete, all images, scoring, local cases and reports work offline. Browser storage can still be cleared or evicted. Downloading does not upload records.

Updates wait for acceptance or all old windows to close. Acceptance saves the active assessment before reloading. Failed/incomplete updates preserve the working release. Worker requests and caches are scoped to this app's directory.

Upload the **entire folder**, including worker, manifest, release, scripts/styles, screenshots, icons and images. Serve `.webmanifest` as `application/manifest+json`, `.webp` as `image/webp` and JavaScript as `text/javascript`. Avoid long-lived HTTP caching for `sw.js` and `assets/pwa-release.js`. PWABuilder must inspect the deployed HTTPS URL; local checks cannot certify an unpublished deployment or physical-device installation.

After changing shipped files:

```sh
node forms/speech/articulation/scripts/build-pwa.cjs
node forms/speech/articulation/scripts/build-pwa.cjs --check
node forms/speech/articulation/tests/screener.test.cjs
node forms/speech/articulation/tests/dropdowns.test.cjs
node forms/speech/articulation/tests/browser.test.cjs
ARTICULATION_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node forms/speech/articulation/tests/cases-browser.cjs
APP_ENGINE=webkit ARTICULATION_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node forms/speech/articulation/tests/cases-browser.cjs
ARTICULATION_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node forms/speech/articulation/tests/pwa-browser.cjs
```

The suites use installed Chrome/Chromium and WebKit. They check isolation, autosave/reload, history, comparison, complete reports, PDF output, deletion, storage failure, cross-tab deletion, five viewport sizes, manifest/installability, every offline asset, all 84 pictures, updates and failed-release recovery. Also check native installation, print/share and pagination on intended devices.

Regenerate screenshots using `scripts/capture-screenshots.cjs <app-url>` against a running preview, with the same Playwright environment variable, then rebuild the release. Icon/image maintenance scripts remain in `scripts/`.

References: [MDN PWA installation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [Microsoft PWABuilder guidance](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/pwa/turn-your-website-pwa).


## Research workbook and revised reports

The app is named **اختبار النطق**. The language/dialect fields start blank. Programmatic heading focus does not draw a selection-like outline, while keyboard focus remains visible on controls. The report adds an incorrect-sound matrix with initial, medial and final positions; orange cells also carry an explicit error label. Optional whole-word IPA is recorded in the item-note dialog.

The former connected-speech, participation, selected-pattern, analysis, conclusion and plan controls/sections have been removed. Historical metadata is retained in saved records rather than destroyed. The replacement summary offers provisional descriptive decision support and a typed clinician override, with a separate review checkbox. Scoring or relevant reference/diagnostic changes invalidate that review checkbox. The app does not apply English age cutoffs to Arabic speakers or generate numeric diagnosis codes.

The report share icon updates a cumulative local Excel workbook on the computer through the loopback research server. The dialog opens/downloads that workbook and exports/imports JSON for device transfer. Online Drive/Sheets sharing has been removed. See [local setup](research/SETUP.md). Clinical datasets and generated workbooks are ignored by Git and excluded from offline releases.

Additional checks:

```sh
node forms/speech/articulation/tests/research.test.cjs
node forms/speech/articulation/tests/research-server.test.cjs
ARTICULATION_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node forms/speech/articulation/tests/research-browser.cjs
APP_ENGINE=webkit ARTICULATION_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node forms/speech/articulation/tests/research-browser.cjs
```

## Optional Google account and device syncing

The launch dialog can be skipped; the home cloud icon opens it again. Firebase Google sign-in, independent local account spaces, private per-assessment cloud syncing, offline retry and concurrent-edit preservation are implemented in `assets/cloud.js` / `cloud-model.js`. The `cloud/` directory contains the public Firebase configuration and private per-user Firestore rules. The online research collector has been removed. Source identity columns and the `Accounts` research tab distinguish where submissions came from.

The public `cloud/config.json` now identifies Firebase project `speech-apps-5d3b0`. Live sign-in and syncing still require the project's authentication providers, authorized domains, Firestore database and deployed rules; see [cloud setup](cloud/SETUP.md). These console settings and real-device syncing have not been verified. Report sharing uses local Excel only and is independent of personal Google account syncing.
