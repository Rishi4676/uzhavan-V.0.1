import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/e2e/**",
      "**/price-trend-dashboard/server/**",
    ],
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.js",
  },
});
