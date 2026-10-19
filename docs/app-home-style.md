# Default app home style

The user selected the `tools/taffaha` home-screen style as the project default for future apps. Existing examples are `tools/taffaha/index.html`, `tools/voc/index.html`, and `tools/senb/index.html`.

- Use a light background (`#f8fafc`) with soft green and blue radial washes. Use dark blue text (`#22445a`), muted secondary text (`#5c7285`), and pale borders (`#dceaf4`).
- Use the system font stack: system-ui, -apple-system, Segoe UI, Tahoma, Arial, sans-serif.
- Place a compact white header across the top, with the app logo/name on the right in RTL and compact rounded icon controls on the left. Keep touch targets at least 44px and visible keyboard focus.
- Center the app logo, title, and one short subtitle above the activity choices. Keep the app's own identity and existing routes.
- Arrange primary actions in two columns. Use white cards with a 28px radius, a pale border, a subtle shadow, a pastel icon tile, and a short label. Use local outline SVGs. For four actions, keep a two-by-two grid and reduce vertical spacing to fit the viewport.
- Use blue and green icon tiles for the first two actions; amber and lavender are available for additional actions.
- Show the contact footer in four centered lines: SPEECH AND LANGUAGE PATHOLOGY, Ahmad Ghanem, Latakia - Syria, and the email link.
- Scale logo sizes and spacing with viewport height. Adapt to short landscape screens and allow vertical scrolling when needed. Keep safe-area insets and reduced-motion preferences.
- Keep home styling scoped so activity screens retain their existing layout. `tools/voc/assets/home.css` and `tools/senb/assets/home.css` are identical local copies of the reusable home pattern; keep them synchronized. Local copies let each app remain independently hostable and available offline.
- After editing a PWA shell, regenerate that app's release manifest with its existing build script, then run the relevant checks.

## Download and update controls

Use one home-header download icon labeled «تنزيل». Its dialog contains only a «تنزيل» action, a 0–100% progress bar, and the percentage. Keep error feedback hidden unless a download fails. Omit installation help, install buttons, file/size details, and extra download actions.

Use the local `assets/updates.js` and `assets/updates.css` pattern to check for a new complete service-worker release on app opening. Offer «تحديث الآن» and «لاحقًا» in a separate modal. Keep the existing release active when postponed; reload all open app windows after acceptance. Check the published site rather than GitHub commits, since a commit may not have deployed yet. Regenerate release manifests for every publication.

The shared browser regression check is `tools/tests/pwa-controls-browser.cjs`. From the repository root, run `APP_PLAYWRIGHT="$PWD/tools/voc/node_modules/playwright" node tools/tests/pwa-controls-browser.cjs` after installing VOC's dev dependencies. It uses small catalogs of real media to verify download completion, offline reopening, update deferral, and activation across multiple open windows.

The split sound apps (`tools/arabicsounds` and `tools/auditory-rehabilitation`) use the same home/download/update conventions. Their five-action home grids use compact spacing, while each app retains its own activity engine, media catalog, manifest, logo, icons, and scoped caches. The old `tools/aswati` entry handles saved-link migration only.

For activity-screen redesigns, the user also selected Taffaha as the layout and interaction reference: calm cards, compact icon-only controls with accessible labels, and minimal routine status/instruction text. Respect an activity's requested automatic flow.

When switching between VOC, SENB, and Taffaha (including report links), blur the current app behind a compact white transition card. Show the destination app logo on the right and the same colorful 1–2–3 count on the left, at 800ms per number, then navigate. Preserve this physical layout in RTL and on small screens. Reduced motion keeps the count without animation. Verify with `node tools/tests/app-transition-browser.cjs` (also supports `APP_ENGINE=webkit`).

## Shared account controls

Hamada is protected in VOC, SENB, and Taffaha: never show a delete control for it, and reject its deletion in the shared account logic. Under Hamada, show saved accounts as a vertical list with one account per row. Each child has a compact trash icon with an accessible label and a minimum 44px touch target. Keep the parent gate and deletion confirmation. Regular child accounts have no delete controls.

Edit `tools/shared/accounts.js` and the account styles in `tools/shared/flow-ui.css`, then run `node tools/shared/sync-navigation.cjs` and rebuild all three release manifests. Verify with `node tools/tests/account-deletion.cjs` and `node tools/tests/account-deletion-browser.cjs`; the browser check also supports `APP_ENGINE=webkit`.
