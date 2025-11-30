import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import * as React from "react";
import appCss from "@/styles/app.css?url";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import SearchDialog from "@/components/search";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Documentation | Tracktrip",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [
      {
        src: "https://umami.alexistac.net/script.js",
        "data-website-id": "e4947d3a-4cfd-482c-93d7-8198c85505d9",
        defer: true,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          theme={{
            enabled: false,
          }}
          search={{ SearchDialog }}
        >
          {children}
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
