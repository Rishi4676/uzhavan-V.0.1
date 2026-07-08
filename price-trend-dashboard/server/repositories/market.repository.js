const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

let dbPath = path.join(process.cwd(), "price-trend-dashboard/server/market.db");
if (!fs.existsSync(dbPath)) {
  dbPath = path.join(__dirname, "../market.db");
}

const db = new DatabaseSync(dbPath);

// Initialize database schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS districts (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS markets (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      district_id TEXT,
      taluk TEXT,
      village TEXT,
      status TEXT,
      FOREIGN KEY(district_id) REFERENCES districts(id)
    );

    CREATE TABLE IF NOT EXISTS commodities (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      tamil_name TEXT,
      english_name TEXT,
      category TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id TEXT PRIMARY KEY,
      market_id TEXT,
      commodity_id TEXT,
      min_price REAL,
      max_price REAL,
      modal_price REAL,
      price_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(market_id) REFERENCES markets(id),
      FOREIGN KEY(commodity_id) REFERENCES commodities(id)
    );

    CREATE TABLE IF NOT EXISTS market_updates (
      id TEXT PRIMARY KEY,
      market_id TEXT,
      last_updated TEXT,
      commodity_count INTEGER,
      FOREIGN KEY(market_id) REFERENCES markets(id)
    );

    CREATE TABLE IF NOT EXISTS arrival_data (
      id TEXT PRIMARY KEY,
      market_id TEXT,
      commodity_id TEXT,
      arrival_quantity REAL,
      available_quantity REAL,
      arrival_date TEXT,
      FOREIGN KEY(market_id) REFERENCES markets(id),
      FOREIGN KEY(commodity_id) REFERENCES commodities(id)
    );
  `);
}

initDatabase();

module.exports = {
  db,

  // Helper functions to save records
  saveDistrict(name) {
    const check = db.prepare("SELECT id FROM districts WHERE name = ?").get(name);
    if (check) return check.id;
    const id = name.toLowerCase().replace(/\s+/g, "_");
    db.prepare("INSERT INTO districts (id, name) VALUES (?, ?)").run(id, name);
    return id;
  },

  saveMarket(name, districtId, taluk = "", village = "", status = "Active") {
    const check = db.prepare("SELECT id FROM markets WHERE name = ?").get(name);
    if (check) return check.id;
    const id = name.toLowerCase().replace(/\s+/g, "_");
    db.prepare("INSERT INTO markets (id, name, district_id, taluk, village, status) VALUES (?, ?, ?, ?, ?, ?)").run(
      id, name, districtId, taluk, village, status
    );
    return id;
  },

  saveCommodity(name, tamilName = "", englishName = "", category = "Crops", imageUrl = "") {
    const check = db.prepare("SELECT id FROM commodities WHERE name = ?").get(name);
    if (check) return check.id;
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    db.prepare("INSERT INTO commodities (id, name, tamil_name, english_name, category, image_url) VALUES (?, ?, ?, ?, ?, ?)").run(
      id, name, tamilName, englishName, category, imageUrl
    );
    return id;
  },

  savePriceHistory(marketId, commodityId, minPrice, maxPrice, modalPrice, priceDate) {
    const id = `${marketId}_${commodityId}_${priceDate}`;
    const check = db.prepare("SELECT id FROM price_history WHERE id = ?").get(id);
    if (check) {
      db.prepare("UPDATE price_history SET min_price = ?, max_price = ?, modal_price = ? WHERE id = ?").run(
        minPrice, maxPrice, modalPrice, id
      );
    } else {
      db.prepare("INSERT INTO price_history (id, market_id, commodity_id, min_price, max_price, modal_price, price_date) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        id, marketId, commodityId, minPrice, maxPrice, modalPrice, priceDate
      );
    }
    return id;
  },

  saveMarketUpdate(marketId, lastUpdated, commodityCount) {
    const id = marketId;
    const check = db.prepare("SELECT id FROM market_updates WHERE id = ?").get(id);
    if (check) {
      db.prepare("UPDATE market_updates SET last_updated = ?, commodity_count = ? WHERE id = ?").run(
        lastUpdated, commodityCount, id
      );
    } else {
      db.prepare("INSERT INTO market_updates (id, market_id, last_updated, commodity_count) VALUES (?, ?, ?, ?)").run(
        id, marketId, lastUpdated, commodityCount
      );
    }
  },

  saveArrivalData(marketId, commodityId, arrivalQuantity, availableQuantity, arrivalDate) {
    const id = `${marketId}_${commodityId}_${arrivalDate}`;
    const check = db.prepare("SELECT id FROM arrival_data WHERE id = ?").get(id);
    if (check) {
      db.prepare("UPDATE arrival_data SET arrival_quantity = ?, available_quantity = ? WHERE id = ?").run(
        arrivalQuantity, availableQuantity, id
      );
    } else {
      db.prepare("INSERT INTO arrival_data (id, market_id, commodity_id, arrival_quantity, available_quantity, arrival_date) VALUES (?, ?, ?, ?, ?, ?)").run(
        id, marketId, commodityId, arrivalQuantity, availableQuantity, arrivalDate
      );
    }
  },

  // Queries
  getLatestPrices() {
    return db.prepare(`
      SELECT 
        ph.min_price, ph.max_price, ph.modal_price, ph.price_date as arrival_date,
        m.id as market_id, m.name as market, m.taluk, m.village, m.status as market_status,
        d.name as district,
        c.id as commodity_id, c.name as commodity, c.tamil_name, c.english_name, c.category, c.image_url,
        mu.last_updated, mu.commodity_count,
        ad.arrival_quantity, ad.available_quantity
      FROM price_history ph
      JOIN markets m ON ph.market_id = m.id
      JOIN districts d ON m.district_id = d.id
      JOIN commodities c ON ph.commodity_id = c.id
      LEFT JOIN market_updates mu ON m.id = mu.market_id
      LEFT JOIN arrival_data ad ON (ph.market_id = ad.market_id AND ph.commodity_id = ad.commodity_id AND ph.price_date = ad.arrival_date)
      WHERE ph.price_date = (
        SELECT MAX(price_date) 
        FROM price_history 
        WHERE market_id = ph.market_id AND commodity_id = ph.commodity_id
      )
    `).all();
  },

  getPriceHistory(marketId, commodityId) {
    return db.prepare(`
      SELECT ph.min_price, ph.max_price, ph.modal_price, ph.price_date, ad.arrival_quantity
      FROM price_history ph
      LEFT JOIN arrival_data ad ON (ph.market_id = ad.market_id AND ph.commodity_id = ad.commodity_id AND ph.price_date = ad.arrival_date)
      WHERE ph.market_id = ? AND ph.commodity_id = ?
      ORDER BY ph.price_date ASC
    `).all(marketId, commodityId);
  },

  getStats() {
    const commodities = db.prepare("SELECT COUNT(*) as count FROM commodities").get().count;
    const markets = db.prepare("SELECT COUNT(*) as count FROM markets").get().count;
    const districts = db.prepare("SELECT COUNT(*) as count FROM districts").get().count;
    return { commodities, markets, districts };
  }
};
