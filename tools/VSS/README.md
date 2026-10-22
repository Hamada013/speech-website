# VSS

VOC (words), SENB (sentences), and Taffaha (syllables) are activity areas inside one installable PWA. Open `/tools/VSS/` on HTTPS or localhost. Install **VSS** from that page or any activity page; all use the same manifest, identity, scope, and VOC icon.

```text
tools/VSS/
  index.html                 VSS home
  manifest.webmanifest       One installation identity
  sw.js                      One worker for every activity
  assets/                    Shared download/update client and release inventory
  icons/                     VOC installation icons
  voc/                       Vocabulary activities and media
  senb/                      Sentence activities and media
  taffaha/                   Syllable activities and media
  scripts/                   Unified release build
  tests/                     Suite integrity and PWA lifecycle checks
```

The existing app picker and 1–2–3 countdown switch activity areas in the same window. Child accounts, reports, parent gates, and progress retain their existing storage keys. No browser data is deleted by the merge. The two sound apps remain outside VSS and retain Hamada's existing access rules.

Tapping any activity logo opens the same VSS download: all 7,234 media files (about 144 MB) across the three areas. Downloads resume on another VSS screen and reuse unchanged files after updates. Installation saves the complete interface; media downloads remain opt-in. Updates install the complete suite before offering **تحديث الآن / لاحقًا**, and activation reloads every open VSS window.

Build and check from the repository root:

```sh
npm run build --prefix tools/VSS
node tools/VSS/tests/static.cjs
node tools/VSS/tests/pwa-browser.cjs
APP_ENGINE=webkit node tools/VSS/tests/pwa-browser.cjs
APP_FULL_CATALOG=1 node tools/VSS/tests/pwa-browser.cjs
node tools/shared/build-pwa-releases.cjs --site
```

The build requires no npm installation. Browser checks currently use the Playwright dependency in `voc/node_modules`; install VOC's dev dependencies if needed. Existing module build commands rebuild the whole VSS release.

The Pages build generates compatibility redirects and replacement workers for the former `/tools/voc/`, `/tools/senb/`, and `/tools/taffaha/` URLs. There are no duplicate source app directories. Old links preserve their query strings and activity fragments. Existing installations at those old URLs remain separate installation identities; install VSS from its new URL. Browser progress remains available in the same origin/storage context. Separately installed iOS apps can have isolated storage, so automatic transfer from those installations is not guaranteed.
