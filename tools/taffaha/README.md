# تف فا حة

Arabic syllable cards in five groups: **1, 2, 3, 4, 5 syllables**. The current bank has 25 cards. Serve the repository root over HTTPS or localhost, then open `/tools/taffaha/`. Keep the shared VOC media at its existing relative paths.

## Controls

- Choose a syllable-count group from the header's card-library icon. Previous/next/shuffle remain within the selected word's group.
- Tap a circle to hear its latest saved take, or the Arabic device voice when no take exists.
- Press the **header microphone icon** to reveal one recording button below each circle. Press a recording button to start, and press it again or the checkmark to stop/save. The cancel icon discards the current take. Recording stops automatically after 15 seconds.
- The speaker icon plays the existing whole-word recording. The sequence icon plays the syllables right to left, using saved takes wherever available; the square icon stops playback.

There is no settings modal, no per-syllable playback button, and no long-press recording gesture. Recording controls start hidden on each launch. Icons have accessible Arabic names and titles. The footer contains Ahmad Ghanem's supplied contact details.

## Image/title/audio synchronization

`scripts/build-data.cjs` reads VOC's `CATEGORIES` directly and preserves each original word ID, label and audio path. A visual audit found five food pictures whose supplied image numbers differ from their matching word/audio numbers:

| Word | Audio remains | Reviewed image |
| --- | --- | --- |
| حليب | `sounds/5/21.m4a` | `images/5/29.webp` |
| بيتزا | `sounds/5/23.m4a` | `images/5/27.webp` |
| بوظة | `sounds/5/25.m4a` | `images/5/23.webp` |
| معكرونة | `sounds/5/33.m4a` | `images/5/35.webp` |
| شوربة | `sounds/5/32.m4a` | `images/5/34.webp` |

These are explicit Taffaha artwork corrections; source VOC files are not changed. The remaining cards retain their VOC image references. Matching pictures were checked visually, rather than inferred from filenames alone. Three one-syllable cards and two five-syllable utterances provide content in all five groups.

`assetsManager.js` clears old artwork to the local placeholder before loading the next image, and ignores late results from previous requests. This prevents a new title appearing with a previous card's decoded picture during slow/rapid navigation. Generated image revision queries invalidate ordinary HTTP image caches after artwork changes. Missing art uses the placeholder.

Syllable examples reflect the current Arabic training bank and may vary with dialect. Existing custom divisions of 1–5 segments remain honored for compatibility, without exposing the removed settings screen. The entire-word recording stays paired with its original title; recorded syllable takes independently replace device speech.

## Saved recordings and PWA storage

The existing IndexedDB database `taffaha-recordings` is preserved. Audio bytes, actual MIME type and metadata commit locally; no recordings are uploaded. Old child/model takes remain available, with the latest take for a word/segment taking playback priority. New recordings use stable original word/segment IDs and replace only that segment's previous child take.

A full browser close/reopen retains recordings in the same browser/profile, including when offline. Audio is loaded on demand rather than all at once. The app requests persistent storage from the record-header gesture and after saving, where supported. A browser/OS can still evict website storage or a user can clear it. Clearing this app's downloaded libraries does **not** delete recordings. If a write fails, an explicit error and emergency download icon appear; the current take stays usable in memory for the session and is not falsely reported as saved.

`audio.js` resumes suspended/interrupted AudioContexts on a user gesture for iOS, negotiates MediaRecorder codecs, and provides a PCM/WAV fallback. Microphone tracks and nodes are stopped on completion, cancel and errors. Backgrounding attempts to finish/save an active recording. Native permission denial gives an actionable message. Arabic device voices can require Internet; saved takes and downloaded whole-word audio do not.

The scoped worker installs a verified local shell, including icons. The download dialog optionally saves all existing shared VOC/SENB/Arabic-sound assets (currently 6,938 files, about 140.5 MB) with hashes, timeout, pause/resume, quota feedback and revisioned keys. Other apps' caches are independent. Cached audio answers Safari byte-range requests. New releases wait for older windows to close, avoiding mixed app versions.

## Build and verify

From the repository root:

```sh
node tools/taffaha/scripts/build-data.cjs
node tools/taffaha/scripts/build-pwa.cjs
node tools/taffaha/tests/static.cjs
```

Rebuild data after labels, syllable divisions or artwork mappings change; rebuild the release after any shipped code or shared media changes. `node scripts/build-pwa.cjs --check` checks release freshness. The icon builder reads `assets/icons/logo.webp` and requires Sharp 0.34.5. Production requires no npm dependency or CDN.

`tests/static.cjs` verifies all title/audio IDs against VOC, permits only the five reviewed image corrections, checks image revisions, all five groups, icons and shell/media integrity. Browser tests require Playwright 1.56.1 (`TAFFAHA_PLAYWRIGHT` can point to an existing installation). Chrome uses the installed Google Chrome; `TAFFAHA_ENGINE=webkit` selects Playwright WebKit. The tests visit every card, exercise request-race guards, header recording controls, native and WAV capture, recorded-circle/sequence playback, legacy recordings and 320px layout. Chrome checks a full browser restart with the server offline. WebKit checks offline page reopening in a regular context; `tests/persistence.cjs` separately checks recording retention across its full browser restart. This separation is necessary because this workstation's Playwright persistent WebKit profile silently discards Cache API writes even on a minimal unrelated page. The app detects downloads that make no storage progress and shows an error instead of retrying indefinitely. The WebKit microphone uses a generated input stream to test encoding rather than physical hardware. Artifacts go to `/private/tmp/taffaha-qa` on this workstation.

For isolated WebKit storage checks, run `tests/persistence.cjs` with `TAFFAHA_ENGINE=webkit`; add `TAFFAHA_WEBKIT_OFFLINE=1` to check complete library download and offline reopening without the generated microphone fixture.
