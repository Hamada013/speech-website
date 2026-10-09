# Fluency Flow

Arabic and English visual practice for fluency shaping, stuttering modification, and breathing. The original exercise content and visual theme are retained.

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

App icons are generated from the local SVG. If you change it, run `node scripts/build-icons.cjs` in a development environment with Playwright, then rebuild the PWA release.

## Files

- `manifest.webmanifest`, `sw.js`, and generated `assets/pwa-release.js`: install metadata and versioned offline cache.
- `assets/pwa.js`: bilingual install guidance, offline readiness and controlled update UI.
- `assets/icons/`: SVG source, Android icons, maskable icon and Apple touch icon.
- `assets/app.js`: editable React views, translations, exercise content, and session timing.
- `assets/practice.js`: shared category, pagination, phrase, and navigation helpers.
- `assets/recording.js`: local recording lifecycle and permission/error handling.
- `assets/dialog.js`: dialog focus management, Escape, and background scroll locking.
- `assets/vendor.js`: the existing bundled React, Motion, and icon runtime, extracted without upgrading dependencies. Treat this as a generated vendor file.
- `assets/index-B-ZKx10f.css`: the original generated theme.
- `assets/responsive.css`: responsive layout, touch targets, safe areas, focus styles, and reduced motion overrides.

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
node tests/browser.cjs
node tests/behavior.cjs
node tests/pwa-browser.cjs
node scripts/build-pwa.cjs --check
```

For Playwright installed outside this folder, set `FLUENCY_PLAYWRIGHT` to its module path. Set `PLAYWRIGHT_BROWSERS_PATH` when using a custom browser directory. The browser checks use installed Google Chrome on macOS when available, or Playwright Chromium otherwise. `FLUENCY_SMOKE=1` limits layout checks to a 390px phone; `FLUENCY_SKIP_WEBKIT=1` runs Chromium only.

Layout coverage: Chromium and WebKit at 320px, 390px, 768px, 844px landscape, and 1366px; all strategies; Arabic and English; accessible button names; 44px touch targets; dialogs; category changes; and pagination. Behavioral checks cover timers, final pages, pause/resume, backgrounding, dialog focus, microphone errors/format selection/cleanup, and failed app loading. Chromium also verifies native recording, playback, and microphone track release using synthetic audio input. Automated engine checks do not replace testing microphone permissions and audio hardware on a physical iPhone or Android phone.

PWA checks cover the actual nested website path (including the space in the folder name), manifest parsing, Chromium installation requirements, icon dimensions, offline reload and new-tab launch with the server stopped, offline exercises, waiting updates, update interruption prevention, failed-release rollback, and isolation from other apps and their caches.
