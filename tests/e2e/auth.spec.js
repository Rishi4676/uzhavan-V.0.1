import { test, expect } from "@playwright/test";

test.describe("Authentication and Database Flow", () => {
  test("should register a new user and login successfully", async ({ page }) => {
    const randomId = Math.floor(Math.random() * 1000000);
    const testUsername = `user_${randomId}`;
    const testPassword = "Password123!";

    // Listen to browser console messages
    page.on("console", (msg) => {
      console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    page.on("pageerror", (err) => {
      console.error(`[Browser PageError] ${err.message}`);
    });

    page.on("requestfailed", (request) => {
      console.error(`[Browser RequestFailed] ${request.url()}: ${request.failure()?.errorText || "Unknown error"}`);
    });

    page.on("response", (response) => {
      if (response.status() >= 400) {
        console.error(`[Browser Response Error] ${response.url()}: ${response.status()}`);
      }
    });

    // 1. Navigate to Registration Page
    await page.goto("/register.html");

    // Fill registration form
    await page.fill("#reg-name", "Test Farmer");
    await page.fill("#reg-username", testUsername);
    await page.fill("#reg-phone", "9876543210");
    await page.fill("#reg-village", "Test Village");
    await page.fill("#reg-password", testPassword);

    // Intercept standard JavaScript alerts/dialogs
    let alertMsg = "";
    page.on("dialog", async (dialog) => {
      alertMsg = dialog.message();
      console.log(`[Browser Dialog] ${dialog.type().toUpperCase()}: ${alertMsg}`);
      await dialog.accept();
    });

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for the operations and redirection
    await page.waitForTimeout(5000);
    console.log("Registration Alert Message Received:", alertMsg);

    // Expect successful registration and redirection to login
    expect(page.url()).toContain("login.html");

    // 2. Login Page
    await page.goto("/login.html");
    await page.fill("#login-username", testUsername);
    await page.fill("#login-password", testPassword);

    // Click Login
    await page.click('button[type="submit"]');

    // Wait for authentication and redirection to index.html
    await page.waitForTimeout(5000);
    console.log("Login Redirection URL:", page.url());

    // Expect successful redirection to home page
    expect(page.url()).toContain("index.html");

    // Verify localStorage has user session saved correctly
    const userSession = await page.evaluate(() => localStorage.getItem("user"));
    console.log("User session cached:", userSession);
    expect(userSession).not.toBeNull();
    const parsed = JSON.parse(userSession);
    expect(parsed.username).toBe(testUsername);
    expect(parsed.village_name).toBe("Test Village");
  });
});
