import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account-deleted")({
  component: RouteComponent,
  loader: async () => {
    localStorage.clear();
  },
});

function RouteComponent() {
  return (
    <div className="bg-background dark h-full w-full flex items-center justify-center">
      <div className="p-6 flex flex-col justify-center gap-6 h-full max-w-lg w-full">
        <div>
          <div className="size-6 rounded-full bg-white mb-2" />
          <h1 className="text-lg font-semibold mt-3 text-foreground">
            Account successfully deleted
          </h1>
          <div className="text-sm text-muted-foreground mt-1">
            Your account has been successfully deleted. All your data has been
            permanently removed from our servers.
          </div>
        </div>
      </div>
    </div>
  );
}
