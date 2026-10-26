# Main website

The homepage, Forms, Tools, Resources and eight form-category directories share the same local styles, scripts, outline SVG icons and VOC logo. They have no runtime font or CSS CDN dependency. Their app links retain the existing paths; the assessment and activity apps remain independently maintained.

- `assets/site/`: shared stylesheet, interactions, SVG sprite and brand artwork.
- `scripts/site-pages.cjs`: bilingual content and destination paths for the twelve directory pages.
- `scripts/build-site.cjs`: renders those pages as static HTML, including correct relative paths for nested hosting.
- `tests/site.test.cjs` and `tests/site-browser.cjs`: directory integrity and browser checks.
- `images/logo.png`: retained for older subapps that still reference it. The new main pages use `assets/site/brand/logo.webp`, copied from VOC; the app's own logo is unchanged.

After editing the main website:

```sh
node scripts/build-site.cjs
node scripts/build-site.cjs --check
node tests/site.test.cjs
SITE_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node tests/site-browser.cjs
```

The generator edits only the twelve paths declared in `site-pages.cjs`. It never traverses or builds apps. A directory entry whose destination has not been supplied is rendered as a non-link “Coming soon” card. AOS language selection continues into its assessment through the `lang` query parameter. Forms links open the directory directly without an access-code prompt.

Generated site artifacts and app-test screenshots belong in ignored `output/` and `tmp/` folders. Unreferenced GIFs, old homepage effects and obsolete root assets were removed; media inside apps is outside this cleanup's scope. Do not move app directories to reorganize the main website.

The existing GitHub Pages workflow publishes pushes to `main`. It stages tracked website assets through `tools/shared/build-pwa-releases.cjs --site` and retains independent app release checks.
