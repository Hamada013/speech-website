# Original M-CHAT observation record

Open index.html over HTTPS or localhost. Arabic is the default; English is available from the language icon. The app saves records only in this browser. Clearing site storage removes them. Print or download important reports separately.

Read [the clinical/content review](../assessment-shared/REVIEW.md) before using results, especially the version and licensing limits for M-CHAT. This is an observation/recording aid, not a validated diagnostic product.

## Files

- assets/data.json: versioned local questionnaire content and references.
- ../assessment-shared/: readable UI, scoring, responsive CSS and offline runtime.
- assets/icons/: generated logo, original source, all app icons. [Prompts and generation details](../assessment-shared/LOGOS.md).
- sw.js / assets/pwa-release.js: generated app-scoped worker and hashed offline release.
- The original compiled JS/CSS remain for provenance and are no longer loaded.

## Rebuild after editing shipped files

From the repository root:

```sh
node forms/ASD/assessment-shared/build-pwa.cjs
node forms/ASD/assessment-shared/build-pwa.cjs --check
node forms/ASD/assessment-shared/model.test.mjs
ASD_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node forms/ASD/assessment-shared/installability.test.cjs
ASD_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node forms/ASD/assessment-shared/pwa.test.cjs
ASD_PLAYWRIGHT="$PWD/tools/VSS/voc/node_modules/playwright" node forms/ASD/assessment-shared/browser.test.cjs
```

Build both releases after changing shared files. Publish both app folders and assessment-shared together; every worker verifies its complete shell before replacing the previous release. Public electronic M-CHAT distribution needs the authors' licensing agreement; this change does not establish one.

The home, two-step record details, questions and paginated report share the fixed viewport layout used by BLAF. Reports replace repeated item responses with low/moderate/high screening-risk bands and next-step guidance, preserving optional observations. Age, parent-response and original-form checks still control whether a band is assigned. These bands do not describe autism severity or establish an autism/social-communication diagnosis. Attribution, reference links and data revision remain in app information/content, outside the report and PDF.

The PDF keeps the risk scale together on one page. Its case-specific referral recommendation uses the eligible initial score: monitoring for 0–2, a clinician Follow-Up interview before a referral decision for 3–7, and direct evaluation referral for 8–23. Incomplete or ineligible records do not receive a referral decision.
