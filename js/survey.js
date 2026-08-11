/* global Chart */
/**
 * Smart Farmer Assistant - Land Survey & Registry Records (Patta/Chitta)
 * Integrates Government NLRMP API (simulated secure client) and Leaflet cadastral overlays
 */

const CADASTRAL_API_KEY =
  "YOUR_CADASTRAL_API_KEY_PLACEHOLDER";

let surveyMap, surveyMarker, selectedSurveyLocation;
let standardSurveyLayer, satelliteSurveyLayer, currentSurveyLayer;
let cadastralLayerGroup, surveyWaterLayerGroup;
let generatedSurveyPlots = [];
let selectedPlotPoly = null;
let plotPolysMap = {};
let surveySearchTimeout = null;

// Chart.js references
let landClassChart = null;
let landValueTrendChart = null;

// Initial Map Setup
function initSurveyPage() {
  const mapEl = document.getElementById("survey-map");
  if (!mapEl) return;

  // Initialize Map
  surveyMap = L.map("survey-map").setView([11.1271, 78.6569], 7);

  standardSurveyLayer = L.tileLayer(
    "https://mt{s}.google.com/vt/lyrs=m&hl={hl}&scale={scale}&x={x}&y={y}&z={z}",
    {
      subdomains: ["0", "1", "2", "3"],
      maxZoom: 22,
      maxNativeZoom: 19,
      hl: (localStorage.getItem("lang") || "en") === "ta" ? "ta" : "en",
      scale: 2,
      attribution: "&copy; Google Maps",
    },
  );

  satelliteSurveyLayer = L.tileLayer(
    "https://mt{s}.google.com/vt/lyrs=y&hl={hl}&scale={scale}&x={x}&y={y}&z={z}",
    {
      subdomains: ["0", "1", "2", "3"],
      maxZoom: 22,
      maxNativeZoom: 18, // Satellite imagery in rural areas often doesn't go beyond 18
      hl: (localStorage.getItem("lang") || "en") === "ta" ? "ta" : "en",
      scale: 2,
      attribution: "&copy; Google Maps",
    },
  );

  standardSurveyLayer.addTo(surveyMap);
  currentSurveyLayer = "standard";

  cadastralLayerGroup = L.layerGroup().addTo(surveyMap);
  surveyWaterLayerGroup = L.layerGroup().addTo(surveyMap);

  // Expose to window for global access (especially from script.js)
  window.surveyMap = surveyMap;
  window.surveyWaterLayerGroup = surveyWaterLayerGroup;
  window.updateSurveyMarker = updateSurveyMarker;
  window.highlightWaterBodies = highlightWaterBodies;

  // Satellite Toggle Button
  const satToggle = document.getElementById("survey-satellite-toggle");
  if (satToggle) {
    satToggle.addEventListener("click", () => {
      if (currentSurveyLayer === "standard") {
        surveyMap.removeLayer(standardSurveyLayer);
        satelliteSurveyLayer.addTo(surveyMap);
        satToggle.innerText = "Street View";
        satToggle.style.background = "#795548"; // Earthy brown
        currentSurveyLayer = "satellite";
      } else {
        surveyMap.removeLayer(satelliteSurveyLayer);
        standardSurveyLayer.addTo(surveyMap);
        satToggle.innerText = "Satellite View";
        satToggle.style.background = "var(--primary-green)";
        currentSurveyLayer = "standard";
      }
    });
  }

  // Map Click handler to identify clicked coordinate plots
  surveyMap.on("click", async (e) => {
    const { lat, lng } = e.latlng;
    updateSurveyMarker(lat, lng);
    
    if (window.activeMapMode === "weather") {
      let locationName = `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      if (typeof window.reverseGeocode === "function") {
        try {
          locationName = await window.reverseGeocode(lat, lng);
        } catch (err) {
          console.error("Reverse geocoding failed, using coordinates:", err);
        }
      }
      if (window.fetchWeather) {
        window.fetchWeather(lat, lng, locationName);
      }
      const weatherInput = document.getElementById("location-input");
      if (weatherInput) weatherInput.value = locationName;
    } else {
      fetchLandSurveyRecords(lat, lng);
      highlightWaterBodies(lat, lng);
    }
  });

  // Setup Autocomplete Search
  setupSurveyAutocomplete();

  // Invalidate size shortly after load to guarantee smooth rendering
  setTimeout(() => {
    surveyMap.invalidateSize();
  }, 250);
}

function updateSurveyMarker(lat, lng) {
  if (surveyMarker) {
    surveyMarker.setLatLng([lat, lng]);
    surveyMap.panTo([lat, lng]);
  } else {
    surveyMarker = L.marker([lat, lng]).addTo(surveyMap);
    surveyMap.setView([lat, lng], 12);
  }
}

function setupSurveyAutocomplete() {
  const input = document.getElementById("survey-location-input");
  const suggestionsDiv = document.getElementById("survey-suggestions");
  if (!input || !suggestionsDiv) return;

  input.addEventListener("input", () => {
    clearTimeout(surveySearchTimeout);
    const query = input.value.trim();
    if (query.length < 3) {
      suggestionsDiv.innerHTML = "";
      suggestionsDiv.style.display = "none";
      return;
    }

    surveySearchTimeout = setTimeout(async () => {
      try {
        let response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in&viewbox=75,8,80.5,14`,
          {
            headers: {
              "Accept-Language":
                typeof currentLang !== "undefined" && currentLang === "ta"
                  ? "ta"
                  : "en",
            },
          },
        );
        let data = await response.json();

        // Fallback: If no results found, try appending "Tamil Nadu" to help find small rural villages
        if ((!data || data.length === 0) && !query.toLowerCase().includes("tamil")) {
          response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Tamil Nadu")}&limit=5&addressdetails=1&countrycodes=in`,
            {
              headers: {
                "Accept-Language":
                  typeof currentLang !== "undefined" && currentLang === "ta"
                    ? "ta"
                    : "en",
              },
            },
          );
          data = await response.json();
        }

        if (data && data.length > 0) {
          suggestionsDiv.innerHTML = data
            .map((item) => {
              const addr = item.address;
              const place =
                addr.village ||
                addr.town ||
                addr.city ||
                addr.suburb ||
                addr.county ||
                item.display_name.split(",")[0];
              const state = addr.state || "";
              const displayName = state ? `${place}, ${state}` : place;

              // Google Maps styling
              const parts = item.display_name.split(",");
              const primaryPlace = parts[0].trim();
              const secondaryPlace = parts.slice(1).join(",").trim();

              return `
                <div class="suggestion-item" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${displayName}" style="display: flex; align-items: flex-start; padding: 10px 12px; border-bottom: 1px solid #eee; cursor: pointer;">
                  <i class="fas fa-map-marker-alt" style="color: #ea4335; margin-right: 12px; font-size: 1.1rem; margin-top: 3px;"></i>
                  <div style="display: flex; flex-direction: column; text-align: left;">
                    <strong style="color: #333; font-size: 0.9rem;">${primaryPlace}</strong>
                    <span style="color: #666; font-size: 0.76rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${secondaryPlace}</span>
                  </div>
                </div>
              `;
            })
            .join("");
          suggestionsDiv.style.display = "block";

          const items = suggestionsDiv.querySelectorAll(".suggestion-item");
          items.forEach((item) => {
            item.addEventListener("click", () => {
              const lat = parseFloat(item.getAttribute("data-lat"));
              const lon = parseFloat(item.getAttribute("data-lon"));
              const name = item.getAttribute("data-name");
              input.value = name;
              suggestionsDiv.innerHTML = "";
              suggestionsDiv.style.display = "none";
              updateSurveyMarker(lat, lon);
              const numInput = document.getElementById("survey-number-input");
              const surveyNo = numInput ? numInput.value.trim() : "";
              fetchLandSurveyRecords(lat, lon, surveyNo ? surveyNo : null);
              highlightWaterBodies(lat, lon);
            });
          });
        }
      } catch (err) {
        console.warn("Autocomplete error:", err);
      }
    }, 500);
  });

  document.addEventListener("click", (e) => {
    if (e.target !== input && e.target !== suggestionsDiv) {
      suggestionsDiv.innerHTML = "";
      suggestionsDiv.style.display = "none";
    }
  });
}

// Simulated Seeded Random Generator
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Fetch Land records with Simulated Government API Handshake
async function fetchLandSurveyRecords(lat, lon, specificSurveyNum = null) {
  if (!cadastralLayerGroup) return;
  cadastralLayerGroup.clearLayers();
  plotPolysMap = {};
  selectedPlotPoly = null;
  generatedSurveyPlots = [];

  const section = document.getElementById("survey-records-section");
  const tbody = document.getElementById("survey-records-table-body");
  const detailCard = document.getElementById("selected-plot-card");
  const isTamil = typeof currentLang !== "undefined" && currentLang === "ta";

  if (section) section.style.display = "block";
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 25px; color: var(--primary-green);">
          <div class="spinner" style="margin: 0 auto 10px auto; width: 25px; height: 25px;"></div>
          <span>Secure Handshake with State Land Registry Department...</span><br/>
          <span style="font-size: 0.72rem; color: #888; font-family: monospace;">Access Key: ${CADASTRAL_API_KEY.substring(0, 16)}...</span>
        </td>
      </tr>
    `;
  }

  if (detailCard) {
    detailCard.innerHTML = `
      <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
      <p style="font-size: 0.9rem; font-weight: 600;">Select a survey plot on the map to view detailed Patta records and land valuation.</p>
    `;
    detailCard.style.background = "#f9fbf8";
    detailCard.style.border = "1px dashed var(--secondary-green)";
    detailCard.style.textAlign = "center";
    detailCard.style.alignItems = "center";
  }

  // Reverse geocode to get actual District, Taluk and Village names
  let districtName = isTamil ? "தஞ்சாவூர்" : "Thanjavur";
  let talukName = isTamil ? "ஒரத்தநாடு" : "Orathanadu";
  let villageName = isTamil ? "மேலூர்" : "Melur";

  try {
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const geoRes = await fetch(geoUrl, {
      headers: { "Accept-Language": isTamil ? "ta" : "en" },
    });
    const geoData = await geoRes.json();
    if (geoData && geoData.address) {
      const addr = geoData.address;
      districtName =
        addr.state_district || addr.county || addr.city || districtName;
      talukName = addr.suburb || addr.city_district || addr.town || talukName;
      villageName =
        addr.village || addr.town || addr.hamlet || addr.suburb || villageName;
    }
  } catch (err) {
    console.warn("Reverse geocode failed, using fallbacks");
  }

  // Console logging simulated API handshake
  console.log(
    `[NLRMP-API] Initiating secure cadastral query (GET) to landrecords.gov.in/v1/survey`,
  );
  console.log(`[NLRMP-API] API Key (authorized): ${CADASTRAL_API_KEY}`);
  console.log(
    `[NLRMP-API] Handshake status: 200 OK. Parsing records for coordinate bounds (${lat.toFixed(6)}, ${lon.toFixed(6)})`,
  );

  setTimeout(() => {
    const gridLat = Math.round(lat * 1000) / 1000;
    const gridLon = Math.round(lon * 1000) / 1000;
    const baseSeed = Math.abs(Math.sin(gridLat + gridLon) * 1000);

    const ownersDb = [
      {
        en: "Kuppusamy R",
        ta: "ரா. குப்புசாமி",
        fatherEn: "Ramasamy",
        fatherTa: "ராமசாமி",
      },
      {
        en: "Anbarasan K",
        ta: "கோ. அன்பரசன்",
        fatherEn: "Kathiresan",
        fatherTa: "கதிரேசன்",
      },
      {
        en: "Lakshmi S",
        ta: "சா. லட்சுமி",
        fatherEn: "Sundaram",
        fatherTa: "சுந்தரம்",
      },
      {
        en: "Subramanian T",
        ta: "த. சுப்பிரமணியன்",
        fatherEn: "Thangavelu",
        fatherTa: "தங்கவேலு",
      },
      {
        en: "Meenakshi A",
        ta: "அ. மீனாட்சி",
        fatherEn: "Arumugam",
        fatherTa: "ஆறுமுகம்",
      },
      {
        en: "Chidambaram P",
        ta: "பெ. சிதம்பரம்",
        fatherEn: "Palanisamy",
        fatherTa: "பழனிசாமி",
      },
      {
        en: "Palanisamy M",
        ta: "மு. பழனிசாமி",
        fatherEn: "Maruthan",
        fatherTa: "மருதன்",
      },
      {
        en: "Govindaraj S",
        ta: "சீ. கோவிந்தராஜ்",
        fatherEn: "Srinivasan",
        fatherTa: "சீனிவாசன்",
      },
      {
        en: "Murugan R",
        ta: "ரா. முருகன்",
        fatherEn: "Rengasamy",
        fatherTa: "ரெங்கசாமி",
      },
      {
        en: "Ramasamy G",
        ta: "கோ. ராமசாமி",
        fatherEn: "Ganesan",
        fatherTa: "கணேசன்",
      },
      {
        en: "Karuppiah N",
        ta: "நா. கருப்பையா",
        fatherEn: "Narayanan",
        fatherTa: "நாராயணன்",
      },
      {
        en: "Maruthu M",
        ta: "மு. மருது",
        fatherEn: "Muthu",
        fatherTa: "முத்து",
      },
      {
        en: "Selvam K",
        ta: "கா. செல்வம்",
        fatherEn: "Kandasamy",
        fatherTa: "கந்தசாமி",
      },
      {
        en: "Karthikeyan P",
        ta: "பா. கார்த்திகேயன்",
        fatherEn: "Palani",
        fatherTa: "பழனி",
      },
      {
        en: "Thangavelu A",
        ta: "அ. தங்கவேலு",
        fatherEn: "Arunachalam",
        fatherTa: "அருணாசலம்",
      },
      {
        en: "Dhanalakshmi R",
        ta: "ரா. தனலட்சுமி",
        fatherEn: "Ramachandran",
        fatherTa: "ராமச்சந்திரன்",
      },
    ];

    const landTypes = [
      { type: "Wetland (Nanjai)", pricePerAcre: 1500000 },
      { type: "Dryland (Punjai)", pricePerAcre: 800000 },
      { type: "Garden Land (Thottam)", pricePerAcre: 1200000 },
    ];

    const crops = [
      "Paddy",
      "Sugarcane",
      "Banana",
      "Cotton",
      "Groundnut",
      "Turmeric",
      "Fallow",
    ];

    // Base Survey Number logic
    let baseSurveyNum = 124;
    if (specificSurveyNum) {
      const match = specificSurveyNum.match(/^(\d+)/);
      if (match) baseSurveyNum = parseInt(match[1]);
    } else {
      baseSurveyNum = 100 + Math.floor(seededRandom(baseSeed) * 400);
    }

    // Generate 3x4 contiguous irregular cadastral cells (12 plots)
    const gridRows = 3;
    const gridCols = 4;
    const vertices = [];
    const stepLat = 0.0018;
    const stepLon = 0.0022;
    const startLat = lat - (gridRows / 2) * stepLat;
    const startLon = lon - (gridCols / 2) * stepLon;

    // Create vertices grid with jitter to make polygons irregular
    for (let r = 0; r <= gridRows; r++) {
      vertices[r] = [];
      for (let c = 0; c <= gridCols; c++) {
        const vLat = startLat + r * stepLat;
        const vLon = startLon + c * stepLon;
        const jitterSeed = baseSeed + r * 13 + c * 37;
        const jitterLat = (seededRandom(jitterSeed) - 0.5) * 0.0006;
        const jitterLon = (seededRandom(jitterSeed + 1) - 0.5) * 0.0008;
        vertices[r][c] = [vLat + jitterLat, vLon + jitterLon];
      }
    }

    let plotIdx = 0;
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const i = plotIdx;
        plotIdx++;

        const rand1 = seededRandom(baseSeed + i * 11);
        const rand2 = seededRandom(baseSeed + i * 17);
        const rand3 = seededRandom(baseSeed + i * 29);
        const rand4 = seededRandom(baseSeed + i * 43);

        const ownerObj = ownersDb[Math.floor(rand1 * ownersDb.length)];
        const owner = isTamil ? ownerObj.ta : ownerObj.en;
        const father = isTamil ? ownerObj.fatherTa : ownerObj.fatherEn;
        const landInfo = landTypes[Math.floor(rand3 * landTypes.length)];
        const crop = crops[Math.floor(rand4 * crops.length)];

        // Survey No Subdivisions
        let surveyNo;
        if (specificSurveyNum && i === 5) {
          // searched plot in center
          surveyNo = specificSurveyNum;
        } else {
          const subNo = 1 + (i % 3);
          const subL = String.fromCharCode(65 + (i % 4));
          surveyNo = `${baseSurveyNum}/${subNo}${subL}`;
        }

        // Hectares and Ares calculation
        const hectaresVal = Math.floor(rand2 * 2); // 0 or 1 hectare
        const aresVal = 5 + Math.floor(rand4 * 90); // 5 to 95 ares
        const areaHecAres = `${hectaresVal}.${aresVal.toString().padStart(2, "0")}`;

        const totalSqM = hectaresVal * 10000 + aresVal * 100;
        const acres = parseFloat((totalSqM * 0.000247105).toFixed(2));

        // Tirvai (Government Tax in Rs. Paise)
        const isWet = landInfo.type.includes("Wetland");
        const taxRate = isWet ? 12.5 : 3.2;
        const tax = parseFloat((acres * taxRate).toFixed(2));

        const pattaNo = 1000 + Math.floor(rand3 * 5000);

        // Grid contiguous coordinates
        const coords = [
          vertices[r][c], // Bottom Left
          vertices[r + 1][c], // Top Left
          vertices[r + 1][c + 1], // Top Right
          vertices[r][c + 1], // Bottom Right
        ];

        generatedSurveyPlots.push({
          id: 4000 + i,
          surveyNo,
          pattaNo,
          owner,
          father,
          ownerEn: ownerObj.en,
          ownerTa: ownerObj.ta,
          fatherEn: ownerObj.fatherEn,
          fatherTa: ownerObj.fatherTa,
          district: districtName,
          taluk: talukName,
          village: villageName,
          classification: isTamil
            ? isWet
              ? "நன்செய் (Wetland)"
              : landInfo.type.includes("Dryland")
                ? "புன்செய் (Dryland)"
                : "தோட்ட (Garden)"
            : landInfo.type,
          areaHecAres,
          acres,
          tax,
          pricePerAcre: landInfo.pricePerAcre,
          totalValue: Math.round(acres * landInfo.pricePerAcre),
          crop: isTamil
            ? crop === "Paddy"
              ? "நெல்"
              : crop === "Sugarcane"
                ? "கரும்பு"
                : crop === "Banana"
                  ? "வாழை"
                  : crop === "Cotton"
                    ? "பருத்தி"
                    : crop === "Groundnut"
                      ? "நிலக்கடலை"
                      : crop === "Turmeric"
                        ? "மஞ்சள்"
                        : "தரிசு நிலம்"
            : crop,
          coords,
        });
      }
    }

    // Populate Table
    if (tbody) {
      tbody.innerHTML = generatedSurveyPlots
        .map(
          (p) => `
        <tr class="survey-row" id="survey-row-${p.id}" style="border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s;" onclick="highlightPlotById(${p.id})">
          <td style="padding: 12px 10px; font-weight: 700; color: #e65100;">${p.surveyNo}</td>
          <td style="padding: 12px 10px; font-weight: 600; color: #555;">${p.pattaNo}</td>
          <td style="padding: 12px 10px; font-weight: 600; color: #333;">${p.owner}</td>
          <td style="padding: 12px 10px; color: #555;">${p.classification}</td>
          <td style="padding: 12px 10px; font-weight: 700; color: var(--primary-green);">${p.areaHecAres} Hec</td>
          <td style="padding: 12px 10px; font-weight: 700; color: #2e7d32;">₹${p.tax.toFixed(2)}</td>
        </tr>
      `,
        )
        .join("");

      // Row hover effects
      const rows = tbody.querySelectorAll(".survey-row");
      rows.forEach((r) => {
        r.addEventListener("mouseenter", () => {
          if (!r.classList.contains("selected-row")) {
            r.style.background = "#f1f8e9";
          }
        });
        r.addEventListener("mouseleave", () => {
          if (!r.classList.contains("selected-row")) {
            r.style.background = "transparent";
          }
        });
      });
    }

    // Draw Polygons
    generatedSurveyPlots.forEach((p) => {
      drawPlotPolygon(p);
    });

    // Update Visualization Charts
    renderSurveyVisualCharts(generatedSurveyPlots, isTamil);

    // If specific survey number was searched, select it automatically!
    if (specificSurveyNum) {
      const searchedPlot = generatedSurveyPlots.find(
        (p) => p.surveyNo === specificSurveyNum,
      );
      if (searchedPlot) {
        highlightPlotById(searchedPlot.id);
      }
    }

    // Check and translate any dynamic strings if lang is Tamil
    if (typeof window.checkAndTranslate === "function") {
      window.checkAndTranslate();
    }
  }, 700);
}

function drawPlotPolygon(plot) {
  const poly = L.polygon(plot.coords, {
    color: "#795548",
    fillColor: "#ffcc80",
    fillOpacity: 0.15,
    weight: 2,
  }).addTo(cadastralLayerGroup);

  plotPolysMap[plot.id] = poly;

  const isTamil = typeof currentLang !== "undefined" && currentLang === "ta";
  poly.bindPopup(
    `<b>${isTamil ? "புல எண்" : "Survey No"}: ${plot.surveyNo}</b><br>${isTamil ? "உரிமையாளர்" : "Owner"}: ${plot.owner}`,
  );

  poly.on("mouseover", () => {
    if (selectedPlotPoly !== poly) {
      poly.setStyle({
        weight: 3.5,
        color: "#e65100",
        fillOpacity: 0.3,
      });
    }
  });

  poly.on("mouseout", () => {
    if (selectedPlotPoly !== poly) {
      poly.setStyle({
        weight: 2,
        color: "#795548",
        fillOpacity: 0.15,
      });
    }
  });

  poly.on("click", (e) => {
    L.DomEvent.stopPropagation(e);
    selectPlotRecord(plot, poly);
  });
}

function selectPlotRecord(plot, poly) {
  const isTamil = typeof currentLang !== "undefined" && currentLang === "ta";

  if (selectedPlotPoly) {
    let prevPlotId = null;
    Object.keys(plotPolysMap).forEach((key) => {
      if (plotPolysMap[key] === selectedPlotPoly) {
        prevPlotId = key;
      }
    });

    const prevPlot = generatedSurveyPlots.find(
      (p) => p.id === parseInt(prevPlotId),
    );
    if (prevPlot) {
      selectedPlotPoly.setStyle({
        color: "#795548",
        fillColor: "#ffcc80",
        fillOpacity: 0.15,
        weight: 2,
      });
    }
  }

  selectedPlotPoly = poly;
  poly.setStyle({
    color: "#ffd600",
    fillColor: "#fff59d",
    fillOpacity: 0.45,
    weight: 4,
  });

  poly.openPopup();

  // Row Highlight
  const tbody = document.getElementById("survey-records-table-body");
  if (tbody) {
    const rows = tbody.querySelectorAll(".survey-row");
    rows.forEach((r) => {
      r.style.background = "transparent";
      r.classList.remove("selected-row");
    });

    const activeRow = document.getElementById(`survey-row-${plot.id}`);
    if (activeRow) {
      activeRow.style.background = "#dcedc8";
      activeRow.classList.add("selected-row");
      activeRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // Update Detail Card
  const detailCard = document.getElementById("selected-plot-card");
  if (detailCard) {
    detailCard.style.background = "#fff";
    detailCard.style.border = "2px solid var(--primary-green)";
    detailCard.style.textAlign = "left";
    detailCard.style.alignItems = "stretch";

    const districtLabel = isTamil ? "மாவட்டம்:" : "District:";
    const talukLabel = isTamil ? "வட்டம் (தாலுகா):" : "Taluk:";
    const villageLabel = isTamil ? "கிராமம்:" : "Village:";
    const pattaLabel = isTamil ? "பட்டா எண்:" : "Patta Number:";
    const ownerLabel = isTamil ? "பட்டாதாரர் பெயர்:" : "Pattadhar Name:";
    const fatherLabel = isTamil ? "தந்தை/கணவர் பெயர்:" : "Father/Husband Name:";
    const classLabel = isTamil ? "நில வகைப்பாடு:" : "Classification:";
    const areaLabel = isTamil ? "நிலப் பரப்பு:" : "Land Area:";
    const taxLabel = isTamil ? "நில தீர்வை (வரி):" : "Land Tax (Tirvai):";
    const cropLabel = isTamil
      ? "சாகுபடி பயிர் (அடங்கல்):"
      : "Current Crop (Adangal):";
    const valueLabel = isTamil
      ? "சந்தை மதிப்பு (தோராயமாக):"
      : "Est. Market Value:";

    detailCard.innerHTML = `
      <h4 style="color: var(--primary-green); font-size: 1.15rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-file-signature"></i> ${isTamil ? "புல எண்" : "Survey No"}: ${plot.surveyNo}
      </h4>
      <div style="display: flex; flex-direction: column; gap: 9px; font-size: 0.88rem;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;">
          <span style="color: #666;">${districtLabel}</span>
          <strong style="color: #333;">${plot.district}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;">
          <span style="color: #666;">${talukLabel}</span>
          <strong style="color: #333;">${plot.taluk}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;">
          <span style="color: #666;">${villageLabel}</span>
          <strong style="color: #333;">${plot.village}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;">
          <span style="color: #666; font-weight: 700;">${pattaLabel}</span>
          <strong style="color: #b71c1c;">${plot.pattaNo}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;">
          <span style="color: #666;">${ownerLabel}</span>
          <strong style="color: #333;">${plot.owner}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;">
          <span style="color: #666;">${fatherLabel}</span>
          <strong style="color: #333;">${plot.father}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;">
          <span style="color: #666;">${classLabel}</span>
          <strong style="color: #333;">${plot.classification}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;">
          <span style="color: #666;">${areaLabel}</span>
          <strong style="color: var(--primary-green); font-size: 0.95rem;">${plot.areaHecAres} Hec (~${plot.acres} Acres)</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;">
          <span style="color: #666;">${cropLabel}</span>
          <strong style="color: #333;">${plot.crop}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;">
          <span style="color: #666; font-weight: 700;">${taxLabel}</span>
          <strong style="color: #2e7d32;">₹${plot.tax.toFixed(2)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 4px; padding-bottom: 10px;">
          <span style="color: #666; font-weight: 700;">${valueLabel}</span>
          <strong style="color: #2e7d32; font-size: 1.05rem; font-weight: 800;">₹${plot.totalValue.toLocaleString()}</strong>
        </div>
      </div>
      
      <!-- TN Government Registry Verification Bridge inside Card -->
      <div style="margin-top: 15px; padding: 12px; border-radius: 8px; background: #e8f5e9; border: 1.5px solid #a5d6a7; display: flex; flex-direction: column; gap: 8px;">
        <h5 style="color: #1b5e20; font-size: 0.85rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 6px;">
          <i class="fas fa-shield-alt"></i> ${isTamil ? "அரசு இ-சேவைகள் சரிபார்ப்பு" : "Official TN Government Verification"}
        </h5>
        <p style="font-size: 0.74rem; color: #33691e; margin: 0; line-height: 1.35;">
          ${isTamil 
            ? "நில விவரங்களை சரிபார்க்க, கீழே உள்ள தகவலை நகலெடுத்து, அரசு இ-சேவை இணையதளத்தில் பதியவும்:" 
            : "To legally verify this land, copy the details below and paste them into the official TN E-Services Portal:"}
        </p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 4px;">
          <!-- Copy District -->
          <div style="background: white; border: 1px solid #c8e6c9; border-radius: 6px; padding: 4px 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
            <div style="display: flex; flex-direction: column; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span style="font-size: 0.55rem; color: #777;">${isTamil ? "மாவட்டம்" : "District"}</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: #333; overflow: hidden; text-overflow: ellipsis;">${plot.district}</span>
            </div>
            <button onclick="copyToClipboard('${plot.district.replace(/'/g, "\\'")}', this)" style="border: none; background: transparent; cursor: pointer; color: var(--primary-green); padding: 2px;" title="Copy">
              <i class="far fa-copy" style="font-size: 0.8rem;"></i>
            </button>
          </div>
          
          <!-- Copy Taluk -->
          <div style="background: white; border: 1px solid #c8e6c9; border-radius: 6px; padding: 4px 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
            <div style="display: flex; flex-direction: column; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span style="font-size: 0.55rem; color: #777;">${isTamil ? "வட்டம்" : "Taluk"}</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: #333; overflow: hidden; text-overflow: ellipsis;">${plot.taluk}</span>
            </div>
            <button onclick="copyToClipboard('${plot.taluk.replace(/'/g, "\\'")}', this)" style="border: none; background: transparent; cursor: pointer; color: var(--primary-green); padding: 2px;" title="Copy">
              <i class="far fa-copy" style="font-size: 0.8rem;"></i>
            </button>
          </div>

          <!-- Copy Village -->
          <div style="background: white; border: 1px solid #c8e6c9; border-radius: 6px; padding: 4px 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
            <div style="display: flex; flex-direction: column; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span style="font-size: 0.55rem; color: #777;">${isTamil ? "கிராமம்" : "Village"}</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: #333; overflow: hidden; text-overflow: ellipsis;">${plot.village}</span>
            </div>
            <button onclick="copyToClipboard('${plot.village.replace(/'/g, "\\'")}', this)" style="border: none; background: transparent; cursor: pointer; color: var(--primary-green); padding: 2px;" title="Copy">
              <i class="far fa-copy" style="font-size: 0.8rem;"></i>
            </button>
          </div>

          <!-- Copy Survey Number -->
          <div style="background: white; border: 1px solid #c8e6c9; border-radius: 6px; padding: 4px 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
            <div style="display: flex; flex-direction: column; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span style="font-size: 0.55rem; color: #777;">${isTamil ? "புல எண்" : "Survey No."}</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: #333; overflow: hidden; text-overflow: ellipsis;">${plot.surveyNo}</span>
            </div>
            <button onclick="copyToClipboard('${plot.surveyNo.replace(/'/g, "\\'")}', this)" style="border: none; background: transparent; cursor: pointer; color: var(--primary-green); padding: 2px;" title="Copy">
              <i class="far fa-copy" style="font-size: 0.8rem;"></i>
            </button>
          </div>
        </div>

        <a href="https://eservices.tn.gov.in/eservicesweb/land/chitta.html" target="_blank" class="btn" style="margin-top: 5px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: #2e7d32; color: white; border: none; font-weight: bold; padding: 10px; border-radius: 6px; text-decoration: none; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.15); font-size: 0.82rem;" onmouseover="this.style.background='#1b5e20'" onmouseout="this.style.background='#2e7d32'">
          <i class="fas fa-external-link-alt"></i> 
          <span>${isTamil ? "அரசு இ-சேவை தளம் செல்க" : "Open TN Gov E-Services Portal"}</span>
        </a>
      </div>

      <!-- Action Button for Weather Integration -->
      <button onclick="goToWeather(${plot.coords && plot.coords.length > 0 ? plot.coords[0][0] : poly.getBounds().getCenter().lat}, ${plot.coords && plot.coords.length > 0 ? plot.coords[0][1] : poly.getBounds().getCenter().lng}, '${plot.village}, ${plot.district}')" class="btn" style="margin-top: 15px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--primary-green); color: white; border: none; font-weight: bold; padding: 12px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
        <i class="fas fa-cloud-sun"></i> 
        <span>${isTamil ? "இந்த நிலத்திற்கான வானிலை விவரம்" : "View Weather Forecast for this Plot"}</span>
      </button>
    `;

    // Update Right-side helper inputs if they are in the DOM
    const hDistrict = document.getElementById("helper-district");
    const hTaluk = document.getElementById("helper-taluk");
    const hVillage = document.getElementById("helper-village");
    const hSurvey = document.getElementById("helper-survey");
    if (hDistrict) hDistrict.innerText = plot.district;
    if (hTaluk) hTaluk.innerText = plot.taluk;
    if (hVillage) hVillage.innerText = plot.village;
    if (hSurvey) hSurvey.innerText = plot.surveyNo;

    // Update Farm Digital Twin
    if (window.updateFarmDigitalTwin) {
      window.updateFarmDigitalTwin({
        activeFarm: {
          surveyNo: plot.surveyNo,
          village: plot.village || (typeof selectedSurveyLocation !== "undefined" && selectedSurveyLocation?.name?.split(",")[0]) || "",
          acres: plot.acres,
          classification: plot.classification,
          crop: plot.crop,
          soilType: (plot.classification || "").toLowerCase().includes("wetland") ? "clay" : "loamy"
        }
      });
    }
  }
}

function highlightPlotById(id) {
  const plot = generatedSurveyPlots.find((p) => p.id === id);
  const poly = plotPolysMap[id];
  if (plot && poly) {
    selectPlotRecord(plot, poly);
    const bounds = poly.getBounds();
    surveyMap.fitBounds(bounds, { maxZoom: 17, padding: [40, 40] });
  }
}

// Specific Survey Number Search click trigger
async function searchLandRecords() {
  const placeInput = document.getElementById("survey-location-input");
  const numberInput = document.getElementById("survey-number-input");

  if (!placeInput) return;

  const place = placeInput.value.trim();
  const surveyNo = numberInput ? numberInput.value.trim() : "";

  if (!place) {
    alert("Please enter village/city name");
    return;
  }

  // Geocode place coordinates
  try {
    let response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1&addressdetails=1&countrycodes=in&viewbox=75,8,80.5,14`,
    );
    let data = await response.json();

    // Fallback: If no results found, try appending "Tamil Nadu" to help find small rural villages
    if ((!data || data.length === 0) && !place.toLowerCase().includes("tamil")) {
      response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place + ", Tamil Nadu")}&limit=1&addressdetails=1&countrycodes=in`,
      );
      data = await response.json();
    }

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      updateSurveyMarker(lat, lon);
      fetchLandSurveyRecords(lat, lon, surveyNo ? surveyNo : null);
      highlightWaterBodies(lat, lon);
    } else {
      alert("Location not found. Please try another place.");
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
  }
}

// Download Patta/Chitta PDF record certificate simulation
function downloadPattaPDF(plotId) {
  const plot = generatedSurveyPlots.find((p) => p.id === plotId);
  if (!plot) return;

  const isTamil = localStorage.getItem("lang") === "ta";

  // Create print window
  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) {
    alert("Please allow popups to download/print the PDF copy.");
    return;
  }

  const formattedTax = parseFloat(plot.tax).toFixed(2);
  const now = new Date().toLocaleString(isTamil ? "ta-IN" : "en-IN");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="${isTamil ? "ta" : "en"}">
      <head>
        <meta charset="UTF-8">
        <title>Patta Chitta Copy - ${plot.surveyNo}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            padding: 30px;
            color: #1a202c;
            background: #fff;
            line-height: 1.5;
          }
          .border-wrapper {
            border: 4px double #1b5e20;
            padding: 25px;
            border-radius: 4px;
            position: relative;
          }
          .govt-header {
            text-align: center;
            border-bottom: 2px dashed #1b5e20;
            padding-bottom: 15px;
            margin-bottom: 25px;
            position: relative;
          }
          .emblem-placeholder {
            width: 70px;
            height: 70px;
            margin: 0 auto 10px auto;
            background: #f1f8e9;
            border: 2px solid #2e7d32;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #1b5e20;
            font-weight: bold;
          }
          .govt-title {
            font-size: 19px;
            font-weight: 800;
            color: #1b5e20;
            margin: 5px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .dept-title {
            font-size: 14px;
            font-weight: 700;
            color: #4a5568;
            margin: 0;
          }
          .extract-title {
            font-size: 16px;
            font-weight: 800;
            color: #2e7d32;
            margin-top: 8px;
            text-decoration: underline;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-size: 14px;
          }
          .info-table td {
            padding: 8px 12px;
            vertical-align: top;
          }
          .info-table td.label {
            font-weight: 700;
            color: #4a5568;
            width: 30%;
          }
          .info-table td.val {
            color: #1a202c;
            border-bottom: 1px dotted #cbd5e0;
          }
          .plots-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 13px;
          }
          .plots-table th {
            background: #f1f8e9;
            border: 1px solid #1b5e20;
            padding: 10px;
            color: #1b5e20;
            font-weight: 800;
            text-align: center;
          }
          .plots-table td {
            border: 1px solid #cbd5e0;
            padding: 10px;
            text-align: center;
          }
          .footer-section {
            margin-top: 40px;
            border-top: 1px dashed #cbd5e0;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .legal-disclaimer {
            font-size: 11px;
            color: #718096;
            max-width: 60%;
            line-height: 1.4;
          }
          .verification-box {
            text-align: right;
            font-size: 12px;
          }
          .qr-placeholder {
            width: 85px;
            height: 85px;
            border: 2px solid #2e7d32;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            color: #2e7d32;
            font-weight: bold;
            margin-bottom: 5px;
            float: right;
            background: #fafafa;
          }
          .print-btn-bar {
            text-align: center;
            margin-bottom: 20px;
            padding: 15px;
            background: #edf2f7;
            border-radius: 8px;
          }
          .btn-print {
            background-color: #2e7d32;
            color: white;
            border: none;
            padding: 10px 24px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(46,125,50,0.2);
            transition: all 0.2s;
          }
          .btn-print:hover {
            background-color: #1b5e20;
          }
        </style>
      </head>
      <body>
        <div class="print-btn-bar no-print">
          <button class="btn-print" onclick="window.print()">${isTamil ? "PDF ஆக சேமிக்கவும் / அச்சிடவும்" : "Save as PDF / Print Document"}</button>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #4a5568;">
            ${isTamil ? "குறிப்பு: திறக்கும் அச்சிடும் விண்டோவில் 'Save as PDF' என்பதைத் தேர்ந்தெடுக்கவும்." : "Tip: Select 'Save as PDF' in the destination print window to save as a PDF file."}
          </p>
        </div>
        
        <div class="border-wrapper">
          <div class="govt-header">
            <div class="emblem-placeholder">🌱</div>
            <div class="govt-title">${isTamil ? "தமிழ்நாடு அரசு - வருவாய்த்துறை" : "GOVERNMENT OF TAMIL NADU - REVENUE DEPARTMENT"}</div>
            <div class="dept-title">${isTamil ? "நில உரிமைப் பதிவேடு நகல்" : "LAND RECORDS EXTRACT COPY"}</div>
            <div class="extract-title">${isTamil ? "சிட்டா விவரம் (Chitta Copy)" : "CHITTA EXTRACT (Form 1)"}</div>
          </div>
          
          <table class="info-table">
            <tr>
              <td class="label">${isTamil ? "மாவட்டம்:" : "District:"}</td>
              <td class="val">${plot.district}</td>
              <td class="label">${isTamil ? "வட்டம் (தாலுகா):" : "Taluk:"}</td>
              <td class="val">${plot.taluk}</td>
            </tr>
            <tr>
              <td class="label">${isTamil ? "கிராமம்:" : "Village:"}</td>
              <td class="val">${plot.village}</td>
              <td class="label">${isTamil ? "பட்டா எண்:" : "Patta Number:"}</td>
              <td class="val"><strong>${plot.pattaNo}</strong></td>
            </tr>
            <tr>
              <td class="label">${isTamil ? "பட்டாதாரர் பெயர்:" : "Pattadhar Name:"}</td>
              <td class="val"><strong>${isTamil ? plot.ownerTa : plot.ownerEn}</strong></td>
              <td class="label">${isTamil ? "தந்தை / கணவர் பெயர்:" : "Father / Husband Name:"}</td>
              <td class="val">${isTamil ? plot.fatherTa : plot.fatherEn}</td>
            </tr>
          </table>

          <table class="plots-table">
            <thead>
              <tr>
                <th>${isTamil ? "புல எண் & உட்பிரிவு" : "Survey & Subdivision"}</th>
                <th>${isTamil ? "நில வகைப்பாடு" : "Land Class"}</th>
                <th>${isTamil ? "பரப்பளவு (ஹெக்டேர் - ஏர்)" : "Area (Hec - Ares)"}</th>
                <th>${isTamil ? "நிலத் தீர்வை (வரி)" : "Land Tax (Tirvai)"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${plot.surveyNo}</strong></td>
                <td>${plot.classification}</td>
                <td>${plot.areaHecAres} Hec (~${plot.acres} Acres)</td>
                <td><strong>₹${formattedTax}</strong></td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 13px;">
            <p style="margin: 5px 0;"><strong>${isTamil ? "தற்போதைய சாகுபடி (அடங்கல்):" : "Current Crop (Adangal):"}</strong> ${plot.crop}</p>
            <p style="margin: 5px 0;"><strong>${isTamil ? "மதிப்பிடப்பட்ட சந்தை மதிப்பு:" : "Estimated Market Value:"}</strong> ₹${plot.totalValue.toLocaleString()}</p>
          </div>

          <div class="footer-section">
            <div class="legal-disclaimer">
              ${
                isTamil
                  ? "* இக்குறிப்பு மின்-பதிவேடு சரிபார்ப்பிற்காக மட்டுமே. நீதிமன்ற தேவைக்கு அல்லது சட்ட ஆவணங்களுக்கு கையொப்பம் இன்றி செல்லாது."
                  : "* This copy is generated from the simulated NLRMP database for verification. Not valid for court or legal disputes without official signature/stamp."
              }
              <br><span style="font-size: 9px; opacity: 0.8;">Generated on: ${now}</span>
            </div>
            <div class="verification-box">
              <div class="qr-placeholder">
                QR CODE<br>VERIFICATION
              </div>
              <div style="clear: both; margin-top: 5px; font-family: monospace; font-size: 10px; color: #4a5568;">
                Ref ID: TN-NLRMP-${Date.now().toString().slice(-8)}
              </div>
            </div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

async function highlightWaterBodies(lat, lon) {
  if (!surveyWaterLayerGroup) return;
  surveyWaterLayerGroup.clearLayers();

  const latMin = lat - 0.03;
  const latMax = lat + 0.03;
  const lonMin = lon - 0.03;
  const lonMax = lon + 0.03;

  const url = "https://overpass-api.de/api/interpreter";
  const query = `[out:json][timeout:15];(
    node["natural"="water"](${latMin},${lonMin},${latMax},${lonMax});
    way["natural"="water"](${latMin},${lonMin},${latMax},${lonMax});
    way["waterway"="riverbank"](${latMin},${lonMin},${latMax},${lonMax});
    relation["natural"="water"](${latMin},${lonMin},${latMax},${lonMax});
  );out geom;`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) throw new Error("Overpass query failed");
    const data = await response.json();

    if (data && data.elements) {
      const isTamil =
        typeof currentLang !== "undefined" && currentLang === "ta";
      data.elements.forEach((el) => {
        if (el.type === "node") {
          L.circleMarker([el.lat, el.lon], {
            radius: 8,
            color: "#0055ff",
            fillColor: "#00b0ff",
            fillOpacity: 0.8,
            weight: 2,
          })
            .addTo(surveyWaterLayerGroup)
            .bindPopup(
              `<b>${el.tags?.name || (isTamil ? "நீர் நிலை" : "Water Point")}</b>`,
            );
        } else if (el.type === "way" || el.type === "relation") {
          if (el.geometry && el.geometry.length >= 3) {
            const coords = el.geometry.map((pt) => [pt.lat, pt.lon]);
            L.polygon(coords, {
              color: "#0055ff",
              fillColor: "#3399ff",
              fillOpacity: 0.5,
              weight: 3,
            })
              .addTo(surveyWaterLayerGroup)
              .bindPopup(
                `<b>${el.tags?.name || (isTamil ? "நீர் பரப்பு" : "Water Body")}</b>`,
              );
          } else if (el.geometry && el.geometry.length >= 2) {
            const coords = el.geometry.map((pt) => [pt.lat, pt.lon]);
            L.polyline(coords, {
              color: "#0055ff",
              weight: 4,
              opacity: 0.8,
            })
              .addTo(surveyWaterLayerGroup)
              .bindPopup(
                `<b>${el.tags?.name || (isTamil ? "ஆறு / ஓடை" : "Waterway")}</b>`,
              );
          }
        }
      });
    }
  } catch (err) {
    console.warn("Could not load water bodies:", err);
  }
}

// Professional Chart Visualizations (Chart.js integration)
function renderSurveyVisualCharts(plots, isTamil) {
  const ctxClass = document.getElementById("landClassChart");
  const ctxTrend = document.getElementById("landValueTrendChart");

  if (!ctxClass || !ctxTrend) return;

  // Destroy previous charts if they exist
  if (landClassChart) landClassChart.destroy();
  if (landValueTrendChart) landValueTrendChart.destroy();

  // Aggregate land classification share
  let wetAcres = 0,
    dryAcres = 0,
    gardenAcres = 0;
  plots.forEach((p) => {
    if (
      p.classification.includes("Wetland") ||
      p.classification.includes("நன்செய்")
    ) {
      wetAcres += p.acres;
    } else if (
      p.classification.includes("Dryland") ||
      p.classification.includes("புன்செய்")
    ) {
      dryAcres += p.acres;
    } else {
      gardenAcres += p.acres;
    }
  });

  const classLabels = isTamil
    ? [
        "நன்செய் நிலம் (Wetland)",
        "புன்செய் நிலம் (Dryland)",
        "தோட்ட நிலம் (Garden)",
      ]
    : ["Wetland (Nanjai)", "Dryland (Punjai)", "Garden Land (Thottam)"];

  // Chart 1: Doughnut Chart representing Land Share
  landClassChart = new Chart(ctxClass, {
    type: "doughnut",
    data: {
      labels: classLabels,
      datasets: [
        {
          data: [
            parseFloat(wetAcres.toFixed(1)),
            parseFloat(dryAcres.toFixed(1)),
            parseFloat(gardenAcres.toFixed(1)),
          ],
          backgroundColor: ["#0288d1", "#ffa726", "#66bb6a"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, font: { family: "Inter", size: 10 } },
        },
      },
    },
  });

  // Chart 2: Land Value Trend Line Chart (past 5 years trend)
  const years = ["2022", "2023", "2024", "2025", "2026"];
  const trendData = [8.5, 9.2, 10.4, 11.1, 11.7]; // value in lakhs per acre average

  const trendLabel = isTamil
    ? "சராசரி மதிப்பு (இலட்சங்களில் / ஏக்கர்)"
    : "Average Value (Lakhs / Acre)";

  landValueTrendChart = new Chart(ctxTrend, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: trendLabel,
          data: trendData,
          borderColor: "#2e7d32",
          backgroundColor: "rgba(46, 125, 50, 0.1)",
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointBackgroundColor: "#2e7d32",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          ticks: { callback: (value) => "₹" + value + " L" },
        },
      },
    },
  });
}

// Global active mode
window.activeMapMode = "land";

// Global mode switcher
window.setDashboardMode = function(mode) {
  const isTamil = typeof currentLang !== "undefined" && currentLang === "ta";
  const titleEl = document.getElementById("map-section-title");
  
  const landBtn = document.getElementById("toggle-mode-land");
  const weatherBtn = document.getElementById("toggle-mode-weather");
  
  if (mode === "land") {
    if (landBtn) {
      landBtn.classList.add("active");
      landBtn.style.background = "var(--primary-green)";
      landBtn.style.color = "white";
    }
    if (weatherBtn) {
      weatherBtn.classList.remove("active");
      weatherBtn.style.background = "transparent";
      weatherBtn.style.color = "#558b2f";
    }
    
    if (titleEl) {
      titleEl.innerHTML = isTamil ? "இணையவழி புல வரைபடம் & நீர்நிலைகள்" : "Interactive Cadastral Map & Water Highlights";
    }
    
    // Hide weather, show land
    const weatherSec = document.getElementById("weather-records-section");
    if (weatherSec) weatherSec.style.display = "none";
    
    const landSec = document.getElementById("survey-records-section");
    if (landSec) landSec.style.display = "block";
    
    window.activeMapMode = "land";
    window.location.hash = "land";
  } else {
    if (weatherBtn) {
      weatherBtn.classList.add("active");
      weatherBtn.style.background = "var(--primary-green)";
      weatherBtn.style.color = "white";
    }
    if (landBtn) {
      landBtn.classList.remove("active");
      landBtn.style.background = "transparent";
      landBtn.style.color = "#558b2f";
    }
    
    if (titleEl) {
      titleEl.innerHTML = isTamil ? "வானிலை வரைபடம் & முன்னறிவிப்பு" : "Interactive Weather Map & Forecast";
    }
    
    // Hide land, show weather
    const landSec = document.getElementById("survey-records-section");
    if (landSec) landSec.style.display = "none";
    
    const weatherSec = document.getElementById("weather-records-section");
    if (weatherSec) weatherSec.style.display = "block";
    
    window.activeMapMode = "weather";
    window.location.hash = "weather";
  }
  
  if (window.surveyMap) {
    setTimeout(() => {
      window.surveyMap.invalidateSize();
    }, 100);
  }
};

// Global function to redirect to standalone weather.html
window.goToWeather = function(lat, lon, name) {
  localStorage.setItem('sharedLocation', JSON.stringify({ lat, lon, name }));
  window.location.href = 'weather.html';
};

// Initialization on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  initSurveyPage();
  
  // Set default mode to land (weather is on a separate page now)
  window.setDashboardMode('land');
  
  // Handle shared state if navigating from weather.html
  const shared = localStorage.getItem('sharedLocation');
  if (shared) {
    try {
      const { lat, lon, name } = JSON.parse(shared);
      localStorage.removeItem('sharedLocation');
      
      // Auto-load land survey data for the shared location
      setTimeout(() => {
        updateSurveyMarker(lat, lon);
        fetchLandSurveyRecords(lat, lon);
        highlightWaterBodies(lat, lon);
      }, 500);
    } catch (e) {
      console.error("Failed to parse shared location:", e);
    }
  }
});

// Also expose as global for safety
window.searchLandRecords = searchLandRecords;
window.highlightPlotById = highlightPlotById;
window.downloadPattaPDF = downloadPattaPDF;

// ===================================================================
// TAMIL NADU E-SERVICES PORTAL PATTA/CHITTA MOCK SEARCH LOGIC
// ===================================================================

const landLocations = {
  Ariyalur: {
    taluks: {
      "Ariyalur (அரியலூர்)": ["Ariyalur Town (அரியலூர்)", "Keezhapalur (கீழப்பழுவூர்)", "Kallankurichi (கல்லங்குறிச்சி)"],
      "Sendurai (செந்துறை)": ["Sendurai Village (செந்துறை)", "Nakkambadi (நக்கம்பாடி)", "Asur (ஆசூர்)"]
    }
  },
  Chengalpattu: {
    taluks: {
      "Chengalpattu (செங்கல்கட்டு)": ["Chengalpattu Town (செங்கல்பட்டு)", "Vandalur (வண்டலூர்)", "Maraimalai Nagar (மறைமலைநகர்)"],
      "Tambaram (தாம்பரம்)": ["Tambaram Town (தாம்பரம்)", "Pallavaram (பல்லாவரம்)", "Chitlapakkam (சிட்லபாக்கம்)"]
    }
  },
  Chennai: {
    taluks: {
      "Egmore (எழும்பூர்)": ["Egmore Area (எழும்பூர்)", "Nungambakkam (நுங்கம்பாக்கம்)", "Chetpet (சேத்துப்பட்டு)"],
      "Mylapore (மயிலாப்பூர்)": ["Mylapore Area (மயிலாப்பூர்)", "Adyar (அடையாறு)", "Royapettah (இராயப்பேட்டை)"]
    }
  },
  Coimbatore: {
    taluks: {
      "Coimbatore North (கோவை வடக்கு)": ["Ganapathy (கணபதி)", "Thudiyalur (துடியலூர்)", "Sowripalayam (சௌரிபாளையம்)"],
      "Pollachi (பொள்ளாச்சி)": ["Pollachi Town (பொள்ளாச்சி)", "Anaimalai (ஆனைமலை)", "Negamam (நெகமம்)"]
    }
  },
  Cuddalore: {
    taluks: {
      "Cuddalore (கடலூர்)": ["Cuddalore Town (கடலூர்)", "Nellikuppam (நெல்லிக்குப்பம்)", "Panruti (பண்ருட்டி)"],
      "Chidambaram (சிதம்பரம்)": ["Chidambaram Town (சிதம்பரம்)", "Kattumannarkoil (காட்டுமன்னார்கோவில்)", "Annamalai Nagar (அண்ணாமலை நகர்)"]
    }
  },
  Dharmapuri: {
    taluks: {
      "Pennagaram (பெண்ணாகரம்)": ["Kodur (கோடூர்)", "Pennagaram (பெண்ணாகரம் கிராமம்)", "Hogenakkal (ஒகேனக்கல்)"],
      "Harur (அரூர்)": ["Harur Town (அரூர் நகரம்)", "Morappur (மொரப்பூர்)", "Kambainallur (கம்பைநல்லூர்)"]
    }
  },
  Dindigul: {
    taluks: {
      "Dindigul (திண்டுக்கல்)": ["Dindigul Town (திண்டுக்கல்)", "Oddanchatram (ஒட்டன்சத்திரம்)", "Natham (நத்தம்)"],
      "Palani (பழனி)": ["Palani Town (பழனி)", "Kodaikanal (கொடைக்கானல்)", "Ayakudi (ஆயக்குடி)"]
    }
  },
  Erode: {
    taluks: {
      "Gobichettipalayam (கோபிசெட்டிபாளையம்)": ["Gobi Town (கோபி நகரம்)", "Nambiyur (நம்பியூர்)", "Kalingarayanpalayam (காலிங்கராயன்பாளையம்)"],
      "Perundurai (பெருந்துறை)": ["Perundurai (பெருந்துறை கிராமம்)", "Chennimalai (சென்னிமலை)", "Kanjikovil (கஞ்சிகோவில்)"]
    }
  },
  Kallakurichi: {
    taluks: {
      "Kallakurichi (கள்ளக்குறிச்சி)": ["Kallakurichi Town (கள்ளக்குறிச்சி)", "Chinnasalem (சின்னசேலம்)", "Thiyagadurgam (தியாகதுருகம்)"],
      "Sankarapuram (சங்கராபுரம்)": ["Sankarapuram Town (சங்கராபுரம்)", "Rishivandiyam (ரிஷிவந்தியம்)", "Moongilthuraipattu (மூங்கில்துறைப்பட்டு)"]
    }
  },
  Kanchipuram: {
    taluks: {
      "Kanchipuram (காஞ்சிபுரம்)": ["Kanchipuram Town (காஞ்சிபுரம்)", "Walajabad (வாலாஜாபாத்)", "Uttiramerur (உத்திரமேரூர்)"],
      "Sriperumbudur (ஸ்ரீபெரும்புதூர்)": ["Sriperumbudur Town (ஸ்ரீபெரும்புதூர்)", "Kundrathur (குன்றத்தூர்)", "Sunguvarchatram (சுங்குவார்சத்திரம்)"]
    }
  },
  Kanyakumari: {
    taluks: {
      "Nagercoil (நாகர்கோவில்)": ["Nagercoil Town (நாகர்கோவில்)", "Agastheeswaram (அகஸ்தீஸ்வரம்)", "Kanyakumari Town (கன்னியாகுமரி)"],
      "Kalkulam (கல்குளம்)": ["Thuckalay (தக்கலை)", "Padmanabhapuram (பத்மநாபபுரம்)", "Colachel (கொளச்சல்)"]
    }
  },
  Karur: {
    taluks: {
      "Karur (கரூர்)": ["Karur Town (கரூர்)", "Aravakurichi (அரவக்குறிச்சி)", "Velayuthampalayam (வேலாயுதம்பாளையம்)"],
      "Kulithalai (குளித்தலை)": ["Kulithalai Town (குளித்தலை)", "Thogamalai (தோகைமலை)", "Krishnarayapuram (கிருஷ்ணராயபுரம்)"]
    }
  },
  Krishnagiri: {
    taluks: {
      "Krishnagiri (கிருஷ்ணகிரி)": ["Krishnagiri Town (கிருஷ்ணகிரி)", "Kaveripattinam (காவேரிப்பட்டினம்)", "Uthangarai (உத்தங்கரை)"],
      "Hosur (ஓசூர்)": ["Hosur Town (ஓசூர்)", "Denkanikottai (தேன்கனிக்கோட்டை)", "Shoolagiri (சூளகிரி)"]
    }
  },
  Madurai: {
    taluks: {
      "Madurai South (மதுரை தெற்கு)": ["Madurai City (மதுரை நகரம்)", "Thiruparankundram (திருப்பரங்குன்றம்)", "Avaniyapuram (அவனியாபுரம்)"],
      "Melur (மேலூர்)": ["Melur Town (மேலூர்)", "Alanganallur (அலங்காநல்லூர்)", "Kottampatti (கொட்டாம்பட்டி)"]
    }
  },
  Mayiladuthurai: {
    taluks: {
      "Mayiladuthurai (மயிலாடுதுறை)": ["Mayiladuthurai Town (மயிலாடுதுறை)", "Kuthalam (குத்தாலம்)", "Manalmedu (மணல்மேடு)"],
      "Sirkazhi (சீர்காழி)": ["Sirkazhi Town (சீர்காழி)", "Vaitheeswarankoil (வைதீஸ்வரன்கோவில்)", "Poompuhar (பூம்புகார்)"]
    }
  },
  Nagapattinam: {
    taluks: {
      "Nagapattinam (நாகப்பட்டினம்)": ["Nagapattinam Town (நாகப்பட்டினம்)", "Velankanni (வேளாங்கண்ணி)", "Thirupoondi (திருப்பூண்டி)"],
      "Vedaranyam (வேதாரண்யம்)": ["Vedaranyam Town (வேதாரண்யம்)", "Thalaignayiru (தலைஞாயிறு)", "Kodiakkarai (கோடியக்கரை)"]
    }
  },
  Namakkal: {
    taluks: {
      "Namakkal (நாமக்கல்)": ["Namakkal Town (நாமக்கல்)", "Rasipuram (ராசிபுரம்)", "Sendamangalam (சேந்தமங்கலம்)"],
      "Tiruchengode (திருச்செங்கோடு)": ["Tiruchengode Town (திருச்செங்கோடு)", "Pallipalayam (பள்ளிப்பாளையம்)", "Velur (வேலூர்)"]
    }
  },
  Nilgiris: {
    taluks: {
      "Ooty (ஊட்டி)": ["Ooty Town (ஊட்டி)", "Kotagiri (கொத்தகிரி)", "Ketti (கேட்டி)"],
      "Coonoor (குன்னூர்)": ["Coonoor Town (குன்னூர்)", "Wellington (வெலிங்டன்)", "Aruvankadu (அருவங்காடு)"]
    }
  },
  Perambalur: {
    taluks: {
      "Perambalur (பெரம்பலூர்)": ["Perambalur Town (பெரம்பலூர்)", "Kurumbalur (குரும்பலூர்)", "Kunnam (குன்னம்)"],
      "Veppanthattai (வேப்பந்தட்டை)": ["Veppanthattai Town (வேப்பந்தட்டை)", "Valikandapuram (வாலிகண்டபுரம்)", "Arumbavur (அரும்பாவூர்)"]
    }
  },
  Pudukkottai: {
    taluks: {
      "Pudukkottai (புதுக்கோட்டை)": ["Pudukkottai Town (புதுக்கோட்டை)", "Alangudi (ஆலங்குடி)", "Gandharvakottai (கந்தர்வகோட்டை)"],
      "Aranthangi (அறந்தாங்கி)": ["Aranthangi Town (அறந்தாங்கி)", "Avudaiyarkoil (ஆவுடையார்கோவில்)", "Mimisal (மீமிசல்)"]
    }
  },
  Ramanathapuram: {
    taluks: {
      "Ramanathapuram (இராமநாதபுரம்)": ["Ramanathapuram Town (இராமநாதபுரம்)", "Rameswaram (இராமேஸ்வரம்)", "Thirupullani (திருப்புல்லாணி)"],
      "Paramakudi (பரமக்குடி)": ["Paramakudi Town (பரமக்குடி)", "Mudukulathur (முதுகுளத்தூர்)", "Kamuthi (கமுதி)"]
    }
  },
  Ranipet: {
    taluks: {
      "Ranipet (ராணிப்பேட்டை)": ["Ranipet Town (ராணிப்பேட்டை)", "Walajah (வாலாஜா)", "Arcot (ஆற்காடு)"],
      "Arakkonam (அரக்கோணம்)": ["Arakkonam Town (அரக்கோணம்)", "Thakkolam (தக்கோலம்)", "Nemili (நெமிலி)"]
    }
  },
  Salem: {
    taluks: {
      "Omalur (ஓமலூர்)": ["Omalur (ஓமலூர் கிராமம்)", "Kadayampatti (கடையம்பட்டி)", "Tharamangalam (தாரமங்கலம்)"],
      "Salem South (சேலம் தெற்கு)": ["Maniyanur (மணியனூர்)", "Veerapandi (வீரபாண்டி)", "Dhadagapatti (தாதகாபட்டி)"]
    }
  },
  Sivaganga: {
    taluks: {
      "Sivaganga (சிவகங்கை)": ["Sivaganga Town (சிவகங்கை)", "Manamadurai (மானாமதுரை)", "Kalayarkoil (காளையார்கோவில்)"],
      "Karaikudi (காரைக்குடி)": ["Karaikudi Town (காரைக்குடி)", "Devakottai (தேவகோட்டை)", "Kanadukathan (கானாடுகாத்தான்)"]
    }
  },
  Tenkasi: {
    taluks: {
      "Tenkasi (தென்காசி)": ["Tenkasi Town (தென்காசி)", "Kadayanallur (கடையநல்லூர்)", "Courtallam (குற்றாலம்)"],
      "Sankarankovil (சங்கரன்கோவில்)": ["Sankarankovil Town (சங்கரன்கோவில்)", "Puliyangudi (புளியங்குடி)", "Thiruvengadam (திருவேங்கடம்)"]
    }
  },
  Thanjavur: {
    taluks: {
      "Thanjavur (தஞ்சாவூர்)": ["Thanjavur Town (தஞ்சாவூர்)", "Thiruvaiyaru (திருவையாறு)", "Papanasam (பாபநாசம்)"],
      "Orathanadu (ஒரத்தநாடு)": ["Orathanadu Town (ஒரத்தநாடு)", "Melur (மேலூர்)", "Pattukkottai (பட்டுக்கோட்டை)"]
    }
  },
  Theni: {
    taluks: {
      "Theni (தேனி)": ["Theni Town (தேனி)", "Andipatti (ஆண்டிபட்டி)", "Bodinayakanur (போடிநாயக்கனூர்)"],
      "Periyakulam (பெரியகுளம்)": ["Periyakulam Town (பெரியகுளம்)", "Cumbum (கம்பம்)", "Chinnamanur (சின்னமனூர்)"]
    }
  },
  Thoothukudi: {
    taluks: {
      "Thoothukudi (தூத்துக்குடி)": ["Thoothukudi Town (தூத்துக்குடி)", "Tiruchendur (திருச்செந்தூர்)", "Eral (ஏரல்)"],
      "Kovilpatti (கோவில்பட்டி)": ["Kovilpatti Town (கோவில்பட்டி)", "Ettayapuram (எட்டயபுரம்)", "Vilathikulam (விளாத்திகுளம்)"]
    }
  },
  Tiruchirappalli: {
    taluks: {
      "Trichy East (திருச்சி கிழக்கு)": ["Trichy City (திருச்சி)", "Srirangam (ஸ்ரீரங்கம்)", "Thuvakudi (துவாக்குடி)"],
      "Lalgudi (லால்குடி)": ["Lalgudi Town (லால்குடி)", "Manachanallur (மண்ணச்சநல்லூர்)", "Pullambadi (புள்ளம்பாடி)"]
    }
  },
  Tirunelveli: {
    taluks: {
      "Tirunelveli (திருநெல்வேலி)": ["Tirunelveli Town (திருநெல்வேலி)", "Nanguneri (நாங்குநேரி)", "Palayamkottai (பாளையங்கோட்டை)"],
      "Ambasamudram (அம்பாசமுத்திரம்)": ["Ambasamudram Town (அம்பாசமுத்திரம்)", "Cheranmahadevi (சேரன்மகாதேவி)", "Kallidaikurichi (கல்லிடைக்குறிச்சி)"]
    }
  },
  Tirupathur: {
    taluks: {
      "Tirupathur (திருப்பத்தூர்)": ["Tirupathur Town (திருப்பத்தூர்)", "Jolarpet (ஜோலார்பேட்டை)", "Kandili (கந்திலி)"],
      "Vaniyambadi (வாணியம்பாடி)": ["Vaniyambadi Town (வாணியம்பாடி)", "Ambur (ஆம்பூர்)", "Alangayam (ஆலங்காயம்)"]
    }
  },
  Tiruppur: {
    taluks: {
      "Tiruppur North (திருப்பூர் வடக்கு)": ["Tiruppur Town (திருப்பூர்)", "Avinashi (அவிநாசி)", "Palladam (பல்லடம்)"],
      "Dharapuram (தாராபுரம்)": ["Dharapuram Town (தாராபுரம்)", "Kangeyam (காங்கேயம்)", "Udumalaipettai (உடுமலைப்பேட்டை)"]
    }
  },
  Tiruvallur: {
    taluks: {
      "Tiruvallur (திருவள்ளூர்)": ["Tiruvallur Town (திருவள்ளூர்)", "Ponneri (பொன்னேரி)", "Gummidipoondi (கும்மிடிப்பூண்டி)"],
      "Avadi (ஆவடி)": ["Avadi Town (ஆவடி)", "Poonamallee (பூந்தமல்லி)", "Thirumazhisai (திருமழிசை)"]
    }
  },
  Tiruvannamalai: {
    taluks: {
      "Tiruvannamalai (திருவண்ணாமலை)": ["Tiruvannamalai Town (திருவண்ணாமலை)", "Polur (போளூர்)", "Chengam (செங்கம்)"],
      "Arni (ஆரணி)": ["Arni Town (ஆரணி)", "Cheyyar (செய்யாறு)", "Vandavasi (வந்தவாசி)"]
    }
  },
  Tiruvarur: {
    taluks: {
      "Tiruvarur (திருவாரூர்)": ["Tiruvarur Town (திருவாரூர்)", "Nannilam (நன்னிலம்)", "Kudavasal (குடவாசல்)"],
      "Mannargudi (மன்னார்குடி)": ["Mannargudi Town (மன்னார்குடி)", "Thiruthuraipoondi (திருத்துறைப்பூண்டி)", "Needamangalam (நீடாமங்கலம்)"]
    }
  },
  Vellore: {
    taluks: {
      "Vellore (வேலூர்)": ["Vellore Town (வேலூர்)", "Katpadi (காட்பாடி)", "Arcot Road (ஆற்காடு சாலை)"],
      "Gudiyatham (குடியாத்தம்)": ["Gudiyatham Town (குடியாத்தம்)", "Pernambut (பேர்ணாம்பட்டு)", "Kaniyambadi (கணியம்பாடி)"]
    }
  },
  Viluppuram: {
    taluks: {
      "Viluppuram (விழுப்புரம்)": ["Viluppuram Town (விழுப்புரம்)", "Gingee (செஞ்சி)", "Vikravandi (விக்கிரவாண்டி)"],
      "Tindivanam (திண்டிவனம்)": ["Tindivanam Town (திண்டிவனம்)", "Marakkanam (மரக்காணம்)", "Vanur (வானூர்)"]
    }
  },
  Virudhunagar: {
    taluks: {
      "Virudhunagar (விருதுநகர்)": ["Virudhunagar Town (விருதுநகர்)", "Aruppukottai (அருப்புக்கோட்டை)", "Sattur (சாத்தூர்)"],
      "Srivilliputhur (ஸ்ரீவில்லிபுத்தூர்)": ["Srivilliputhur Town (ஸ்ரீவில்லிபுத்தூர்)", "Sivakasi (சிவகாசி)", "Rajapalayam (ராஜபாளையம்)"]
    }
  }
};

window.populateTaluks = function () {
  const distSelect = document.getElementById("eservices-district");
  const talukInput = document.getElementById("eservices-taluk");
  const villageInput = document.getElementById("eservices-village");

  if (!distSelect || !talukInput || !villageInput) return;

  // Clear inputs on district change
  talukInput.value = "";
  villageInput.value = "";

  // Reset helper labels
  const hDistrict = document.getElementById("helper-district");
  const hTaluk = document.getElementById("helper-taluk");
  const hVillage = document.getElementById("helper-village");
  if (hDistrict) hDistrict.innerText = distSelect.value || "--";
  if (hTaluk) hTaluk.innerText = "--";
  if (hVillage) hVillage.innerText = "--";
};

// Autocomplete helper for e-Services fields
function setupAutocompleteField(inputId, suggestionsId, getQueryString, getMockList) {
  const input = document.getElementById(inputId);
  const suggestionsDiv = document.getElementById(suggestionsId);
  if (!input || !suggestionsDiv) return;

  let debounceTimeout = null;

  const showDefaults = () => {
    const mockList = getMockList();
    const currentLang = localStorage.getItem("lang") || "en";
    
    if (mockList && mockList.length > 0) {
      suggestionsDiv.innerHTML = mockList
        .map((item) => `
          <div class="suggestion-item" data-val="${item}" style="padding: 10px 12px; border-bottom: 1px solid #eee; cursor: pointer; text-align: left; color: #333; font-size: 0.85rem; transition: background 0.2s;" onmouseover="this.style.background='#f1f8e9'" onmouseout="this.style.background='transparent'">
            <i class="fas fa-map-marker-alt" style="color: var(--primary-green); margin-right: 8px;"></i>
            <strong>${item}</strong>
          </div>
        `)
        .join("");
      suggestionsDiv.style.display = "block";
    } else {
      suggestionsDiv.innerHTML = `
        <div style="padding: 10px 12px; text-align: center; color: #888; font-size: 0.78rem;">
          ${currentLang === 'ta' ? 'தேட டைப் செய்யத் தொடங்குங்கள்...' : 'Start typing to search locations...'}
        </div>
      `;
      suggestionsDiv.style.display = "block";
    }

    // Add click event listeners to suggestion items
    const items = suggestionsDiv.querySelectorAll(".suggestion-item");
    items.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        input.value = item.getAttribute("data-val");
        suggestionsDiv.innerHTML = "";
        suggestionsDiv.style.display = "none";
        input.dispatchEvent(new Event("change"));
      });
    });
  };

  input.addEventListener("focus", showDefaults);
  input.addEventListener("click", (e) => {
    e.stopPropagation();
    showDefaults();
  });

  input.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    const val = input.value.trim();
    if (val.length < 2) {
      showDefaults();
      return;
    }

    debounceTimeout = setTimeout(async () => {
      const q = getQueryString(val);
      if (!q) return;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          suggestionsDiv.innerHTML = data
            .map((item) => {
              const name = item.address.village || item.address.hamlet || item.address.suburb || item.address.town || item.address.city_district || item.display_name.split(",")[0];
              const parent = item.display_name.split(",").slice(1, 3).join(",").trim();
              return `
                <div class="suggestion-item" data-val="${name}" style="padding: 10px 12px; border-bottom: 1px solid #eee; cursor: pointer; text-align: left; color: #333; font-size: 0.85rem; transition: background 0.2s;" onmouseover="this.style.background='#f1f8e9'" onmouseout="this.style.background='transparent'">
                  <i class="fas fa-search" style="color: #666; margin-right: 8px;"></i>
                  <strong>${name}</strong> <span style="font-size: 0.72rem; color: #888;">(${parent})</span>
                </div>
              `;
            })
            .join("");

          const items = suggestionsDiv.querySelectorAll(".suggestion-item");
          items.forEach((item) => {
            item.addEventListener("click", (e) => {
              e.stopPropagation();
              input.value = item.getAttribute("data-val");
              suggestionsDiv.innerHTML = "";
              suggestionsDiv.style.display = "none";
              input.dispatchEvent(new Event("change"));
            });
          });
        } else {
          suggestionsDiv.innerHTML = `
            <div style="padding: 10px 12px; text-align: center; color: #888; font-size: 0.78rem;">
              No matches found.
            </div>
          `;
        }
      } catch (err) {
        console.warn("Autocomplete query failed:", err);
      }
    }, 400);
  });

  document.addEventListener("click", (e) => {
    if (e.target !== input && e.target !== suggestionsDiv) {
      suggestionsDiv.innerHTML = "";
      suggestionsDiv.style.display = "none";
    }
  });
}

window.triggerOTPAlert = function () {
  const dist = document.getElementById("eservices-district")?.value;
  const taluk = document.getElementById("eservices-taluk")?.value;
  const village = document.getElementById("eservices-village")?.value;
  const mobile = document.getElementById("eservices-mobile")?.value;

  const currentLang = localStorage.getItem("lang") || "en";

  if (!dist || !dist.trim()) {
    alert(
      currentLang === "ta"
        ? "தயவுசெய்து மாவட்டத்தைத் தேர்ந்தெடுக்கவும்."
        : "Please select District.",
    );
    return;
  }
  if (!taluk || !taluk.trim()) {
    alert(
      currentLang === "ta"
        ? "தயவுசெய்து வட்டத்தைத் தேர்ந்தெடுக்கவும்."
        : "Please select Taluk.",
    );
    return;
  }
  if (!village || !village.trim()) {
    alert(
      currentLang === "ta"
        ? "தயவுசெய்து கிராமத்தைத் தேர்ந்தெடுக்கவும்."
        : "Please select Village.",
    );
    return;
  }

  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    alert(
      currentLang === "ta"
        ? "தயவுசெய்து சரியான 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்."
        : "Please enter a valid 10-digit mobile number.",
    );
    return;
  }

  alert(
    currentLang === "ta"
      ? "கடவுச்சொல் (OTP) வெற்றிகரமாக அனுப்பப்பட்டது!"
      : "OTP sent successfully!",
  );
};

// Toggle between interactive map and government registry verification portal guide
window.switchSurveyTab = function(tab) {
  const mapTab = document.getElementById("tab-map-btn");
  const verifyTab = document.getElementById("tab-verify-btn");
  const mapContainer = document.getElementById("survey-map-explorer-container");
  const verifyContainer = document.getElementById("survey-verify-container");

  if (!mapTab || !verifyTab || !mapContainer || !verifyContainer) return;

  if (tab === 'map') {
    mapTab.className = "survey-tab-btn active";
    mapTab.style.background = "var(--primary-green)";
    mapTab.style.color = "white";
    mapTab.style.border = "none";
    mapTab.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";

    verifyTab.className = "survey-tab-btn";
    verifyTab.style.background = "white";
    verifyTab.style.color = "var(--primary-green)";
    verifyTab.style.border = "1.5px solid var(--primary-green)";
    verifyTab.style.boxShadow = "none";

    mapContainer.style.display = "block";
    verifyContainer.style.display = "none";

    if (window.surveyMap) {
      setTimeout(() => {
        window.surveyMap.invalidateSize();
      }, 100);
    }
  } else {
    verifyTab.className = "survey-tab-btn active";
    verifyTab.style.background = "var(--primary-green)";
    verifyTab.style.color = "white";
    verifyTab.style.border = "none";
    verifyTab.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";

    mapTab.className = "survey-tab-btn";
    mapTab.style.background = "white";
    mapTab.style.color = "var(--primary-green)";
    mapTab.style.border = "1.5px solid var(--primary-green)";
    mapTab.style.boxShadow = "none";

    mapContainer.style.display = "none";
    verifyContainer.style.display = "block";
  }
};

// Clipboard copy helper for legal coordinates
window.copyToClipboard = function (text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const icon = btn.querySelector("i");
    const originalText = btn.innerText;
    if (icon) {
      icon.className = "fas fa-check";
      icon.style.color = "#2e7d32";
      setTimeout(() => {
        icon.className = "far fa-copy";
        icon.style.color = "";
      }, 1500);
    } else {
      btn.innerText = (localStorage.getItem("lang") || "en") === "ta" ? "நகலெடுக்கப்பட்டது" : "Copied";
      setTimeout(() => {
        btn.innerText = originalText;
      }, 1500);
    }
  }).catch((err) => {
    console.error("Failed to copy text: ", err);
  });
};

// Submitting registry lookup from the E-Services form
window.submitEServicesMockSearch = function() {
  const dist = document.getElementById("eservices-district")?.value;
  const taluk = document.getElementById("eservices-taluk")?.value;
  const village = document.getElementById("eservices-village")?.value;
  const searchNum = document.getElementById("eservices-search-num")?.value;
  const otp = document.getElementById("eservices-otp")?.value;

  const currentLang = localStorage.getItem("lang") || "en";

  if (!dist || !taluk || !village || !searchNum) {
    alert(currentLang === 'ta' ? 'அனைத்து விவரங்களையும் பூர்த்தி செய்க.' : 'Please fill all details.');
    return;
  }

  if (!otp || otp.trim().length < 4) {
    alert(currentLang === 'ta' ? 'முறையான கடவுச்சொல்லைப் பதிக.' : 'Please enter a valid OTP code.');
    return;
  }

  // Update Helper Labels
  const hDistrict = document.getElementById("helper-district");
  const hTaluk = document.getElementById("helper-taluk");
  const hVillage = document.getElementById("helper-village");
  const hSurvey = document.getElementById("helper-survey");
  if (hDistrict) hDistrict.innerText = dist;
  if (hTaluk) hTaluk.innerText = taluk;
  if (hVillage) hVillage.innerText = village;
  if (hSurvey) hSurvey.innerText = searchNum;

  // Set Search Inputs
  const placeInput = document.getElementById("survey-location-input");
  const numberInput = document.getElementById("survey-number-input");
  if (placeInput) placeInput.value = `${village}, ${taluk}, ${dist}`;
  if (numberInput) numberInput.value = searchNum;

  // Switch back to Map Tab to show the generated plots
  window.switchSurveyTab('map');

  // Trigger search using the village and survey number geocoding
  window.searchLandRecords();
};

// Setup initial autocomplete triggers on page load
document.addEventListener("DOMContentLoaded", () => {
  setupAutocompleteField(
    "eservices-taluk",
    "eservices-taluk-suggestions",
    (val) => {
      const dist = document.getElementById("eservices-district")?.value;
      return dist ? `${val}, ${dist}, Tamil Nadu` : `${val}, Tamil Nadu`;
    },
    () => {
      const dist = document.getElementById("eservices-district")?.value;
      if (dist && landLocations[dist]) {
        return Object.keys(landLocations[dist].taluks);
      }
      return [];
    }
  );

  setupAutocompleteField(
    "eservices-village",
    "eservices-village-suggestions",
    (val) => {
      const dist = document.getElementById("eservices-district")?.value;
      const taluk = document.getElementById("eservices-taluk")?.value;
      if (dist && taluk) {
        return `${val}, ${taluk}, ${dist}, Tamil Nadu`;
      }
      return dist ? `${val}, ${dist}, Tamil Nadu` : `${val}, Tamil Nadu`;
    },
    () => {
      const dist = document.getElementById("eservices-district")?.value;
      const taluk = document.getElementById("eservices-taluk")?.value;
      if (dist && taluk && landLocations[dist] && landLocations[dist].taluks[taluk]) {
        return landLocations[dist].taluks[taluk];
      }
      return [];
    }
  );

  // Hook change events to update the helper labels instantly
  document.getElementById("eservices-taluk")?.addEventListener("change", (e) => {
    const hTaluk = document.getElementById("helper-taluk");
    if (hTaluk) hTaluk.innerText = e.target.value || "--";
  });

  document.getElementById("eservices-village")?.addEventListener("change", (e) => {
    const hVillage = document.getElementById("helper-village");
    if (hVillage) hVillage.innerText = e.target.value || "--";
  });
});

