import { defineConfig } from "drizzle-kit";

import { env } from "./src/env";

export default defineConfig({
  out: `./migrations`,
  schema: `./src/db/schema.ts`,
  dialect: `postgresql`,
  casing: `snake_case`,
  dbCredentials: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    ssl: env.POSTGRES_HOST === "localhost" ? false : true,
  },
});
