import { useCallback, useEffect, useRef, useState } from "react";
import { detectPitch, type DetectedPitch } from "../audio/pitchDetection";
import { useI18n } from "../i18n";

export type MicrophoneState = "idle" | "requesting" | "listening" | "unsupported" | "denied" | "error";

export interface PitchCaptureResult {
  state: MicrophoneState;
  pitch: DetectedPitch | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  stablePitch: DetectedPitch | null;
  consumeStablePitch: () => void;
  suppressDetection: (durationMs: number) => void;
}

export function usePitchCapture(): PitchCaptureResult {
  const { t } = useI18n();
  const [state, setState] = useState<MicrophoneState>("idle");
  const [pitch, setPitch] = useState<DetectedPitch | null>(null);
  const [stablePitch, setStablePitch] = useState<DetectedPitch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const stableFramesRef = useRef(0);
  const requestIdRef = useRef(0);
  const detectionSuppressedUntilRef = useRef(0);

  const stop = useCallback(() => {
    requestIdRef.current += 1;
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
      setError(t("micRequirements"));
      return;
    }
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setState("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      if (requestId !== requestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
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
        if (Date.now() < detectionSuppressedUntilRef.current) {
          stableFramesRef.current = 0;
          setPitch(null);
          setStablePitch(null);
          frameRef.current = requestAnimationFrame(loop);
          return;
        }
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
      if (requestId !== requestIdRef.current) return;
      const reason = caught instanceof Error ? caught.message : "Unknown error";
      const denied = reason.toLowerCase().includes("denied") || reason.toLowerCase().includes("permission");
      setState(denied ? "denied" : "error");
      setError(denied ? t("micDenied") : t("micOpenFailed", { reason }));
    }
  }, [t]);

  const consumeStablePitch = useCallback(() => {
    stableFramesRef.current = 0;
    setStablePitch(null);
  }, []);

  const suppressDetection = useCallback((durationMs: number) => {
    detectionSuppressedUntilRef.current = Date.now() + durationMs;
    stableFramesRef.current = 0;
    setPitch(null);
    setStablePitch(null);
  }, []);

  useEffect(() => stop, [stop]);

  return { state, pitch, stablePitch, error, start, stop, consumeStablePitch, suppressDetection };
}
