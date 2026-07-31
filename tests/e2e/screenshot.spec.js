import { test } from "@playwright/test";

test("take screenshots fast", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000); // Wait for animations to finish
  await page.screenshot({ path: "./tests/screenshots/homepage.png", fullPage: true });

  await page.goto("/weather.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000); // Wait for animations to finish
  await page.screenshot({ path: "./tests/screenshots/weather.png", fullPage: true });
});
