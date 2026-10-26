# Main website

The homepage, Forms, Tools, Resources and eight form-category directories share the same local styles, scripts, outline SVG icons and VOC logo. They have no runtime font or CSS CDN dependency. Their app links retain the existing paths; the assessment and activity apps remain independently maintained.

- `assets/site/`: shared base styles, fixed-screen app layout, interactions, SVG sprite, brand artwork and generated PWA release.
- `scripts/site-pages.cjs`: bilingual content and destination paths for the twelve directory pages.
- `scripts/build-site.cjs`: renders those pages as static HTML, including correct relative paths for nested hosting.
- `tests/site.test.cjs`, `tests/site-browser.cjs` and `tests/site-pwa.cjs`: directory integrity, layout, navigation and offline/update checks.
- `images/logo.png`: retained for older subapps that still reference it. The new main pages use `assets/site/brand/logo.webp`, copied from VOC; the app's own logo is unchanged.

After editing the main website:

```sh
node scripts/build-site.cjs
node scripts/build-site.cjs --check
node tests/site.test.cjs
SITE_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node tests/site-browser.cjs
SITE_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node tests/site-pwa.cjs
```

Use `SITE_ENGINE=webkit` with either browser suite to check Safari's engine. The layout suite visits all twelve directories at desktop, phone, small-phone and short-landscape sizes, in English and Arabic. It checks every paginated item, drawer direction, launch motion, reduced motion and keyboard dismissal.

The offline suite uses Chromium's network-offline flag. For WebKit it stops the local origin instead, because Playwright's WebKit offline emulation rejects even worker-generated responses ([upstream issue](https://github.com/microsoft/playwright/issues/42775)). Both runs require the cached directory pages to work and uncached subapp requests to fail when the origin is unavailable.

The main site is one installable PWA (`manifest.webmanifest`, root `sw.js`). Directory pages stay within the viewport, with numbered previous/next controls for longer lists. Search resets pagination, and resizing recalculates capacity. The navigation drawer opens from the left in English and the right in Arabic; its long navigation list can scroll independently on short screens. Research references and installation help open in accessible dialogs.

The root worker verifies and caches only the twelve directory pages and their shared assets. It passes through all subapp requests and deletes only caches beginning with `speech-site-shell-`. An incomplete release is discarded, preserving the working release and unrelated app caches. Existing subapp manifests, workers, code and media are unchanged. Installation and browser-specific home-screen UI still need a physical-device check.

The generator edits only the twelve paths declared in `site-pages.cjs`. It never traverses or builds apps. A directory entry whose destination has not been supplied is rendered as a non-link “Coming soon” card. AOS language selection continues into its assessment through the `lang` query parameter. Forms links open the directory directly without an access-code prompt.

Generated site artifacts and app-test screenshots belong in ignored `output/` and `tmp/` folders. Unreferenced GIFs, old homepage effects and obsolete root assets were removed; media inside apps is outside this cleanup's scope. Do not move app directories to reorganize the main website.

The existing GitHub Pages workflow publishes pushes to `main`. It stages tracked website assets through `tools/shared/build-pwa-releases.cjs --site` and retains independent app release checks.
