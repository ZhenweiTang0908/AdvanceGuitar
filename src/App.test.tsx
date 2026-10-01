import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "./App";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("application routes", () => {
  it("starts at the daily practice overview", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: "今天继续" })).toBeInTheDocument();
  });

  it("opens the first-stage curriculum route", () => {
    renderAt("/stage/1");
    expect(screen.getByRole("heading", { name: "第一阶段" })).toBeInTheDocument();
  });
});
