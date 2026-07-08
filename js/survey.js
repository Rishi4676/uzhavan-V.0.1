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
    "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    {
      subdomains: ["0", "1", "2", "3"],
      maxZoom: 20,
      attribution: "&copy; Google Maps",
    },
  );

  satelliteSurveyLayer = L.tileLayer(
    "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    {
      subdomains: ["0", "1", "2", "3"],
      maxZoom: 20,
      attribution: "&copy; Google Maps",
    },
  );

  standardSurveyLayer.addTo(surveyMap);
  currentSurveyLayer = "standard";

  cadastralLayerGroup = L.layerGroup().addTo(surveyMap);
  surveyWaterLayerGroup = L.layerGroup().addTo(surveyMap);

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
    fetchLandSurveyRecords(lat, lng);
    highlightWaterBodies(lat, lng);
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
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`,
          {
            headers: {
              "Accept-Language":
                typeof currentLang !== "undefined" && currentLang === "ta"
                  ? "ta"
                  : "en",
            },
          },
        );
        const data = await response.json();
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
    `;
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
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1&addressdetails=1&countrycodes=in`,
    );
    const data = await response.json();
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

// Initialization on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  initSurveyPage();
});

// Also expose as global for safety
window.searchLandRecords = searchLandRecords;
window.highlightPlotById = highlightPlotById;
window.downloadPattaPDF = downloadPattaPDF;

// ===================================================================
// TAMIL NADU E-SERVICES PORTAL PATTA/CHITTA MOCK SEARCH LOGIC
// ===================================================================

const landLocations = {
  Salem: {
    taluks: {
      "Omalur (ஓமலூர்)": [
        "Omalur (ஓமலூர் கிராமம்)",
        "Kadayampatti (கடையம்பட்டி)",
        "Tharamangalam (தாரமங்கலம்)",
      ],
      "Salem South (சேலம் தெற்கு)": [
        "Maniyanur (மணியனூர்)",
        "Veerapandi (வீரபாண்டி)",
        "Dhadagapatti (தாதகாபட்டி)",
      ],
    },
  },
  Dharmapuri: {
    taluks: {
      "Pennagaram (பெண்ணாகரம்)": [
        "Kodur (கோடூர்)",
        "Pennagaram (பெண்ணாகரம் கிராமம்)",
        "Hogenakkal (ஒகேனக்கல்)",
      ],
      "Harur (அரூர்)": [
        "Harur Town (அரூர் நகரம்)",
        "Morappur (மொரப்பூர்)",
        "Kambainallur (கம்பைநல்லூர்)",
      ],
    },
  },
  Erode: {
    taluks: {
      "Gobichettipalayam (கோபிசெட்டிபாளையம்)": [
        "Gobi Town (கோபி நகரம்)",
        "Nambiyur (நம்பியூர்)",
        "Kalingarayanpalayam (காலிங்கராயன்பாளையம்)",
      ],
      "Perundurai (பெருந்துறை)": [
        "Perundurai (பெருந்துறை கிராமம்)",
        "Chennimalai (சென்னிமலை)",
        "Kanjikovil (கஞ்சிகோவில்)",
      ],
    },
  },
};

window.populateTaluks = function () {
  const distSelect = document.getElementById("eservices-district");
  const talukSelect = document.getElementById("eservices-taluk");
  const villageSelect = document.getElementById("eservices-village");

  if (!distSelect || !talukSelect || !villageSelect) return;

  const currentLang = localStorage.getItem("lang") || "en";

  // Reset
  talukSelect.innerHTML = `<option value="">${currentLang === "ta" ? "-- வட்டம் தேர்ந்தெடுக்கவும் --" : "-- Select Taluk --"}</option>`;
  villageSelect.innerHTML = `<option value="">${currentLang === "ta" ? "-- கிராமம் தேர்ந்தெடுக்கவும் --" : "-- Select Village --"}</option>`;
  talukSelect.disabled = true;
  villageSelect.disabled = true;

  const dist = distSelect.value;
  if (!dist || !landLocations[dist]) return;

  const taluks = Object.keys(landLocations[dist].taluks);
  taluks.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.innerText = t;
    talukSelect.appendChild(opt);
  });

  talukSelect.disabled = false;
};

window.populateVillages = function () {
  const distSelect = document.getElementById("eservices-district");
  const talukSelect = document.getElementById("eservices-taluk");
  const villageSelect = document.getElementById("eservices-village");

  if (!distSelect || !talukSelect || !villageSelect) return;

  const currentLang = localStorage.getItem("lang") || "en";

  villageSelect.innerHTML = `<option value="">${currentLang === "ta" ? "-- கிராமம் தேர்ந்தெடுக்கவும் --" : "-- Select Village --"}</option>`;
  villageSelect.disabled = true;

  const dist = distSelect.value;
  const taluk = talukSelect.value;

  if (
    !dist ||
    !taluk ||
    !landLocations[dist] ||
    !landLocations[dist].taluks[taluk]
  )
    return;

  const villages = landLocations[dist].taluks[taluk];
  villages.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.innerText = v;
    villageSelect.appendChild(opt);
  });

  villageSelect.disabled = false;
};

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
