import path from "path";
import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { spawn } from "child_process";
import { VitePWA } from "vite-plugin-pwa";

const bunServerPlugin = {
  name: "bun-server-plugin",
  configureServer(server: ViteDevServer) {
    const startBunServer = () => {
      const process = spawn("bun", ["run", "src/server.ts"], {
        stdio: "inherit",
        shell: true,
      });
      process.on("error", (err) => {
        console.error("Failed to start Bun server:", err);
      });
    };

    server.httpServer?.once("listening", startBunServer);
  },
};

export default defineConfig({
  plugins: [
    bunServerPlugin,
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      manifest: {
        name: "Voyage",
        short_name: "Voyage",
        description: "Voyage is a travel app.",
        theme_color: "#232323",
        background_color: "#232323",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
