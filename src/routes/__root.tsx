import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import { Install } from "@/components/install";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/trpc/client";

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="bg-primary w-full max-w-md mx-auto h-full relative">
        <Outlet />
      </main>

      <Toaster />
      <Install />
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({ component: RootComponent });
