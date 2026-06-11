import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      coverage: {
        provider: "istanbul",
        reportsDirectory: "./coverage/unit",
      },
    },
  }),
);
