# Private Google account sync for articulation

Google sign-in remains optional. It syncs cases and dated assessments through Firebase Authentication and Firestore, separately from local Excel report sharing. There is no online research collector, Google Drive connection, spreadsheet OAuth flow or Sheets upload in this version.

## Firebase setup

The public Web app configuration in `config.json` identifies project `speech-apps-5d3b0`. Before relying on cross-device sync:

1. In Firebase Console → Authentication, enable **Google** and select the correct support email. Anonymous auth is no longer needed by this app.
2. Add the published host and required local preview hosts in Authentication → Settings → Authorized domains. This local app uses `127.0.0.1:8876`; add the host without its port if accepted by Firebase.
3. Create Cloud Firestore in production mode and deploy `firestore.rules`. Each signed-in Google user may access only their own `/users/<uid>/records` documents; other paths are denied.

From this directory:

```sh
npx firebase-tools login
npx firebase-tools deploy --project speech-apps-5d3b0 --only firestore:rules
```

No Cloud Functions or Blaze research collector deployment is required. If an older research function was independently deployed, remove it in Firebase Console; removing deployment source does not delete a live function. There is no configured research endpoint in this app.

## What sync does

Signing into Google imports unlinked local cases into that Google account and syncs each child/assessment. Other Google accounts have separate local and remote spaces. Signing out returns to local guest cases. Offline edits stay local until a successful sync. Conflicting concurrent assessment edits preserve both versions; deletions use tombstones. App account sync never creates or updates a Drive workbook.

For the same email on phone, laptop and iPad, verify successful sync on each device before assuming the records match. On two real devices, sign into the same account, create/score an assessment, wait for success, and check it on the other device. Also test offline edits, reconnect, sign-out, another account's isolation and deletion. Repository browser tests verify this logic with a deterministic Firebase adapter; live project settings and real-device sync have not been certified from this workspace.

## API key alert

Firebase web keys are public app identifiers, not database or spreadsheet passwords. Their live API restrictions still need verification. In Google Cloud Console → APIs & Services → Credentials, restrict the matching key to Firebase APIs actually used (Authentication needs Identity Toolkit API and Token Service API). Exclude Gemini and unrelated paid APIs, review usage/billing, and verify appropriate website restrictions. If the old key was unrestricted or used for other services, replace it with a Firebase-only restricted key, update/test/deploy the public config and then revoke the old key. Hiding it in frontend environment variables does not secure it. Supplied Firestore rules also must be deployed before cloud saving is enabled.

References: [Firebase API keys](https://firebase.google.com/docs/projects/api-keys), [Google sign-in](https://firebase.google.com/docs/auth/web/google-signin), [Firestore rules](https://firebase.google.com/docs/firestore/security/get-started).
