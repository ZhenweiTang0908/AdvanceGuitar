import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ExercisePage } from "./ExercisePage";
import { I18nProvider } from "../i18n";
import { ProgressProvider } from "../progress/ProgressProvider";

function renderExercise(path = "/exercise/day-1-fretboard?day=1") {
  return render(
    <I18nProvider>
      <ProgressProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="exercise/:id" element={<ExercisePage />} />
          </Routes>
        </MemoryRouter>
      </ProgressProvider>
    </I18nProvider>,
  );
}

beforeEach(() => localStorage.clear());

describe("ExercisePage", () => {
  it("renders keycap badges on audio buttons and options", () => {
    const { container } = renderExercise("/exercise/day-1-ear?day=1");
    expect(screen.getByText("Play target note")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
    expect(container.querySelectorAll(".keycap-badge").length).toBeGreaterThanOrEqual(2);
  });

  it("supports keyboard response using number keys", () => {
    renderExercise("/exercise/day-1-ear?day=1");
    fireEvent.keyDown(window, { key: "1" });
    expect(screen.getAllByText(/Tried \d+ times/).length).toBeGreaterThan(0);
  });

  it("resumes the round after leaving and offers the next exercise when finished", () => {
    const first = renderExercise();
    const answerCurrent = () => {
      // Try every choice until the round advances.
      const label = screen.getByText(/Round \d+ of 8/).textContent;
      for (const button of screen.getAllByRole("button").filter((element) => element.classList.contains("choice-button"))) {
        if (screen.queryByText(/Round \d+ of 8/)?.textContent !== label) break;
        fireEvent.click(button);
      }
    };
    answerCurrent();
    answerCurrent();
    expect(screen.getByText(/Round 3 of 8/)).toBeInTheDocument();
    first.unmount();

    renderExercise();
    expect(screen.getByText(/Round 3 of 8/)).toBeInTheDocument();
    for (let index = 0; index < 6; index += 1) answerCurrent();
    expect(screen.getByRole("link", { name: /Next exercise/ })).toHaveAttribute("href", "/exercise/day-1-ear?day=1");
  });
});
