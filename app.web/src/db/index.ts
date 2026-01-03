import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

import { env } from "@/env";
import { logger } from "@/lib/logger";

const globalForDrizzle = globalThis as unknown as {
  pool: Pool | undefined;
};

export type DbType = NodePgDatabase<typeof schema>;

const createPool = () => {
  logger.info("[Database] Connecting to database...");
  const pool = new Pool({
    connectionString: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
    max: env.POSTGRES_MAX_CONNECTIONS,
    idleTimeoutMillis: env.POSTGRES_IDLE_TIMEOUT,
    connectionTimeoutMillis: env.POSTGRES_CONNECTION_TIMEOUT,
    statement_timeout: env.POSTGRES_STATEMENT_TIMEOUT,
    query_timeout: env.POSTGRES_QUERY_TIMEOUT, // This timeout is a socket one, so it's a bit higher than statement_timeout
    lock_timeout: env.POSTGRES_LOCK_TIMEOUT,
  });

  globalForDrizzle.pool = pool;
  return pool;
};

const getPoolAndDrizzleDB = () => {
  let pool: Pool;

  if (globalForDrizzle.pool) {
    pool = globalForDrizzle.pool;
  } else {
    pool = createPool();
  }

  const db = drizzle(pool, { schema });

  return { pool, db };
};

export const { pool, db } = getPoolAndDrizzleDB();
