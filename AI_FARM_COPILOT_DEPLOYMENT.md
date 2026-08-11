# AI Farm Copilot: Deployment Guide

This document details the configuration requirements, build pipelines, and deployment steps for launching the **AI Farm Copilot** into production.

---

## 1. Environment Configuration

Create a `.env` file in the root directory. This file must contain the following keys:

```ini
PORT=3000
GEMINI_API_KEY=your_google_gemini_api_key_here
GROQ_API_KEY=your_groq_llama_api_key_here
```

* Ensure that `.env` is added to your `.gitignore` to prevent committing sensitive keys to GitHub.
* For serverless hosting (Vercel, Render, Heroku), configure these variables under the **Environment Variables** tab of your deployment project dashboard.

---

## 2. Server Deployment Pipelines

### Vercel Deployment (Default)
The project includes a `vercel.json` file pointing routes to the Vercel-compatible server entry point in `api/index.js`.
To deploy:
1. Install Vercel CLI globally: `npm install -g vercel`.
2. Link the repository to your Vercel project: `vercel link`.
3. Push to production: `vercel --prod`.

### Manual VPS / Docker Deployment
To host on a standard Linux virtual private server (e.g. DigitalOcean, AWS EC2):
1. Clone the repository to your server:
   ```bash
   git clone https://github.com/your-username/uzhavan.git
   cd uzhavan
   ```
2. Create your `.env` file:
   ```bash
   nano .env
   ```
3. Install production dependencies:
   ```bash
   npm install --omit=dev
   ```
4. Build the production frontend assets:
   ```bash
   npm run build
   ```
5. Run the background server using a process manager like PM2:
   ```bash
   pm2 start price-trend-dashboard/server/index.js --name "agri-copilot"
   ```

---

## 3. Production Verification Checklist

Before opening the portal to farmers:
- [ ] **SSL (HTTPS)**: Ensure that SSL is configured. Web Speech Recognition (`webkitSpeechRecognition`) requires a secure context (HTTPS) to gain microphone permissions in browsers.
- [ ] **API Connection**: Confirm that `/api/chatbot` responds with valid JSON objects when queried.
- [ ] **Firebase Integration**: Confirm database sync writes to Firestore successfully on login.
- [ ] **Unit Tests**: All unit tests must pass before deployment (`npm run test -- --run` exits 0).
