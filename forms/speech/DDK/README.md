# DDK assessment

Static, dependency-free English / Arabic workspace styled to match the oral motor examination. Keep the existing asset filenames; no build step is required.

## Workflow

1. Select the labial target `/ba/` or `/pa/`, then a task: labial, `/ta/`, `/ka/`, or the combined sequence. Record one task per clip in a quiet room. Record only the client's performance, excluding the clinician's model.
2. Record in the browser (5, 10, or 15 second auto-stop) or choose an audio file of up to 60 seconds / 15 MB. Supported file codecs depend on the browser. WAV and MP3 are useful alternatives when an encoded recording cannot be decoded.
3. The app estimates acoustic pulses locally. Review playback, adjust the start/end of the measured window, tune sensitivity and minimum spacing, and correct individual markers. Waveform taps add/remove markers; numbered marker buttons and a time-entry control provide a keyboard alternative.
4. Review the syllable count and, for a combined task, the complete sequence count. The initial sequence count is `floor(pulses / 3)` and **does not verify phoneme identity, order, or accuracy**. Incomplete / incorrect sequences require manual review. A complete sequence has three syllables; the complete sequence count cannot exceed the entered syllable count divided by three. The syllable rate includes all counted syllables, including those outside complete sequences.
5. Mark clinician review, select observations, and save the trial. Unreviewed estimates can be saved but remain clearly labeled. The form also supports manual counting, a count button, and a monotonic timer without recording.
6. Reports include saved trials only. Export to browser Print / Save PDF, text, or CSV. Audio can be downloaded separately and is never embedded in reports or drafts. Mean rates shown in the workspace are arithmetic means of saved trial rates, grouped separately for `/ba/` and `/pa/` targets. No normative scores or automated diagnoses are applied.

## Audio method and limits

`assets/analysis.js` implements a transparent energy-envelope heuristic: 150–1800 Hz first-order band limits, 20 ms RMS windows with 5 ms hops, envelope smoothing, adaptive energy gating, local peak prominence, and minimum-gap suppression. It estimates candidate syllable nuclei; it is **not** a trained phoneme recognizer or a clinically validated DDK algorithm. Constant vowels, noise, breaths, weak phonation, and merged syllables can result in missed or extra markers. Quality messages flag low level, clipping, low energy contrast, and absence of distinct pulses. Marker interval variability is descriptive and has no diagnostic cutoff.

The analysis runs in a Web Worker when available, with a local main-thread fallback. Recordings are decoded with Web Audio. A stereo file uses the channel with the highest sampled energy to avoid cancellation between channels. The count and duration use the same selected window, including pauses within that window. Auto-trimming is a suggestion that needs review, not an automatic protocol decision.

Clinical context: [ASHA's acquired apraxia of speech practice portal](https://www.asha.org/Practice-Portal/Clinical-Topics/Acquired-Apraxia-of-Speech/) describes AMR and SMR tasks; [ASHA's dysarthria practice portal](https://www.asha.org/practice-portal/clinical-topics/dysarthria-in-adults/) discusses speed, regularity, and precision. The custom estimator here is not the published Wav2DDK algorithm and does not inherit its validation results.

## iPad, browsers, and privacy

- Use HTTPS or localhost. A phone/tablet visiting another computer's plain HTTP LAN address generally cannot record. Upload and manual entry remain available where recording APIs are unavailable.
- Microphone permission is requested only when the user starts recording. MIME type is chosen using `MediaRecorder.isTypeSupported`, including MP4 for Safari where supported. The default browser recorder is used when no advertised type matches.
- The microphone tracks stop on Stop, auto-stop, recorder error, hidden-page interruption, or leaving the page. Audio does not connect to speakers and is not transmitted to a service.
- Audio and the current unsaved trial are memory-only. Draft saving is optional and off by default. It stores client details, saved trial measurements, observations, and clinical notes in local storage. Use a private device; clear the draft afterward. Exported audio / reports are outside the app's control.
- Install through Safari Share → Add to Home Screen, or a supported desktop browser's install control. Offline app-shell access becomes available after the first successful HTTPS / localhost load. Cache and worker scope are restricted to this directory. Increment the cache version for releases.
- Browser microphone and codec behavior still needs real-device testing; feature detection is not a claim that every iPad / browser combination has been tested.

Technical references: [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), [MediaRecorder MIME support](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static), and [Web Audio decoding](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData).

## Verification

Run `node --test forms/speech/DDK/tests/*.test.cjs` from the repository root. Synthetic pulse tests check algorithm behavior, not clinical accuracy. UI-harness tests check workflow logic, recording cleanup, draft handling, and reports; they do not replace real Safari microphone / codec, touch layout, and print testing.
