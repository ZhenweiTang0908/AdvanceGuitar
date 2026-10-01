import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "./App";
import { ProgressProvider } from "./progress/ProgressProvider";

function renderAt(path: string) {
  return render(
    <ProgressProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ProgressProvider>,
  );
}

describe("application routes", () => {
  it("starts at the daily practice overview", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: "第 1 天 · 建立 C、E、G 的声音坐标" })).toBeInTheDocument();
  });

  it("opens the first-stage curriculum route", () => {
    renderAt("/stage/1");
    expect(screen.getByRole("heading", { name: "把声音连接到一小块指板" })).toBeInTheDocument();
  });
});
