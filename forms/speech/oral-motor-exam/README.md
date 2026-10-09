# Oral motor examination

Open `index.html` through the existing website or a local HTTP server. No build step or external libraries are required. The existing asset filenames are preserved for the editor tabs.

- Nine assessment sections, English / Arabic interface, RTL layout, and optional bilingual reports.
- Visible radio choices replace all dropdowns. Use checkboxes to select multiple findings, history items, languages, referral reasons, and plan items. Additional notes are optional and expandable; earlier text drafts remain readable. “None reported”, “Unknown”, and equivalent exclusive answers clear other items in that checklist. Checkbox findings do not automatically assign an assessment status or clinical conclusion.
- Reports use browser printing to preserve selectable text and Arabic shaping. Choose **Print / Save PDF**, then Save as PDF. On iPad Safari, share the expanded print preview to Files. “Include unanswered fields” also produces an organized blank examination form.
- DDK: `/pa/`, `/ta/`, `/ka/` are repetitions per second; `/pa-ta-ka/` is complete sequences per second. Enter an integer count and duration of at least 0.1 seconds. No normative scores or automated diagnoses are assigned.
- Draft saving is off by default. Opting in stores one draft in this browser's local storage. Disabling it or starting a new exam removes that draft. Clearing site data also removes it. Exports are generated locally.
- The manifest and service worker support installation and offline app-shell access over HTTPS or localhost after a successful first load. Offline access and saved answers are separate options. iPad Safari: Share → Add to Home Screen.
- The service worker is scoped to this directory. Increment the cache version in `sw.js` when changing cached assets in a release.

Clinical scope informed by [ASHA's Speech Sound Disorders practice portal](https://www.asha.org/practice-portal/clinical-topics/articulation-and-phonology/) (oral mechanism examination) and [Adult Dysphagia practice portal](https://www.asha.org/practice-portal/clinical-topics/adult-dysphagia/) (limits of non-instrumental assessment). This is a descriptive clinician record; it is not a standardized diagnostic instrument or a swallowing safety assessment.

Suggested release checks: iPad portrait and landscape; English and Arabic; bilingual A4 print preview; draft restore and clear; complete and partial DDK measurements; offline reload after the first online visit.

Run the dependency-free behavior checks with `node --test forms/speech/oral-motor-exam/tests/form.test.cjs` from the repository root. The DOM harness checks content, calculations, validation, draft handling, and worker scope; it does not render CSS or exercise native Safari printing / installation.
