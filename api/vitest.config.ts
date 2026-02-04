/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    setupFiles: ["./src/test-setup.ts"],
    coverage: {
      // Include json-summary so CI can read api/coverage/coverage-summary.json
      reporter: ["text", "json", "json-summary", "html"],
    },
    exclude: ["dist/**", "node_modules/**", "database/**"],
    // Enable experimental support for ES modules in Vitest
    // This allows importing TypeScript files with ES module syntax
    server: {
      deps: {
        inline: true,
      },
    },
  },
});
