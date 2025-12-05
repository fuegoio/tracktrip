import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "http://10.0.2.2:8000",
  plugins: [
    expoClient({
      scheme: "tracktrip",
      storagePrefix: "tracktrip",
      storage: SecureStore,
    }),
  ],
});
