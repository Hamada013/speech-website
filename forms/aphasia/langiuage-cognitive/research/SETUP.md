# Local language and cognitive research workbook

Online Drive/Sheets sharing and automatic Apps Script uploads have been removed. Old saved upload settings are discarded when this version opens. Case saving remains local to this app's browser storage.

Start the shared loopback collector from the repository root:

```sh
node forms/speech/articulation/scripts/research-server.mjs
```

Open http://127.0.0.1:8876/forms/aphasia/langiuage-cognitive/ and press the report share icon. It updates `language-cognitive-research.xlsx` and `dataset.json` in this folder, then confirms success. The workbook icon downloads the latest file. Repeat shares update existing case IDs and retain other cases. Updates happen only when requested, not after routine edits or reconnecting.

`Assessments` contains one row per visit, performance-task counts and accuracy. `Items` contains every task, result, observation/performance type, support and comment. `Clinical_fields` preserves recorded patient/context fields, clinical impressions, recommendations and section notes. Accuracy = correct / evaluated; observations, excluded tasks and unassessed tasks do not enter that denominator. Zero evaluated tasks leave accuracy blank.

Names, examiner and doctor fields are omitted by default. Select identifiers and update again to include them. Free text is retained as entered. JSON download remains available without the collector. Keep the dataset and workbook backed up together; the next update regenerates Excel from the dataset. Records are ignored by Git and never cached or published with the app. See [shared local collector setup](../../../speech/articulation/research/SETUP.md) for runtime requirements and loopback security.
