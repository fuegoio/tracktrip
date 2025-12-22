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
  head: (params) => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title:
          "Documentation | Tracktrip — Track your expenses while travelling",
      },
      {
        name: "description",
        content:
          "Tracktrip is a mobile and web application to record and budget your travel expenses, solo or with your friends.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "48x48",
        href: "favicon-48x48.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "favicon-192x192.png",
      },
      {
        rel: "apple-touch-icon",
        type: "image/png",
        sizes: "180x180",
        href: "icons/apple-touch-icon-180x180.png",
      },
    ],
    scripts: [
      import.meta.env.PROD
        ? {
            src: "https://umami.alexistac.net/script.js",
            "data-website-id": "e4947d3a-4cfd-482c-93d7-8198c85505d9",
            defer: true,
          }
        : undefined,
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
