import { test, expect } from "@playwright/test";

test.describe("Smart Farmer Assistant - E2E Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the home page correctly", async ({ page }) => {
    await expect(page).toHaveTitle(/Smart Farmer Assistant/);
    await expect(page.locator("header h1")).toContainText(/Smart Farmer Assistant/);
  });

  test("should toggle language", async ({ page }) => {
    const langBtn = page.locator("#lang-toggle");
    if (await langBtn.isVisible()) {
      await langBtn.click();
      // Wait for the translation to occur (if it's instant or has transition)
      await expect(page.locator("header h1")).toContainText(
        /ஸ்மார்ட் விவசாயி உதவியாளர்/,
      );
    }
  });

  test("should open chatbot", async ({ page }) => {
    const chatbotToggle = page.locator('button:has-text("Ask FarmerBot")');
    if (await chatbotToggle.isVisible()) {
      await chatbotToggle.click();
      const chatbotBox = page.locator("#chatbot-box");
      await expect(chatbotBox).not.toHaveClass(/chatbot-hidden/);
    }
  });
});
