# SENB sentence builder

Serve `index.html`, `manifest.webmanifest`, `sw.js`, `assets/`, `images/`, and `sounds/` together under the existing SENB URL, over HTTPS. No runtime build, CDN JavaScript, framework, or backend is required. The optional Google font falls back to the system font when unavailable.

## Files

- `index.html`: Arabic RTL markup and toolbar/dialog structure.
- `assets/styles.css`: card styling, responsive toolbar, safe areas, scroll containers, and touch targets.
- `assets/utilities.css`: committed, compiled Tailwind utility CSS. Browsers do not compile styles at runtime.
- `assets/data.js`: vocabulary, conjugations, advanced categories, image-folder map, and all 960 advanced sentence presets. Presets are constructed once at startup.
- `assets/grammar.js`: context-dependent titles, gender agreement, slot colors, and image/audio path resolution.
- `assets/app.js`: session state, rendering, pickers, keyboard support, viewport sizing, and shared audio playback.
- `assets/activities-model.js`: random assessment plans, game choices, and isolated grammar lookup for activity sentences.
- `assets/activities.js`: home activity setup, repetition playback, comprehension/expressive scoring, and pointer/touch game controls.
- `assets/activities.css`: responsive home menu, activity cards, stars, assessment choices, and game layout.
- `assets/image-fallback.svg`: local placeholder for unavailable images.

The rows of `ADV_IMAGE_FOLDER_MAP` in `data.js` correspond to sentence groups 2–6; each array lists the image folders for subgroups 1–8. Audio retains the requested sentence group/subgroup path. Do not infer the audio path from the image folder.

Slot selection, preset slot assignments, advanced title overrides, noun gender lookup, verb subject lookup, pronoun modifiers, and all conjugation data were preserved during extraction. Image thumbnails load on demand; startup does not download the entire image/audio library. The PWA caches the app interface and saves media as it is used. The home-page download control can save the entire supplied media library for offline use.

Verbs scan earlier slots in the same row for the nearest valid personal pronoun, subject, object, or place. Gaps, adjectives, colors, and other modifiers are skipped. A noun’s explicit `genderCode` takes priority over its gender; the preset verb’s `conjugation` is used when no earlier context is available. Dynamic labels, audio paths, and both future clips share this lookup. Explicit preset title overrides stay intact.

Future verb slot audio is composed as two consecutive present-folder clips: `15.m4a` (want), then the selected verb's `1.m4a`–`100.m4a`, using the same subject code. The slot's future-tense label and advanced whole-sentence recordings remain unchanged. A new tap cancels the rest of an interrupted two-clip phrase.

## Activities

The home menu opens the original sentence board, repetition tasks, assessments, or the missing-card game. Activities read the original presets; they do not replace the manual board's slot assignments or its grammar settings.

- Repetition: select 2–6 words and a subgroup. Each repetition plays the advanced recording followed by all its contextual slot recordings. Repeat the complete sequence 1–5 times; navigate manually or use automatic advancement. One of 24 stars lights after each completed sentence. Pause, a card tap, or navigation cancels pending playback and advancement.
- Comprehension: choose sentence length, one subgroup or all subgroups, and advanced images or word-card rows. Each selected subgroup contributes three distinct random targets from its 24 sentences, with four visually distinct alternatives per trial. Choices have no sentence titles or word circles. The first answer is recorded, then the test advances. Replay is available before answering; the result shows the percentage of correct answers for the selected scope: three trials for one subgroup, or 24 for all eight.
- Expressive: choose sentence length and one subgroup or all subgroups. Each selected subgroup contributes three distinct random images, with a 16:9 advanced image and title only. Toggle one circle per spoken word, then use the next arrow. The result shows the percentage of marked words out of all possible words across the selected trials.
- Game: random sentences from the chosen word group without repeats until the 192-sentence bag is exhausted. One mapped slot is missing, with the correct card and two alternatives from its vocabulary category. Drag a card into the missing slot, or tap a card and then tap the slot. Images/cards play their recordings; the hint plays the missing word with the sentence's tense/pronoun context.

Repetition uses 1–5 count buttons above icon-only playback/navigation controls. Repetition and game advanced cards keep their 16:9 shape on phones, tablets, and desktops. The homepage footer contains Ahmad Ghanem's professional/contact information.

Assessment results stay in memory for the current session and display only an achievement percentage, with no report or save button. Starting a new activity resets its results.

Some legacy presets use alternate category spellings. Activities resolve these on temporary copies, preserving the stored data and the workplace's grammar context. Twelve existing slot references have no supplied vocabulary mapping: `UNKNOWN` entries in `2/7/20`, `3/2/16`, `4/2/5`, `4/2/19`, `6/8/11`; object `162` in `4/6/15`, `4/6/16`, `5/6/15`, `5/6/16`, `6/6/15`, `6/6/16`; and verb `0` in `6/7/22`. They display the local placeholder and use Arabic speech synthesis when available. The game chooses its missing slot from mapped cards. No replacement image is guessed for these unresolved entries.

## Asset audit

All 630 basic image files, all advanced images, and all 960 advanced audio files exist. All card images now use WebP and recordings use M4A. The shared image helper resolves the physical `images/07 pronouns/` folder; audio uses the physical `sounds/prepositions/` folder. Vocabulary category IDs and grammatical codes remain unchanged. The existing logo and installation icons remain PNG for platform compatibility.

The supplied library is missing 198 recordings: `sounds/verbs/present/youplural/1.m4a`–`99.m4a` and `sounds/verbs/future/youplural/1.m4a`–`99.m4a`. The mappings and conjugation text remain unchanged; missing media uses the browser's Arabic speech synthesis when available. Future slot speech now plays `present/<subject>/15.m4a` (want) followed by `present/<subject>/<verb-id>.m4a`; separate future verb recordings are not required. The present `youplural` recordings are still needed for recorded speech in those forms.

## Development

From this directory, install development dependencies with `npm install` only when rebuilding CSS or running browser tests. If HTML or JavaScript utility classes change, run `npm run build:css` and commit `assets/utilities.css` with the source changes. Existing deployments use the committed CSS directly. After any app, CSS, image, or sound change, run `npm run build:pwa` and deploy the regenerated `assets/offline-assets.json` and `assets/pwa-release.js` with the changed files. Run the PWA build after the CSS build. The build hashes file contents and generates the download inventory and shell integrity checks; it does not modify media or vocabulary.

`npm test` runs data/grammar regression, verb-context checks, audio lifecycle checks, activity planning checks, and offline storage/catalog checks. The SHA-256 values in `tests/baseline.json` were captured from the complete app immediately before this refactor; they cover vocabulary, all 960 advanced image/audio/title/slot records, and 12,732 grammar/audio/color outputs across both rows. The original grammar digest is retained as `grammar`; `grammarAfterSubjectScan` records the intentional backward subject lookup correction on 2026-10-09. That correction changed 330 verb audio paths in the baseline, preserving all displayed preset titles, tenses, verb IDs, non-verb outputs, and data/image mappings. The regression test normalizes only the reviewed WebP/M4A extension changes and the physical prepositions-folder capitalization before comparing the original advanced/grammar digests. It still compares vocabulary data directly, including the original image-folder map. Update baselines only after an intentional, reviewed content or grammar change.

For browser checks, run `npx playwright install chromium webkit`, then `npm run test:browser`. On macOS an existing Chrome installation is used automatically. `SENB_CHROME` can select another Chrome executable; `SENB_SKIP_WEBKIT=1` runs only Chrome. `SENB_PLAYWRIGHT` can point to a separately installed Playwright package. Tests use a temporary local HTTP server and leave screenshots in `/private/tmp` on macOS. Adjust the screenshot path for another operating system if needed.

Browser coverage includes 320×568, 390×844, 844×390, 768×1024, 1024×768, 820×1180, and 1366×768 in Chromium and WebKit, plus viewport rotation while preserving slot assignments. It checks startup requests, toolbar bounds/touch targets, grammar filters, covers, clearing, advanced mappings, real M4A decoding after a user tap, and sentence playback order. WebKit desktop emulation does not replace a final check on physical iOS/iPadOS devices.

Activity browser coverage runs complete comprehension and expressive sessions for one subgroup and all subgroups on phone and tablet sizes in both engines, including subgroup selection/reset, percentage denominators, first-answer scoring, three-trial subgroup boundaries, circle toggling, advanced-image and slot-only presentations, repetition audio order and repeat count, progress stars, automatic play/pause, game hints, wrong/correct touch placement, captured pointer dragging, and navigation cancellation. The activity layouts are also checked in landscape and desktop sizes.

## Installation and saved media

1. Open SENB over HTTPS. On Android/desktop, use **تثبيت التطبيق** or the browser install menu. On iPhone/iPad, use Safari → Share → Add to Home Screen → Add; the same steps are shown by the install button.
2. Open SENB from its new home-screen icon, then press **حفظ الصور والأصوات** on the home page. Press **تنزيل الصور والأصوات** in the panel.
3. Keep the app open while it downloads. The current inventory contains **4,881 files / 107.9 MB**. The panel shows file count and bytes saved. Pause whenever needed; completed files survive reload/reopening, and resume downloads only missing or changed files.
4. Once complete, the saved interface, images, and recordings work without the network. While online, SENB checks for app updates when opened or returned to the foreground. **تحديث التطبيق** appears on the home page when a new complete release is ready; choosing it reloads into that release.

The full-library download is optional. Startup caches only the small interface, manifest, catalog, and installation icons; it does not download thousands of media files. Images and sounds also cache on first use. Media downloads are full responses verified against file size and SHA-256; incomplete responses, HTML error pages, and mismatched versions are never marked as saved. Both the app and worker share one revisioned media cache. Cached audio supports byte ranges for Safari/iPad playback.

Downloads run while SENB is open, rather than relying on background download support. Files are stored in this app's browser storage on this device, not in the Files/Downloads app. Install first, then download from inside the installed app. The app requests persistent storage when download starts; the browser decides whether to grant it. Clearing site data, uninstalling, or device storage pressure can remove saved files. The panel recounts actual cache entries on reopening rather than trusting a permanent “download complete” flag. [Browser storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/)

A waiting update leaves the working release in place. Shell files have integrity checks, and a failed installation keeps the previous offline app. Updates reuse unchanged media and remove obsolete revisions. Cache names and the service-worker scope are restricted to SENB, so other apps on the same website keep their own workers/data.

The existing missing recordings and unresolved preset slots listed above remain missing; the downloader saves all supplied files. Arabic speech synthesis fallback depends on voices available on the device, including offline voice availability. Assessment results remain in memory as before; saving the media does not make unfinished child assessments persistent.

## PWA files and hosting

- `manifest.webmanifest`, `assets/icons/`: Arabic app identity, home-screen launch, and installation icons derived from the existing logo.
- `assets/pwa.js`, `assets/pwa.css`: install instructions/native prompt, download panel, progress, pause/resume, and update control.
- `assets/offline-store.js`: shared media verification, revision keys, download queue, cache inspection, and audio range responses.
- `sw.js`: scoped shell/media serving, complete-release activation, and safe cache cleanup.
- `scripts/build-pwa.cjs`: repeatable build of `assets/offline-assets.json` and `assets/pwa-release.js`. Commit both generated files.

Use HTTPS in production; localhost works for development. Opening `index.html` directly with `file://` does not enable the PWA features. Serve `.webp` as `image/webp`, `.m4a` as `audio/mp4`, `.webmanifest` as `application/manifest+json`, and `.js` as JavaScript. Avoid rewriting missing files to an HTML success page. Configure `sw.js`, `assets/pwa-release.js`, `index.html`, and the manifest to revalidate (`Cache-Control: no-cache`). Deploy a complete generated release together and invalidate stale CDN copies of changed app files. No server-side code or runtime npm installation is required. [Installation requirements](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)

The PWA browser suite downloads the complete library, pauses/reloads/resumes, reopens with the origin stopped, decodes real cached M4A recordings, checks audio ranges, and simulates successful/failed updates with a one-file media change. It also verifies that other website apps/caches remain outside SENB's scope. Chromium additionally uses browser offline emulation. WebKit uses a stopped origin because Playwright's offline flag rejects service-worker responses in the pinned browser; see [upstream issue](https://github.com/microsoft/playwright/issues/42775). Physical iPhone/iPad installation still needs a device check after deployment.
