// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import bun from "@nurodev/astro-bun";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: bun(),
  integrations: [react()],

  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },

  site: "https://tracktrip.app",
  server: {
    host: "0.0.0.0",
  },
});
