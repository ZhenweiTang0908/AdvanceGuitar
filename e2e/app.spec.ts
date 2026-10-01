import { expect, test } from "@playwright/test";

test("opens the first day and enters a practice", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /第 1 天/ })).toBeVisible();
  await page.getByRole("link", { name: /指板定位/ }).first().click();
  await expect(page.getByRole("heading", { name: "指板定位" })).toBeVisible();
  await expect(page.getByText(/第 1 \/ 8 题/)).toBeVisible();
});

test("renders the curriculum overview and mobile navigation", async ({ page }) => {
  await page.goto("/stage/1");
  await expect(page.getByRole("heading", { name: "把声音连接到一小块指板" })).toBeVisible();
  await expect(page.getByText("第一阶段总览")).toBeVisible();
  const navigationName = (page.viewportSize()?.width ?? 0) < 760 ? "移动端主导航" : "主导航";
  await expect(page.getByRole("navigation", { name: navigationName })).toBeVisible();
});

test("exposes settings and progress data controls", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "设置" })).toBeVisible();
  await page.getByRole("link", { name: "进度" }).first().click();
  await expect(page.getByRole("heading", { name: "学习进度" })).toBeVisible();
  await expect(page.getByRole("button", { name: /导出 JSON/ })).toBeVisible();
});
