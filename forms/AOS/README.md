# Acquired AOS assessment — English / Arabic

`index.html` is the revised bilingual entry page. The full form remains at `AOS and disarthria/index.html` to preserve existing site links. The historical folder spelling is retained; the interface uses the correct terms **acquired apraxia of speech**, **dysarthria**, **تعذر الأداء النطقي المكتسب**, and **عسر التلفظ**.

The form loads readable `assets/data.js`, `tasks.js`, `model.js`, `app.js`, and `styles.css`. Old generated bundles are retained for reference and are no longer loaded. No build tools, external fonts, API keys or clinical-data service are required.

## Scope and clinical content

This is an original descriptive assessment worksheet for **adult acquired AOS**, including differential consideration of dysarthria and aphasia. It is not a childhood-apraxia assessment, a standardized instrument, the ASRS-3.5, or a validated Arabic translation of ASRS. No diagnostic total, probability, subtype or automated severity rating is produced.

Nine sections cover patient details; relevant history; languages/dialect and access; oral examination and differential; speech tasks; perceptual observations; functional communication; clinician synthesis/plan; and research/use limits. Speech observations distinguish observed, not observed in an interpretable sample, uncertain, untested, and uninterpretable. Blank answers never become normal findings. Diagnosis remains the examining clinician’s responsibility.

The previous portal mislabeled this folder “Aphasia” and had broken relative links. The previous assessment mixed construction, limb and speech tasks, used literal English-to-Arabic stimulus translations, and represented unselected observations as a zero/none rating. The new form keeps associated oral findings separate from speech observations, records untested states explicitly, and uses editable original elicitation examples.

## Tasks and measurements

- Select English or Arabic example prompts independently of the interface language. A newly added target starts **not assessed**; switching languages never translates an existing target or patient response. An Arabic entry link uses `?lang=ar`; English uses `?lang=en`.
- Task types: connected speech, familiar automatic sequences, familiar word repetition, the same word across three attempts, increasing speech demand, optional oral reading, AMR and SMR. Enter exact targets, language, elicitation conditions, responses, annotations and limitations. All targets are editable.
- Complete repeated-word samples require three recorded productions; partial samples can be marked Limited. Removal supports a one-step undo. Drafts include all currently retained samples.
- AMR rate = entered syllable repetitions / measured seconds. SMR rate = entered complete cycles / seconds. SMR syllables/second = cycles/second × entered syllables/cycle (default 3, editable for a custom target). Zero counts are valid; zero duration, fractional counts, missing denominators and unassessed samples do not generate rates. These rates have no diagnostic cutoffs or Arabic norms.
- Optional listener word intelligibility = understood words / sampled words × 100. Counts must be whole numbers, the denominator positive, and understood words ≤ total. This describes the specified sample and listener; it is not AOS severity or a standardized intelligibility test.
- For recording support, use the linked DDK form. This AOS form does not automatically analyze voice or identify phonemes.

## Arabic use

The Arabic prompts are informal starting points, **not equated versions** of the English prompts. Document the patient’s dialect, intended pronunciations, vowel length, gemination, stress, literacy, language familiarity and any interpreter involvement. Adapt before elicitation. `/ba/` and `/ba-ta-ka/` are examples for Arabic; `/p/` is not imposed. Typical Arabic long vowels or geminate consonants should not be coded as pathological prolongation simply because they are long. A qualified Arabic-speaking clinician must judge the intended production in the patient’s variety.

The references explain their scope. The interpreter pilot and 2026 Arabic review concern **dysarthria**, not validation of Arabic AOS measures. ASRS research supports that specific published scale in its studied population; its psychometrics do not transfer to this worksheet or Arabic example targets. Full citations, DOI links, and bilingual explanations appear in the form’s research section. See [EVIDENCE.md](EVIDENCE.md) for the implementation mapping.

## Reports, privacy and installation

Review & export provides the current-language or bilingual report, optional unanswered fields, research references (enabled by default), and Ahmad Ghanem’s footer details. It preserves original patient targets/notes without machine translation. PDF uses native browser print with an A4 stylesheet; text uses UTF-8/BOM. Long notes may continue across printed pages; reference headings and observation labels avoid isolated page breaks.

Answers remain in browser memory unless **Save draft on this device** is enabled. The local key is `aghanem-acquired-aos-v1`; disabling saving removes that draft and keeps open answers. New/clear removes this case’s draft and resets samples/reports. Storage deletion failures are shown before discarding a saved case. Downloaded reports must be managed separately.

`manifest.webmanifest`, icons and `sw.js` support a home-screen web app and an offline shell after an online load on HTTPS/localhost. The service worker covers this form’s directory only and caches shell resources, not answers or reports. Increment its cache version when deploying changes to shell files.

## Verification

Run from the site root:

```sh
node --test 'forms/AOS/AOS and disarthria/tests/'*.test.cjs
```

Behavior tests cover chronology, Arabic digits, observation states, preservation of sample targets, repeated trials, correct AMR/SMR units, intelligibility denominators, bilingual reports, draft recovery, and reference links. DOM tests do not establish medical validity or verify browser layout. Actual Safari/iPad layout, print/PDF pagination, installation and offline navigation require a browser/device check; no connected browser was available for this revision.
