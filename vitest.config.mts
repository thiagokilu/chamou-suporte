import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    exclude: ["tests/**", "node_modules/**", "dist/**"],
    env: {
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    },
  },
});
