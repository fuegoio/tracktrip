import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import { auth } from "./auth";
import { db } from "./db";
import { appRouter } from "./trpc/server/router";
import { createContext } from "./trpc/server/trpc";

const CORS_HEADERS = {
  headers: {
    "Access-Control-Allow-Origin": "http://localhost:8081",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Access-Control-Allow-Headers": "Content-Type",
  },
};

const routes = {
  "/api/auth/*": async (req: Request) => {
    if (req.method === "OPTIONS") {
      const res = new Response("Departed", CORS_HEADERS);
      return res;
    }

    const res = await auth.handler(req);
    res.headers.set("Access-Control-Allow-Origin", "http://localhost:8081");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return res;
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
