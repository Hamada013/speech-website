# Ling six-sound identification

Open `index.html` through a local web server or HTTPS. This is an independent Arabic PWA with its own accounts, worker, media and caches. Its logo uses the existing website artwork; its six images and recordings are local copies from Arabic Sounds. Rebuild after edits with `node forms/Hearing/ling_test/scripts/build-pwa.cjs`.

The automatic path introduces all six pictures with sound and a pointing model, moves the demonstrated answer before the child's turn, then runs practice and a randomized test. Practice increases its choice set after two correct responses and reduces it after an incorrect response. Each test presents every sound twice with all six pictures visible. Explicit no-response entries count as incorrect. Replays, assistance, introductions, smaller choice sets and unfinished runs remain in the practice section; only a complete independent six-card test appears in assessment results. Records save after each response. Reloaded sessions resume with playback assistance recorded. No calibrated output level, norms or diagnostic cutoffs are inferred.

Research exports are deliberate, not background synchronization. To write the cumulative Excel file, run from the repository root:

```sh
node forms/speech/articulation/scripts/research-server.mjs
```

Open `http://127.0.0.1:8876/forms/Hearing/ling_test/`, choose a child and press the report's export icon. `research/ling-research.xlsx` contains separate Assessments, Practice and Trials sheets, with a Readme explaining eligibility. Child names are omitted. Re-export replaces that source/child's previous snapshot without duplicating it; other children remain. The local collector requires the existing `@oai/artifact-tool` runtime (or `ARTIFACT_NODE_MODULES`). On a phone or static host, export research JSON and transfer it to the research computer; import it from the same export dialog there. A static page alone cannot write into a computer folder.

The report's trash icon asks for a parent gate and explicit cross/tick confirmation, then empties only Ling's research dataset/workbook. Clinical accounts and reports remain and can be exported again. Cancel changes nothing. Existing downloaded copies of files cannot be erased by the app. Reset/export operations serialize on the local collector.

Checks:

```sh
node forms/Hearing/ling_test/tests/model.cjs
node forms/Hearing/ling_test/tests/browser.cjs
node forms/Hearing/ling_test/scripts/build-pwa.cjs --check
```

The browser check uses disposable children, a temporary research folder, synthetic audio completion for interaction timing, Chrome, real XLSX generation, and offline fetches of every real recording. It never resets production research files.
