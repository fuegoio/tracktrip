import { createRootRoute, Outlet } from "@tanstack/react-router";

const RootLayout = () => (
  <main className="bg-white h-full w-full max-w-xl mx-auto md:border-r md:border-l md:shadow-xl">
    <Outlet />
  </main>
);

export const Route = createRootRoute({ component: RootLayout });
