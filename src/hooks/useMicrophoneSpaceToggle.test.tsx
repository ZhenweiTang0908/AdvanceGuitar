import { fireEvent, render } from "@testing-library/react";
import { useMicrophoneSpaceToggle } from "./useMicrophoneSpaceToggle";

interface HarnessProps {
  enabled?: boolean;
  state: "idle" | "requesting" | "listening";
  start: () => Promise<void>;
  stop: () => void;
}

function Harness({ enabled = true, state, start, stop }: HarnessProps) {
  useMicrophoneSpaceToggle({ enabled, state, start, stop });
  return <button type="button">保留按钮默认空格行为</button>;
}

describe("useMicrophoneSpaceToggle", () => {
  it("starts on space and stops on the next space", () => {
    const start = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn();
    const { rerender } = render(<Harness state="idle" start={start} stop={stop} />);

    fireEvent.keyDown(window, { code: "Space" });
    expect(start).toHaveBeenCalledTimes(1);

    rerender(<Harness state="listening" start={start} stop={stop} />);
    fireEvent.keyDown(window, { code: "Space" });
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("ignores repeats, modified shortcuts, and interactive targets", () => {
    const start = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn();
    const { getByRole } = render(<Harness state="idle" start={start} stop={stop} />);

    fireEvent.keyDown(window, { code: "Space", repeat: true });
    fireEvent.keyDown(window, { code: "Space", ctrlKey: true });
    fireEvent.keyDown(getByRole("button"), { code: "Space" });

    expect(start).not.toHaveBeenCalled();
    expect(stop).not.toHaveBeenCalled();
  });

  it("does nothing outside microphone exercises", () => {
    const start = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn();
    render(<Harness enabled={false} state="idle" start={start} stop={stop} />);

    fireEvent.keyDown(window, { code: "Space" });

    expect(start).not.toHaveBeenCalled();
  });
});
