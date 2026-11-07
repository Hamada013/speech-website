# Sources and checks

## Where the original 197 tasks come from

The repository does not record a source. Some clues are visible:

- Section 3 uses the Boston Diagnostic Aphasia Examination's subtest name "Complex Ideational Material" and its yes/no question style ("will a stone sink in water?").
- Some memory items translate English originals: "Helen", the "baseball team" and "Happy Birthday".

No single published test was matched. **Please confirm the source.** If it adapts a published test, publishing it or building norms on it needs the publisher's permission.

## Corrections made

| Item | Problem | Change |
|---|---|---|
| 10-5 | The text said the toothbrush costs 5000 and you have 1000, but its picture shows 1000 × 5 | Costs 1000, you have 5000 |
| 12sub2-1 | The story stopped mid-word ("والآيس") | "والآيس كريم" |
| 12sub1-8 | Baseball is unfamiliar in Syria. Khwaileh et al. (2025) report imported items being culturally biased | Football |

Kept, but left out of all scores because healthy adults cannot answer them: 1-10 (accident date), 1-11 (problems since the accident), 1-13 and 12sub3-7 (treating doctor, the same question twice), 12sub3-6 (other treatments) and 12sub3-8 (how long here).

## Added tasks

They are marked "جديد" in the app, with their source in the info button. All wording and scoring are drafts for clinical review.

| Group | Task | Reason |
|---|---|---|
| 2subE | Sentences with swappable roles (3) | ASHA lists sentence comprehension; the list's commands and yes/no questions don't test grammar on its own |
| 6subF | Word repetition (4) | ASHA lists repetition; the list repeats only letters, numbers and sentences |
| 6subG | Nonword repetition (2) | A subtest of the Russian Aphasia Test, where older healthy adults scored lower |
| 9subG | Reading aloud (4) | ASHA lists written language; the list tests reading for meaning only |
| 9subH | Writing to dictation (3) | ASHA lists writing; the list only asks for the person's name and the date |
| 13sub4 | Gestures on request (3) | ASHA lists gestures; the list only observes them in conversation |
| 13sub5 | Motor speech signs (2 observations) | ASHA apraxia of speech page: groping, inconsistent errors. Slow rate was already observed |
| Fluency | Animals in one minute | Common in aphasia assessment. **Its sources came from search summaries only; confirm against the full papers** |

Considered and not added, because the list already covers them: single-word comprehension (the 2subA commands touch named objects), picture description (13sub2), counting (section 10) and proverbs (7subB).

## How norms are built

The method follows the Russian Aphasia Test:

- Healthy adults form the norm group, with each person counted once at their first visit.
- Age groups are 18–39, 40–59 and 60+, the test's original cohorts.
- Before the cut-off is set, a healthy score is removed if it is both under 90% and more than 3 SD below its group's mean.
- The cut-off is the 5th percentile, so a score at or below it is below the healthy range.

These are my working choices, not taken from a source. You can change the numeric ones in `research/settings.json`.

- Splitting education at 9 years.
- Needing 30 people per group. The Russian test had 106 healthy adults.
- Counting a domain only when 80% of its tasks were given.
- The item-check thresholds: healthy adults pass at least 80%, and the groups differ by at least 10 points.

## References

1. ASHA Practice Portal: [Aphasia](https://www.asha.org/practice-portal/clinical-topics/aphasia/) and [Acquired Apraxia of Speech](https://www.asha.org/practice-portal/clinical-topics/acquired-apraxia-of-speech/).
2. Ivanova MV, Akinina YS, Soloukhina OA, et al. [The Russian Aphasia Test](https://pmc.ncbi.nlm.nih.gov/articles/PMC8601577). *PLoS One*. 2021;16(11):e0258946. doi:10.1371/journal.pone.0258946.
3. Khwaileh T, Mustafawi E, Elbuy S, et al. [Arabic Aphasia Research Through a Clinical and Linguistic Lens](https://pmc.ncbi.nlm.nih.gov/articles/PMC12169208/). *Int J Lang Commun Disord*. 2025;60(4):e70064. doi:10.1111/1460-6984.70064.
4. Arabic tools with their own norms, which could be compared later: [ADAT discourse tool](https://onlinelibrary.wiley.com/doi/10.1111/1460-6984.13083), [Qatari/Gulf Arabic battery](https://www.researchgate.net/publication/306129644_An_aphasia_battery_for_QatariGulf_Arabic), [Palestinian Arabic BAT](https://www.sciencedirect.com/science/article/abs/pii/S0911604417301598) and [Egyptian Arabic ACE-III norms](https://www.researchgate.net/publication/271215349_Normative_data_for_healthy_adult_performance_on_the_Egyptian-Arabic_Addenbrooke's_Cognitive_Examination_III).

The eight aphasia profiles in the app (Broca, Wernicke, anomic and others) follow the classic fluency, comprehension, repetition and naming scheme. ASHA's page confirms the fluent/nonfluent split and warns that people may not fit one type, but it has no table to check them against. The source I tried was behind a verification page.
