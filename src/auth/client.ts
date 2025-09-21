import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== `undefined`
      ? window.location.origin // Always use current domain in browser
      : undefined, // Let better-auth handle server-side baseURL detection
});
