export interface DetectedPitch {
  frequency: number;
  midi: number;
  cents: number;
}

export function detectPitch(samples: Float32Array, sampleRate: number): DetectedPitch | null {
  let rms = 0;
  for (const sample of samples) rms += sample * sample;
  rms = Math.sqrt(rms / samples.length);
  if (rms < 0.01) return null;

  const minLag = Math.floor(sampleRate / 1000);
  const maxLag = Math.floor(sampleRate / 70);
  let bestLag = -1;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    for (let index = 0; index < samples.length - lag; index += 1) {
      correlation += samples[index] * samples[index + lag];
    }
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  if (bestLag < 0) return null;
  const frequency = sampleRate / bestLag;
  if (frequency < 70 || frequency > 1000) return null;
  const midiFloat = 69 + 12 * Math.log2(frequency / 440);
  const midi = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midi) * 100);
  return { frequency, midi, cents };
}

export function isWithinTolerance(pitch: DetectedPitch, expectedMidi: number, toleranceCents = 40): boolean {
  return pitch.midi === expectedMidi && Math.abs(pitch.cents) <= toleranceCents;
}
