import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { auth } from "./auth";
import { createContext } from "./trpc/server/trpc";
import { appRouter } from "./trpc/server/router";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";

const routes = {
  "/api/auth/*": (req: Request) => {
    return auth.handler(req);
  },
  "/api/trpc/*": (req: Request) => {
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: () => createContext({ request: req }),
    });
  },
  "/*": async (req: Request) => {
    // Try to serve static files from the dist folder
    const filePath = new URL(req.url).pathname;
    const file = Bun.file(`./dist${filePath}`);
    if (await file.exists()) {
      const response = new Response(file);

      // Add cache headers for files in the assets/ directory
      if (filePath.startsWith("/assets/")) {
        response.headers.set(
          "Cache-Control",
          "public, max-age=31536000, immutable",
        );
      }

      return response;
    }

    // If the file doesn't exist, serve the index.html
    return new Response(Bun.file("./dist/index.html"));
  },
};

const server = Bun.serve({
  idleTimeout: 0,
  routes,
});

console.info(
  `[HTTP Server] Server is running on http://${server.hostname}:${server.port}`,
);

console.info("[Database] Running database migrations...");
migrate(db, { migrationsFolder: "./migrations" })
  .then(() => {
    console.info("[Database] Database migrations complete");
  })
  .catch((err) => {
    console.error(`[Database] Error running migrations: ${String(err)}`);
  });
