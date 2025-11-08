import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import { Install } from "@/components/install";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/trpc/client";

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-full w-full flex items-center justify-center sm:py-4">
        <main className="bg-primary w-full max-w-lg mx-auto h-full relative sm:border border-white/10 sm:rounded-lg overflow-hidden sm:shadow-lg">
          <Outlet />
        </main>
      </div>

      <Toaster />
      <Install />
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({ component: RootComponent });
