# أصواتي العربية

Standalone Arabic RTL PWA, separated from the former combined Aswati app. Serve this directory on HTTPS or localhost; it has no dependency on the other sound app or `tools/aswati`.

## Content

31 Arabic sound recordings and pictures, custom sound pairs, speech levels, guided practice, ten-trial tests, Ling observations and PDF reports, matching, and paired memory games. Pair practice begins with a colorful 1–2–3 countdown, plays the first displayed card ten times while covering the second, then the second ten times while covering the first. It keeps one-second gaps and returns automatically to the same pair and order. Pair tests start after the same countdown, use ten balanced questions, advance after each answer, and show the final score. Pair controls are icon-only; custom and level-selected pairs share this flow. Leaving or hiding the page cancels the session.

The supplied logo is `images/logo.webp`. Installation icons are in `icons/`. The home uses the project home-screen style. Its only header action is Download, opening one «تنزيل» button and a percentage bar. Downloading saves this app's own 62 media files, verifies hashes, and resumes missing files on retry. Offline audio supports byte ranges. Cache names include this app's name and hosting scope.

Ling has a separate setup dialog with the child's name and two mode buttons. Detection presents the six existing sound pictures one at a time, plays each recording automatically, and preserves tick/cross/no-response observations while navigating with arrows. The report becomes available after all six observations. Identification has five numbered levels with 2, 3, 4, 5, and 6 choices; the level dialog offers every possible set (15, 20, 15, 6, and 1 sets). Each chosen set starts ten balanced trials with automatic audio and large correct/incorrect feedback. Replay is an icon in the activity header. Changing sets starts a fresh ten-trial session; hiding the page pauses audio until Replay is pressed. Both reports include the child's name, the automatic session date, mode-specific results, optional notes, and a direct PDF download without browser URL headers or GitHub links.

Drag and Match covers the three lower cards individually. Tapping a covered card plays its sound without revealing it or recording an answer; dragging the target onto a covered card still submits a match. The hide setting persists across rounds. The sound-pool catalog uses image-only selection cards, keeps at least three sounds, and applies changes only when saved.

Drag and Match and Memory omit visible match counters and card captions while keeping accessible names. Their image cards stay square in covered and revealed states. Six-card Memory always uses two rows of three cards, including desktop and landscape screens.

Drag and Match uses the same large animated tick/cross feedback as Ling, then automatically advances a correct answer or allows another attempt after an incorrect answer. Leaving the activity cancels its pending feedback. These games and active Ling tests size their boards to both the viewport width and height, keeping all cards and controls on one screen; 12-card Memory uses a compact grid that also fits short landscape screens. Detailed reports and selection dialogs retain their own content layouts.

Ling reports use a numeric day/month/year date and separate correct and incorrect responses. Identification passes the app's session criterion at 8/10 (80%) or higher. The summary lists missed sounds in the low (م، و), middle (ا، ي), and high (ش، س) screening groups, or multiple groups, and explicitly marks untested groups. These approximate groups follow [Advanced Bionics' interpretation guidance](https://www.advancedbionics.com/content/dam/advancedbionics/Documents/libraries/Tools-for-Toddlers/tools-for-parents/The-Ling-Six-Sound-Check.pdf); the session summary does not diagnose hearing loss. Detection retains observation-only scoring. PDF exports keep a fixed readable text size and move complete table sections to a new page when needed, without GitHub links.

Complete new releases wait for «تحديث الآن» or «لاحقًا». Update checks run when opening the app and returning online. Rebuild release manifests before publishing changes.

## Development

```sh
npm install
npm run build:icons  # Requires Python with Pillow, when changing the logo.
npm run build
npm test
npm run test:activities
npm run test:audio
npm run test:browser
```

Browser checks require Chrome and Playwright. Set `SOUNDS_PLAYWRIGHT` to an absolute installed Playwright package path if needed; `SOUNDS_ENGINE=chromium` selects Chrome for activity checks. Shared standalone checks are in `tools/tests/split-sounds-browser.cjs` and verify responsive screens, download retries, native audio decoding, offline reopening, updates, and legacy URLs.

Legacy HTML activity paths now redirect within this app to `index.html#/arabic/…`. Old `tools/aswati/index.html#/arabic/…` bookmarks redirect here. Ling observations stay in memory as before; download the PDF to retain them.
