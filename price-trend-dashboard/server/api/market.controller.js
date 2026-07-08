const service = require("../services/market.service");

let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getMarketData(req, res) {
  try {
    const now = Date.now();
    if (cache && now - cacheTime < CACHE_DURATION) {
      console.log("[Cache] Serving market data from cache");
      return res.json({ records: cache, source: "cache", cacheTime });
    }

    console.log("[Controller] Fetching market data from database");
    const records = service.getLatestPrices();
    cache = records;
    cacheTime = now;

    res.json({ records, source: "database", cacheTime });
  } catch (error) {
    console.error("[Controller] Error in getMarketData:", error.message);
    res.status(500).json({ error: "Failed to retrieve market data" });
  }
}

async function getStats(req, res) {
  try {
    const stats = service.getStats();
    res.json(stats);
  } catch (error) {
    console.error("[Controller] Error in getStats:", error.message);
    res.status(500).json({ error: "Failed to retrieve market stats" });
  }
}

async function getPriceHistory(req, res) {
  try {
    const { marketId, commodityId } = req.query;
    if (!marketId || !commodityId) {
      return res
        .status(400)
        .json({ error: "marketId and commodityId parameters are required" });
    }
    const history = service.getPriceHistory(marketId, commodityId);
    res.json(history);
  } catch (error) {
    console.error("[Controller] Error in getPriceHistory:", error.message);
    res.status(500).json({ error: "Failed to retrieve price history" });
  }
}

async function forceSync(req, res) {
  try {
    console.log("[Controller] Manual sync requested");
    await service.syncMarketData();
    // Invalidate cache
    cache = null;
    cacheTime = 0;
    res.json({ message: "Sync completed successfully" });
  } catch (error) {
    console.error("[Controller] Error in forceSync:", error.message);
    res.status(500).json({ error: `Sync failed: ${error.message}` });
  }
}

module.exports = {
  getMarketData,
  getStats,
  getPriceHistory,
  forceSync,
};
