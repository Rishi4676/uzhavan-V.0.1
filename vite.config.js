import { defineConfig } from "vite";
import { spawn } from "child_process";

export default defineConfig({
  server: {
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        crop: "crop.html",
        forum: "forum.html",
        market: "market.html",
        pest: "pest.html",
        schemes: "schemes.html",
        survey: "survey.html",
        weather: "weather.html",
      },
    },
  },
  plugins: [
    {
      name: "start-backend",
      configureServer(server) {
        console.log("Starting backend server dynamically on port 3000...");
        const backend = spawn(
          "node",
          ["price-trend-dashboard/server/index.js"],
          {
            stdio: "inherit",
            shell: true,
          },
        );

        backend.on("error", (err) => {
          console.error("Failed to start backend server:", err);
        });

        // Terminate backend when Vite server closes
        server.httpServer.on("close", () => {
          console.log("Stopping backend server...");
          backend.kill();
        });
      },
    },
  ],
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/e2e/**"],
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.js",
  },
});
