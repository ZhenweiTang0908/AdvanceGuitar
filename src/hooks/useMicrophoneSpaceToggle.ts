import { useEffect } from "react";
import type { MicrophoneState } from "./usePitchCapture";

interface MicrophoneSpaceToggleOptions {
  enabled: boolean;
  state: MicrophoneState;
  start: () => Promise<void>;
  stop: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target.tagName);
}

export function useMicrophoneSpaceToggle({ enabled, state, start, stop }: MicrophoneSpaceToggleOptions): void {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.code !== "Space"
        || event.repeat
        || event.defaultPrevented
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
        || isEditableTarget(event.target)
      ) return;

      event.preventDefault();
      if (state === "listening" || state === "requesting") stop();
      else void start();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, start, state, stop]);
}
