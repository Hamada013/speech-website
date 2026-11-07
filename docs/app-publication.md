# App publication and GitHub Pages

The website publishes the main pages, the forms and the tools that still live here, including Arabic Sounds and Auditory Rehabilitation. كلمة (Vocabulary Builder), جملة (Sentences Builder) and مقطع (Syllables Builder), formerly the VSS suite, publish from their own repositories: `Hamada013/vocabulary-builder`, `Hamada013/sentences-builder` and `Hamada013/syllables-builder`. Each has a `.github/workflows/pages.yml` that checks its release and tests before publishing; select **GitHub Actions** as its Pages source once, as below.

## Publish the final files

1. Merge the bundle's `tools/`, `.github/` and `docs/` contents into the matching locations in `Hamada013/speech-website`, keeping the existing website pages. Commit and push the files to `main`.
2. On GitHub, open **Settings → Pages → Build and deployment → Source**, then select **GitHub Actions**.
3. Let **Build and publish website** finish in the Actions tab.

The one-time source setting follows [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Every push to `main`, including edits made in GitHub's browser, then rebuilds both sound-app release manifests before publishing the complete website. Code, picture and recording changes receive new content hashes. Shared controls are edited in `tools/shared/`; the build synchronizes the app copies. All existing website pages are included in the deployment.

After deployment finishes, an affected app checks on opening, returning to the foreground, reconnecting, and every five minutes while visible. The update popup appears after the new app shell is completely downloaded and verified. **تحديث الآن** activates it and reloads all open windows for that app. **لاحقًا** keeps the current release; reopening offers the update again. A media-only change also triggers the popup. Unchanged downloaded files and locally saved child progress are preserved.

Accepting an update immediately shows **جارٍ التحديث…**. The app releases the old worker's download queue without cancelling the saved request; the new release resumes it. A browser-managed background transfer continues across the update, with changed revisions fetched afterward. Failed or stalled activation restores the update/later controls and shows a retry message. Returning shortcuts also check for a controller change they may have missed while suspended.

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

Serve apps over HTTPS or localhost. The build writes forwarding pages for the old `tools/VSS/…` and `tools/voc|senb|taffaha/…` addresses to the three builder apps' own addresses, plus a retiring worker at `tools/VSS/sw.js` that moves open offline copies to the new apps, removes the old suite caches and unregisters.

## Verification

Each builder app has its own browser check, `npm run test:browser` in its repository: launch logo, no name prompt, no links out, single learner, download through the home header icon, cache isolation and offline reopening (`APP_ENGINE=webkit` for Safari's engine). The sound apps use `node tools/tests/split-sounds-browser.cjs` and `node tools/tests/sound-suite-browser.cjs`.

`node tools/tests/update-readiness.cjs` and `node tools/tests/update-activation.cjs` cover worker readiness, immediate feedback, queued downloads, duplicate taps, failed messages, activation timeouts, and returning shortcuts. Browser checks use Playwright from `npm install` at the repository root.
