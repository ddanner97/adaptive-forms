import { defineConfig } from "vitest/config";

/** Self-contained so it survives the eventual `git subtree split` into its own repo. */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
