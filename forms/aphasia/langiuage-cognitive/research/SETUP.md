# Private aphasia workbook collector

The app uses local case files, with no Google login for the examiner. The Google account owner performs this one-time setup. The workbook is private; do not publish it or enable public link access.

1. Open the workbook linked by the app's share icon. Choose **Extensions → Apps Script**.
2. Paste `Collector.gs` into the bound project. Save, then run `configureCollector`. Authorize access to this workbook. Enter a private random device key of at least 32 characters. Keep the key out of GitHub, screenshots and public configuration.
3. Select **Deploy → New deployment → Web app**. Execute as **Me**; access **Anyone**. This lets the app send without Google login; the collector checks the private device key for every write. Workspace policies may prevent this deployment.
4. Copy the production `/exec` URL. In the app, open a case → share icon → **إعداد الإرسال التلقائي**. Enter that URL and the key. Save. These settings stay on this browser/device and are excluded from backups.
5. For a test case, approve sending, choose whether to include identifying fields, then press upload. Require a verified success receipt and inspect Cases, Assessments, Items, Clinical_fields and its new Case_* tab. Repeat the upload: row counts must stay unchanged. Check another case is retained.
6. Enable automatic sending if desired. It sends the active consenting case after edits and reconnecting. It does not send other cases in the background. A failed/unverified send retains local records; retry upload. There is no guaranteed background delivery after closing the app.

Cases contains one row per case. Each Case_* sheet contains its assessment timeline and item details. Charts rebuild from the records received. Empty accuracy is left blank; it is never presented as zero. Excluded/unassessed items and descriptive observations do not enter accuracy denominators. Clinical_fields preserves context, ratings, section notes and clinical recommendations. Do not manually edit collector-owned data; a later upload replaces that case's received snapshot. Make a separate analysis tab for additional work. Device deletion does not delete cloud records.

The default upload omits the case name, patient name, examiner and doctor fields. **Free text can still identify a patient**. Review all notes and obtain appropriate consent before sending. The device key grants write access: use a secured device, rotate the key using configureCollector if exposed, and remove old deployments. This simple single-owner collector is not a multiuser authentication system.

The collector serializes writes, validates payloads, treats formula-like input as literal text, and upserts by case/assessment IDs. It acknowledges only after verifying assessment row counts. If delivery is interrupted between table writes, retrying the same case repairs those tables. Two different devices restoring the same backup should not edit it independently: revision checks cannot resolve independently branched clinical records.

Deployment cannot be completed through the Sheets connector. Apps Script deployment and a live browser upload must be tested by the workbook owner. Google redirects ContentService responses; the client follows redirects and sends a plain-text POST to avoid an unnecessary preflight. A blocked or unreadable response is reported as unverified, never as success. JSON export remains available.

Official setup references: [Web apps](https://developers.google.com/apps-script/guides/web), [Content Service](https://developers.google.com/apps-script/guides/content).
