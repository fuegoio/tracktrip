import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Resend } from "resend";

import RecoverAccount from "./emails/recover-account";
import VerifyEmail from "./emails/verify-email";

import { db } from "@/db";
import {
  usersTable,
  accountsTable,
  sessionsTable,
  verificationsTable,
} from "@/db/schema";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

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
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      console.log("Sending reset password email to", user.email, url);
      resend.emails.send({
        from: "Tracktrip <onboarding@notifications.tracktrip.app>",
        to: user.email,
        subject: "Reset your password",
        react: <RecoverAccount url={url} />,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log("Sending verification email to", user.email, url);
      resend.emails.send({
        from: "Tracktrip <onboarding@notifications.tracktrip.app>",
        to: user.email,
        subject: "Verify your email address",
        react: <VerifyEmail url={url} />,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  trustedOrigins: [
    "tracktrip://",
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:8081", "exp://"]
      : []),
  ],
  plugins: [tanstackStartCookies(), expo()],
});
