import { test } from "@playwright/test";

test("take screenshots fast", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000); // Wait for animations to finish
  await page.screenshot({ path: "C:/Users/HP/.gemini/antigravity-cli/brain/f8c65ab4-ab8e-4bf9-8a8a-5a7395e6df16/homepage.png", fullPage: true });

  await page.goto("/weather.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000); // Wait for animations to finish
  await page.screenshot({ path: "C:/Users/HP/.gemini/antigravity-cli/brain/f8c65ab4-ab8e-4bf9-8a8a-5a7395e6df16/weather.png", fullPage: true });
});
