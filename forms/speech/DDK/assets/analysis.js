/* Local syllable-pulse estimation. No phoneme recognition or normative scoring. */
(function (root) {
  'use strict';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const VERSION = 'energy-pulses-1';
  function percentile(values, fraction) {
    const sorted = Array.from(values).sort((a, b) => a - b);
    return sorted[Math.floor((sorted.length - 1) * fraction)] || 0;
  }
  function analyze(samples, sampleRate, options = {}) {
    if (!(samples instanceof Float32Array) || !Number.isFinite(sampleRate) || sampleRate < 8000 || sampleRate > 192000) throw Error('invalidAudio');
    const duration = samples.length / sampleRate;
    if (duration < 0.1 || duration > 60.05) throw Error('audioLength');
    const start = clamp(Number(options.start) || 0, 0, duration);
    const end = options.end === undefined ? duration : clamp(Number(options.end), 0, duration);
    if (!Number.isFinite(end) || end - start < 0.1) throw Error('invalidWindow');
    const sensitivity = clamp(Number(options.sensitivity) || 50, 1, 100);
    const minGap = clamp(Number(options.minGap) || 90, 60, 300) / 1000;
    // First-order band limits emphasize vowel energy while suppressing low rumble.
    const highPass = Math.exp(-2 * Math.PI * 150 / sampleRate);
    const lowPass = 1 - Math.exp(-2 * Math.PI * 1800 / sampleRate);
    const hop = Math.max(1, Math.round(sampleRate * 0.005));
    const frame = Math.max(hop, Math.round(sampleRate * 0.02));
    const energies = new Float32Array(Math.ceil(samples.length / hop));
    const power = new Float64Array(samples.length + 1);
    let previous = 0, hp = 0, lp = 0, clipped = 0;
    for (let i = 0; i < samples.length; i++) {
      const x = Number.isFinite(samples[i]) ? samples[i] : 0;
      if (Math.abs(x) >= 0.98) clipped++;
      hp = highPass * (hp + x - previous); previous = x;
      lp += lowPass * (hp - lp);
      power[i + 1] = power[i] + lp * lp;
    }
    for (let i = 0; i < energies.length; i++) {
      const mid = i * hop, left = Math.max(0, mid - Math.floor(frame / 2)), right = Math.min(samples.length, mid + Math.ceil(frame / 2));
      energies[i] = Math.sqrt(Math.max(0, power[right] - power[left]) / Math.max(1, right - left));
    }
    const envelope = new Float32Array(energies.length);
    for (let i = 0; i < energies.length; i++) {
      let sum = 0, n = 0;
      for (let j = Math.max(0, i - 2); j <= Math.min(energies.length - 1, i + 2); j++) { sum += energies[j]; n++; }
      envelope[i] = sum / n;
    }
    const first = Math.ceil(start * sampleRate / hop), last = Math.min(envelope.length - 1, Math.floor(end * sampleRate / hop));
    const region = envelope.slice(first, last + 1);
    const peak = Math.max(...region), floor = percentile(region, 0.2);
    const threshold = Math.max(0.0015, floor + (peak - floor) * (0.52 - sensitivity * 0.004));
    const prominenceLimit = Math.max(peak * (0.18 - sensitivity * 0.001), 0.001);
    const radius = Math.max(6, Math.round(Math.max(0.06, minGap * 0.8) * sampleRate / hop));
    const candidates = [];
    let activeStart = null, activeEnd = null;
    for (let i = first; i <= last; i++) {
      if (envelope[i] >= threshold) {
        if (activeStart === null) activeStart = i * hop / sampleRate;
        activeEnd = i * hop / sampleRate;
      }
      const height = envelope[i];
      if (height < threshold || height < (envelope[i - 1] || 0) || height <= (envelope[i + 1] || 0)) continue;
      let leftMin = height, rightMin = height;
      for (let j = Math.max(first, i - radius); j < i; j++) leftMin = Math.min(leftMin, envelope[j]);
      for (let j = i + 1; j <= Math.min(last, i + radius); j++) rightMin = Math.min(rightMin, envelope[j]);
      if (i - first < 2) leftMin = 0;
      if (last - i < 2) rightMin = 0;
      if (height - Math.max(leftMin, rightMin) >= prominenceLimit) candidates.push({ time: i * hop / sampleRate, height });
    }
    const kept = [];
    candidates.sort((a, b) => b.height - a.height).forEach(candidate => {
      if (kept.every(point => Math.abs(point.time - candidate.time) >= minGap)) kept.push(candidate);
    });
    const markers = kept.map(point => point.time).sort((a, b) => a - b);
    const waveform = new Float32Array(1000);
    let maxAbs = 0;
    for (let i = 0; i < samples.length; i++) {
      const value = Number.isFinite(samples[i]) ? Math.abs(samples[i]) : 0;
      const bin = Math.min(999, Math.floor(i * 1000 / samples.length));
      waveform[bin] = Math.max(waveform[bin], value); maxAbs = Math.max(maxAbs, value);
    }
    if (maxAbs) for (let i = 0; i < waveform.length; i++) waveform[i] /= maxAbs;
    const warnings = [];
    if (maxAbs < 0.01) warnings.push('quietAudio');
    if (clipped / samples.length > 0.001) warnings.push('clippedAudio');
    if (!markers.length) warnings.push('noPulses');
    if (floor > peak * 0.6 && peak > 0.003) warnings.push('lowContrast');
    return {
      version: VERSION, duration, markers, waveform, warnings, threshold, window: { start, end },
      suggestedStart: activeStart === null ? start : Math.max(start, activeStart - 0.04),
      suggestedEnd: activeEnd === null ? end : Math.min(end, activeEnd + 0.04),
      parameters: { sensitivity, minGap: minGap * 1000 }
    };
  }
  function measurement(count, seconds, sequences = null) {
    if (!['string','number'].includes(typeof count) || !['string','number'].includes(typeof seconds) || String(count).trim() === '' || String(seconds).trim() === '') return null;
    const n = Number(count), d = Number(seconds);
    if (count === '' || seconds === '' || !Number.isSafeInteger(n) || n < 0 || !Number.isFinite(d) || d < 0.1 || d > 60) return null;
    let cycles = null;
    if (sequences !== null && sequences !== '') {
      cycles = Number(sequences);
      if (!Number.isSafeInteger(cycles) || cycles < 0 || cycles * 3 > n) return null;
    }
    return { count: n, duration: d, rate: n / d, sequences: cycles, sequenceRate: cycles === null ? null : cycles / d };
  }
  function intervalStats(markers) {
    if (markers.length < 3) return null;
    const intervals = markers.slice(1).map((time, index) => time - markers[index]);
    const mean = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
    const deviation = Math.sqrt(intervals.reduce((sum, value) => sum + (value - mean) ** 2, 0) / intervals.length);
    return mean > 0 ? { meanMs: mean * 1000, cvPercent: deviation / mean * 100 } : null;
  }
  function recorderOptions(Recorder) {
    const types = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];
    const mimeType = types.find(type => typeof Recorder.isTypeSupported === 'function' && Recorder.isTypeSupported(type));
    return mimeType ? { mimeType } : {};
  }
  const api = { analyze, measurement, intervalStats, recorderOptions, VERSION };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DDKAnalysis = api;
})(globalThis);
