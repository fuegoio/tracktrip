import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Link, RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Import the CSS file
import "./assets/index.css";
import { Button } from "./components/ui/button";
import { ArrowRight } from "lucide-react";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen">
        <p className="text-7xl font-bold">404</p>
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
