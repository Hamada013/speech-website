# VSS and GitHub Pages

VSS (`tools/VSS/`) contains VOC, SENB, and Taffaha as one installable app with VOC's icon. VSS app switching and report links stay within these three areas for every account, including Hamada. Arabic Sounds and Auditory Rehabilitation remain separate.

## Publish the final files

1. Merge the bundle's `tools/`, `.github/` and `docs/` contents into the matching locations in `Hamada013/speech-website`, keeping the existing website pages. Commit and push the files to `main`.
2. On GitHub, open **Settings → Pages → Build and deployment → Source**, then select **GitHub Actions**.
3. Let **Build and publish website** finish in the Actions tab.

The one-time source setting follows [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Every push to `main`, including edits made in GitHub's browser, then rebuilds VSS and both sound-app release manifests before publishing the complete website. Code, picture and recording changes receive new content hashes. Shared controls are edited in `tools/shared/`; the build synchronizes the app copies. All existing website pages are included in the deployment.

After deployment finishes, an affected app checks on opening, returning to the foreground, reconnecting, and every five minutes while visible. The update popup appears after the new app shell is completely downloaded and verified. **تحديث الآن** activates it and reloads all open windows for that app. **لاحقًا** keeps the current release; reopening offers the update again. A media-only change also triggers the popup. Unchanged downloaded files and locally saved child progress are preserved.

Accepting an update immediately shows **جارٍ التحديث…**. VSS releases the old worker's download queue without cancelling the saved request; the new release resumes it. A browser-managed background transfer continues across the update, with changed revisions fetched afterward. Failed or stalled activation restores the update/later controls and shows a retry message. Returning shortcuts also check for a controller change they may have missed while suspended.

The update popup follows the published release; GitHub's commit time can precede completion of the Pages deployment.

The download readiness check accepts a worker that has already claimed the app while Safari still reports it as activating. It continues to wait when a different worker controls the page. This prevents an update from leaving the download button waiting unnecessarily.

## Build locally

No npm installation is required for the release build:

```sh
node tools/shared/build-pwa-releases.cjs
```

Inside a repository checkout, prepare and verify the complete Pages artifact with:

```sh
node tools/shared/build-pwa-releases.cjs --site
```

The website is staged in `output/pages/`. This omits repository metadata, local dependencies, tests and previous output archives, and verifies every app's shipped shell and media hashes.

Serve apps over HTTPS or localhost. Keep the complete `tools/VSS/` directory together. The build generates redirects for the three former top-level app URLs. Tap the home or header logo, then **تنزيل**, and wait for **100%** to save images and audio for offline use.

## Verification

The end-to-end check uses production workers and real media, covering early download taps, failed-install retries, complete downloads, offline reopening, automatic code/media update popups, postponement, activation in multiple windows, and the replacement recording's actual bytes:

```sh
APP_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node tools/tests/pwa-controls-browser.cjs
APP_FULL_CATALOG=1 APP_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node tools/tests/pwa-controls-browser.cjs
APP_ENGINE=webkit APP_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node tools/tests/pwa-controls-browser.cjs
```

The second command downloads all 7,234 VSS media files; add `APP_FULL_CATALOG=1` to the WebKit command for the same complete check in Safari's browser engine. The full catalogs contain 1,990, 4,884 and 360 files respectively. Safari uses a real stopped origin for offline checks so the test does not depend on Playwright's worker/offline emulation.

`node tools/tests/update-activation.cjs` covers immediate feedback, queued downloads, duplicate taps, failed messages, activation timeouts, and returning shortcuts. `APP_NATIVE_FETCH=1 node tools/VSS/tests/pwa-browser.cjs` also verifies a real Chrome background transfer across a release update while two windows are open.
