import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ExercisePage } from "./ExercisePage";
import { ProgressProvider } from "../progress/ProgressProvider";

describe("ExercisePage keyboard shortcuts", () => {
  it("renders keycap badges on audio buttons and options", () => {
    const { container } = render(
      <ProgressProvider>
        <MemoryRouter initialEntries={["/exercise/day-1-ear"]}>
          <Routes>
            <Route path="exercise/:id" element={<ExercisePage />} />
          </Routes>
        </MemoryRouter>
      </ProgressProvider>
    );

    expect(screen.getByText("播放目标音")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
    const keycaps = container.querySelectorAll(".keycap-badge");
    expect(keycaps.length).toBeGreaterThanOrEqual(2);
  });

  it("supports keyboard response using number keys", () => {
    render(
      <ProgressProvider>
        <MemoryRouter initialEntries={["/exercise/day-1-ear"]}>
          <Routes>
            <Route path="exercise/:id" element={<ExercisePage />} />
          </Routes>
        </MemoryRouter>
      </ProgressProvider>
    );

    // Fire number key '1'
    fireEvent.keyDown(window, { key: "1" });
    // Expect attempt count or next round/feedback to be triggered
    expect(screen.getByText(/已尝试/)).toBeInTheDocument();
  });
});
