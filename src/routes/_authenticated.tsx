import { authClient } from "@/auth/client";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async () => {
    const res = await authClient.getSession();
    if (!res.data?.session) {
      throw redirect({
        to: `/login`,
        search: {
          redirect: location.pathname,
        },
      });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
