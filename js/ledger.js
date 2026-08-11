/**
 * Smart Farmer Assistant - Farm Expense & Profit Planner (Farm Ledger)
 * Integrates interactive calculations, Chart.js visualizations, LocalStorage,
 * and context-aware agricultural financial advice in English & Tamil.
 */

// --- 1. DEFAULT DATASETS ---
const CROP_FINANCIAL_DEFAULTS = {
  paddy: {
    name: "Paddy (Rice)",
    taName: "நெல் (அரிசி)",
    yield: 2200, // kg/Acre
    price: 23, // INR/kg
    costs: {
      seeds: 2000,
      prep: 4000,
      fertilizer: 5000,
      irrigation: 2000,
      pesticide: 2500,
      labor: 8000,
      transport: 1500
    }
  },
  cotton: {
    name: "Cotton",
    taName: "பруத்தி",
    yield: 800,
    price: 70,
    costs: {
      seeds: 2500,
      prep: 3500,
      fertilizer: 6000,
      irrigation: 1500,
      pesticide: 5000,
      labor: 10000,
      transport: 2000
    }
  },
  tomato: {
    name: "Tomato",
    taName: "தக்காளி",
    yield: 10000,
    price: 15,
    costs: {
      seeds: 5000,
      prep: 5000,
      fertilizer: 10000,
      irrigation: 4000,
      pesticide: 8000,
      labor: 12000,
      transport: 6000
    }
  },
  sugarcane: {
    name: "Sugarcane",
    taName: "கரும்பு",
    yield: 35000,
    price: 3.2,
    costs: {
      seeds: 10000,
      prep: 6000,
      fertilizer: 12000,
      irrigation: 8000,
      pesticide: 4000,
      labor: 18000,
      transport: 5000
    }
  },
  wheat: {
    name: "Wheat",
    taName: "கோதுமை",
    yield: 1800,
    price: 22,
    costs: {
      seeds: 2000,
      prep: 3500,
      fertilizer: 4500,
      irrigation: 3000,
      pesticide: 1500,
      labor: 5000,
      transport: 1500
    }
  },
  maize: {
    name: "Maize (Corn)",
    taName: "சோளம் (மக்காச்சோளம்)",
    yield: 2500,
    price: 20,
    costs: {
      seeds: 2200,
      prep: 4000,
      fertilizer: 5500,
      irrigation: 2500,
      pesticide: 2000,
      labor: 6000,
      transport: 1800
    }
  },
  chilli: {
    name: "Chilli",
    taName: "மிளகாய்",
    yield: 1500,
    price: 120,
    costs: {
      seeds: 4000,
      prep: 4500,
      fertilizer: 8000,
      irrigation: 3500,
      pesticide: 6000,
      labor: 14000,
      transport: 3000
    }
  }
};

// State Variables
let expenseChart = null;
let summaryChart = null;
let activeLang = localStorage.getItem("lang") || "en";

// --- 2. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  activeLang = localStorage.getItem("lang") || "en";
  initEventListeners();
  loadCropDefaults();
  renderHistory();
  recalculate();
});

// Event Listeners Setup
function initEventListeners() {
  // Sync inputs and sliders
  const syncElements = [
    { input: "land-area", slider: "land-area-slider" },
    { input: "seeds-cost", slider: "seeds-cost-slider" },
    { input: "prep-cost", slider: "prep-cost-slider" },
    { input: "fertilizer-cost", slider: "fertilizer-cost-slider" },
    { input: "irrigation-cost", slider: "irrigation-cost-slider" },
    { input: "pesticide-cost", slider: "pesticide-cost-slider" },
    { input: "labor-cost", slider: "labor-cost-slider" },
    { input: "transport-cost", slider: "transport-cost-slider" }
  ];

  syncElements.forEach(({ input, slider }) => {
    const inputEl = document.getElementById(input);
    const sliderEl = document.getElementById(slider);

    if (inputEl && sliderEl) {
      inputEl.addEventListener("input", (e) => {
        sliderEl.value = e.target.value;
        recalculate();
      });
      sliderEl.addEventListener("input", (e) => {
        inputEl.value = e.target.value;
        recalculate();
      });
    }
  });

  // Basic fields trigger recalculate
  const triggerFields = ["crop-select", "expected-yield", "selling-price"];
  triggerFields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        if (id === "crop-select") {
          loadCropDefaults();
        }
        recalculate();
      });
    }
  });
}

// Load default numbers based on crop
function loadCropDefaults() {
  const cropKey = document.getElementById("crop-select").value;
  const cropData = CROP_FINANCIAL_DEFAULTS[cropKey];
  if (!cropData) return;

  document.getElementById("expected-yield").value = cropData.yield;
  document.getElementById("selling-price").value = cropData.price;

  // Costs
  document.getElementById("seeds-cost").value = cropData.costs.seeds;
  document.getElementById("seeds-cost-slider").value = cropData.costs.seeds;

  document.getElementById("prep-cost").value = cropData.costs.prep;
  document.getElementById("prep-cost-slider").value = cropData.costs.prep;

  document.getElementById("fertilizer-cost").value = cropData.costs.fertilizer;
  document.getElementById("fertilizer-cost-slider").value = cropData.costs.fertilizer;

  document.getElementById("irrigation-cost").value = cropData.costs.irrigation;
  document.getElementById("irrigation-cost-slider").value = cropData.costs.irrigation;

  document.getElementById("pesticide-cost").value = cropData.costs.pesticide;
  document.getElementById("pesticide-cost-slider").value = cropData.costs.pesticide;

  document.getElementById("labor-cost").value = cropData.costs.labor;
  document.getElementById("labor-cost-slider").value = cropData.costs.labor;

  document.getElementById("transport-cost").value = cropData.costs.transport;
  document.getElementById("transport-cost-slider").value = cropData.costs.transport;
}

// --- 3. CORE CALCULATION LOGIC ---
function recalculate() {
  const landArea = parseFloat(document.getElementById("land-area").value) || 0.1;
  const yieldPerAcre = parseFloat(document.getElementById("expected-yield").value) || 0;
  const pricePerKg = parseFloat(document.getElementById("selling-price").value) || 0;

  // Categorized Costs (per acre)
  const seedsCost = parseFloat(document.getElementById("seeds-cost").value) || 0;
  const prepCost = parseFloat(document.getElementById("prep-cost").value) || 0;
  const fertilizerCost = parseFloat(document.getElementById("fertilizer-cost").value) || 0;
  const irrigationCost = parseFloat(document.getElementById("irrigation-cost").value) || 0;
  const pesticideCost = parseFloat(document.getElementById("pesticide-cost").value) || 0;
  const laborCost = parseFloat(document.getElementById("labor-cost").value) || 0;
  const transportCost = parseFloat(document.getElementById("transport-cost").value) || 0;

  const costPerAcre = seedsCost + prepCost + fertilizerCost + irrigationCost + pesticideCost + laborCost + transportCost;
  const totalCost = costPerAcre * landArea;

  const totalYield = yieldPerAcre * landArea;
  const grossIncome = totalYield * pricePerKg;
  const netProfit = grossIncome - totalCost;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  // Break-even
  const breakEvenYield = pricePerKg > 0 ? costPerAcre / pricePerKg : 0;
  const breakEvenPrice = yieldPerAcre > 0 ? costPerAcre / yieldPerAcre : 0;

  // Update UI Elements
  document.getElementById("out-total-cost").textContent = formatCurrency(totalCost);
  document.getElementById("out-gross-income").textContent = formatCurrency(grossIncome);
  
  const profitEl = document.getElementById("out-net-profit");
  const profitBadge = document.getElementById("profit-badge");
  profitEl.textContent = formatCurrency(netProfit);

  if (netProfit >= 0) {
    profitEl.className = "metric-value profit-color";
    profitBadge.textContent = activeLang === "ta" ? "இலாபம்" : "PROFIT";
    profitBadge.className = "sentiment-badge bullish";
  } else {
    profitEl.className = "metric-value loss-color";
    profitBadge.textContent = activeLang === "ta" ? "நஷ்டம்" : "LOSS";
    profitBadge.className = "sentiment-badge bearish";
  }

  const roiEl = document.getElementById("out-roi");
  roiEl.textContent = `${roi.toFixed(1)}%`;
  if (roi >= 0) {
    roiEl.className = "metric-value profit-color";
  } else {
    roiEl.className = "metric-value loss-color";
  }

  // Break Even
  document.getElementById("out-be-yield").textContent = `${breakEvenYield.toFixed(0)} kg / Acre`;
  document.getElementById("out-be-price").textContent = `${formatCurrency(breakEvenPrice)} / kg`;

  // Draw Charts
  updateCharts({
    seeds: seedsCost,
    prep: prepCost,
    fertilizer: fertilizerCost,
    irrigation: irrigationCost,
    pesticide: pesticideCost,
    labor: laborCost,
    transport: transportCost
  }, totalCost, grossIncome, netProfit);

  // Generate Recommendations
  generateAdvice({
    seeds: seedsCost,
    prep: prepCost,
    fertilizer: fertilizerCost,
    irrigation: irrigationCost,
    pesticide: pesticideCost,
    labor: laborCost,
    transport: transportCost,
    total: costPerAcre,
    roi: roi,
    yield: yieldPerAcre,
    price: pricePerKg
  });
}

function formatCurrency(val) {
  return "₹" + val.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

// --- 4. VISUAL CHARTING LOGIC ---
function updateCharts(costs, totalCost, grossIncome, netProfit) {
  const chartLabels = activeLang === "ta" 
    ? ["விதை & விதைப்பு", "நிலம் தயாரித்தல்", "உரங்கள்", "நீர் & பாசனம்", "பூச்சி மருந்து", "விவசாய கூலி", "போக்குவரத்து"]
    : ["Seeds & Sowing", "Land Preparation", "Fertilizers", "Water & Irrigation", "Pesticides", "Labor & Harvesting", "Transport & Storage"];

  const costValues = [costs.seeds, costs.prep, costs.fertilizer, costs.irrigation, costs.pesticide, costs.labor, costs.transport];

  // 1. Expense Breakdown Doughnut
  const ctxExpense = document.getElementById("expenseBreakdownChart").getContext("2d");
  if (expenseChart) {
    expenseChart.data.labels = chartLabels;
    expenseChart.data.datasets[0].data = costValues;
    expenseChart.update();
  } else {
    expenseChart = new Chart(ctxExpense, {
      type: "doughnut",
      data: {
        labels: chartLabels,
        datasets: [{
          data: costValues,
          backgroundColor: [
            "#4caf50", // Seeds
            "#ff9800", // Prep
            "#2196f3", // Fertilizers
            "#00bcd4", // Irrigation
            "#f44336", // Pesticides
            "#9c27b0", // Labor
            "#795548"  // Transport
          ],
          borderWidth: 2,
          borderColor: "#fff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              font: { family: "Inter", size: 11 }
            }
          }
        }
      }
    });
  }

  // 2. Budget Comparison Bar Chart
  const ctxSummary = document.getElementById("summaryComparisonChart").getContext("2d");
  const comparisonLabels = activeLang === "ta"
    ? ["மொத்த செலவு", "வருவாய்", "நிகர இலாபம்/நஷ்டம்"]
    : ["Total Cost", "Gross Income", "Net Profit/Loss"];

  if (summaryChart) {
    summaryChart.data.labels = comparisonLabels;
    summaryChart.data.datasets[0].data = [totalCost, grossIncome, netProfit];
    summaryChart.data.datasets[0].backgroundColor = [
      "#f44336", // red for cost
      "#2196f3", // blue for income
      netProfit >= 0 ? "#4caf50" : "#ff5722" // green/orange for profit/loss
    ];
    summaryChart.update();
  } else {
    summaryChart = new Chart(ctxSummary, {
      type: "bar",
      data: {
        labels: comparisonLabels,
        datasets: [{
          label: activeLang === "ta" ? "மதிப்பு (₹)" : "Value (INR)",
          data: [totalCost, grossIncome, netProfit],
          backgroundColor: [
            "#f44336",
            "#2196f3",
            netProfit >= 0 ? "#4caf50" : "#ff5722"
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return "₹" + value.toLocaleString("en-IN");
              }
            }
          }
        }
      }
    });
  }
}

// --- 5. AGRICULTURAL FINANCIAL FINANCIAL ADVICE ENGINE ---
function generateAdvice(data) {
  const adviceList = [];
  const lang = activeLang;

  // Ratio Thresholds
  const fertRatio = data.fertilizer / data.total;
  const pestRatio = data.pesticide / data.total;
  const laborRatio = data.labor / data.total;
  const waterRatio = data.irrigation / data.total;

  if (lang === "ta") {
    // Tamil Advice
    if (data.roi < 0) {
      adviceList.push({
        type: "danger",
        text: "<strong>எச்சரிக்கை:</strong> உங்கள் முதலீட்டு வருவாய் (ROI) எதிர்மறையாக உள்ளது. கூலிச் செலவைக் குறைக்க இயந்திரங்களைப் பயன்படுத்துங்கள் அல்லது உங்கள் பகுதியில் அதிக தேவை மற்றும் நல்ல சந்தை விலை உள்ள மாற்றுப் பயிர்களைப் பற்றி யோசியுங்கள்."
      });
    } else if (data.roi < 20) {
      adviceList.push({
        type: "warning",
        text: "<strong>மிதமான இலாபம்:</strong> தற்போதைய பட்ஜெட் குறைந்த லாபத்தைக் காட்டுகிறது. விளைச்சலை அதிகரிக்க சிறந்த விதை ரகங்களைப் பயன்படுத்துவதுடன், செலவைக் குறைக்க இயற்கை உரங்களைச் சேர்க்கவும்."
      });
    } else {
      adviceList.push({
        type: "success",
        text: "<strong>சிறந்த பட்ஜெட்:</strong> இந்த விவசாய முறை நல்ல லாபத்தை அளிக்கும். இலாபத்தைப் பாதுகாக்க பயிர் காப்பீடு செய்து கொள்ளுங்கள்."
      });
    }

    if (fertRatio > 0.25) {
      adviceList.push({
        type: "info",
        text: "<strong>உர மேலாண்மை:</strong> உங்கள் மொத்த பட்ஜெட்டில் 25%-க்கும் மேல் உரங்களுக்குச் செலவாகிறது. மண் பரிசோதனை செய்து தேவையான அளவு இரசாயன உரங்களை மட்டும் போடவும். உரம் விரயமாவதைத் தடுக்க தொழு உரம் மற்றும் பசுந்தாள் உரங்களை அதிகம் பயன்படுத்துங்கள்."
      });
    }

    if (pestRatio > 0.20) {
      adviceList.push({
        type: "info",
        text: "<strong>பூச்சி கட்டுப்பாடு:</strong> பூச்சிக்கொல்லி செலவுகள் அதிகமாக உள்ளன. செலவைக் குறைக்க ஒருங்கிணைந்த பூச்சி மேலாண்மை (IPM) முறையைப் பின்பற்றுங்கள். வேப்ப எண்ணெய் கரைசல் போன்ற இயற்கை பூச்சி விரட்டிகளைப் பயன்படுத்தலாம்."
      });
    }

    if (waterRatio > 0.15) {
      adviceList.push({
        type: "info",
        text: "<strong>நீர் மேலாண்மை:</strong> நீர் பாசனத்திற்கு அதிக செலவு ஏற்படுகிறது. சொட்டு நீர் பாசனம் அமைப்பதன் மூலம் 40% வரை தண்ணீரைச் சேமிக்கலாம். இதற்குத் தமிழக அரசு வழங்கும் 100% வரையிலான மானியங்களைப் பயன்படுத்திக் கொள்ளுங்கள்."
      });
    }

    if (laborRatio > 0.35) {
      adviceList.push({
        type: "info",
        text: "<strong>விவசாயக் கூலி:</strong> கூலிச் செலவு அதிகமாக உள்ளது. உழுதல், களை எடுத்தல் மற்றும் அறுவடை செய்ய வாடகை இயந்திரங்கள் அல்லது சிறு கருவிகளைப் பயன்படுத்துவது செலவை வெகுவாகக் குறைக்கும்."
      });
    }
  } else {
    // English Advice
    if (data.roi < 0) {
      adviceList.push({
        type: "danger",
        text: "<strong>Alert:</strong> Your Return on Investment (ROI) is negative. Consider mechanization to reduce high labor costs, or explore alternative high-value crop options with better local market rates."
      });
    } else if (data.roi < 20) {
      adviceList.push({
        type: "warning",
        text: "<strong>Tight Margins:</strong> The current projection shows low profitability. Optimize costs, apply nutrients based strictly on soil health tests, and use certified high-yielding seeds to raise production."
      });
    } else {
      adviceList.push({
        type: "success",
        text: "<strong>Healthy Outlook:</strong> Your budget shows strong financial viability! We recommend enrolling in crop insurance schemes to secure this potential yield against extreme weather."
      });
    }

    if (fertRatio > 0.25) {
      adviceList.push({
        type: "info",
        text: "<strong>Fertilizer Efficiency:</strong> Fertilizer costs exceed 25% of your total budget. Avoid blanket applications. Use custom NPK applications based on soil analysis and substitute partially with organic bio-fertilizers."
      });
    }

    if (pestRatio > 0.20) {
      adviceList.push({
        type: "info",
        text: "<strong>Pest Control Cost:</strong> Expenditure on crop protection is high. Transition to Integrated Pest Management (IPM) techniques. Introduce beneficial predator insects and use organic bio-pesticides like neem oil."
      });
    }

    if (waterRatio > 0.15) {
      adviceList.push({
        type: "info",
        text: "<strong>Irrigation Saving:</strong> Your irrigation costs are high. Explore installing micro-drip systems which can save up to 40% water and pump power. Check PMKSY central subsidies for drip installation."
      });
    }

    if (laborRatio > 0.35) {
      adviceList.push({
        type: "info",
        text: "<strong>Labor Optimization:</strong> Labor constitutes a major chunk of your expenses. Explore community machinery renting for operations like weeding and harvesting to lower human labor hours."
      });
    }
  }

  // Render on DOM
  const container = document.getElementById("advice-list-container");
  if (!container) return;

  container.innerHTML = "";
  if (adviceList.length === 0) {
    container.innerHTML = `<div class="advice-item text-center">${lang === "ta" ? "விளக்கங்கள் ஏதுமில்லை" : "No specific warnings. Your budget looks well-balanced!"}</div>`;
    return;
  }

  adviceList.forEach((item) => {
    const div = document.createElement("div");
    div.className = `advice-item advice-${item.type}`;
    div.innerHTML = item.text;
    container.appendChild(div);
  });
}

// --- 6. LOCAL STORAGE BUDGET HISTORY LOGIC ---
window.saveCurrentBudget = function () {
  const cropSelect = document.getElementById("crop-select");
  const cropKey = cropSelect.value;
  const cropName = cropSelect.options[cropSelect.selectedIndex].text;
  
  const landArea = parseFloat(document.getElementById("land-area").value) || 1;
  const yieldPerAcre = parseFloat(document.getElementById("expected-yield").value) || 0;
  const pricePerKg = parseFloat(document.getElementById("selling-price").value) || 0;

  const seedsCost = parseFloat(document.getElementById("seeds-cost").value) || 0;
  const prepCost = parseFloat(document.getElementById("prep-cost").value) || 0;
  const fertilizerCost = parseFloat(document.getElementById("fertilizer-cost").value) || 0;
  const irrigationCost = parseFloat(document.getElementById("irrigation-cost").value) || 0;
  const pesticideCost = parseFloat(document.getElementById("pesticide-cost").value) || 0;
  const laborCost = parseFloat(document.getElementById("labor-cost").value) || 0;
  const transportCost = parseFloat(document.getElementById("transport-cost").value) || 0;

  const totalCost = (seedsCost + prepCost + fertilizerCost + irrigationCost + pesticideCost + laborCost + transportCost) * landArea;
  const netProfit = (yieldPerAcre * pricePerKg * landArea) - totalCost;

  const budgetRecord = {
    id: Date.now().toString(),
    date: new Date().toLocaleDateString(activeLang === "ta" ? "ta-IN" : "en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }),
    cropKey,
    cropName,
    landArea,
    yieldPerAcre,
    pricePerKg,
    costs: {
      seeds: seedsCost,
      prep: prepCost,
      fertilizer: fertilizerCost,
      irrigation: irrigationCost,
      pesticide: pesticideCost,
      labor: laborCost,
      transport: transportCost
    },
    totalCost,
    netProfit
  };

  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("agri_budget_history")) || [];
  } catch (e) {
    history = [];
  }

  history.unshift(budgetRecord); // Add to top
  localStorage.setItem("agri_budget_history", JSON.stringify(history));

  // Visual alert feedback
  alert(activeLang === "ta" ? "பட்ஜெட் வெற்றிகரமாக சேமிக்கப்பட்டது!" : "Budget saved successfully to history!");

  renderHistory();
};

function renderHistory() {
  const container = document.getElementById("history-table-body");
  if (!container) return;

  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("agri_budget_history")) || [];
  } catch (e) {
    history = [];
  }

  container.innerHTML = "";
  if (history.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #888; padding: 20px;">
          ${activeLang === "ta" ? "சேமிக்கப்பட்ட பட்ஜெட்டுகள் எதுவும் இல்லை." : "No saved budgets found in history."}
        </td>
      </tr>
    `;
    return;
  }

  history.forEach((record) => {
    const tr = document.createElement("tr");

    // Format Name based on lang
    let cropDisplayName = record.cropName;
    if (CROP_FINANCIAL_DEFAULTS[record.cropKey]) {
      cropDisplayName = activeLang === "ta" 
        ? CROP_FINANCIAL_DEFAULTS[record.cropKey].taName 
        : CROP_FINANCIAL_DEFAULTS[record.cropKey].name;
    }

    const profitClass = record.netProfit >= 0 ? "profit-color" : "loss-color";

    tr.innerHTML = `
      <td>${record.date}</td>
      <td style="font-weight: 600;">${cropDisplayName}</td>
      <td>${record.landArea} ${activeLang === "ta" ? "ஏக்கர்" : "Acres"}</td>
      <td style="font-weight: 500;">${formatCurrency(record.totalCost)}</td>
      <td class="${profitClass}" style="font-weight: 600;">${formatCurrency(record.netProfit)}</td>
      <td>
        <button class="btn-history-action btn-history-load" onclick="loadSavedBudget('${record.id}')" title="${activeLang === "ta" ? "பதிவேற்று" : "Load Budget"}">
          <i class="fas fa-folder-open"></i>
        </button>
        <button class="btn-history-action btn-history-delete" onclick="deleteSavedBudget('${record.id}')" title="${activeLang === "ta" ? "அழி" : "Delete"}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    container.appendChild(tr);
  });
}

window.loadSavedBudget = function (id) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("agri_budget_history")) || [];
  } catch (e) {
    return;
  }

  const record = history.find((b) => b.id === id);
  if (!record) return;

  // Set Inputs
  document.getElementById("crop-select").value = record.cropKey;
  document.getElementById("land-area").value = record.landArea;
  document.getElementById("land-area-slider").value = record.landArea;
  document.getElementById("expected-yield").value = record.yieldPerAcre;
  document.getElementById("selling-price").value = record.pricePerKg;

  // Costs
  document.getElementById("seeds-cost").value = record.costs.seeds;
  document.getElementById("seeds-cost-slider").value = record.costs.seeds;

  document.getElementById("prep-cost").value = record.costs.prep;
  document.getElementById("prep-cost-slider").value = record.costs.prep;

  document.getElementById("fertilizer-cost").value = record.costs.fertilizer;
  document.getElementById("fertilizer-cost-slider").value = record.costs.fertilizer;

  document.getElementById("irrigation-cost").value = record.costs.irrigation;
  document.getElementById("irrigation-cost-slider").value = record.costs.irrigation;

  document.getElementById("pesticide-cost").value = record.costs.pesticide;
  document.getElementById("pesticide-cost-slider").value = record.costs.pesticide;

  document.getElementById("labor-cost").value = record.costs.labor;
  document.getElementById("labor-cost-slider").value = record.costs.labor;

  document.getElementById("transport-cost").value = record.costs.transport;
  document.getElementById("transport-cost-slider").value = record.costs.transport;

  // Trigger Calculate
  recalculate();

  // Scroll smoothly to output if element exists
  const anchor = document.getElementById("dashboard-results-anchor");
  if (anchor && typeof anchor.scrollIntoView === "function") {
    anchor.scrollIntoView({ behavior: "smooth" });
  }
};

window.deleteSavedBudget = function (id) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("agri_budget_history")) || [];
  } catch (e) {
    return;
  }

  const confirmMsg = activeLang === "ta" 
    ? "இந்த பட்ஜெட் பதிவை அழிக்க விரும்புகிறீர்களா?" 
    : "Are you sure you want to delete this budget entry?";

  if (confirm(confirmMsg)) {
    history = history.filter((b) => b.id !== id);
    localStorage.setItem("agri_budget_history", JSON.stringify(history));
    renderHistory();
  }
};
