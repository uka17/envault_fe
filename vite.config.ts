import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import nightwatchPlugin from "vite-plugin-nightwatch";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost/api",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ["@emotion/is-prop-valid"],
  },
  plugins: [vue(), vueDevTools(), nightwatchPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
