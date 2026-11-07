# Language-cognitive research file

The research file stays on this computer. This app has its own collector, separate from the articulation one.

## Start it

From the repository root:

```sh
node forms/aphasia/langiuage-cognitive/scripts/research-server.mjs
```

Open http://127.0.0.1:8878/ and keep that window running.

## Send a visit

1. Open a visit's report and press the sheet icon.
2. Answer the research questions:
   - the group (healthy adult, aphasia or another condition)
   - age, years of education, sex and hand used
   - cause and months since onset, for people with a condition
   - hearing, vision, dialect and other languages
3. Tick consent, then send.

Only a random person code, the visit month, these answers and the task results are sent. Names, the doctor, the examiner, full dates, comments and notes are never sent.

If the collector isn't reachable, for example on a phone, the app downloads a file instead. Add it on the computer with:

```sh
node forms/aphasia/langiuage-cognitive/scripts/research-server.mjs --import path/to/file.json
```

## Files in this folder

None of these files go into git.

- `language-cognitive-research.xlsx`: the workbook. It is rebuilt on every send, so changes made inside it are replaced.
- `dataset.json`: the data the workbook is built from. Back it up with the workbook.
- `settings.json`: the minimum people per norm group and the item-check thresholds. Edit this file, not the workbook.

## The workbook

- **Dashboard**: people per norm group, and healthy and aphasia domain means, with charts.
- **Norms**: healthy adults by age (18–39, 40–59, 60+) and education (up to 9 years or more), per domain. Each row gives the mean, SD and a cut-off at the 5th percentile, following the Russian Aphasia Test (Ivanova et al., 2021).
- **Score_Check**: choose a group, a measure and a score. It shows whether the score is at or below the healthy cut-off, plus a guide standard score and bell curve.
- **Item_Analysis**: whether each task separates healthy adults from people with aphasia.
- **Assessments** and **Items**: the data, one row per visit and one row per task.
- **Dictionary** and **Sources**.

The trash icon next to the workbook clears the research file only. Cases and reports stay in the app.
