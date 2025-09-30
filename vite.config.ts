import path from "path";
import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { spawn } from "child_process";

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
