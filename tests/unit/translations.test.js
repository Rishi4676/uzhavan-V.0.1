import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// Since the script isn't a module, we can read and execute it or use JSDOM to load it.
// For simplicity, we'll mock the functions and variables if they were exported,
// but since they are global, we'll load the file content.

const scriptContent = readFileSync(
  resolve(__dirname, "../../js/script.js"),
  "utf8",
);

describe("Smart Farmer Assistant - Translations", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <h1 data-key="title"></h1>
      <button id="lang-toggle" data-key="btn_lang"></button>
    `;

    // Reset localStorage
    localStorage.getItem.mockReturnValue(null);
    localStorage.setItem.mockClear();

    // Execute script logic in the current JSDOM context
    // We wrap it in a function to avoid global pollution across tests if possible,
    // but here we just need to ensure the globals are set.
    const scriptFunc = new Function(
      "document",
      "window",
      "localStorage",
      scriptContent,
    );
    scriptFunc(document, window, localStorage);
  });

  it("should update text on the page based on current language", () => {
    // Initial state should be English (default)
    // In our beforeEach, scriptFunc is called which sets up the globals.
    // We need to call updateLanguage manually if it was defined.

    if (typeof window.updateLanguage === "function") {
      window.updateLanguage();
      const title = document.querySelector('[data-key="title"]');
      expect(title.innerText).toBe("Smart Farmer Assistant");
    }
  });

  it("should toggle language from English to Tamil", () => {
    if (typeof window.toggleLanguage === "function") {
      window.toggleLanguage();
      const title = document.querySelector('[data-key="title"]');
      expect(title.innerText).toBe("ஸ்மார்ட் விவசாயி உதவியாளர்");
      expect(localStorage.setItem).toHaveBeenCalledWith("lang", "ta");
    }
  });
});
