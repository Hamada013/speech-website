# Arabic speech sound screener / فاحص النطق العربي

A standalone, installable Progressive Web App built with HTML, CSS and JavaScript. All 69 naming pictures are included as genuine lossless WebP files. Scoring, reports and pictures work offline after the initial download. No account, build server or external fonts are required.

Serve this entire folder over HTTPS (or localhost for development). Open `index.html`, expand “تثبيت التطبيق والعمل دون إنترنت”, and wait for “جاهز دون إنترنت”. Then install using the app button or your browser menu. On iPhone/iPad use Share → Add to Home Screen; on Mac Safari use File → Add to Dock. Opening a local file directly does not enable PWA installation or service workers.

## Picture-led screening

1. Enter the child’s details, dates, family dialect and hearing context.
2. Open “فحص الأصوات”. One picture appears in the center, with response buttons immediately below it. Use the left arrow for the next picture and the right arrow for the previous picture. Keyboard arrows work outside text fields and dialogs. Use the collapsible sound menu to jump to a letter group.
3. Try independent naming first. Record imitation or contextual cues with the separate pill buttons. Unfamiliar words can be marked unelicited; accepted family-dialect realizations are excluded from error scoring.
4. Selecting substitution or addition opens the sound picker. Choose an Arabic letter with its precise IPA phoneme. It includes dialect variants, extra consonants and vowels. Use the custom-entry button if the sound is absent from the palette. Cancelling the dialog leaves the existing score unchanged. Deletions are recorded as ∅. Distortion can be scored without inventing a substitution.
5. Record stimulability after the original attempt and add an optional note. Changing the word or its whole-word reference pronunciation clears the previous judgment and requires choosing the target phoneme again. Changing a target phoneme also clears its previous judgment.
6. Add connected-speech observations, clinician interpretation and individual recommendations. Review the automatic candidate-pattern section and the report before export.

## Syrian Levantine reference

The word and IPA fields are prefilled with **editable draft urban Syrian forms**, not a single norm for all Syrian families. See [the complete reference table](assets/LEVANTINE-REFERENCE.md). Confirm the family’s vocabulary, phoneme, position and pronunciation, particularly qāf, interdental realizations, glides, geminates and vowels. Coastal, rural and urban varieties differ; use the target picker and word editor to reflect the child’s actual reference.

The target is the spoken phoneme, not the written letter. Examples: إيد /ʔiːd/ has no initial /j/. The selected فأس /faʔs/ and ماء /maːʔ/ prompts explicitly include /ʔ/; accept family-dialect alternatives without treating them as errors. Error buttons are disabled where the draft target is absent. Select a suitable replacement word and confirm its target, or mark it dialect-appropriate / skipped. Old saved records retain their scores and original words but require reference confirmation before automatic phonological analysis.

## Automatic phonological analysis

Rules identify candidate stopping, velar/uvular fronting, alveolar/dental backing, gliding, deaffrication, depalatalization, de-emphasis, voicing/devoicing and initial/final target-consonant deletion from the recorded reference and response. Each result lists its examples, elicitation method, occurrences and interpretable opportunities. Naming, imitation and contextual cues are analyzed separately. “Repeated” means more than one observed example in the current sample; it is not a clinical cutoff or evidence of age-inappropriate development.

Dialect-appropriate, unelicited, skipped and unrecorded trials are excluded. Unrecognized custom transcriptions, missing references and contradictory same-phoneme substitutions are reported as needing review rather than guessed. Whole-word processes such as assimilation, syllable deletion and cluster reduction, and inconsistency across repeated trials, cannot be reliably inferred from one target-phoneme judgment. Review final deletion in the context of clusters, dialect and the complete word.

This is an informal screening worksheet with 28 written-letter groups and 84 editable word-position probes. It is not a validated Arabic test. Target accuracy is not PCC, a whole-word score, a standardized severity score or a diagnosis. The clinician supplies the clinical conclusion.

## Arabic / English report

Choose “العربية” or “English” in the report dialog. Generated headings, fixed responses, calculated summaries and process descriptions switch language in the preview, TXT download and PDF printout. Arabic test words, IPA and names remain intact. For free-text clinical notes, add the optional English version in the form or item note. Otherwise the original authored note is retained; the app does not invent translations or transmit clinical notes to a translation service.

For PDF choose “Save as PDF” in the browser print window, A4 paper, and disable browser-generated headers/footers if desired. The professional contact block flows at the end of the report, on its final page.

## Picture assets

The included pictures are `1.webp` through `69.webp` in `assets/images/`. They were converted from PNG data with misleading WebP filenames using lossless compression; decoded RGBA pixels were checked for equality. [IMAGE-LIST.md](assets/images/IMAGE-LIST.md) describes every picture, filename and word. Repeated words reuse the same file. Use clear pictures without written labels. Missing images show a styled text placeholder; picture-only mode hides the target label and scoring panel. A custom replacement word hides the original picture until you provide a matching prompt.

## Files and privacy

- `index.html`: form, picture workspace and dialogs.
- `assets/browser.js`: visual viewport, modal scroll locking, dialog fallback and text-download compatibility.
- `assets/styles.css`: white, baby blue and baby green interface, rounded controls and print styles.
- `assets/stimuli.js`: stable picture mapping and editable Syrian spoken references.
- `assets/phonology.js`: IPA inventory, phoneme features and candidate-pattern rules.
- `assets/reporting.js`: Arabic/English report rendering and automatic analysis summaries.
- `assets/dropdowns.js`: styled, keyboard-accessible option menus (including Safari).
- `assets/app.js`: navigation, scoring, sound picker, dates, drafts and export.
- `assets/LEVANTINE-REFERENCE.md`: reference words and target phonemes for review.
- `tests/screener.test.cjs`: recording, scoring, rule, translation and draft tests.

Draft saving is off by default; enable it only on a private device. Local drafts are not encrypted. Use the new-case dialog after exporting to clear the recording and saved draft. This app does not send reports or patient data to a server.

Run `node forms/speech/articulation/tests/screener.test.cjs` from the workspace root, or `node tests/screener.test.cjs` from this folder. Run `node forms/speech/articulation/tests/dropdowns.test.cjs` to check the styled menus, keyboard operation and selection events. Automated checks cover behavior and report data. The additional Playwright suite checks real Chromium and WebKit layouts, picture decoding, reports, draft restore, offline launch and PWA updates. Native PDF pagination should also be reviewed on the intended device.

References: [ASHA — Selected Phonological Patterns](https://www.asha.org/practice-portal/clinical-topics/articulation-and-phonology/selected-phonological-patterns/), [ASHA — Speech Sound Disorders](https://www.asha.org/practice-portal/clinical-topics/articulation-and-phonology/), [Living Arabic — Sounds of Levantine Arabic](https://www.livingarabic.com/brief-introduction-to-the-sounds-of-levantine-arabic).


## iPad and browser compatibility

The picture canvas is a larger **1:1 square**, for both loaded pictures and missing-image placeholders. Images use `object-fit: contain`, so wide or tall pictures are not cropped or distorted. A square padding fallback is provided for browsers without CSS `aspect-ratio`. Narrow Split View layouts put navigation arrows below the picture to preserve its size.

The app accounts for the visible viewport, keyboard changes, orientation, safe-area insets and 16px text-entry fields. Dialogs lock the page behind them and scroll internally. Menus calculate available room inside their dialog or visual viewport and close after rotation/resize so they can reopen in the correct place. Download URLs remain valid for 60 seconds to allow Safari to resolve them. The report modal closes before invoking the native print interface.

Current browsers are the intended target. Native dialog support was added in [Safari 15.4](https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/); a basic dialog fallback and an own-property helper are included for older compatible engines. This does not guarantee every historic browser version. JavaScript must be enabled. On an iPad, open the app’s website URL in the browser; a Files/Quick Look preview is not a full browser session. A Mac’s `127.0.0.1` address is local to that Mac, so an iPad needs a website/server URL reachable from the iPad.

Automated checks:

- `node forms/speech/articulation/tests/screener.test.cjs` — recording, analysis, dates and bilingual reports.
- `node forms/speech/articulation/tests/dropdowns.test.cjs` — styled menus, selection events and keyboard controls.
- `node forms/speech/articulation/tests/browser.test.cjs` — viewport/keyboard dimensions, native/fallback dialogs, scroll restoration and download cleanup.

Automated Chromium and WebKit checks are included; they do not replace testing native installation, sharing and printing on a physical phone or iPad. Check the following on your intended devices:

1. Portrait, landscape and narrow Split View: square picture, visible arrows, no page-wide overflow.
2. Load square, landscape and portrait WebP pictures: all remain contained in the square; delete/rename a test image to confirm the placeholder has the same size.
3. Tap every score type, select a replacement phoneme, enter a custom phoneme and cancel the picker: confirm the intended record is saved.
4. Open menus near the bottom of the page or report dialog; scroll and select long options. Rotate the device and reopen the menu.
5. Open the keyboard in notes and custom sound entry: controls remain reachable, the background stays still and closing the dialog restores the page position.
6. Enable draft saving, reload and restore; check behavior when saving is unavailable in the browser’s current context.
7. Export Arabic and English TXT, then print/save PDF: review all pages and the final professional footer using the iPad’s native print/share interface.

## PWA deployment and maintenance

Upload **the entire folder together**, including `sw.js`, `manifest.webmanifest`, `assets/pwa-release.js`, all scripts, icons and 69 pictures. Paths are relative, so the app works in a subfolder such as `/forms/speech/articulation/`. Use HTTPS and serve `.webmanifest` as `application/manifest+json`, `.webp` as `image/webp`, and JavaScript as `text/javascript`. Avoid long-lived HTTP caching for `sw.js` and `assets/pwa-release.js`.

The initial download includes every picture. Offline readiness appears only after the complete release is cached. Browser storage can be cleared or evicted; reopen online if offline files are removed. Offline caching stores app assets, not patient records. Draft saving stays off by default and remains separate from installation. Reports and patient data are not uploaded.

Updates download and verify a complete release before becoming available. The app does not automatically reload an open assessment. Choose “تحديث وإعادة تحميل” after exporting or saving. An unsaved current case requires a separate confirmation; cancelling preserves it. A failed/incomplete download leaves the previous offline release available.

After changing shipped files, run from this folder:

```sh
node scripts/build-pwa.cjs
node scripts/build-pwa.cjs --check
node tests/screener.test.cjs
node tests/dropdowns.test.cjs
node tests/browser.test.cjs
ARTICULATION_PLAYWRIGHT=/path/to/playwright node tests/pwa-browser.cjs
```

The Playwright suite needs installed Chromium/Chrome and WebKit. Set `PLAYWRIGHT_BROWSERS_PATH` if their binaries are in a custom location. Icons are already included; `scripts/build-icons.cjs` regenerates them from the local SVG using Playwright. `scripts/normalize-images.cjs` is an optional maintenance utility requiring `sharp`; it checks pixel equality and keeps originals in a temporary backup when correcting PNG data named `.webp`. Rebuild the PWA release after regenerating icons or images.

For local testing, run `python3 -m http.server 8080` from the repository root and open `http://localhost:8080/forms/speech/articulation/`. A phone needs a reachable HTTPS website for installation and offline support.

PWA platform references: [MDN installation guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [MDN service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).
