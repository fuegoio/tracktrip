import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_USER: z.string().default("voyage"),
    POSTGRES_PASSWORD: z.string().default("password"),
    POSTGRES_HOST: z.string().default("localhost"),
    POSTGRES_PORT: z.coerce.number().default(5432),
    POSTGRES_DB: z.string().default("voyage"),
    POSTGRES_MAX_CONNECTIONS: z.coerce.number().default(10),
    POSTGRES_IDLE_TIMEOUT: z.coerce.number().default(30000),
    POSTGRES_CONNECTION_TIMEOUT: z.coerce.number().default(2000),
    POSTGRES_STATEMENT_TIMEOUT: z.coerce.number().default(5000),
    POSTGRES_QUERY_TIMEOUT: z.coerce.number().default(10000),
    POSTGRES_LOCK_TIMEOUT: z.coerce.number().default(2000),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    APPLE_CLIENT_ID: z.string(),
    APPLE_CLIENT_SECRET: z.string(),
    APPLE_BUNDLE_ID: z.string().default("app.fuegoio.tracktrip"),
    RESEND_API_KEY: z.string(),
  },
  client: {},
  runtimeEnv: {
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_MAX_CONNECTIONS: process.env.POSTGRES_MAX_CONNECTIONS,
    POSTGRES_IDLE_TIMEOUT: process.env.POSTGRES_IDLE_TIMEOUT,
    POSTGRES_CONNECTION_TIMEOUT: process.env.POSTGRES_CONNECTION_TIMEOUT,
    POSTGRES_STATEMENT_TIMEOUT: process.env.POSTGRES_STATEMENT_TIMEOUT,
    POSTGRES_QUERY_TIMEOUT: process.env.POSTGRES_QUERY_TIMEOUT,
    POSTGRES_LOCK_TIMEOUT: process.env.POSTGRES_LOCK_TIMEOUT,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
    APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET,
    APPLE_BUNDLE_ID: process.env.APPLE_BUNDLE_ID,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
