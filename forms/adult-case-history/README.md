# Adult case history

Static, dependency-free adult speech and language intake, styled to match the child case history. `index.html` loads readable `assets/data.js`, `model.js`, `app.js`, and `styles.css`. The original generated bundles remain in the folder for reference and are no longer loaded.

## Use

- Open the form through your existing site / preview. All clinical choices start unselected. The interview date defaults to today and clinician to Ahmad Ghanem; both can be changed or cleared.
- Select multiple answers where applicable, or a single answer for mutually exclusive categories. “None reported” and “Unknown” clear conflicting selections. “Other” opens a note. Notes can also be used without selecting a choice.
- Switch between English and Arabic without losing answers. Arabic and Persian digits are accepted in date inputs. Age uses the recorded assessment date. Partial, impossible, future history dates and inconsistent chronology are highlighted before export.
- Review & export opens a full report. Choose the current language or bilingual labels / choices. Free-text notes stay as written. Unanswered fields are omitted by default; enable them for a blank or incomplete-history report.
- Print / Save as PDF uses the browser’s native print workflow with an A4 report stylesheet. Text export is UTF-8 with a BOM for Arabic-compatible readers. Neither format depends on an external PDF library or font service.
- Draft saving is opt-in and local to this browser (`aghanem-adult-history-v1`). Disabling it removes the saved draft while retaining open answers. New / clear resets the form and removes its draft; a failed storage deletion is reported before resetting a saved case. Exported files must be managed separately.
- Home-screen installation uses `manifest.webmanifest`, PNG icons, and a directory-scoped service worker. Requires HTTPS or localhost and an initial online load; offline cache holds the app shell, not patient answers. Increment the cache version in `sw.js` when changing shell files after deployment.

## Content and report

Nine sections cover interview/source details; referral, onset and priorities; medical, hearing and vision history; languages and communication; speech, fluency and voice; cognition and access; swallowing and oral history; daily roles and services; clinician summary and plan. Medication names/doses and clinical synthesis remain free text to preserve exact information.

The report separates reported history from direct observations and clinician synthesis. It never infers normal findings, a diagnosis, swallowing safety, or a diet recommendation from blank answers. Report and screen footers include Ahmad Ghanem, Speech and Language Pathology, Latakia - Syria, and slp.ahmadghanem@gmail.com.

History domains were checked against ASHA’s [Aphasia case-history guidance](https://www.asha.org/practice-portal/clinical-topics/aphasia/) and [Adult Dysphagia assessment guidance](https://www.asha.org/practice-portal/clinical-topics/adult-dysphagia/). This custom intake is not a standardized assessment instrument.

## Verification

Run `node --test forms/adult-case-history/tests/*.test.cjs` from the site root. Tests cover calendar dates and age, choice exclusivity, malformed drafts, bilingual report contents, escaping, navigation, notes, saving/clearing failures, and export behavior in a lightweight DOM harness.

Actual Safari/iPad layout, home-screen installation, offline navigation and PDF pagination need a browser/device check. Automated DOM tests do not verify those layouts. No connected browser was available during this revision.
