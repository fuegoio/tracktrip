import { StrictMode } from "react";

import { Link, RouterProvider, createRouter } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import ReactDOM from "react-dom/client";

import { Button } from "./components/ui/button";
import { routeTree } from "./routeTree.gen";

// Import the CSS file
import "./assets/index.css";

// Import dayjs configuration
import "./lib/dayjs";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => {
    return (
      <div className="dark flex flex-col items-center justify-center h-full w-full">
        <p className="text-7xl font-bold text-foreground">404</p>
        <p className="text-xl text-subtle-foreground">
          This page can't be found
        </p>
        <Button asChild className="mt-8" variant="secondary">
          <Link to="/">
            Go home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
