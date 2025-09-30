import { Outlet, createRootRoute } from "@tanstack/react-router";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { Update } from "@/components/update";

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="bg-background h-full w-full max-w-md mx-auto">
        <Outlet />
      </main>

      <Toaster />
      <Update />
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({ component: RootComponent });
