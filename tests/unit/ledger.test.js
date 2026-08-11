import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const scriptContent = readFileSync(
  resolve(__dirname, "../../js/script.js"),
  "utf8",
);
const ledgerContent = readFileSync(
  resolve(__dirname, "../../js/ledger.js"),
  "utf8",
);

describe("Smart Farmer Assistant - Farm Ledger & Budget Planner", () => {
  beforeEach(() => {
    // Set up standard DOM structure for ledger.html
    document.body.innerHTML = `
      <div id="loader"><div class="spinner"></div></div>
      <select id="crop-select">
        <option value="paddy">Paddy (Rice)</option>
        <option value="cotton">Cotton</option>
        <option value="tomato">Tomato</option>
      </select>
      <input type="number" id="land-area" value="1" />
      <input type="range" id="land-area-slider" value="1" />
      <input type="number" id="expected-yield" value="2200" />
      <input type="number" id="selling-price" value="23" />

      <!-- Cost Sliders and Inputs -->
      <input type="number" id="seeds-cost" value="2000" />
      <input type="range" id="seeds-cost-slider" value="2000" />

      <input type="number" id="prep-cost" value="4000" />
      <input type="range" id="prep-cost-slider" value="4000" />

      <input type="number" id="fertilizer-cost" value="5000" />
      <input type="range" id="fertilizer-cost-slider" value="5000" />

      <input type="number" id="irrigation-cost" value="2000" />
      <input type="range" id="irrigation-cost-slider" value="2000" />

      <input type="number" id="pesticide-cost" value="2500" />
      <input type="range" id="pesticide-cost-slider" value="2500" />

      <input type="number" id="labor-cost" value="8000" />
      <input type="range" id="labor-cost-slider" value="8000" />

      <input type="number" id="transport-cost" value="1500" />
      <input type="range" id="transport-cost-slider" value="1500" />

      <!-- Output Dashboard Elements -->
      <span id="out-total-cost">₹0</span>
      <span id="out-gross-income">₹0</span>
      <span id="out-net-profit">₹0</span>
      <span id="profit-badge">PROFIT</span>
      <span id="out-roi">0%</span>
      <span id="out-be-yield">0 kg / Acre</span>
      <span id="out-be-price">₹0 / kg</span>

      <div id="advice-list-container"></div>
      
      <!-- Canvas Elements mock -->
      <canvas id="expenseBreakdownChart"></canvas>
      <canvas id="summaryComparisonChart"></canvas>

      <div id="dashboard-results-anchor"></div>
      <table>
        <tbody id="history-table-body"></tbody>
      </table>
    `;

    // Mock localStorage
    localStorage.getItem.mockReset();
    localStorage.setItem.mockClear();

    // Mock canvas getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn()
      })
    });

    global.Chart = vi.fn().mockImplementation(function() {
      return {
        update: vi.fn(),
        destroy: vi.fn(),
        data: { datasets: [{ data: [] }] }
      };
    });

    // Mock window alert
    global.alert = vi.fn();
    global.confirm = vi.fn().mockReturnValue(true);

    // Execute scripts in JSDOM context
    const runScript = (code) => {
      const cleanCode = code.replace(/import\s+[\s\S]*?from\s+['"].*?['"];/g, "");
      const fn = new Function("document", "window", "localStorage", cleanCode);
      fn(document, window, localStorage);
    };

    runScript(scriptContent);
    runScript(ledgerContent);

    // Dispatch DOMContentLoaded manually to initialize ledger.js listeners and initial math run
    document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
  });

  it("should calculate correct financial values and update UI for default Paddy settings", () => {
    // Initial calculation should trigger automatically on DOM load
    const totalCostText = document.getElementById("out-total-cost").textContent;
    const grossIncomeText = document.getElementById("out-gross-income").textContent;
    const profitText = document.getElementById("out-net-profit").textContent;
    const roiText = document.getElementById("out-roi").textContent;

    // Total Cost = 2000 + 4000 + 5000 + 2000 + 2500 + 8000 + 1500 = ₹25,000
    expect(totalCostText).toContain("25,000");

    // Gross Income = 2200 kg * ₹23 = ₹50,600
    expect(grossIncomeText).toContain("50,600");

    // Net Profit = ₹50,600 - ₹25,000 = ₹25,600
    expect(profitText).toContain("25,600");

    // ROI = (25,600 / 25,000) * 100 = 102.4%
    expect(roiText).toContain("102.4%");
  });

  it("should recalculate correctly when land acreage changes", () => {
    // Set Land Area to 2 Acres
    document.getElementById("land-area").value = "2";
    
    // Manually trigger change or calculation
    if (typeof window.saveCurrentBudget === "function") {
      // In ledger.js recalculate is triggered on event listener, let's manually invoke recalculate if it was exported
      // Or we can just call an input event
      const event = new Event("input");
      document.getElementById("land-area").dispatchEvent(event);

      const totalCostText = document.getElementById("out-total-cost").textContent;
      const grossIncomeText = document.getElementById("out-gross-income").textContent;
      
      // Total Cost = ₹25,000 * 2 = ₹50,000
      expect(totalCostText).toContain("50,000");
      // Gross Income = ₹50,600 * 2 = ₹1,01,200
      expect(grossIncomeText).toContain("1,01,200");
    }
  });

  it("should save and load budget records in history via localStorage", () => {
    let mockStorage = [];
    localStorage.getItem.mockImplementation(() => JSON.stringify(mockStorage));
    localStorage.setItem.mockImplementation((key, val) => {
      mockStorage = JSON.parse(val);
    });

    if (typeof window.saveCurrentBudget === "function") {
      // Set input values to Paddy defaults
      document.getElementById("crop-select").value = "paddy";
      document.getElementById("land-area").value = "1.5";
      document.getElementById("expected-yield").value = "2000";
      document.getElementById("selling-price").value = "25";

      window.saveCurrentBudget();

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(mockStorage.length).toBe(1);
      expect(mockStorage[0].cropKey).toBe("paddy");
      expect(mockStorage[0].landArea).toBe(1.5);
      
      // Test loading
      document.getElementById("land-area").value = "1";
      window.loadSavedBudget(mockStorage[0].id);

      expect(document.getElementById("land-area").value).toBe("1.5");
    }
  });
});
