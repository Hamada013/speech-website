# أصواتي

A single Arabic, RTL Progressive Web App containing **أصواتي العربية** and **أصوات من حولي**. Open `tools/aswati/index.html` through the website or a local HTTP server. Previous Arabic Sounds and Auditory Rehabilitation page URLs redirect to their corresponding section here. The tools directory links to one app card.

## Included activities

- Arabic: all 31 recorded sounds, custom pairs, existing speech level 1/2 pairs and Ling training pairs, free listening, guided practice, a balanced 10-trial test, memory, and pointer/touch/keyboard-accessible matching.
- Guided practice: **each of the 10 trials** plays the first card ten times, the second card ten times, then a target once. Each exposure is followed by a one-second rest before the next playback. Exposure animation starts with actual playback. The answer cue appears only after the target audio ends. Incorrect guided choices allow retry; they are not counted as independent test results. Interrupted playback resumes from the unfinished exposure.
- Ling: popup with a detection/identification choice and session details, two randomized presentations per sound, clinician-entered responses (including unrecorded responses), concise one-page A4 PDF. Session data stays in memory until the page reloads; download the report to retain it. It is a recorded-sound observation, not a calibrated hearing-threshold measurement.
- Sound discovery: ten automatic sound/silence trials, large green tick/red cross responses, ten yellow stars (filled only for correct answers), pause/resume, and an out-of-ten score and percentage popup. The next trial waits for a response. No library tile appears in discovery.
- Duration inside discrimination: a 50-picture sound picker replaces the dropdown. Two identical picture cards have no short/long titles; their positions remain consistent so practice teaches the same positions used in the test. Practice follows the Arabic ten-exposures-per-card sequence with one-second rests and a centered short/long playback progress bar driven by actual audio time. The ten-answer test hides playback bars and guidance.
- Identification: open groups show ten unique cards, including the current target, and refresh with a different target each trial. Practice automatically plays and moves the correct card into the empty box over ten trials; test mode waits for the child's selection/drag and records ten answers. Original pair/set catalogs for two and three/four options remain in `assets/data.js`.
- Memory: 4/6/8/12 paired cards, with names hidden on covered cards. Completing a board automatically starts a fresh board with different sounds after a short success message.
- The auditory drawer opens on the **left** on every subpage; Escape, outside-click dismissal, native dialog focus containment and return focus are supported.

## Install and offline use

The header download icon opens shortcut instructions/native installation where supported, then optional offline media download. Safari uses its Share → Add to Home Screen action. HTTPS or localhost is required for a service worker.

The shell, fonts and PDF libraries are local. The optional media pack contains **262 WebP/M4A files, approximately 23 MB**. Downloads run in three-file batches, can pause/resume after reload, verify SHA-256 before saving, and report quota/connection failures. Previously downloaded matching revisions are reused. Offline audio supports byte-range requests. Cache names and worker scope are isolated from VOC/SENB and other tools. Browser storage can be cleared/evicted by the device; the dialog reports current availability.

Source media remains under `../arabicsounds/` and `../auditory-rehabilitation/` to avoid duplicating files. Serve/deploy all three directories together.

## Build and checks

After editing source files or media:

```sh
node tools/aswati/scripts/build-pwa.cjs
```

This validates every referenced file, records content hashes and sizes, and rebuilds the offline catalog. To regenerate installation icons, install Pillow and run `python3 tools/aswati/scripts/build-icons.py` before rebuilding the catalog.

Browser checks require Playwright and Chrome plus the Playwright WebKit engine. Set `ASWATI_PLAYWRIGHT` to the installed package if it is outside the normal module search path; optionally set `PLAYWRIGHT_BROWSERS_PATH`, `ASWATI_ENGINE=chromium|webkit`, or `ASWATI_QA_DIR`.

```sh
node tools/aswati/tests/browser.cjs
node tools/aswati/tests/navigation.cjs
node tools/aswati/tests/auditory.cjs
```

The suite checks guided exposure counts/order, test balance, cancellation, matching cover bounds and pointer dragging, completion of all memory sizes, twelve Ling responses and a PDF download, every auditory drawer/page, detection/discrimination/duration/identification sessions, native decoding of all 181 M4A files and a full ten-plus-ten practice playback sequence, corrupt-file rejection, paused/resumed downloads, offline reload, images, audio, and byte ranges with the origin server shut down. Generated screenshots and PDFs go to a temporary QA directory. The navigation suite checks 320/768/1280px layouts, all nine legacy URL redirects, the Ling identification option and the browser installation prompt. Visual PDF review should follow any report-layout change.
