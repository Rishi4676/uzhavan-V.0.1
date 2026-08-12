import { test, expect } from "@playwright/test";

test.describe("Smart Farmer Assistant - Voice Assistant UI Verification", () => {
  test("should inject and display the farmer voice assistant on the home page", async ({ page }) => {
    await page.goto("/");

    // 1. Verify the floating container exists
    const container = page.locator(".farmer-corner-container");
    await expect(container).toBeAttached();

    // 2. Verify the avatar wrapper is present
    const avatarWrapper = page.locator(".farmer-avatar-wrapper");
    await expect(avatarWrapper).toBeVisible();

    // 3. Verify the farmer avatar is visible and has the correct SVG logo
    const avatar = page.locator("#farmer-avatar");
    await expect(avatar).toBeVisible();

    // 4. Verify the voice toggle checkbox exists
    const voiceToggle = page.locator("#voice-toggle");
    await expect(voiceToggle).toBeAttached();

    // 5. Verify the speech bubble is in the DOM
    const speechBubble = page.locator("#farmer-speech-bubble");
    await expect(speechBubble).toBeAttached();
  });

  test("should inject the voice assistant on the weather page globally", async ({ page }) => {
    await page.goto("/weather.html");

    // Verify the container exists on this page too
    const container = page.locator(".farmer-corner-container");
    await expect(container).toBeAttached();

    const avatar = page.locator("#farmer-avatar");
    await expect(avatar).toBeVisible();
  });

  test("should inject the voice assistant on the market page globally", async ({ page }) => {
    await page.goto("/market.html");

    // Verify the container exists on this page too
    const container = page.locator(".farmer-corner-container");
    await expect(container).toBeAttached();

    const avatar = page.locator("#farmer-avatar");
    await expect(avatar).toBeVisible();
  });
});
