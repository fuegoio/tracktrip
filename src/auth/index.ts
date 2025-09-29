import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { reactStartCookies } from "better-auth/react-start";

import {
  usersTable,
  accountsTable,
  sessionsTable,
  verificationsTable,
} from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: {
      users: usersTable,
      accounts: accountsTable,
      sessions: sessionsTable,
      verifications: verificationsTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [reactStartCookies()],
});
