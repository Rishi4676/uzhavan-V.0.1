# AI Farm Copilot: Security Configuration

This document outlines the security architecture, data handling constraints, and access control models for the **AI Farm Copilot** decision engine.

---

## 1. Security Boundaries & Context Isolation

The Copilot follows a strict security perimeter model:

```
  [ Farmer User Agent ]
            |
            | (SSL Encrypted Client Request)
            v
  [ Vite/Express Router ] <---> [ Firebase Auth Token Verification ]
            |
            +---> Local Cache (localStorage) - Isolated per user profile
            +---> Live APIs (Open-Meteo / OSM) - Read-only public coordinates
            |
  [ LLM Inference Engines ] (Groq / Gemini)
            |
            +---> Prompt Sandboxing: User data stripped of private credentials
```

---

## 2. API Key Management & Credentials Masking

* **Zero Hardcoding**: All third-party secrets (`GEMINI_API_KEY`, `GROQ_API_KEY`) are stored as environmental variables in the `.env` file (configured in local development and Vercel/production environment panels).
* **Server-Side Proxying**: Frontend scripts never contact Groq or Gemini endpoints directly. All AI reasoning is proxied through the Express `/api/chatbot` and `/api/detect-pest` endpoints, preventing exposure of API keys to the browser inspector.
* **Firebase Admin JSON**: The Firebase SDK credential JSON is saved as a secure secret in the server workspace root and excluded from version control via `.gitignore`.

---

## 3. Cloud Firestore & Local Fallback Auditing

* **Firestore Security Rules**: User records under the `users/{uid}` collection are structured with explicit read/write rules:
  ```javascript
  match /users/{userId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```
* **Offline LocalStorage Encryption Fallback**: If internet connectivity is interrupted or Firestore rules fail to respond, the profile writes to client-side `localStorage`. Private fields (such as phone numbers or patta credentials) are stored securely under local session segments.

---

## 4. User Authorization & Private Data Safety
1. **Implicit Consent**: No land records or budget transactions are shared with third parties or models.
2. **Confidence Filtering**: High-risk suggestions (such as crop disease spraying chemical amounts or financial land valuations) must show verified sources and require confirmation before execution.
3. **Data Anonymization**: GPS coordinates and user names are mapped inside prompt formatting to prevent leaks of individual locations.
