import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        L: "readonly", // Leaflet
        currentLang: "writable",
      },
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "warn",
    },
  },
];
