import { defineConfig } from "vite";
import path from "node:path";
import istanbul from "vite-plugin-istanbul";

export default defineConfig({
  base: "/codeVibeCheck/",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/index.scss" as *;`,
      },
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    port: 3000,
    open: true,
  },
  plugins: [
    istanbul({
      include: "src/**/*",
      exclude: ["node_modules", "test/"],
      extension: [".js", ".ts", ".tsx", ".vue"],
      requireEnv: false,
    }),
  ],
});
