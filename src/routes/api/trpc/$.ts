import { createServerFileRoute } from "@tanstack/react-start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/trpc/server/router";
import { createContext } from "@/trpc/server/trpc";

const serve = ({ request }: { request: Request }) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext({ request }),
  });
};

export const ServerRoute = createServerFileRoute("/api/trpc/$").methods({
  GET: serve,
  POST: serve,
});
