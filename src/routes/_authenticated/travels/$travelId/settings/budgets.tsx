import { createFileRoute, Link } from "@tanstack/react-router";
import { BudgetSettings } from "@/components/budgets/budget-settings";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/settings/budgets",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { travelId } = Route.useParams();
  return (
    <>
      <div className="px-1 py-4">
        <Button variant="ghost" asChild className="text-subtle-foreground">
          <Link from={Route.fullPath} to="..">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      <div className="px-5 pb-6">
        <div className="font-semibold text-xl">Budgets</div>
        <div className="text-muted-foreground text-sm mt-1">
          Configure how you want to budget your expenses.
        </div>
      </div>
      <BudgetSettings travelId={travelId} />
    </>
  );
}
