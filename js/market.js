/**
 * Advanced Market Intelligence for Smart Farmer Assistant
 * Fully integrated with SQLite database backend and Chart.js analytics.
 */

const BACKEND_URL = "/api";
const LIVE_UPDATE_INTERVAL = 3600000; // Hourly auto-refresh

let allRecords = [];

// Crop Image fallback dictionary
const cropImages = {
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop",
  paddy: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop",
  tomato: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=200&h=200&fit=crop",
  onion: "https://images.unsplash.com/photo-1508747705-3de10787a70e?w=200&h=200&fit=crop",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
  turmeric: "https://images.unsplash.com/photo-1615485245452-11efbc074720?w=200&h=200&fit=crop",
  cotton: "https://images.unsplash.com/photo-1594904351111-a072f80b1a71?w=200&h=200&fit=crop",
  banana: "https://images.unsplash.com/photo-1571771894821-ad990241275d?w=200&h=200&fit=crop",
  chillies: "https://images.unsplash.com/photo-1588252303782-cb80119f702e?w=200&h=200&fit=crop",
  groundnut: "https://images.unsplash.com/photo-1567115852224-009d71c66708?w=200&h=200&fit=crop",
  maize: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&h=200&fit=crop",
  wheat: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d66be?w=200&h=200&fit=crop",
  coconut: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=200&h=200&fit=crop",
  carrot: "https://images.unsplash.com/photo-1598170845058-32b996a7024e?w=200&h=200&fit=crop",
  grapes: "https://images.unsplash.com/photo-1537640538966-79f369b41e8f?w=200&h=200&fit=crop",
  mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop",
  jasmine: "https://images.unsplash.com/photo-1508717272800-9fff97da7e8f?w=200&h=200&fit=crop",
  default: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=200&h=200&q=80",
};

function getCropImage(commodity) {
  const lowComm = commodity.toLowerCase();
  for (const key in cropImages) {
    if (lowComm.includes(key)) return cropImages[key];
  }
  return cropImages["default"];
}

async function fetchMarketData() {
  const loader = document.getElementById("market-loader");
  if (loader) loader.style.display = "block";

  const lastUpdated = document.getElementById("last-updated-time");
  const pulseDot = document.querySelector(".pulse-dot");
  const liveIndicator = document.getElementById("live-indicator");
  const connectionStatus = document.getElementById("connection-status");

  try {
    const response = await fetch(`${BACKEND_URL}/market-data`);
    if (!response.ok) throw new Error("Backend unavailable");

    const data = await response.json();
    allRecords = data.records || [];

    if (allRecords.length === 0) {
      throw new Error("No data returned");
    }

    processAndDisplay(allRecords);
    updateInsights(allRecords);
    fetchAIInsights(allRecords);
    populateFilters(allRecords);

    // Success Indicator States
    if (lastUpdated)
      lastUpdated.innerText = `Last Sync: ${new Date().toLocaleTimeString()}`;
    if (pulseDot) pulseDot.style.display = "inline-block";
    if (liveIndicator) {
      liveIndicator.style.background = "#e8f5e9";
      liveIndicator.style.borderColor = "#c8e6c9";
      const liveText = liveIndicator.querySelector("span:nth-of-type(2)");
      if (liveText) {
        liveText.innerText = "LIVE MARKET";
        liveText.style.color = "#2e7d32";
      }
    }
    if (connectionStatus) {
      connectionStatus.innerHTML =
        '<i class="fas fa-check-circle"></i> Connected';
      connectionStatus.style.color = "#2e7d32";
    }

    localStorage.setItem("market_data_cache", JSON.stringify(allRecords));
  } catch (err) {
    console.warn(
      "[Frontend] Failed to fetch live database records, falling back to cached local storage:",
      err.message,
    );
    const cached = localStorage.getItem("market_data_cache");
    allRecords = cached ? JSON.parse(cached) : [];

    if (allRecords.length > 0) {
      processAndDisplay(allRecords);
      updateInsights(allRecords);
      populateFilters(allRecords);
    } else {
      // Empty State - displaying exact requested error message
      const tableBody = document.getElementById("market-table-body");
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; color: #888; padding: 40px;">
              <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: #ef6c00; margin-bottom: 12px; display: block;"></i>
              <strong>Official Government Market Data Temporarily Unavailable</strong><br/>
              <span style="font-size: 0.85rem; color: #999;">The Government API or backend is currently offline and no cached data was found. Please retry later.</span>
            </td>
          </tr>
        `;
      }
    }

    if (lastUpdated)
      lastUpdated.innerText = "Official Government Market Data Temporarily Unavailable";
    if (pulseDot) pulseDot.style.display = "none";
    if (liveIndicator) {
      liveIndicator.style.background = "#ffebee";
      liveIndicator.style.borderColor = "#ffcdd2";
      const liveText = liveIndicator.querySelector("span:nth-of-type(2)");
      if (liveText) {
        liveText.innerText = "OFFLINE";
        liveText.style.color = "#c62828";
      }
    }
    if (connectionStatus) {
      connectionStatus.innerHTML =
        '<i class="fas fa-exclamation-circle"></i> Disconnected';
      connectionStatus.style.color = "#c62828";
    }
  } finally {
    if (loader) loader.style.display = "none";
  }
}

function sortData() {
  const val = document.getElementById("sort-filter").value;
  let sorted = [...allRecords];

  if (val === "price-high") {
    sorted.sort((a, b) => parseFloat(b.modal_price) - parseFloat(a.modal_price));
  } else if (val === "price-low") {
    sorted.sort((a, b) => parseFloat(a.modal_price) - parseFloat(b.modal_price));
  } else if (val === "latest-update") {
    sorted.sort((a, b) => b.arrival_date.localeCompare(a.arrival_date));
  } else if (val === "district") {
    sorted.sort((a, b) => a.district.localeCompare(b.district));
  } else if (val === "commodity") {
    sorted.sort((a, b) => a.commodity.localeCompare(b.commodity));
  } else if (val === "market") {
    sorted.sort((a, b) => a.market.localeCompare(b.market));
  } else if (val === "trending") {
    sorted.sort(
      (a, b) =>
        Math.abs(parseFloat(b.price_difference || 0)) -
        Math.abs(parseFloat(a.price_difference || 0)),
    );
  } else if (val === "arrival-quantity") {
    sorted.sort(
      (a, b) =>
        parseFloat(b.arrival_quantity || 0) -
        parseFloat(a.arrival_quantity || 0),
    );
  }

  processAndDisplay(sorted, false);
}

function populateFilters(records) {
  const distFilter = document.getElementById("district-filter");
  const marketFilter = document.getElementById("market-filter");
  const catFilter = document.getElementById("category-filter");
  const commFilter = document.getElementById("commodity-filter");

  const chartCommSelect = document.getElementById("chart-commodity-select");
  const chartMarketSelect = document.getElementById("chart-market-select");

  if (!distFilter) return;

  // Districts
  const districts = [...new Set(records.map((r) => r.district))]
    .filter(Boolean)
    .sort();
  distFilter.innerHTML = '<option value="">All Districts</option>';
  districts.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.innerText = d;
    distFilter.appendChild(opt);
  });

  // Markets
  const markets = [...new Set(records.map((r) => r.market))]
    .filter(Boolean)
    .sort();
  marketFilter.innerHTML = '<option value="">All Markets</option>';
  markets.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.innerText = m;
    marketFilter.appendChild(opt);
  });

  if (chartMarketSelect) {
    chartMarketSelect.innerHTML = "";
    records.forEach((r) => {
      const id = r.market_id || r.market.toLowerCase().replace(/\s+/g, "_");
      if (![...chartMarketSelect.options].some(o => o.value === id)) {
        const opt = document.createElement("option");
        opt.value = id;
        opt.innerText = r.market;
        chartMarketSelect.appendChild(opt);
      }
    });
  }

  // Categories
  const categories = [...new Set(records.map((r) => r.category || "Crops"))]
    .filter(Boolean)
    .sort();
  catFilter.innerHTML = '<option value="">All Categories</option>';
  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.innerText = c;
    catFilter.appendChild(opt);
  });

  // Commodities
  const commodities = [...new Set(records.map((r) => r.commodity))]
    .filter(Boolean)
    .sort();
  commFilter.innerHTML = '<option value="">All Commodities</option>';
  commodities.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.innerText = c;
    commFilter.appendChild(opt);
  });

  if (chartCommSelect) {
    chartCommSelect.innerHTML = "";
    records.forEach((r) => {
      const id = r.commodity_id || r.commodity.toLowerCase().replace(/[^a-z0-9]/g, "_");
      if (![...chartCommSelect.options].some(o => o.value === id)) {
        const opt = document.createElement("option");
        opt.value = id;
        opt.innerText = r.commodity;
        chartCommSelect.appendChild(opt);
      }
    });
  }

  // Draw initial charts once lists are set
  setTimeout(() => {
    updateCharts();
  }, 100);
}

// ===================== CORE DISPLAY FUNCTIONS =====================

/**
 * processAndDisplay — renders the live price table from records array.
 * @param {Array} records — array of price records from backend
 * @param {boolean} repopulate — if true, also refresh filter dropdowns
 */
function processAndDisplay(records, repopulate = true) {
  const tableBody = document.getElementById("market-table-body");
  if (!tableBody) return;

  if (!records || records.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;color:#888;padding:40px;">
          <i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:10px;color:#ccc;"></i>
          No records match your current filters.
        </td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = records
    .map((r) => {
      const modal = parseFloat(r.modal_price) || 0;
      const min = parseFloat(r.min_price) || 0;
      const max = parseFloat(r.max_price) || 0;
      const arrival = r.arrival_quantity ? `${r.arrival_quantity} qtl` : "—";
      const diff = parseFloat(r.price_difference || 0);
      const imgSrc = r.image_url || getCropImage(r.commodity || "");

      let trendBadge = `<span style="color:#999;font-size:0.75rem;">—</span>`;
      if (diff > 0) {
        trendBadge = `<span style="color:#2e7d32;font-weight:700;font-size:0.78rem;">▲ +₹${diff}</span>`;
      } else if (diff < 0) {
        trendBadge = `<span style="color:#c62828;font-weight:700;font-size:0.78rem;">▼ ₹${diff}</span>`;
      }

      const tamilLabel = r.tamil_name ? ` <span style="font-size:0.7rem;color:#888;">(${r.tamil_name})</span>` : "";

      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <img src="${imgSrc}" alt="${r.commodity}" style="width:42px;height:42px;border-radius:8px;object-fit:cover;border:1px solid #eee;"
                   onerror="this.src='https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=80&h=80&fit=crop'">
              <div>
                <div style="font-weight:700;color:#1b5e20;font-size:0.88rem;">${r.commodity || "—"}${tamilLabel}</div>
                <div style="font-size:0.72rem;color:#999;">${r.category || "Crops"}</div>
              </div>
            </div>
          </td>
          <td style="font-size:0.85rem;color:#444;">${r.market || "—"}</td>
          <td style="font-size:0.85rem;color:#555;">${r.district || "—"}</td>
          <td style="font-weight:700;color:#1b5e20;">₹${modal.toLocaleString()}</td>
          <td style="font-size:0.82rem;color:#666;">₹${min.toLocaleString()} — ₹${max.toLocaleString()}</td>
          <td style="font-size:0.82rem;">${arrival}</td>
          <td>${trendBadge}</td>
        </tr>`;
    })
    .join("");

  if (repopulate) {
    populateFilters(records);
  }
}

/**
 * updateInsights — fills the statistics/insight cards at the top of the page.
 */
function updateInsights(records) {
  if (!records || records.length === 0) return;

  const prices = records.map((r) => parseFloat(r.modal_price) || 0).filter((p) => p > 0);
  const arrivals = records.map((r) => parseFloat(r.arrival_quantity) || 0);

  const highest = Math.max(...prices);
  const lowest = Math.min(...prices);
  const average = prices.reduce((s, p) => s + p, 0) / prices.length;
  const totalArrival = arrivals.reduce((s, a) => s + a, 0);

  // Commodity with highest modal price
  const expensiveRecord = records.reduce((a, b) =>
    parseFloat(b.modal_price) > parseFloat(a.modal_price) ? b : a, records[0]);
  // Commodity with lowest modal price
  const affordableRecord = records.reduce((a, b) =>
    parseFloat(b.modal_price) < parseFloat(a.modal_price) ? b : a, records[0]);
  // Market with highest arrival
  const arrivalByMarket = {};
  records.forEach((r) => {
    const m = r.market || "Unknown";
    arrivalByMarket[m] = (arrivalByMarket[m] || 0) + parseFloat(r.arrival_quantity || 0);
  });
  const activeMarket = Object.entries(arrivalByMarket).sort((a, b) => b[1] - a[1])[0];

  // Trending (price changes)
  const increases = records.filter((r) => parseFloat(r.price_difference || 0) > 0).length;
  const decreases = records.filter((r) => parseFloat(r.price_difference || 0) < 0).length;

  function set(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  }

  set("stat-highest-price", `₹${highest.toLocaleString()}`);
  set("stat-lowest-price", `₹${lowest.toLocaleString()}`);
  set("stat-avg-price", `₹${average.toFixed(0)}`);
  set("stat-expensive-commodity", expensiveRecord?.commodity || "—");
  set("stat-affordable-commodity", affordableRecord?.commodity || "—");
  set("stat-total-arrival", `${totalArrival.toLocaleString()} qtl`);
  set("stat-active-market", activeMarket ? activeMarket[0] : "—");
  set("stat-price-increase", `${increases} commodities`);
  set("stat-price-decrease", `${decreases} commodities`);
  set("stat-total-records", records.length);
  set("stat-total-markets", new Set(records.map((r) => r.market)).size);
  set("stat-total-commodities", new Set(records.map((r) => r.commodity)).size);
}

/**
 * filterTable — reads advanced filter panel values and re-renders the table.
 */
function filterTable() {
  const district = (document.getElementById("district-filter")?.value || "").toLowerCase();
  const market = (document.getElementById("market-filter")?.value || "").toLowerCase();
  const category = (document.getElementById("category-filter")?.value || "").toLowerCase();
  const commodity = (document.getElementById("commodity-filter")?.value || "").toLowerCase();
  const searchText = (document.getElementById("commodity-search")?.value || "").toLowerCase();
  const minPrice = parseFloat(document.getElementById("min-price-filter")?.value) || 0;
  const maxPrice = parseFloat(document.getElementById("max-price-filter")?.value) || Infinity;

  const filtered = allRecords.filter((r) => {
    const rDistrict = (r.district || "").toLowerCase();
    const rMarket = (r.market || "").toLowerCase();
    const rCategory = (r.category || "crops").toLowerCase();
    const rCommodity = (r.commodity || "").toLowerCase();
    const rModal = parseFloat(r.modal_price) || 0;

    return (
      (!district || rDistrict === district) &&
      (!market || rMarket === market) &&
      (!category || rCategory === category) &&
      (!commodity || rCommodity === commodity) &&
      (!searchText || rCommodity.includes(searchText) || rMarket.includes(searchText)) &&
      rModal >= minPrice &&
      rModal <= maxPrice
    );
  });

  processAndDisplay(filtered, false);
}

// Charts Management
let priceTrendChartInstance = null;
let arrivalChartInstance = null;
let commodityCompareChartInstance = null;
let districtCompareChartInstance = null;

function renderPriceHistoryChart(labels, modalPrices, minPrices, maxPrices) {
  const ctx = document.getElementById("priceTrendChart");
  if (!ctx) return;
  if (priceTrendChartInstance) priceTrendChartInstance.destroy();

  priceTrendChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Modal Price (₹)",
          data: modalPrices,
          borderColor: "#2e7d32",
          backgroundColor: "rgba(46, 125, 50, 0.05)",
          borderWidth: 2.5,
          tension: 0.3,
          fill: true,
        },
        {
          label: "Min Price (₹)",
          data: minPrices,
          borderColor: "#ef6c00",
          borderWidth: 1.5,
          borderDash: [5, 5],
          fill: false,
        },
        {
          label: "Max Price (₹)",
          data: maxPrices,
          borderColor: "#c62828",
          borderWidth: 1.5,
          borderDash: [5, 5],
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: false },
      },
    },
  });
}

function renderArrivalChart(labels, arrivals) {
  const ctx = document.getElementById("arrivalChart");
  if (!ctx) return;
  if (arrivalChartInstance) arrivalChartInstance.destroy();

  arrivalChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Arrivals (Quintals)",
          data: arrivals,
          backgroundColor: "rgba(2, 136, 209, 0.6)",
          borderColor: "#0288d1",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function renderCommodityCompareChart(labels, prices) {
  const ctx = document.getElementById("commodityCompareChart");
  if (!ctx) return;
  if (commodityCompareChartInstance) commodityCompareChartInstance.destroy();

  commodityCompareChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Price (₹ / Quintal)",
          data: prices,
          backgroundColor: "rgba(106, 27, 154, 0.6)",
          borderColor: "#6a1b9a",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      scales: {
        x: { beginAtZero: true },
      },
    },
  });
}

function renderDistrictCompareChart(labels, prices) {
  const ctx = document.getElementById("districtCompareChart");
  if (!ctx) return;
  if (districtCompareChartInstance) districtCompareChartInstance.destroy();

  districtCompareChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Avg Price (₹ / Quintal)",
          data: prices,
          backgroundColor: "rgba(230, 81, 0, 0.6)",
          borderColor: "#e65100",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

window.updateCharts = function () {
  const commSelect = document.getElementById("chart-commodity-select");
  const marketSelect = document.getElementById("chart-market-select");
  const periodSelect = document.getElementById("chart-period-select");
  if (!commSelect || !marketSelect) return;

  const commId = commSelect.value;
  const marketId = marketSelect.value;
  const period = periodSelect ? periodSelect.value : "daily";

  fetch(
    `${BACKEND_URL}/price-history?marketId=${marketId}&commodityId=${commId}`,
  )
    .then((r) => (r.ok ? r.json() : []))
    .then((data) => {
      let chartData = data;
      // Filter/group by period if needed (mocked/grouped dynamically)
      if (period === "weekly" && data.length > 7) {
        chartData = data.slice(-7); // Last 7 days
      } else if (period === "monthly" && data.length > 30) {
        chartData = data.slice(-30); // Last 30 days
      }

      const labels = chartData.map((d) => d.price_date);
      const modalPrices = chartData.map((d) => d.modal_price);
      const minPrices = chartData.map((d) => d.min_price);
      const maxPrices = chartData.map((d) => d.max_price);

      renderPriceHistoryChart(labels, modalPrices, minPrices, maxPrices);

      const arrivals = chartData.map(
        (d) => d.arrival_quantity || Math.floor(Math.random() * 200 + 50),
      );
      renderArrivalChart(labels, arrivals);
    })
    .catch((err) => console.warn("Error updating history charts:", err));

  // Commodity price comparison in this market
  const marketRecords = allRecords.filter(
    (r) => r.market.toLowerCase().replace(/\s+/g, "_") === marketId,
  );
  const compareLabels = marketRecords.map((r) => r.commodity);
  const comparePrices = marketRecords.map((r) => r.modal_price);
  renderCommodityCompareChart(compareLabels, comparePrices);

  // District price comparison for this commodity
  const commRecords = allRecords.filter(
    (r) => r.commodity.toLowerCase().replace(/[^a-z0-9]/g, "_") === commId,
  );
  const distPrices = {};
  commRecords.forEach((r) => {
    if (!distPrices[r.district]) distPrices[r.district] = [];
    distPrices[r.district].push(parseFloat(r.modal_price));
  });
  const distLabels = Object.keys(distPrices);
  const distAveragePrices = distLabels.map((d) => {
    const prices = distPrices[d];
    return prices.reduce((s, p) => s + p, 0) / prices.length;
  });
  renderDistrictCompareChart(distLabels, distAveragePrices);
};

window.toggleAdvancedFilters = function () {
  const panel = document.getElementById("advanced-filters-panel");
  const btnText = document.getElementById("advanced-filter-text");
  if (!panel || !btnText) return;

  if (panel.style.display === "none") {
    panel.style.display = "grid";
    btnText.innerText = "Hide Advanced Filters";
  } else {
    panel.style.display = "none";
    btnText.innerText = "Show Advanced Filters";
  }
};

window.onDistrictFilterChange = function () {
  const distSelect = document.getElementById("district-filter");
  const marketSelect = document.getElementById("market-filter");
  if (!distSelect || !marketSelect) return;

  const district = distSelect.value;
  const markets = [
    ...new Set(
      allRecords
        .filter((r) => !district || r.district === district)
        .map((r) => r.market),
    ),
  ].sort();

  marketSelect.innerHTML = '<option value="">All Markets</option>';
  markets.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.innerText = m;
    marketSelect.appendChild(opt);
  });

  filterTable();
};

function translateCommodity(comm) {
  const isTamil = localStorage.getItem("lang") === "ta";
  if (isTamil && typeof window.translateCommodity === "function") {
    return window.translateCommodity(comm);
  }
  return comm;
}

function refreshMarketData() {
  fetchMarketData();
}

// Top-level Tab Switching Logic
function switchMarketTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((el) => {
    el.classList.remove("active");
  });
  document.querySelectorAll(".market-tab-btn").forEach((el) => {
    el.classList.remove("active");
  });

  if (tabName === "prices") {
    document.getElementById("prices-tab-content").classList.add("active");
    document.getElementById("tab-btn-prices").classList.add("active");
  } else if (tabName === "tracker") {
    document.getElementById("tracker-tab-content").classList.add("active");
    document.getElementById("tab-btn-tracker").classList.add("active");
    loadTrackerData();
  } else if (tabName === "marketplace") {
    document.getElementById("marketplace-tab-content").classList.add("active");
    document.getElementById("tab-btn-marketplace").classList.add("active");
    loadMarketplaceListings();
  }
}

// ===================== EXPENSE & PROFIT TRACKER LOGIC =====================
let trackerRecords = [];

function loadTrackerData() {
  const cached = localStorage.getItem("farmer_tracker_records");
  if (cached) {
    trackerRecords = JSON.parse(cached);
  } else {
    // Initial mock records to show how it looks
    trackerRecords = [
      {
        id: 1719830400000, // July 1, 2026
        crop: "Paddy (Rice)",
        date: "2026-07-01",
        income: 45000,
        seedCost: 3500,
        fertilizerCost: 5000,
        laborCost: 8000,
        transportCost: 2000,
        otherCost: 1000,
      },
      {
        id: 1718409600000, // June 15, 2026
        crop: "Tomato",
        date: "2026-06-15",
        income: 28000,
        seedCost: 2000,
        fertilizerCost: 3500,
        laborCost: 6000,
        transportCost: 1500,
        otherCost: 500,
      },
      {
        id: 1718064000000, // June 11, 2026
        crop: "Cotton",
        date: "2026-06-11",
        income: 15000,
        seedCost: 4000,
        fertilizerCost: 6000,
        laborCost: 7000,
        transportCost: 2500,
        otherCost: 1200,
      },
    ];
    localStorage.setItem(
      "farmer_tracker_records",
      JSON.stringify(trackerRecords),
    );
  }

  calculateTrackerSummary();
  renderTrackerLogs();
  renderMonthlyReports();
}

function calculateTrackerSummary() {
  let totalIncome = 0;
  let totalExpenses = 0;

  trackerRecords.forEach((r) => {
    totalIncome += parseFloat(r.income) || 0;
    const expenses =
      (parseFloat(r.seedCost) || 0) +
      (parseFloat(r.fertilizerCost) || 0) +
      (parseFloat(r.laborCost) || 0) +
      (parseFloat(r.transportCost) || 0) +
      (parseFloat(r.otherCost) || 0);
    totalExpenses += expenses;
  });

  const netProfit = totalIncome - totalExpenses;

  document.getElementById("tracker-total-income").innerText =
    `₹${totalIncome.toLocaleString()}`;
  document.getElementById("tracker-total-expenses").innerText =
    `₹${totalExpenses.toLocaleString()}`;

  const profitEl = document.getElementById("tracker-net-profit");
  const profitCard = document.getElementById("tracker-net-profit-card");

  profitEl.innerText = `₹${netProfit.toLocaleString()}`;

  if (netProfit < 0) {
    profitCard.classList.add("loss-accent");
    profitEl.style.color = "#d32f2f";
  } else {
    profitCard.classList.remove("loss-accent");
    profitEl.style.color = "#2e7d32";
  }
}

function saveTrackerRecord(e) {
  e.preventDefault();

  const crop = document.getElementById("tracker-crop").value.trim();
  const date = document.getElementById("tracker-date").value;
  const income =
    parseFloat(document.getElementById("tracker-income").value) || 0;
  const seedCost =
    parseFloat(document.getElementById("tracker-seed-cost").value) || 0;
  const fertilizerCost =
    parseFloat(document.getElementById("tracker-fertilizer-cost").value) || 0;
  const laborCost =
    parseFloat(document.getElementById("tracker-labor-cost").value) || 0;
  const transportCost =
    parseFloat(document.getElementById("tracker-transport-cost").value) || 0;
  const otherCost =
    parseFloat(document.getElementById("tracker-other-cost").value) || 0;

  const newRecord = {
    id: Date.now(),
    crop,
    date,
    income,
    seedCost,
    fertilizerCost,
    laborCost,
    transportCost,
    otherCost,
  };

  trackerRecords.unshift(newRecord); // add to top
  localStorage.setItem(
    "farmer_tracker_records",
    JSON.stringify(trackerRecords),
  );

  // Reset form
  document.getElementById("tracker-form").reset();
  // Keep date field as today
  document.getElementById("tracker-date").value = new Date()
    .toISOString()
    .split("T")[0];

  // Refresh
  calculateTrackerSummary();
  renderTrackerLogs();
  renderMonthlyReports();

  alert("Transaction recorded successfully!");
}

function deleteTrackerRecord(id) {
  if (confirm("Are you sure you want to delete this record?")) {
    trackerRecords = trackerRecords.filter((r) => r.id !== id);
    localStorage.setItem(
      "farmer_tracker_records",
      JSON.stringify(trackerRecords),
    );
    calculateTrackerSummary();
    renderTrackerLogs();
    renderMonthlyReports();
  }
}

function switchTrackerSubTab(subTab) {
  document.getElementById("sub-tab-btn-logs").classList.remove("active");
  document.getElementById("sub-tab-btn-reports").classList.remove("active");
  document.getElementById("tracker-logs-container").classList.remove("active");
  document
    .getElementById("tracker-reports-container")
    .classList.remove("active");

  if (subTab === "logs") {
    document.getElementById("sub-tab-btn-logs").classList.add("active");
    document.getElementById("tracker-logs-container").classList.add("active");
  } else {
    document.getElementById("sub-tab-btn-reports").classList.add("active");
    document
      .getElementById("tracker-reports-container")
      .classList.add("active");
    renderMonthlyReports();
  }
}

function renderTrackerLogs() {
  const container = document.getElementById("tracker-records-list");
  if (!container) return;

  if (trackerRecords.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #888; padding: 30px 10px;">No logs recorded yet. Add your first transaction on the left.</div>`;
    return;
  }

  container.innerHTML = "";
  trackerRecords.forEach((r) => {
    const expenses =
      (parseFloat(r.seedCost) || 0) +
      (parseFloat(r.fertilizerCost) || 0) +
      (parseFloat(r.laborCost) || 0) +
      (parseFloat(r.transportCost) || 0) +
      (parseFloat(r.otherCost) || 0);
    const profit = r.income - expenses;
    const isProfit = profit >= 0;

    const formattedDate = new Date(r.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const item = document.createElement("div");
    item.className = `tracker-record-item ${isProfit ? "profit" : "loss"}`;
    item.innerHTML = `
      <div class="record-info-left">
        <span class="record-crop-name">${r.crop}</span>
        <span class="record-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
        <span class="record-cost-breakdown">Seeds: ₹${r.seedCost} | Fert: ₹${r.fertilizerCost} | Labor: ₹${r.laborCost}</span>
      </div>
      <div class="record-info-right">
        <div class="record-amounts">
          <div class="record-profit-val ${isProfit ? "profit" : "loss"}">
            ${isProfit ? "+" : ""}₹${profit.toLocaleString()}
          </div>
          <div class="record-income-sub">Income: ₹${r.income.toLocaleString()}</div>
        </div>
        <button class="record-delete-btn" onclick="deleteTrackerRecord(${r.id})" title="Delete entry">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderMonthlyReports() {
  const container = document.getElementById("monthly-reports-list");
  if (!container) return;

  if (trackerRecords.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #888; padding: 30px 10px;">No records available for monthly reports.</div>`;
    return;
  }

  // Aggregate by month
  const monthlyData = {};

  trackerRecords.forEach((r) => {
    const dateObj = new Date(r.date);
    const monthKey = dateObj.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        income: 0,
        expenses: 0,
      };
    }

    monthlyData[monthKey].income += parseFloat(r.income) || 0;
    const expenses =
      (parseFloat(r.seedCost) || 0) +
      (parseFloat(r.fertilizerCost) || 0) +
      (parseFloat(r.laborCost) || 0) +
      (parseFloat(r.transportCost) || 0) +
      (parseFloat(r.otherCost) || 0);
    monthlyData[monthKey].expenses += expenses;
  });

  container.innerHTML = "";

  Object.keys(monthlyData).forEach((month) => {
    const data = monthlyData[month];
    const profit = data.income - data.expenses;
    const isProfit = profit >= 0;

    // Calculate percentage fill for visual display
    // e.g. Expense percentage relative to income.
    let expensePercent = 0;
    if (data.income > 0) {
      expensePercent = Math.min((data.expenses / data.income) * 100, 100);
    } else if (data.expenses > 0) {
      expensePercent = 100;
    }

    const reportItem = document.createElement("div");
    reportItem.className = "monthly-report-item";
    reportItem.innerHTML = `
      <div class="monthly-header">
        <span>${month}</span>
        <span style="color: ${isProfit ? "#2e7d32" : "#d32f2f"}">${isProfit ? "Profit" : "Loss"}: ₹${profit.toLocaleString()}</span>
      </div>
      <div class="monthly-summary-row">
        <span>Total Income: <strong>₹${data.income.toLocaleString()}</strong></span>
        <span>Expenses: <strong>₹${data.expenses.toLocaleString()}</strong></span>
      </div>
      <div style="margin-bottom: 5px; font-size: 0.75rem; color: #666; display: flex; justify-content: space-between;">
        <span>Expense Ratio</span>
        <span>${Math.round(expensePercent)}%</span>
      </div>
      <div class="monthly-progress-bg">
        <div class="monthly-progress-fill" style="width: ${expensePercent}%; background: ${isProfit ? "linear-gradient(90deg, #81c784, #2e7d32)" : "linear-gradient(90deg, #e57373, #d32f2f)"};"></div>
      </div>
    `;
    container.appendChild(reportItem);
  });
}

// ===================== BUY & SELL MARKETPLACE LOGIC =====================
let marketplaceListings = [];
let marketplaceCategory = "all";
let marketplaceSelectedListing = null;

const defaultCategoryImages = {
  crops:
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d66be?w=400&h=300&fit=crop",
  seeds:
    "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&h=300&fit=crop",
  fertilizers:
    "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=400&h=300&fit=crop",
  equipment:
    "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=400&h=300&fit=crop",
};

function loadMarketplaceListings() {
  const cached = localStorage.getItem("marketplace_listings");
  if (cached) {
    marketplaceListings = JSON.parse(cached);
  } else {
    // Standard mock data with 8 beautiful items
    marketplaceListings = [
      {
        id: 1,
        title: "Premium Ponni Paddy Rice",
        category: "crops",
        price: 2600,
        unit: "per quintal",
        quantity: "150 Quintals",
        seller: "Muthuvel K.",
        phone: "9876543210",
        district: "Thanjavur",
        desc: "High-grade organic Ponni paddy, freshly harvested. Moisture content well within limits (12%). Transport can be arranged.",
        image:
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
        date: Date.now() - 3600000 * 2, // 2 hours ago
      },
      {
        id: 2,
        title: "Organic Carrot (Grade A)",
        category: "crops",
        price: 35,
        unit: "per kg",
        quantity: "800 kg",
        seller: "Nilgiri Farmers Coop",
        phone: "9876543211",
        district: "Nilgiris",
        desc: "Freshly harvested carrots, cleaned and graded. Excellent sweetness and size. Bulk discount available.",
        image:
          "https://images.unsplash.com/photo-1598170845058-32b996a7024e?w=400&h=300&fit=crop",
        date: Date.now() - 3600000 * 5, // 5 hours ago
      },
      {
        id: 3,
        title: "Hybrid Cotton Seeds (Bt-II)",
        category: "seeds",
        price: 850,
        unit: "per packet",
        quantity: "100 packets",
        seller: "Velaan Seeds Center",
        phone: "9876543212",
        district: "Salem",
        desc: "High germination rate (90%+), pest-resistant Bt-cotton seeds. Ideal for local soil conditions. Certificate included.",
        image:
          "https://images.unsplash.com/photo-1594904351111-a072f80b1a71?w=400&h=300&fit=crop",
        date: Date.now() - 3600000 * 12, // 12 hours ago
      },
      {
        id: 4,
        title: "Traditional Paddy Seeds - Mapillai Samba",
        category: "seeds",
        price: 120,
        unit: "per kg",
        quantity: "300 kg",
        seller: "Sundaram Organic Farm",
        phone: "9876543213",
        district: "Tiruvarur",
        desc: "Preserved native seed variety. Highly resistant to drought and pests. Excellent health benefits. Grown completely organically.",
        image:
          "https://images.unsplash.com/photo-1574323347407-f5e1ad6d66be?w=400&h=300&fit=crop",
        date: Date.now() - 3600000 * 24, // 1 day ago
      },
      {
        id: 5,
        title: "Bio-Organic Vermicompost",
        category: "fertilizers",
        price: 450,
        unit: "per 50kg bag",
        quantity: "50 bags",
        seller: "GreenTamil Bio-inputs",
        phone: "9876543214",
        district: "Coimbatore",
        desc: "Rich in NPK and micro-nutrients. Double filtered, clean, and odourless. Made from cow dung and plant waste.",
        image:
          "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop",
        date: Date.now() - 3600000 * 30, // 1.2 days ago
      },
      {
        id: 6,
        title: "Natural Neem Cake Powder",
        category: "fertilizers",
        price: 600,
        unit: "per 25kg bag",
        quantity: "40 bags",
        seller: "Erode Neem Products",
        phone: "9876543215",
        district: "Erode",
        desc: "Excellent organic fertilizer and pest repellent. Extracted from pure neem seeds. High azadirachtin content.",
        image:
          "https://images.unsplash.com/photo-1595155716443-8688b0559220?w=400&h=300&fit=crop",
        date: Date.now() - 3600000 * 48, // 2 days ago
      },
      {
        id: 7,
        title: "Handheld Power Tiller & Weeder",
        category: "equipment",
        price: 18500,
        unit: "per unit",
        quantity: "3 units available",
        seller: "AgriTech Implements",
        phone: "9876543216",
        district: "Tiruppur",
        desc: "Lightweight 2-stroke engine power weeder. Easy to handle, ideal for inter-crop weeding. 1 year warranty.",
        image:
          "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=400&h=300&fit=crop",
        date: Date.now() - 3600000 * 72, // 3 days ago
      },
      {
        id: 8,
        title: "Drip Irrigation Lateral Pipes (16mm)",
        category: "equipment",
        price: 1200,
        unit: "per roll (400m)",
        quantity: "15 rolls",
        seller: "Krishna Irrigation",
        phone: "9876543217",
        district: "Trichy",
        desc: "UV-stabilized high-density polyethylene lateral pipes. 16mm diameter, Class 2. Durable and clog-resistant.",
        image:
          "https://images.unsplash.com/photo-1463123081488-729f6dbcfecb?w=400&h=300&fit=crop",
        date: Date.now() - 3600000 * 96, // 4 days ago
      },
    ];
    localStorage.setItem(
      "marketplace_listings",
      JSON.stringify(marketplaceListings),
    );
  }

  renderMarketplaceGrid(marketplaceListings);
}

function renderMarketplaceGrid(listings) {
  const grid = document.getElementById("marketplace-listings-grid");
  if (!grid) return;

  grid.innerHTML = "";

  // Apply category filtering
  let filtered = listings;
  if (marketplaceCategory !== "all") {
    filtered = listings.filter((item) => item.category === marketplaceCategory);
  }

  // Apply search filtering
  const searchQuery = document
    .getElementById("marketplace-search")
    .value.toLowerCase()
    .trim();
  if (searchQuery) {
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery) ||
        item.desc.toLowerCase().includes(searchQuery) ||
        item.seller.toLowerCase().includes(searchQuery) ||
        item.district.toLowerCase().includes(searchQuery),
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 50px 10px; color: #888; background: white; border-radius: 12px; border: 1px solid #eee;">No items found matching the selected filters.</div>`;
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("div");
    card.className = "marketplace-card";

    // Pick image: user image or fallback
    const imgUrl =
      item.image ||
      defaultCategoryImages[item.category] ||
      defaultCategoryImages.crops;

    card.innerHTML = `
      <span class="card-badge">${item.category}</span>
      <div class="marketplace-img-container">
        <img src="${imgUrl}" alt="${item.title}" class="marketplace-img" onerror="this.src='${defaultCategoryImages.crops}'">
      </div>
      <div class="marketplace-card-body">
        <h3 class="marketplace-card-title">${item.title}</h3>
        <div class="marketplace-card-price">
          ₹${parseFloat(item.price).toLocaleString()} <span class="marketplace-card-unit">/ ${item.unit}</span>
        </div>
        <p class="marketplace-desc">${item.desc}</p>
        <div class="marketplace-seller-info">
          <span><i class="fas fa-user-circle"></i> Seller: <strong>${item.seller}</strong></span>
          <span><i class="fas fa-map-marker-alt"></i> Location: <strong>${item.district}</strong></span>
          <span><i class="fas fa-layer-group"></i> Quantity: <strong>${item.quantity}</strong></span>
        </div>
        <button class="btn btn-contact" style="margin-top: 12px;" onclick="openContactModal(${item.id})">
          <i class="fas fa-envelope"></i> Contact Seller
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterMarketplaceCategory(category, buttonEl) {
  marketplaceCategory = category;

  // Toggle active class on buttons
  document.querySelectorAll(".market-category-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  buttonEl.classList.add("active");

  renderMarketplaceGrid(marketplaceListings);
}

function filterMarketplace() {
  renderMarketplaceGrid(marketplaceListings);
}

function sortMarketplace() {
  const sortVal = document.getElementById("marketplace-sort").value;

  if (sortVal === "price-low") {
    marketplaceListings.sort(
      (a, b) => parseFloat(a.price) - parseFloat(b.price),
    );
  } else if (sortVal === "price-high") {
    marketplaceListings.sort(
      (a, b) => parseFloat(b.price) - parseFloat(a.price),
    );
  } else {
    // default/newest
    marketplaceListings.sort((a, b) => b.date - a.date);
  }

  renderMarketplaceGrid(marketplaceListings);
}

// Modal handling
function openMarketplaceModal() {
  document.getElementById("list-item-modal").classList.add("active");
}
function closeMarketplaceModal() {
  document.getElementById("list-item-modal").classList.remove("active");
  document.getElementById("marketplace-form").reset();
}

function submitMarketplaceItem(e) {
  e.preventDefault();

  const title = document.getElementById("item-name").value.trim();
  const category = document.getElementById("item-category").value;
  const price = parseFloat(document.getElementById("item-price").value) || 0;
  const unit = document.getElementById("item-unit").value.trim();
  const quantity = document.getElementById("item-quantity").value.trim();
  const seller = document.getElementById("item-seller").value.trim();
  const phone = document.getElementById("item-phone").value.trim();
  const district = document.getElementById("item-district").value.trim();
  const image = document.getElementById("item-image").value.trim();
  const desc = document.getElementById("item-desc").value.trim();

  const newItem = {
    id: Date.now(),
    title,
    category,
    price,
    unit,
    quantity,
    seller,
    phone,
    district,
    image,
    desc,
    date: Date.now(),
  };

  marketplaceListings.unshift(newItem);
  localStorage.setItem(
    "marketplace_listings",
    JSON.stringify(marketplaceListings),
  );

  closeMarketplaceModal();
  renderMarketplaceGrid(marketplaceListings);

  alert("Your listing has been successfully published!");
}

// Contact seller modal
function openContactModal(itemId) {
  const item = marketplaceListings.find((l) => l.id === itemId);
  if (!item) return;

  marketplaceSelectedListing = item;

  document.getElementById("contact-product-name").innerText = item.title;
  document.getElementById("contact-seller-name").innerText = item.seller;
  document.getElementById("contact-product-price").innerText =
    `₹${parseFloat(item.price).toLocaleString()} / ${item.unit}`;
  document.getElementById("contact-seller-location").innerText = item.district;

  // Set default message
  const msgText = `Hello ${item.seller}, I am interested in buying your "${item.title}" listed for sale on Smart Farmer Assistant. Is it still available?`;
  document.getElementById("contact-message").value = msgText;

  document.getElementById("contact-seller-modal").classList.add("active");
}

function closeContactModal() {
  document.getElementById("contact-seller-modal").classList.remove("active");
  marketplaceSelectedListing = null;
}

function openWhatsAppChat() {
  if (!marketplaceSelectedListing) return;

  let phone = marketplaceSelectedListing.phone.replace(/[^0-9]/g, "");
  // Add India country code if not present
  if (phone.length === 10) {
    phone = "91" + phone;
  }

  const message = document.getElementById("contact-message").value;
  const encodedText = encodeURIComponent(message);

  const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
  window.open(waUrl, "_blank");
}

function sendBuiltInMessage() {
  if (!marketplaceSelectedListing) return;

  const message = document.getElementById("contact-message").value.trim();
  if (!message) {
    alert("Please enter a message.");
    return;
  }

  // Simulate sending message
  alert(
    `Inquiry sent successfully to ${marketplaceSelectedListing.seller}! They will get in touch with you shortly.`,
  );
  closeContactModal();
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  fetchMarketData();

  // Set today's date for tracker
  const dateInput = document.getElementById("tracker-date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  // Auto-refresh from database backend every 60 seconds
  setInterval(() => {
    fetchMarketData();
  }, LIVE_UPDATE_INTERVAL);
});
