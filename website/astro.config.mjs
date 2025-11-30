// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: node({
    mode: "standalone",
  }),
  integrations: [react(), sitemap()],

  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },

  site: "https://tracktrip.app",
  server: {
    host: "0.0.0.0",
  },
  security: {
    checkOrigin: false,
  },
});
