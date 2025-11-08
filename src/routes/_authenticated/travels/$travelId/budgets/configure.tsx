import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { BudgetSettings } from "@/components/budgets/budget-settings";
import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/budgets/configure",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { travelId } = Route.useParams();
  return (
    <>
      <ScreenHeader>
        <div className="flex items-center">
          <Button
            variant="ghost"
            asChild
            className="text-subtle-foreground"
            size="icon"
          >
            <Link from={Route.fullPath} to="/travels/$travelId/categories">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="ml-2 font-semibold text-xl">Budget setting</div>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          Configure how you want to budget your expenses.
        </div>
      </ScreenHeader>

      <ScreenDrawer>
        <BudgetSettings travelId={travelId} />
      </ScreenDrawer>
    </>
  );
}
