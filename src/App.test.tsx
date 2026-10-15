import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    expect(screen.getByRole("heading", { name: /第 1 天 · 建立 C、E、G 的声音坐标/ })).toBeInTheDocument();
  });

  it("opens the first-stage curriculum route", () => {
    renderAt("/stage/1");
    expect(screen.getByRole("heading", { name: "把声音连接到一小块指板" })).toBeInTheDocument();
  });

  it("lets learners manually switch days and advances after saving a reflection", async () => {
    const user = userEvent.setup();
    renderAt("/day/1");

    expect(screen.getByRole("link", { name: "下一天" })).toHaveAttribute("href", "/day/2");

    await user.type(screen.getByRole("textbox", { name: "练习内容" }), "二弦五音定位");
    await user.clear(screen.getByRole("spinbutton", { name: "用时（分钟）" }));
    await user.type(screen.getByRole("spinbutton", { name: "用时（分钟）" }), "60");
    await user.type(screen.getByRole("textbox", { name: "主要难点" }), "定位 E 需要更多练习");
    await user.click(screen.getByRole("button", { name: "保存备注" }));

    expect(await screen.findByRole("heading", { name: "用方向修正代替碰运气" })).toBeInTheDocument();
  });
});
