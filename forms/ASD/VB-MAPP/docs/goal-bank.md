# Goal bank and child IEP page

The IEP route under Reference / المرجع contains the active child's goal list, a bank icon and copy icon. Each row has edit/remove controls. Source registries, scores, evidence grids, level selection and routine instructions are not shown on this page. Detailed criteria, support, source, review date and report inclusion live in an edit dialog.

## Inventory

| Templates | Count |
| --- | ---: |
| Supplied 14-page “VB-MAPP IEP Goals” PDF, Mark L. Sundberg (2008) | 178 |
| Verified milestone objectives | 170 |
| Supporting task-analysis skills | 740 |
| Total | 1088 |

The bank covers all 16 domains and three levels. Annual examples retain their source page and specific quantities/conditions. English text is whitespace-cleaned, with obvious transcription typos corrected, and has Arabic translations. English letter/case goals explicitly remain English targets. The last three spontaneous-vocal goals printed under Echoic on PDF page 4 are categorized as Vocal, consistent with the supplied Level 1 interpretation chapter.

The PDF differs from some chapter examples: Level 2 spontaneous requests to peers are 50/day in the PDF, and the number-copying example is 1–30. These PDF variants are retained, not silently replaced by other source counts. Source metadata and SHA-256 are in `goal-bank-data.js`. Broad PDF examples remain templates, not automatically inferred unmet skills.

## Child-specific behavior

- The existing mapping engine identifies each domain's first non-mastered milestone. Only a valid recorded 0 or half point produces an automatic goal. Unknown/stale scores, prior visits and later strengths do not create earlier deficits.
- The child's page combines derived goals with saved edited goals. Reading the list does not mutate scores, history or saved plans. Existing edited goals win over automatic suggestions for the same milestone.
- Current milestone goals are available even where a placement passage is absent: the objective comes from the verified assessment record, without reconstructing missing guidance.
- An explicit bank addition can select a broader annual example or a supporting skill. It links to a domain/level milestone for storage/reporting, but does not claim that the selected example was assessed or failed. Unknown baselines cannot be marked reviewed against the assessment.
- Bank choices are independent records, allowing several goals to link to one milestone without replacing each other or the child's earlier goal edits. Duplicate bank entries are disabled once added.
- Removing a suggested goal dismisses it for the current assessment. Removing a saved goal deletes that goal record and dismisses the associated automatic suggestion. It can be re-added from the bank. A follow-up starts fresh, with prior goals/dismissals preserved only in historical snapshots.
- Goals retain report inclusion and assessment-review controls in the editor. Saved bank goals survive normalization, account saves and the existing scoped PDF JSON payload. Milestone scope disabled means these goals are excluded from the report and payload.
- Copy produces the child's displayed goals as plain text; if clipboard access is unavailable, it downloads that text.

## Validation

`npm test` includes bank inventory, bilingual coverage, source variants/pages, non-mutating proposals, exclusions, multiple linked goal records, report/PDF payload inclusion and fresh follow-up behavior. `npm run test:iep` checks the simplified page, bank filters/search/pagination, add/edit/remove, report inclusion, reload persistence, unchanged scores/history, focus restoration and Arabic phone layouts in Chrome; use `VBMAPP_ENGINE=webkit` for Safari. Rebuild the offline release after edits.
