import { expect, test } from "@playwright/test";

test("opens the first day and enters a practice", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Day 1/ })).toBeVisible();
  await page.getByRole("link", { name: "Start 60-minute session" }).click();
  await expect(page.getByRole("heading", { name: "Fretboard", exact: true })).toBeVisible();
});

test("renders the curriculum overview and mobile navigation", async ({ page }) => {
  await page.goto("/stage/1");
  await expect(page.getByRole("heading", { name: "Connect sound to a small area of the fretboard" })).toBeVisible();
  await expect(page.getByText("Stage overview")).toBeVisible();
  const isMobile = (page.viewportSize()?.width ?? 0) < 760;
  await expect(page.getByRole("navigation", { name: isMobile ? "Mobile navigation" : "Curriculum" })).toBeVisible();
});

test("exposes settings and progress data controls", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await page.locator("nav:visible").getByRole("link", { name: "Progress" }).click();
  await expect(page.getByRole("heading", { name: "Learning progress" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Export JSON/ })).toBeVisible();
});
