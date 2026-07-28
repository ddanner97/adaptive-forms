import { defineConfig } from "vitest/config";

/** Self-contained so it travels with the package as its own repo. */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
