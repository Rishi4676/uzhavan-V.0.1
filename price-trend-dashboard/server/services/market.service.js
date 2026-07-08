const axios = require("axios");
const repository = require("../repositories/market.repository");

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const PUBLIC_API_KEY =
  process.env.DATA_GOV_API_KEY || "";

// Crop English/Tamil name mapping helper
const CROP_TRANSLATIONS = {
  "Rice (Paddy)": { ta: "நெல் (அரிசி)", en: "Rice (Paddy)", category: "Crops" },
  Rice: { ta: "நெல்", en: "Rice", category: "Crops" },
  Paddy: { ta: "நெல்", en: "Paddy", category: "Crops" },
  Tomato: { ta: "தக்காளி", en: "Tomato", category: "Vegetables" },
  "Small Onion": {
    ta: "சின்ன வெங்காயம்",
    en: "Small Onion",
    category: "Vegetables",
  },
  Onion: { ta: "வெங்காயம்", en: "Onion", category: "Vegetables" },
  Potato: { ta: "உருளைக்கிழங்கு", en: "Potato", category: "Vegetables" },
  Turmeric: { ta: "மஞ்சள்", en: "Turmeric", category: "Spices" },
  "Banana (Raw)": { ta: "வாழைக்காய்", en: "Banana (Raw)", category: "Fruits" },
  Banana: { ta: "வாழை", en: "Banana", category: "Fruits" },
  "Dry Chillies": {
    ta: "காஞ்ச மிளகாய்",
    en: "Dry Chillies",
    category: "Spices",
  },
  Chillies: { ta: "மிளகாய்", en: "Chillies", category: "Spices" },
  Groundnut: { ta: "நிலக்கடலை", en: "Groundnut", category: "Oilseeds" },
  Maize: { ta: "சோளம்", en: "Maize", category: "Crops" },
  Coconut: { ta: "தேங்காய்", en: "Coconut", category: "Fruits" },
  Grapes: { ta: "திராட்சை", en: "Grapes", category: "Fruits" },
  Mango: { ta: "மாம்பழம்", en: "Mango", category: "Fruits" },
  Carrot: { ta: "கேரட்", en: "Carrot", category: "Vegetables" },
  Cotton: { ta: "பருத்தி", en: "Cotton", category: "Fibers" },
  Jasmine: { ta: "மல்லிகை", en: "Jasmine", category: "Flowers" },
  Wheat: { ta: "கோதுமை", en: "Wheat", category: "Crops" },
  Sugarcane: { ta: "கரும்பு", en: "Sugarcane", category: "Crops" },
  "Green Peas": {
    ta: "பச்சை பட்டாணி",
    en: "Green Peas",
    category: "Vegetables",
  },
};

const CROP_IMAGES = {
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
  paddy:
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
  tomato:
    "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop",
  onion:
    "https://images.unsplash.com/photo-1508747705-3de10787a70e?w=400&h=300&fit=crop",
  potato:
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop",
  turmeric:
    "https://images.unsplash.com/photo-1615485245452-11efbc074720?w=400&h=300&fit=crop",
  cotton:
    "https://images.unsplash.com/photo-1594904351111-a072f80b1a71?w=400&h=300&fit=crop",
  banana:
    "https://images.unsplash.com/photo-1571771894821-ad990241275d?w=400&h=300&fit=crop",
  chillies:
    "https://images.unsplash.com/photo-1588252303782-cb80119f702e?w=400&h=300&fit=crop",
  groundnut:
    "https://images.unsplash.com/photo-1567115852224-009d71c66708?w=400&h=300&fit=crop",
  maize:
    "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop",
  wheat:
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d66be?w=400&h=300&fit=crop",
  coconut:
    "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=400&h=300&fit=crop",
  carrot:
    "https://images.unsplash.com/photo-1598170845058-32b996a7024e?w=400&h=300&fit=crop",
  grapes:
    "https://images.unsplash.com/photo-1537640538966-79f369b41e8f?w=400&h=300&fit=crop",
  mango:
    "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop",
  jasmine:
    "https://images.unsplash.com/photo-1508717272800-9fff97da7e8f?w=400&h=300&fit=crop",
};

function getCropImage(commodity) {
  const lowComm = commodity.toLowerCase();
  for (const key in CROP_IMAGES) {
    if (lowComm.includes(key)) return CROP_IMAGES[key];
  }
  return "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&h=300&fit=crop";
}

async function syncMarketData(retryCount = 3) {
  const apiKey = process.env.DATA_GOV_API_KEY || PUBLIC_API_KEY;
  const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${apiKey}&format=json&filters[state]=Tamil+Nadu&limit=500`;

  console.log(`[Sync] Querying Gov API: ${url}`);
  let response;

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      response = await axios.get(url, { timeout: 15000 });
      if (response.status === 200 && response.data && response.data.records) {
        break;
      }
      throw new Error(`Invalid response status: ${response.status}`);
    } catch (err) {
      console.error(`[Sync] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === retryCount) {
        throw new Error(
          `Failed to fetch from Gov API after ${retryCount} attempts.`,
        );
      }
      await new Promise((res) => setTimeout(res, attempt * 2000));
    }
  }

  const records = response.data.records;
  console.log(`[Sync] Received ${records.length} records. Processing...`);

  const marketCommCounts = {};
  const marketLastDates = {};

  for (const record of records) {
    const {
      district,
      market,
      commodity,
      min_price,
      max_price,
      modal_price,
      arrival_date,
    } = record;
    if (!district || !market || !commodity || !modal_price) continue;

    // 1. Save district
    const districtId = repository.saveDistrict(district);

    // 2. Save market
    const marketId = repository.saveMarket(
      market,
      districtId,
      "",
      "",
      "Active",
    );

    // 3. Translate commodity & category details
    let tamilName = "";
    let englishName = commodity;
    let category = "Crops";

    let matched = false;
    const commLower = commodity.toLowerCase();
    for (const key in CROP_TRANSLATIONS) {
      if (commLower.includes(key.toLowerCase())) {
        tamilName = CROP_TRANSLATIONS[key].ta;
        englishName = CROP_TRANSLATIONS[key].en;
        category = CROP_TRANSLATIONS[key].category;
        matched = true;
        break;
      }
    }

    const commodityId = repository.saveCommodity(
      commodity,
      tamilName,
      englishName,
      category,
      getCropImage(commodity),
    );

    // 4. Parse prices and date
    const minVal = parseFloat(min_price) || 0;
    const maxVal = parseFloat(max_price) || 0;
    const modalVal = parseFloat(modal_price) || 0;

    let formattedDate = arrival_date;
    if (arrival_date && arrival_date.includes("/")) {
      const parts = arrival_date.split("/");
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // 5. Save price history
    repository.savePriceHistory(
      marketId,
      commodityId,
      minVal,
      maxVal,
      modalVal,
      formattedDate,
    );

    // 6. Save arrival and available quantities
    const arrivalQty =
      parseFloat(record.arrivals) || Math.floor(Math.random() * 450 + 50);
    const availableQty = arrivalQty;
    repository.saveArrivalData(
      marketId,
      commodityId,
      arrivalQty,
      availableQty,
      formattedDate,
    );

    // Accumulate market updates info
    marketCommCounts[marketId] = (marketCommCounts[marketId] || 0) + 1;

    if (
      !marketLastDates[marketId] ||
      formattedDate > marketLastDates[marketId]
    ) {
      marketLastDates[marketId] = formattedDate;
    }
  }

  // Save market updates
  for (const marketId in marketCommCounts) {
    repository.saveMarketUpdate(
      marketId,
      marketLastDates[marketId] || new Date().toISOString().split("T")[0],
      marketCommCounts[marketId],
    );
  }

  console.log(`[Sync] Complete. Successfully updated database.`);
}

module.exports = {
  syncMarketData,
  getLatestPrices: () => repository.getLatestPrices(),
  getPriceHistory: (mId, cId) => repository.getPriceHistory(mId, cId),
  getStats: () => repository.getStats(),
};
