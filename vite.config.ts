// defineConfig is imported from vitest/config so the `test` key is typed.
// Importing it from "vite" fails `tsc -b` (npm run build).
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  // Read by Vitest only; `vite` and `vite build` ignore this block.
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // src/api/client.ts throws at import time when VITE_API_URL is unset.
    // A fixed value keeps tests independent of .env locally and in CI.
    // Tests never reach this address.
    env: { VITE_API_URL: "http://localhost:4000" },
  },
});
