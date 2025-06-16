import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "src", "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    VitePWA({
      devOptions: {
        enabled: true,
      },
      registerType: "autoUpdate",
      includeAssets: [
        "/favicon.png",
        "/images/logo.png",
        "/images/Bojji1.jpeg",
      ],
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg,ico,json}"],
      },
    }),
  ],
});
