import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "./App";
import { I18nProvider } from "./i18n";
import { ProgressProvider } from "./progress/ProgressProvider";
import { STORAGE_KEY, createEmptySnapshot } from "./progress/logic";
import { getExercisesForDay } from "./data/exercises";

function renderAt(path: string) {
  return render(
    <I18nProvider>
      <ProgressProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </ProgressProvider>
    </I18nProvider>,
  );
}

beforeEach(() => localStorage.clear());

describe("application routes", () => {
  it("starts at the daily practice overview", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: /Day 1 · Map the sounds of C, E, and G/ })).toBeInTheDocument();
  });

  it("remembers progress: home resumes at the first unfinished day after a reload", () => {
    const snapshot = createEmptySnapshot();
    snapshot.results = getExercisesForDay(1).flatMap((exercise) => Array.from({ length: exercise.rounds }, (_, index) => ({
      id: `${exercise.id}-${index}`, exerciseId: exercise.id, day: 1, skill: exercise.skill, correct: true, attempts: 1, durationMs: 1000, createdAt: new Date().toISOString(),
    })));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    renderAt("/");
    expect(screen.getByRole("heading", { name: /Day 2 · Correct by direction instead of guessing/ })).toBeInTheDocument();
  });

  it("opens the first-stage curriculum route", () => {
    renderAt("/stage/1");
    expect(screen.getByRole("heading", { name: "Connect sound to a small area of the fretboard" })).toBeInTheDocument();
  });

  it("links to the next day and shows no reflection form", () => {
    renderAt("/day/1");
    expect(screen.getByRole("link", { name: /Next day/ })).toHaveAttribute("href", "/day/2");
    expect(screen.queryByRole("button", { name: "Save notes" })).not.toBeInTheDocument();
  });
});
