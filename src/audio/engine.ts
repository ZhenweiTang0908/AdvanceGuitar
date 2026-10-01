import { frequencyForMidi, type Timbre } from "../types/music";

let sharedContext: AudioContext | undefined;

export function getAudioContext(): AudioContext {
  if (typeof window === "undefined" || !("AudioContext" in window)) {
    throw new Error("当前浏览器不支持 Web Audio API");
  }
  if (!sharedContext || sharedContext.state === "closed") {
    sharedContext = new AudioContext({ latencyHint: "interactive" });
  }
  return sharedContext;
}

export async function resumeAudio(): Promise<void> {
  const context = getAudioContext();
  if (context.state === "suspended") await context.resume();
}

function gainForTimbre(timbre: Timbre, index: number): number {
  if (timbre === "piano") return [1, 0.36, 0.16, 0.08][index] ?? 0;
  if (timbre === "guitar") return [1, 0.28, 0.1, 0.04][index] ?? 0;
  return index === 0 ? 1 : 0;
}

function oscillatorType(timbre: Timbre, index: number): OscillatorType {
  if (timbre === "piano") return index === 0 ? "sine" : "triangle";
  if (timbre === "guitar") return index === 0 ? "triangle" : "sine";
  return "sine";
}

interface PlayToneOptions {
  midi: number;
  timbre: Timbre;
  duration?: number;
  delay?: number;
  volume?: number;
}

export function playTone({ midi, timbre, duration = 0.8, delay = 0, volume = 0.22 }: PlayToneOptions): void {
  const context = getAudioContext();
  const start = context.currentTime + delay;
  const master = context.createGain();
  const attack = timbre === "guitar" ? 0.008 : 0.02;
  const sustain = timbre === "pure" ? duration * 0.82 : duration * 0.42;

  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), start + attack);
  master.gain.exponentialRampToValueAtTime(Math.max(volume * 0.55, 0.0002), start + sustain);
  master.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  master.connect(context.destination);

  const partials = timbre === "pure" ? 1 : timbre === "piano" ? 4 : 3;
  for (let index = 0; index < partials; index += 1) {
    const oscillator = context.createOscillator();
    const partialGain = context.createGain();
    oscillator.type = oscillatorType(timbre, index);
    oscillator.frequency.setValueAtTime(frequencyForMidi(midi) * (index + 1), start);
    partialGain.gain.value = gainForTimbre(timbre, index);
    oscillator.connect(partialGain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }
}

export function playChord(midis: readonly number[], timbre: Timbre = "piano", duration = 1.15, delay = 0): void {
  for (const midi of midis) playTone({ midi, timbre, duration, delay, volume: 0.08 });
}

const CADENCE: readonly (readonly number[])[] = [
  [48, 52, 55],
  [53, 57, 60],
  [55, 59, 62],
  [48, 52, 55],
];

export function playCadence(): void {
  CADENCE.forEach((chord, index) => playChord(chord, "piano", 0.75, index * 0.8));
  playTone({ midi: 60, timbre: "piano", delay: 3.25, duration: 1, volume: 0.18 });
}

export function playTonic(): void {
  playChord([48, 52, 55], "piano", 0.8);
  playTone({ midi: 60, timbre: "piano", delay: 0.85, duration: 0.9, volume: 0.2 });
}

export function playSequence(midis: readonly number[], timbre: Timbre, noteDuration = 0.6, gap = 0.08): number {
  midis.forEach((midi, index) => playTone({ midi, timbre, delay: index * (noteDuration + gap), duration: noteDuration }));
  return midis.length * (noteDuration + gap);
}

export function playTimedSequence(midis: readonly number[], timbre: Timbre, durations: readonly number[]): number {
  let cursor = 0;
  midis.forEach((midi, index) => {
    const duration = durations[index] ?? 0.55;
    playTone({ midi, timbre, delay: cursor, duration });
    cursor += duration + 0.08;
  });
  return cursor;
}

export function playMetronome(bpm: 60 | 72 | 84, beats = 8): void {
  const interval = 60 / bpm;
  for (let index = 0; index < beats; index += 1) {
    playTone({ midi: index % 4 === 0 ? 84 : 79, timbre: "pure", delay: index * interval, duration: 0.06, volume: 0.1 });
  }
}
