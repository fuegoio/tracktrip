import {
  getCachedSession,
  isSessionValid,
  setCachedSession,
  type SessionData,
} from "@/auth/cache";
import { authClient } from "@/auth/client";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const cachedSession = getCachedSession();

    let session: SessionData;
    if (cachedSession && isSessionValid(cachedSession)) {
      authClient
        .getSession()
        .then((res) => {
          if (res.data?.session) {
            setCachedSession(res.data);
          }
        })
        .catch(console.error);

      session = cachedSession;
    } else {
      const res = await authClient.getSession();
      if (!res.data?.session) {
        throw redirect({
          to: `/login`,
          search: {
            redirect: location.pathname,
          },
        });
      }

      setCachedSession(res.data);
      session = res.data;
    }

    const { travelsCollection, transactionsCollection } = await import(
      "@/store/collections"
    );
    await travelsCollection.preload();
    await transactionsCollection.preload();
    await travelsCollection.stateWhenReady();
    await transactionsCollection.stateWhenReady();

    return {
      session: session,
    };
  },
});

function RouteComponent() {
  return <Outlet />;
}
