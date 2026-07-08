import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const scriptContent = readFileSync(
  resolve(__dirname, "../../js/script.js"),
  "utf8",
);
const marketContent = readFileSync(
  resolve(__dirname, "../../js/market.js"),
  "utf8",
);

describe("Smart Farmer Assistant - Market Page", () => {
  beforeEach(() => {
    // Set up standard DOM structure for market.html
    document.body.innerHTML = `
      <div id="loader"><div class="spinner"></div></div>
      <div id="market-loader" style="display:none;"></div>
      <span id="last-updated-time"></span>
      <select id="district-filter"><option value="">All Districts</option></select>
      <p id="sentiment-detail"></p>
      <p id="market-sentiment"></p>
      <ul id="ai-recommendations-list"></ul>
      <p id="top-crop-val"></p>
      <small id="top-crop-name"></small>
      <p id="active-district-val"></p>
      <p id="avg-price-val"></p>
      <span id="total-crops-count"></span>
      <table id="market-table">
        <tbody id="market-table-body"></tbody>
      </table>
      <select id="sort-filter">
        <option value="none">Sort By: Default</option>
        <option value="price-high">Price: High to Low</option>
        <option value="price-low">Price: Low to High</option>
        <option value="name">Name: A - Z</option>
      </select>
      <input type="text" id="market-search" value="" />

      <!-- Tracker Elements -->
      <p id="tracker-total-income"></p>
      <p id="tracker-total-expenses"></p>
      <p id="tracker-net-profit"></p>
      <div id="tracker-net-profit-card"></div>
      <form id="tracker-form">
        <input type="text" id="tracker-crop" value="" />
        <input type="date" id="tracker-date" value="" />
        <input type="number" id="tracker-income" value="0" />
        <input type="number" id="tracker-seed-cost" value="0" />
        <input type="number" id="tracker-fertilizer-cost" value="0" />
        <input type="number" id="tracker-labor-cost" value="0" />
        <input type="number" id="tracker-transport-cost" value="0" />
        <input type="number" id="tracker-other-cost" value="0" />
      </form>
      <div id="tracker-records-list"></div>
      <div id="monthly-reports-list"></div>
      <button id="sub-tab-btn-logs"></button>
      <button id="sub-tab-btn-reports"></button>
      <div id="tracker-logs-container"></div>
      <div id="tracker-reports-container"></div>

      <!-- Marketplace Elements -->
      <div id="marketplace-listings-grid"></div>
      <input type="text" id="marketplace-search" value="" />
      <select id="marketplace-sort"><option value="newest">Newest</option></select>
      <div id="list-item-modal"></div>
      <form id="marketplace-form">
        <input type="text" id="item-name" />
        <select id="item-category"><option value="crops">Crops</option></select>
        <input type="number" id="item-price" />
        <input type="text" id="item-unit" />
        <input type="text" id="item-quantity" />
        <input type="text" id="item-seller" />
        <input type="tel" id="item-phone" />
        <input type="text" id="item-district" />
        <input type="url" id="item-image" />
        <textarea id="item-desc"></textarea>
      </form>

      <!-- Contact Seller Modal -->
      <div id="contact-seller-modal">
        <div id="contact-product-name"></div>
        <div id="contact-seller-name"></div>
        <div id="contact-product-price"></div>
        <div id="contact-seller-location"></div>
        <textarea id="contact-message"></textarea>
      </div>

      <!-- Tab Content divs -->
      <div id="prices-tab-content" class="tab-content"></div>
      <div id="tracker-tab-content" class="tab-content"></div>
      <div id="marketplace-tab-content" class="tab-content"></div>
      <button id="tab-btn-prices"></button>
      <button id="tab-btn-tracker"></button>
      <button id="tab-btn-marketplace"></button>
    `;

    // Reset localStorage mock
    localStorage.getItem.mockReset();
    localStorage.setItem.mockClear();

    // Execute scripts in JSDOM context
    const runScript = (code) => {
      const fn = new Function("document", "window", "localStorage", code);
      fn(document, window, localStorage);
    };

    runScript(scriptContent);
    runScript(marketContent);
  });

  it("should display offline message and status when backend fetch fails with no cache", async () => {
    // Mock fetch to reject
    global.fetch.mockRejectedValue(new Error("Network Error"));

    // Call fetchMarketData manually
    if (typeof window.refreshMarketData === "function") {
      await window.refreshMarketData();

      // Check that table body shows the offline warning row
      const rows = document.querySelectorAll("#market-table-body tr");
      expect(rows.length).toBe(1);
      expect(rows[0].innerText).toContain("Live Data Temporarily Unavailable");

      // Check that "Live Data Temporarily Unavailable" is displayed when offline
      const lastUpdated = document.getElementById("last-updated-time");
      expect(lastUpdated.innerText).toBe("Live Data Temporarily Unavailable");
    }
  });

  it("should handle Expense Tracker transaction saving and UI updates", () => {
    if (typeof window.saveTrackerRecord === "function") {
      // Load initial tracker data
      window.loadTrackerData();

      // Set input values for a new transaction
      document.getElementById("tracker-crop").value = "Sugarcane";
      document.getElementById("tracker-date").value = "2026-07-07";
      document.getElementById("tracker-income").value = "60000";
      document.getElementById("tracker-seed-cost").value = "5000";
      document.getElementById("tracker-fertilizer-cost").value = "4000";
      document.getElementById("tracker-labor-cost").value = "10000";
      document.getElementById("tracker-transport-cost").value = "3000";
      document.getElementById("tracker-other-cost").value = "1000";

      // Mock event
      const event = { preventDefault: vi.fn() };

      // Save record
      window.saveTrackerRecord(event);

      // Verify that calculateTrackerSummary updated the values
      const incomeEl = document.getElementById("tracker-total-income");
      expect(incomeEl.innerText).toContain("₹");
    }
  });
});
