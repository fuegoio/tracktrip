import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";

export const Route = createFileRoute("/docs")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Documentation | Tracktrip",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <RootProvider
      search={{
        enabled: false,
      }}
    >
      <Outlet />
    </RootProvider>
  );
}
