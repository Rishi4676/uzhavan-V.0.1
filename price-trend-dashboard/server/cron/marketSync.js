const { syncMarketData } = require("../services/market.service");

function startSyncCron() {
  console.log(
    "[Cron] Starting Market Sync scheduler (runs every hour)...",
  );

  // Run initial sync in the background on startup
  setTimeout(async () => {
    try {
      console.log("[Cron] Running initial market data sync...");
      await syncMarketData();
    } catch (err) {
      console.error("[Cron] Initial sync failed:", err.message);
    }
  }, 5000);

  // Schedule to run every hour
  setInterval(
    async () => {
      try {
        console.log("[Cron] Running scheduled market data sync...");
        await syncMarketData();
      } catch (err) {
        console.error("[Cron] Scheduled sync failed:", err.message);
      }
    },
    60 * 60 * 1000,
  );
}

module.exports = { startSyncCron };
