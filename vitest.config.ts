import { fileURLToPath, URL } from "node:url";
import { defineConfig, configDefaults } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: ["@emotion/is-prop-valid"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "e2e/**", "tests/playwright/**"],
    setupFiles: ["./src/test/setup.ts"],
    root: fileURLToPath(new URL("./", import.meta.url)),
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,vue}"],
      exclude: [
        "src/main.ts",
        "src/router/**",
        "src/theme/**",
        "src/App.vue",
        "src/test/**",
        "src/**/*.d.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
