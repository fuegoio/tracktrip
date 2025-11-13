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
    <div className="dark bg-background text-foreground h-full w-full">
      <RootProvider
        theme={{
          enabled: false,
        }}
        search={{
          enabled: false,
        }}
      >
        <Outlet />
      </RootProvider>
    </div>
  );
}
