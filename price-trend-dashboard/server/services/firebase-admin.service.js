const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");
const fs = require("fs");

let serviceAccount = null;

// Look for the specific service account file in standard project locations
const possiblePaths = [
  path.join(__dirname, "../../../agriculture-2a4cc-firebase-adminsdk-fbsvc-df912226a5.json"),
  path.join(process.cwd(), "agriculture-2a4cc-firebase-adminsdk-fbsvc-df912226a5.json"),
  path.join(__dirname, "../agriculture-2a4cc-firebase-adminsdk-fbsvc-df912226a5.json"),
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH
].filter(Boolean);

let foundPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    foundPath = p;
    break;
  }
}

if (foundPath) {
  try {
    serviceAccount = require(foundPath);
    console.log(`[Firebase Admin] Loaded service account from: ${foundPath}`);
  } catch (error) {
    console.error(`[Firebase Admin] Failed to load service account file: ${error.message}`);
  }
} else {
  console.warn("[Firebase Admin] Service account file 'agriculture-2a4cc-firebase-adminsdk-fbsvc-df912226a5.json' not found in standard paths.");
}

let db = null;

if (serviceAccount) {
  try {
    // Prevent initializing multiple apps if index.js is hot-reloaded
    if (admin.getApps().length === 0) {
      admin.initializeApp({
        credential: admin.cert(serviceAccount)
      });
      console.log("[Firebase Admin] Firebase Admin SDK initialized successfully.");
    }
    db = getFirestore();
  } catch (error) {
    console.error(`[Firebase Admin] Initialization error: ${error.message}`);
  }
}

module.exports = {
  admin,
  db,
  isReady: () => db !== null,
  getFirestore: () => db
};
