'use strict';
importScripts('./analysis.js');
self.onmessage = event => {
  try {
    const { samples, sampleRate, options, id } = event.data;
    const result = DDKAnalysis.analyze(new Float32Array(samples), sampleRate, options);
    self.postMessage({ id, result }, [result.waveform.buffer]);
  } catch (error) { self.postMessage({ id: event.data.id, error: error.message }); }
};
