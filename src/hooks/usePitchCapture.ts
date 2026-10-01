import { useCallback, useEffect, useRef, useState } from "react";
import { detectPitch, type DetectedPitch } from "../audio/pitchDetection";

type MicrophoneState = "idle" | "requesting" | "listening" | "unsupported" | "denied" | "error";

interface PitchCaptureResult {
  state: MicrophoneState;
  pitch: DetectedPitch | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  stablePitch: DetectedPitch | null;
  consumeStablePitch: () => void;
}

export function usePitchCapture(): PitchCaptureResult {
  const [state, setState] = useState<MicrophoneState>("idle");
  const [pitch, setPitch] = useState<DetectedPitch | null>(null);
  const [stablePitch, setStablePitch] = useState<DetectedPitch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const stableFramesRef = useRef(0);

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void contextRef.current?.close();
    contextRef.current = null;
    stableFramesRef.current = 0;
    setState("idle");
    setPitch(null);
    setStablePitch(null);
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) {
      setState("unsupported");
      setError("麦克风识别需要 localhost 或 HTTPS，以及支持 Web Audio 的浏览器。");
      return;
    }
    setState("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const context = new AudioContext();
      await context.resume();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      streamRef.current = stream;
      contextRef.current = context;
      const samples = new Float32Array(analyser.fftSize);
      setState("listening");

      const loop = () => {
        analyser.getFloatTimeDomainData(samples);
        const detected = detectPitch(samples, context.sampleRate);
        setPitch(detected);
        if (detected) {
          stableFramesRef.current += 1;
          if (stableFramesRef.current >= 8) setStablePitch(detected);
        } else {
          stableFramesRef.current = 0;
        }
        frameRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "无法打开麦克风";
      setState(message.toLowerCase().includes("denied") || message.toLowerCase().includes("permission") ? "denied" : "error");
      setError(message);
    }
  }, []);

  const consumeStablePitch = useCallback(() => {
    stableFramesRef.current = 0;
    setStablePitch(null);
  }, []);

  useEffect(() => stop, [stop]);

  return { state, pitch, stablePitch, error, start, stop, consumeStablePitch };
}
