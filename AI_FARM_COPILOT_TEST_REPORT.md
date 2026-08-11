# AI Farm Copilot: Testing & Accuracy Verification Report

This document reports the testing methodology, test suite configurations, and accuracy verification results for the **AI Farm Copilot** decision engine.

---

## 1. Test Suite Configuration
* **Test Runner**: Vitest (v4.1.4)
* **DOM Mocking**: `jsdom` (v29.0.2)
* **Environment Configuration**: `tests/setup.js` (custom mocks for `localStorage` and `fetch`).
* **Test Execution**: Ran via `npm run test` command synchronously.

---

## 2. Test Run Results & Metrics

All unit tests compiled and executed successfully with **Exit Code 0** (100% Pass Rate).

| Test File | Target Module | Verified Behaviors / Assertions | Status |
| :--- | :--- | :--- | :--- |
| `copilot.test.js` | `updateFarmDigitalTwin` | - Schema initializes and populates with active Firebase/localStorage farmer profile details.<br>- Subsequent updates (weather current values/forecast limits) merge without destroying existing registry parameters. | **PASSED** |
| `ledger.test.js` | Ledger & Budget | - Correct financial aggregation calculations.<br>- Dynamic calculations of crop yield values. | **PASSED** |
| `market.test.js` | Mandi Price Dashboard | - Correct rendering of mandi tables.<br>- Offline fallbacks and network error handling. | **PASSED** |
| `translations.test.js` | Internationalization | - Dictionary matching for Tamil, Hindi, and English. | **PASSED** |

---

## 3. Intent & Entity Extraction Validation
Accuracy validation datasets are configured in unit tests and mocks:

### Intent Detection Accuracy (Goal: >95%):
* Common conversational farmer intents mapped:
  1. **Weather Query**: Mapped by checking for keywords `weather`, `வானிலை`, `மழை`, `forecast` ➡️ Redirects to weather page correctly.
  2. **Land Records Query**: Mapped by checking for `survey`, `வரைபடம்`, `patta`, `chitta` ➡️ Navigates to Leaflet interactive map page.
  3. **Mandi price Query**: Mapped by checking for `market`, `சந்தை`, `விலை`, `price` ➡️ Redirects to market trends page.
  4. **Government Schemes Query**: Mapped by checking for `scheme`, `திட்டம்` ➡️ Redirects to schemes search explorer.

### Entity Parsing Accuracy:
* Survey number formats parsed securely:
  * Supported formats: `[Number]/[Subdivision]` (e.g. `104/2B`, `123/4A`, `72/1`).
  * Unit tests confirm fallback to user profiles if survey query contains incomplete parameters.
