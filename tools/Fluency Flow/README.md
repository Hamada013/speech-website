# كلام وطلاقة (Fluency Flow)

The Arabic name is «كلام وطلاقة», used for the installed app and the website card. «Fluency Flow» is the English name.

Arabic and English visual practice for fluency shaping, stuttering modification, and breathing, for children and adults. The interface follows the site's Taffaha style (`docs/app-home-style.md`).

The app lives at `tools/Fluency Flow/index.html`. The former Resources URL redirects here; an existing old offline installation retires its worker after open sessions close. Language preference stays on the same origin.

Open `index.html` through an HTTPS website or a localhost HTTP server. The shipped app needs no package download, remote fonts, or third-party service. Run the PWA release builder after editing shipped files.

## Install and use offline

- Open Fluency Flow online and wait for **Ready for offline practice** (or **جاهز للتدريب دون إنترنت**).
- On Android or desktop Chrome/Edge, use **Install app** in the app or the browser's install menu.
- On iPhone/iPad, use the browser's Share menu → **Add to Home Screen**. On macOS Safari, use File → **Add to Dock**.
- Open the installed icon to use the app in its own window. All exercises, icons, information dialogs and breathing guides are cached for offline use. Browser microphone permission is still required to record.
- Installation requires HTTPS or localhost. Opening the HTML directly from disk does not enable the PWA. Installation options vary by platform; see [MDN's installation guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

The service worker controls only this app folder. It does not control other tools on the speech website. Recordings remain in memory and are not stored in the offline cache. Browser-managed offline storage may be cleared by the user or the operating system.

## Updating and deployment

After editing any shipped HTML, CSS, JavaScript, manifest, icon, or service worker:

```sh
node scripts/build-pwa.cjs
node scripts/build-pwa.cjs --check
```

Upload the entire app folder together to your HTTPS host. Keep `sw.js`, `assets/pwa-release.js`, and all listed assets from the same release. The hash-based cache installs a complete, verified release before activation; a failed download leaves the previous release working. New versions wait until existing app windows close, or the user chooses **Update & reload**. The update button is disabled while practicing or requesting/using the microphone; reloading clears the current session and its recordings.

App icons are generated from `assets/icons/logo.webp`. If you change it, run `node scripts/build-icons.cjs` with Sharp installed (`npm install --no-save sharp@0.34.5`), then rebuild the PWA release.

## Files

- `manifest.webmanifest`, `sw.js`, and generated `assets/pwa-release.js`: install metadata and versioned offline cache.
- `assets/pwa.js`: bilingual install guidance, offline readiness and controlled update UI.
- `assets/icons/`: WebP logo, Android icons, maskable icon and Apple touch icon.
- `assets/app.js`: translations and exercise content.
- `assets/ui.js`: the interface: one shared practice screen for all six speech exercises, the breathing guide, dialogs and session control.
- `assets/pictures.js`: concrete bilingual word mappings, local Lucide icons and supplementary SVG drawings for Easy Onset.
- `assets/practice.js`: the clinical timing rules, plus category, phrase, sound-grouping and navigation helpers. Change pacing, pauses, presets and limits here.
- `assets/recording.js`: local recording lifecycle and permission/error handling.
- `assets/dialog.js`: dialog focus management, Escape, and background scroll locking.
- `assets/vendor.js`: the existing bundled React, Motion, and icon runtime, extracted without upgrading dependencies. Treat this as a generated vendor file.
- `assets/index-B-ZKx10f.css`: the original generated theme, retained for its base reset.
- `assets/responsive.css`: the interface styles, including layout, touch targets, safe areas, focus styles, and reduced motion.

## Easy Onset picture cues

In Easy Onsets or Light Contacts, select Practice and choose a letter. The picture icon toggles between written words and word pictures; its pressed state indicates picture mode. Tap the letter icon to return to words. Both Arabic and English have picture cues for every practice letter. Easy Onsets lists vowels and continuants; stop consonants (ب ت د ض ط ق ك and B C D G K P Q T) are listed under Light Contacts instead. ج stays with Easy Onsets because it is usually /ʒ/ in Syrian Arabic. Picture mode includes concrete words with a recognizable local icon and excludes abstract words; the complete original lists remain in word mode. Each picture has the spoken word as its accessible name. Switching modes resets the guide and pagination, and pictures are included in the offline release.

## Clinical settings

These defaults are in `assets/practice.js` and are suggestions for clinician review:

- **Pace:** speed 1–10 maps to 40–200 syllables a minute, and a word's time follows its syllable count. Arabic practice text has no vowel marks, so its count is estimated from word length and can be off by one.
- **Slower Rate, Light Contacts and the stuttering exercises:** pause for 800 ms at punctuation and between single words.
- **Easy Onsets:** a gentle breath before every single word, and at the start of each phrase in sentences and stories. Its Words and Practice lists leave out stop-initial words; Light Contacts keeps only those. Other lists are unfiltered.
- **Cancellations, Pull-outs, Preparatory Sets:** single words are all targets; sentences and stories use one marked target in each phrase, chosen automatically as the longest word. Cancellation's pause defaults to 3 seconds and can be set from 1 to 5.
- **Breathing:** presets are 4/0/6, 3/0/4 and 3/0/6 seconds (in/hold/out). Holding is optional, the fastest cycle is 4 seconds, and practice ends after a chosen 1–10 breaths (default 5).

## Behavior

- Pause preserves the current exercise position. Reset returns to the beginning.
- Backgrounding the page pauses the guide, cancels queued auto-advance, and stops recording.
- Auto-advance waits 1.5 seconds and stops at the final page. Changing an exercise, category, language, or item count cancels queued work.
- Language preference is remembered when browser storage is available. Changing language resets pagination and the selected practice letter.
- Recordings stay in memory on the current device; they are not uploaded or persisted after reload. Starting a new recording, clearing it, or leaving the exercise releases the old audio URL. A late permission grant after leaving releases its microphone tracks immediately.
- Microphone access requires a secure context such as HTTPS or localhost. The recorder checks supported formats and otherwise lets the browser choose its default format. See [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) and [MediaRecorder format detection](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static).

## Verification

The tests start their own local server. Install Playwright in a development environment and install its WebKit browser, then run:

```sh
node tests/helpers.cjs
node tests/pictures.cjs
node tests/browser.cjs
node tests/behavior.cjs
node tests/pwa-browser.cjs
node scripts/build-pwa.cjs --check
```

For Playwright installed outside this folder, set `FLUENCY_PLAYWRIGHT` to its module path. Set `PLAYWRIGHT_BROWSERS_PATH` when using a custom browser directory. The browser checks use installed Google Chrome on macOS when available, or Playwright Chromium otherwise. `FLUENCY_SMOKE=1` limits layout checks to a 390px phone; `FLUENCY_SKIP_WEBKIT=1` runs Chromium only.

Layout coverage: Chromium and WebKit at 320px, 390px, 768px, 844px landscape, and 1366px; all strategies; Arabic and English; accessible button names; 44px touch targets; dialogs; category changes; and pagination. Behavioral checks cover breathing completion, per-exercise speed, timers, final pages, pause/resume, backgrounding, dialog focus, microphone errors/format selection/cleanup, and failed app loading. Chromium also verifies native recording, playback, and microphone track release using synthetic audio input. Automated engine checks do not replace testing microphone permissions and audio hardware on a physical iPhone or Android phone.

PWA checks cover the actual nested website path (including the space in the folder name), manifest parsing, Chromium installation requirements, icon dimensions, offline reload and new-tab launch with the server stopped, offline exercises, waiting updates, update interruption prevention, failed-release rollback, and isolation from other apps and their caches.
