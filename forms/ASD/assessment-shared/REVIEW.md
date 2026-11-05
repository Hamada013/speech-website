# Clinical-content and implementation review — 2026-11-02

These applications are recording and observation aids. A code review cannot establish clinical validity, diagnostic accuracy, licensing permission, or validation of a translation. No such claims are made in the interface or reports.

## M-CHAT

The supplied bundle contained **23 original-version questions** while its English title and explanatory report claimed **M-CHAT-R/F**. It mixed the original reversed answers and historical Critical6 subset with revised-version follow-up instructions. Its range stopped at 20 despite presenting 23 questions. Incomplete answers could still produce a risk label; no date-of-birth or respondent check was present.

The current author guidance for the **original M-CHAT** recommends the total score, not a stand-alone Critical6 decision:

- 0–2: continue developmental monitoring; rescreen younger children according to the author guidance.
- 3–7: conduct the **original M-CHAT Follow-Up** interview.
- 8–23: direct referral for developmental evaluation / early intervention may proceed without the Follow-Up.

The four original yes-concern items are 11, 18, 20 and 22. Other items add a concern point for no. Do not substitute the revised 20-item reversal list or its Follow-Up cutoff. In the original interview, a persisting score of 3 or more supports referral; a score of 2 calls for careful monitoring. This app **does not administer or score that interview** and never labels an initial result as a completed two-stage screen.

The rebuilt app explicitly identifies the original 23-item recording aid. Existing local question wording was retained, including its abbreviations, rather than presenting an unverified rewrite as an approved translation. A guideline-based computed band is displayed only after all 23 responses, an observation age of 16–30 completed months, parent response, and the clinician's explicit confirmation that answers were transcribed from the official, unmodified original form. Without these conditions, the report provides counts and explains why interpretation is withheld. These guards do not validate the local implementation itself. Scores are not probabilities of autism.

For new screening, consult the current **M-CHAT-R/F** on the authors' website. This original-version app does not replace the revised instrument.

Sources checked:

- [Original M-CHAT scoring — authors' current guidance](https://www.mchatscreen.com/m-chat/scoring-2/)
- [Original form and original Follow-Up interview](https://www.mchatscreen.com/m-chat/)
- [Revised M-CHAT-R/F scoring](https://www.mchatscreen.com/mchat-rf/scoring/)
- [Official translations](https://www.mchatscreen.com/mchat-rf/translations/)

**Distribution rights:** the authors distinguish permitted internal clinical EHR use from distribution of an electronic M-CHAT. Public electronic distribution requires an agreement with the authors, and official use requires preserving instrument wording, order, instructions and copyright. Existing repository possession is not evidence of a license. This review did not obtain or verify a license, contact the authors, publish the apps, or claim author endorsement. Review the [authors' terms](https://www.mchatscreen.com/m-chat/) before public distribution.

## BLAF (repository path remains BALF)

The supplied app contained 12 domains, with five ordered descriptions per domain. It had several substantive content problems:

- Vocal imitation duplicated spontaneous vocal-play choices instead of assessing repetition.
- Cooperation score 2 referred to firm commands instead of a preferred reinforcer.
- Low frequency was translated as low volume in vocal play.
- The top matching anchor omitted block designs.
- The receptive-language anchor used pronouns instead of people/actions.
- Function/feature/class anchors lost distinguishing criteria.
- Peer interaction with prompts was described as interacting quickly.

These errors were corrected in the local adaptation and logged here. Remaining local paraphrases are **not** represented as an authorized or validated BLAF translation. Reports explicitly call this a local descriptive adaptation.

The reference form supports finding an assessment starting point. A 1–5 rating is an ordered description, not a measured mastery percentage. The previous total/60, achievement percentage and arbitrary achieved/developing labels were removed. Reports instead show 12 labeled bars with exact selected ratings and descriptions. Missing/not-observed ratings remain missing and never become a zero or a lowest rating. Possible practice starting points reflect the selected descriptions and do not assign diagnoses, language ages, age norms or outcome guarantees.

Reference:

- [KSDE TASN — Behavior Language Assessment Form, provider description and reference download](https://ksdetasn.org/resources/2663)
- [Reference form with criteria](https://ksdetasn.s3.amazonaws.com/uploads/resource/upload/2900/BLAF_Beh._Lang_Assess._Form___Correlating_ABLLS_Goals.pdf)

## Engineering checks

- Arabic by default; English switching retained; no runtime CDN, external fonts, tracking or remote audio.
- Per-app local drafts, completed/partial records and history; no child records uploaded.
- A failed local save blocks progression, keeps current answers in memory and offers retry. Unreadable records are not silently overwritten.
- Device storage can be cleared by the user or browser. Save important reports separately.
- Both apps have separate manifest identities, maskable and standard icons, verified offline shells and app-scoped cache names. Shared runtime modules are explicitly included in each shell.
- Complete new releases install before activation. Updates wait for closed sessions or the user's update action. A failed download keeps the prior release. Application cache updates do not erase records or other apps' caches.
- Browser checks verify report bar values, partially rated records, save/resume, storage errors, input escaping, print output, touch sizing, installation metadata and offline cold launch. No claim is made that a public PWABuilder URL audit was run before deployment.

The original compiled bundles remain in each app's assets as the provenance of the supplied content; they are unused by the rebuilt UI and excluded from the offline shell.
