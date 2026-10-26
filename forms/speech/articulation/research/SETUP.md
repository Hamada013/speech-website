# ملف بحث أصوات الكلام

The local workbook is `arabic-speech-research.xlsx` in this folder. Its verified Google Sheets link is recorded in `google-link.json`. Clinical records and the generated workbook are ignored by Git; they are not part of the PWA's downloaded assets.

## Save into this VS Code folder

From the repository root:

```sh
node forms/speech/articulation/scripts/research-server.mjs
```

Open `http://127.0.0.1:8876/forms/speech/articulation/`, or keep the existing preview at port 8765. In the child's report, select the share icon, then the local-workbook icon. It writes `dataset.json` and rebuilds `arabic-speech-research.xlsx` here, merging by immutable assessment/probe IDs. Re-sharing updates existing assessments. New assessments remain separate. Workbook creation requires `@oai/artifact-tool`; the script uses Codex's bundled runtime. Set `ARTIFACT_NODE_MODULES` to a different supported dependency folder if needed. The collector binds only to the local computer; a phone cannot write to the Mac's folder through its own `127.0.0.1` address.

The port-8765 and port-8876 preview origins are explicitly allowed by default. Set `RESEARCH_ALLOWED_ORIGINS` to a comma-separated allowlist for another preview origin. Do not deploy this local collector as a public anonymous service.

## Google import without an OAuth client ID

This route uses your existing signed-in Google Sheets account and needs no public endpoint:

1. Open the linked Google workbook. Choose **Extensions → Apps Script**.
2. Paste `Code.gs` into the bound script's `Code.gs` file.
3. Add a script named `ResearchSchema` and paste `../assets/research-schema.js` into it.
4. Add an HTML file named `Sidebar` and paste `Sidebar.html` into it.
5. Save the script, return to the spreadsheet and reload it. The **بحث أصوات الكلام** menu appears.
6. In the assessment's share dialog, use the download icon to export the case JSON file. In the Google workbook's research menu, choose **استيراد حالة / تحديثها**, select that file and import. Google asks you to authorize your own bound script on first use.

The importer preserves other cases, updates matching IDs, retains all 84 item rows per assessment and refreshes the linked Results formulas/charts. There is no web-app deployment or anonymous Google write endpoint. The connected Drive tools cannot install a bound Apps Script project automatically, so these one-time steps must be completed in your Google account.

## Optional direct Google upload

For the app's direct Google-send icon:

1. Create a Google Cloud project, enable the **Google Sheets API**, and configure the OAuth consent screen for your account/test users.
2. Create an OAuth **Web application** client ID. Add the exact app origins, for example `http://127.0.0.1:8765`, `http://127.0.0.1:8876`, and the published HTTPS origin. Add `localhost` separately if used.
3. Put the public client ID into `oauthClientId` in `google-link.json`. Never put a client secret, access token or refresh token in this file or the app.
4. Rebuild the PWA release. In the report share dialog, choose the Google-send icon and select your Google account. Tokens are held in memory only.

Use one uploader at a time for the optional direct API route. The bound-script import route serializes updates with a document lock.

The existing Google workbook must be writable by the selected account. The app uses Google's Identity Services token flow and the Sheets API; a Codex connector connection is not a reusable browser authorization. When the client ID is absent, the app clearly reports that direct sending is not configured and offers the JSON import path instead of reporting a false upload success.

## Research definitions

### Live Google Sheets dashboard

The linked workbook opens with **Dashboard**, followed by **Age_groups** and **Children**. The age table uses six-month intervals: **1.5–2.0**, **2.0–2.5**, and so on through **11.5–12.0** years, with separate under-1.5, 12+ and unknown-age rows. Lower bounds are inclusive and upper bounds exclusive; 1.5–2.0 means 18–23 completed months.

These views calculate directly from `Case_info` and update after supported imports/uploads, without copying formulas or rebuilding charts. They support the collector's existing capacity of 2,000 assessments. Each child is identified by source account plus participant code (child ID if the code is blank). The earliest dated shared assessment supplies that child's age and baseline results; creation time and assessment ID resolve ties. Unknown dates sort after dated assessments. Follow-up visits remain in the overall assessment count and the detailed `Results` phoneme tables, but do not duplicate children in age charts.

`Age_groups` shows child counts, children with scored items, correct/error totals, pooled target accuracy and result bars. Accuracy includes all elicitation methods and is blank when there are no scored items. The phoneme chart separately shows independent naming with reviewed references across all shared visits. These are descriptive observations, not age norms. A name appears in `Children` only if identifiers were explicitly included in the export.

Chart recalculation does not activate data delivery: Firebase personal syncing uses Firestore. The JSON import or an authorized Sheets upload route must deliver records to this workbook first. The one-time native dashboard request builder is `../scripts/research-dashboard.cjs`; it preserves raw-data columns and existing importers.

- `Case_info`: one row per assessment; age in completed months, language/dialect, region, sampling source, consent and clinician review are explicit. Name/DOB are optional in the share dialog. Free-text clinical notes are retained as entered and can still contain identifying content.
- `Findings`: every assessment's 84 probes, including unrecorded items, actual reference IPA, whole-word IPA when entered, target-level replacement, elicitation method, modified references and notes. Missing observations are not scored as zero accuracy.
- `Results`: live counts, outcome pie, age distribution and phoneme results. Assisted productions remain distinguishable from independent naming. The phoneme accuracy table includes independent naming with a clinician-reviewed reference only.
- `Dictionary`: protocol version, variable names, exclusions, sources and interpretation.

The age chart counts the first shared assessment per participant code, not every repeated visit. Use the same participant code across devices when observations belong to the same child. The remaining item totals are descriptive counts over shared assessments, including repeated observations; they are not population acquisition norms or independent-child prevalence estimates. A research design and reviewed eligibility/sampling criteria are still required before building norms. Capacity is 2,000 assessments / 168,000 findings; exceeding it is rejected rather than silently dropping records.

Automatic impressions are provisional descriptions, not confirmed diagnoses. Typed clinician wording takes priority and review status is stored separately. Changing responses or diagnostic inputs resets the review checkbox. No numeric diagnostic code is generated.

Sources: [ASHA speech sound assessment](https://www.asha.org/practice-portal/clinical-topics/articulation-and-phonology/), [Google token authorization](https://developers.google.com/identity/oauth2/web/guides/use-token-model), [Google bound dialogs/sidebars](https://developers.google.com/apps-script/guides/dialogs).

## Google and guest collection from all devices

The preferred shared collector is now in [cloud/SETUP.md](../cloud/SETUP.md). It uses a server-side Google identity to update this same workbook for Google users and guests. The `Accounts` tab and six source columns in each raw-data tab identify the source account, email when signed in, sign-in type, device, origin and whether the collector verified it. The schema is now v2; v1 JSON files migrate with `unattributed` sources rather than invented account labels. Manual/local routes remain available and their provenance is self-reported.
