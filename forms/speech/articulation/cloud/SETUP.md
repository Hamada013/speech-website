# Activate Google sign-in, private syncing and shared research uploads

The app works offline without Google. After its welcome animation it offers an optional Google dialog with a skip arrow. The home cloud icon reopens it. `config.json` contains the public Web app configuration for project `speech-apps-5d3b0`; authentication settings, Firestore rules and real-device syncing still need verification. The research endpoint is empty pending collector deployment. A GitHub Pages push alone cannot enable Google authentication or authorize a server to edit your private spreadsheet.

## 1. Complete Firebase project setup

1. Open https://console.firebase.google.com/ and select **speech-apps-5d3b0**. Its registered **Web app** configuration is already in `cloud/config.json` → `firebase`. These are public app configuration, not server credentials. The measurement ID does not enable Analytics; the app does not load the Analytics SDK.
2. Under **Authentication → Sign-in method**, enable **Google** (choose your support email) and **Anonymous**. Anonymous authentication lets the research button work without asking guests to sign in. Guest cases stay local; only explicit research sharing uses the guest identity.
3. Under **Authentication → Settings → Authorized domains**, add the published host (for example `hamada013.github.io`), plus `localhost` and `127.0.0.1` for previews if accepted by the console. Keep the project's Firebase auth domain. The Google provider creates the OAuth integration; no separate client ID is required in `research/google-link.json` for this route.
4. Create a **Cloud Firestore** database in production mode. Choose an appropriate region, such as `europe-west1`. Deploy the supplied rules before using it. Each Google user can access only their own `/users/<uid>/records/` documents. Research collection and locks are server-only.

## 2. Deploy the private data rules and research service

Cloud Functions deployment requires Firebase's **Blaze billing plan**; set a budget alert in your project. The supplied service scales to one instance with one request at a time. It uses runtime Application Default Credentials, so no service-account JSON key belongs in this repository.

From this directory (`forms/speech/articulation/cloud`):

```sh
npm install --prefix functions
npx firebase-tools login
npx firebase-tools deploy --project speech-apps-5d3b0 --only firestore:rules,functions:submitResearch
```

At deployment, set:

- `APP_ORIGINS`: exact comma-separated website origins, e.g. `https://hamada013.github.io,http://127.0.0.1:8765,http://127.0.0.1:8876`. Do not include paths or trailing slashes.
- `RESEARCH_SPREADSHEET_ID`: `1-85y5YUMqpuQQkxpeVnzxtwqoTeUf-dr4DhBdTnpwRc`.

Find the function's **runtime service account** in Google Cloud Console → Cloud Run → the deployed function → Security. Share the linked Google research spreadsheet with that email as **Editor**, and enable the **Google Sheets API** in the same project. This service can edit the central workbook even when the examiner is a guest or uses another Google account; those examiners do not need edit access to the workbook.

Copy the exact HTTPS `submitResearch` URL printed by deployment into `cloud/config.json` → `researchEndpoint`. Rebuild:

```sh
node forms/speech/articulation/scripts/build-pwa.cjs
```

Run the command above from the repository root. Publish the updated public config and release to GitHub. Never commit `.env*`, credentials, refresh tokens, or service-account keys. Google Sheets remains private unless you deliberately change its sharing settings.

## What is stored and when

- **Skip:** child accounts and progress save to this device, as before. The prompt returns at the next launch; the cloud icon is always available on home.
- **Google sign-in:** imports this device's unlinked guest cases into that Google account, then syncs child accounts and each assessment separately. After upload and a successful local save, its redundant guest copy is removed. Another Google account gets a separate local and remote space. Signing out returns to the separate guest space; it does not delete the cloud account's cached local backup.
- **Offline:** the active account's saved cases keep working locally. Reconnect or press the sync icon to upload/download. A status confirms successful syncing; failed uploads retain local data. Initial sign-in needs the internet. The core PWA remains fully offline; the Firebase SDK is loaded only when cloud services are configured and needed.
- **Concurrent changes:** separate assessment records merge; simultaneous edits to the same assessment preserve both complete versions. A remotely deleted child is not resurrected under its original ID; concurrent local work is recovered as a separate child copy. Deletions are synced using tombstones.
- **Research sharing:** explicit and independent of personal cloud saving. Research-declined assessments are excluded. The deployed service verifies the Firebase token, overwrites claimed source identity/origin, namespaces record IDs by source account, serializes writes and checks Google readback before showing success. It accepts Google and anonymous users. `source_verified=1` means the collector checked the source; local/JSON/manual routes use `0`.
- **Accounts tab:** groups the central results by verified Google account or guest identity. `Case_info` and `Findings` include source account ID, Google email when signed in, sign-in type, device ID, app origin and verification status. Guest identity belongs to a browser installation; clearing its browser storage creates a new guest. The same explicit participant code can support later research reconciliation, but different source accounts are deliberately not merged automatically.
- A guest share followed by a Google share is a distinct source; review duplicate participants before research analysis. Identical client assessment IDs submitted by different accounts cannot overwrite each other.
- The research collector accepts up to 50 assessments / 5 MiB per request and 2,000 assessments in the workbook. Quotas fail visibly, with no silent truncation. Firebase anonymous-auth abuse limits and the collector's origin/token/rate checks apply; monitor quotas and billing before a public research rollout.

## Verify before calling cloud saving active

Use two real browsers/devices with the same Google account. Create a child, score a response and wait for the successful sync message. Sign in on the second device, open the child and check the dated assessment. Try guest and Google research submissions, confirm the source fields and `Accounts` totals in Sheets, and verify another Google account cannot see the first account's cases. Also test offline edits, reconnect and deletion. The repository browser checks use a deterministic Firebase adapter; they do not certify a real Google project deployment.

Official setup references: [Firebase web setup](https://firebase.google.com/docs/web/setup), [Google sign-in](https://firebase.google.com/docs/auth/web/google-signin), [anonymous auth](https://firebase.google.com/docs/auth/web/anonymous-auth), [HTTP functions](https://firebase.google.com/docs/functions/http-events).
