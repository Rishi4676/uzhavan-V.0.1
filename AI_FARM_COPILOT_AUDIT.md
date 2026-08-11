# AI Farm Copilot: Existing Architecture Audit

This audit documents the existing system architecture of the agriculture platform before implementing the **AI Farm Copilot** intelligence layer.

---

## 1. Technical Stack Overview

### Frontend Architecture
* **Core Technologies**: HTML5, Vanilla JavaScript (ES6 Modules), and Vanilla CSS (`css/style.css`).
* **Visual Presentation**: Glassmorphism elements, clean layout grids, custom dashboards.
* **Core UI Pages**:
  * `index.html`: Main landing page with quick access feature cards (Weather, Market, Pest Doctor, Govt Schemes) and dynamic agricultural news display.
  * `survey.html`: Integrated Land Survey & Weather Dashboard. Includes interactive map canvas, dynamic Patta/Chitta registry search records, and weather forecast widgets/charts.
  * `crop.html`: Standalone crop recommendation page utilizing soil type cards (Clay, Sandy, Loamy) and seasonal tabs to suggest crops.
  * `pest.html`: Standalone pest & disease diagnosis page featuring image drag-and-drop upload zone, preview, and results display.
  * `market.html`: Market prices dashboard showing live Mandi prices, filterable crop tables, and price prediction triggers.
  * `schemes.html`: Government agricultural schemes explorer with dynamic category filtering.
  * `ledger.html`: Budget planner with expense registry.
  * `forum.html`: Social messaging forum.
  * `login.html` & `register.html`: User login/signup layouts.
* **Libraries & Visualizations**:
  * **Leaflet JS**: Interactive map renderer used for land survey plot mapping and GPS farm mapping.
  * **Chart.js**: Render land valuation trend lines, crop distribution doughnut charts, and weather forecast trend charts (rainfall/temperature).
* **State Management**:
  * **`localStorage`**: Heavy client-side usage for:
    * `"user"`: Stores current logged-in user profile metadata (UID, Name, Username, Phone, Village).
    * `"agri_users"`: Local database fallback listing all registered users.
    * `"agri_chatbot_history"`: Message thread history for the chatbot.
    * `"sharedLocation"`: Used for cross-page navigation parameters (Option 2).
    * Budget ledger records, local discussion forum posts, etc.

---

## 2. Backend & API Services (`price-trend-dashboard/server/index.js`)
The application executes a node server spawned automatically on port `3000` via the Vite dev process:

### Active REST Endpoints:
1. **`GET /api/news`**: Parses live agriculture news feeds from `https://khetigaadi.com/blog/category/agriculture/feed` via regex parsing.
2. **`GET /api/firebase-status`**: Confirms connections and operational integrity of the Firebase Admin SDK.
3. **`POST /api/ai-insights`**: Computes price projections and commodity trends using LLM inference based on Mandi prices.
4. **`POST /api/detect-pest`**: Evaluates crop image uploads (base64) for diseases.
   * **Inference Chain**: (1) Gemini `gemini-2.5-flash` client ➡️ (2) Groq Vision `llama-3.2-11b-vision-preview` fallback ➡️ (3) Offline Mock Report (Aphid & Sucking Pest) local fallback.
5. **`POST /api/chatbot`**: Feeds queries to chat completions APIs.
   * **Inference Chain**: (1) Groq `llama-3.3-70b-versatile` ➡️ (2) Gemini `gemini-2.5-flash` ➡️ (3) Ollama Local ➡️ (4) Local Rule-based replies fallback (`buildChatbotReply`).

---

## 3. Database & Authentication Integration
* **Service Provider**: Firebase Authentication (OAuth & email credentials) and Cloud Firestore (NoSQL database).
* **Sync Configuration (`js/firebase-config.js` & `js/auth.js`)**:
  * Web config details are public in `firebase-config.js`.
  * User records are saved under the `users/{uid}` collection in Firestore.
  * **Security Fallback**: If connection errors occur or Firestore security rules block access, registrations/logins write to and read from the local browser storage (`localStorage` fallback) to maintain absolute reliability.

---

## 4. Proposed AI Farm Copilot Integration Strategy

To build the Voice-First **AI Farm Copilot** without breaking existing systems:
1. **Microphone Voice Overlay**:
   * Integrate a floating voice button (`#copilot-voice-trigger`) globally next to the existing chatbot icon.
   * Reuse the existing `#chatbot-box` and message window styles, transforming it visually into the **AI Farm Copilot Panel** with active voice visualization (waveform animation) and text-to-speech audio outputs.
2. **State Sync & Context Engine**:
   * Load the active logged-in user profile from `localStorage.getItem("user")` (retrieving Name, Village, etc.) on initialization.
   * Map coordinates selected on the Leaflet map to the current query location.
   * Formulate the **Farm Digital Twin** dynamically from the active map plot, weather readings, and user history.
3. **Audio / Language Tuning**:
   * Deploy natural, soft, and respectful Tamil speech styling (e.g. *அண்ணா*, *அக்கா*) for voice outputs.
   * Implement voice transcription (speech-to-text) and text-to-speech outputs dynamically.
   * Restrict speech replies to 2-4 short sentences, leaving detailed charts and tables on screen.
4. **Safety & Zero-Hallucination Guard**:
   * Set up internal confidence engines. If user data is missing, prompt them directly instead of guessing.
   * Verify all weather, land registry, and price facts against official local arrays/APIs first.
