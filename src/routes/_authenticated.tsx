import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import {
  getCachedSession,
  isSessionValid,
  setCachedSession,
  type SessionData,
} from "@/auth/cache";
import { authClient } from "@/auth/client";
import { ScreenLayoutProvider } from "@/components/layout/screen-layout-context";
import { useEffect } from "react";

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
  /**
   * The documentation uses next-theme which can add a dark class to the html element.
   * But in our case, we don't want to have a dark theme globally.
   */
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center sm:py-4 bg-primary">
      <main className="w-full max-w-lg mx-auto h-full relative sm:border border-white/10 sm:rounded-lg overflow-hidden sm:shadow-lg">
        <ScreenLayoutProvider>
          <Outlet />
        </ScreenLayoutProvider>
      </main>
    </div>
  );
}
