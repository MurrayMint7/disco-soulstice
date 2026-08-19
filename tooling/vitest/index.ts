import { defineConfig } from "vitest/config";

export const discoVitestConfig = defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
