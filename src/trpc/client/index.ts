import {
  createTRPCProxyClient,
  httpBatchLink,
  httpSubscriptionLink,
  splitLink,
} from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../server/router";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    splitLink({
      // uses the httpSubscriptionLink for subscriptions
      condition: (op) => op.type === "subscription",
      true: httpSubscriptionLink({
        url: `/api/trpc`,
        transformer: superjson,
      }),
      false: httpBatchLink({
        url: `/api/trpc`,
        transformer: superjson,
      }),
    }),
  ],
});
