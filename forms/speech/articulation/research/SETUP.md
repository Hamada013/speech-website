# Local research workbooks

Report sharing writes only to this computer. No Google Drive, Google Sheets, Apps Script, OAuth spreadsheet client, or online research endpoint is used. Articulation's optional Google account sync uses Firebase/Firestore independently.

## Start the local app

From the repository root:

```sh
node forms/speech/articulation/scripts/research-server.mjs
```

Keep that process running. Open:

- Articulation: http://127.0.0.1:8876/forms/speech/articulation/
- Language/cognitive: http://127.0.0.1:8876/forms/aphasia/langiuage-cognitive/
- Ling: http://127.0.0.1:8876/forms/Hearing/ling_test/

In a child's report, press the share icon. It immediately updates the local workbook and shows success only after Excel and the cumulative dataset are saved. Press the workbook icon in that dialog to download/open the current file. To include names/identifiers, select that option and press update again. They are omitted by default; free-text notes remain as entered.

Files on this computer:

- Articulation: `forms/speech/articulation/research/arabic-speech-research.xlsx` and `dataset.json`.
- Language/cognitive: `forms/aphasia/langiuage-cognitive/research/language-cognitive-research.xlsx` and `dataset.json`.
- Ling: `forms/Hearing/ling_test/research/ling-research.xlsx` and `dataset.json`.

Re-sharing replaces the same assessment/case IDs rather than appending duplicates. Other submitted cases are retained. The JSON datasets drive rebuilding; keep them alongside the workbooks and back up both. Manual edits to generated Excel files are replaced at the next share. Deleting a case from the app does not remove a previously exported local record. Generated records and workbooks are ignored by Git and omitted from offline caches and publication.

Each app has a trash icon beside its workbook controls. Cross cancels; tick clears only that app’s cumulative research dataset and rebuilds a blank workbook. Child accounts and clinical reports remain unchanged and can be re-exported. Workbook reset and export are serialized. Downloaded copies elsewhere are not modified. Follow Direction’s download-only workbook uses a local exclusion boundary and downloads a blank replacement; later exports include only sessions created after reset.

The collector binds to `127.0.0.1`, validates request origins/Host and JSON payloads, serializes writes, writes temporary files before renaming, and does not expose the raw datasets through HTTP. Workbook downloads use dedicated loopback routes with no caching. `RESEARCH_DATA_DIR` overrides the storage folder; language/cognitive records then live in its `aphasia` subfolder and Ling records in its `ling` subfolder. The two usual loopback preview ports, 8765 and 8876, are allowed. Do not expose the collector as a public service or permit public website origins.

The builder uses Codex's bundled `@oai/artifact-tool` runtime. If running outside that environment, provide a supported installed runtime using `ARTIFACT_NODE_MODULES`. The local collector needs Node.js and that dependency; a hosted static website alone cannot write into a folder on the computer.

## Phones, tablets and account sync

Signing into articulation with the same Google account selects that account's private Firebase case space. With working Firebase settings/rules and a successful sync, cases and dated assessments can be retrieved on another device. Google account sync does not upload a spreadsheet or share a Drive file. Live Firebase setup still needs verification; see [cloud setup](../cloud/SETUP.md).

A phone/tablet cannot write directly to the laptop's disk through its own loopback address. Sync its articulation case, then open the local laptop app, sign into the same Google account, wait for successful sync and press the report share icon there. Alternatively, download the report's research JSON on the phone, transfer it to the laptop, and use the local report dialog's import icon. This merges it into Excel without an online spreadsheet. Local-server errors retain app records and permit retry/export.

## Articulation workbook definitions

`Case_info` has one row per assessment. `Findings` has all 84 probes for every assessment, including missing results. `Accounts` records source-account provenance, not workbook permissions. `Results` calculates descriptive counts, outcome and age charts and phoneme error totals. `Dictionary` records the protocol and exclusions. Research-declined assessments are excluded. Capacity is 2,000 assessments / 168,000 findings; over-capacity submissions fail visibly.

Accuracy includes scored responses only. Dialect-appropriate, unelicited, skipped and unrecorded responses do not enter the denominator. Independent naming with a reviewed reference stays separate from assisted responses. Repeated visits remain identifiable. Counts are descriptive observations, not population acquisition norms or diagnostic cutoffs. The workbook's original layout and research schema are retained.

## Retired online integration

The Ali-owned articulation workbook was permanently deleted at the user's request on 2026-10-27 and deletion was verified by Drive readback. Both apps' online spreadsheet links, upload transports, bound-script sources and deployment instructions have been removed. Language/cognitive also discards its old saved endpoint/token/automatic-upload settings on startup. This source change does not revoke independently deployed external services or remove unrelated files from Google accounts. Previously installed app versions need the rebuilt release before using the local-only behavior.
