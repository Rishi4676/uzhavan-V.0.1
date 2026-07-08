const express = require("express");
const router = express.Router();
const controller = require("../api/market.controller");

router.get("/market-data", controller.getMarketData);
router.get("/market-stats", controller.getStats);
router.get("/price-history", controller.getPriceHistory);
router.post("/force-sync", controller.forceSync);

module.exports = router;
