# Smart Farmer Assistant (Uzhavan V.0.1)

A modern, responsive web application designed to support Indian farmers with real-time weather alerts, crop recommendations, pest and disease identification, land surveys, and a community discussion forum.

## 🔗 Project Links

* **GitHub Repository:** [https://github.com/Rishi4676/uzhavan-V.0.1](https://github.com/Rishi4676/uzhavan-V.0.1)
* **Vercel Live Deployment:** [https://uzhavan-v-0-1.vercel.app](https://uzhavan-v-0-1.vercel.app) *(Note: Update this URL in the README if your Vercel subdomain is different)*

---

## 🚀 Key Features

1. **Community Forum (Supabase Sync):**
   * Real-time discussions and crop advice.
   * Auto-detection of logged-in users, complete with location profiles.
   * Verified TNAU Expert badges for agricultural specialists.
   * High-performance, offline fallback with local storage.
2. **Weather Insights & Charts:**
   * Dynamic rainfall, temperature, and wind graphs.
3. **Market Place & Price Trends:**
   * Live commodity prices and historical trends.
4. **Pest & Disease Detection:**
   * Diagnostic resources for crop issues.
5. **Crop & Irrigation Suggestion:**
   * Smart advice based on soil type and geography.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Vanilla), ES6 Modules, Vite
* **Backend:** Node.js, Express
* **Database & Auth:** Supabase (PostgreSQL)

---

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rishi4676/uzhavan-V.0.1.git
   cd uzhavan-V.0.1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and configure your Supabase keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SECRET_KEY=your_supabase_service_role_key
   ```

4. **Initialize Database Tables:**
   Copy the SQL scripts inside [lib/supabase/schema.sql](lib/supabase/schema.sql) and execute them in your **Supabase SQL Editor** to create the necessary tables (`profiles`, `forum_posts`, `forum_replies`, and `health_check`).

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   *This command starts both the Vite server and the local Express backend proxy server dynamically on port 3000.*
