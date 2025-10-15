import { BudgetTypeSummary } from "@/components/budgets/budget-type-summary";
import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { CategoryTypes } from "@/data/categories";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Cog } from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/budgets/",
)({
  component: RouteComponent,
});

const budgetsSummaries = [
  {
    name: "Today",
    period: "day",
  },
  {
    name: "Last week",
    period: "week",
  },
  {
    name: "Last month",
    period: "month",
  },
  {
    name: "Until now",
    period: "travelUntilNow",
  },
  {
    name: "Whole travel",
    period: "travel",
  },
] as const;

function RouteComponent() {
  const { travelId } = Route.useParams();
  return (
    <>
      <ScreenHeader>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold text-2xl">Budgets</div>
          </div>
          <Button size="icon" variant="secondary" asChild>
            <Link to="./configure" from={Route.fullPath}>
              <Cog />
            </Link>
          </Button>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          How much you did spent in each category.
        </div>
      </ScreenHeader>

      <ScreenDrawer className="pb-20 space-y-4 pt-8">
        {budgetsSummaries.map((budgetSummary) => (
          <div>
            <div className="text-xs text-subtle-foreground px-4">
              {budgetSummary.name}
            </div>
            <div className="flex px-4 justify-between items-center mt-4">
              {CategoryTypes.map((type) => (
                <BudgetTypeSummary
                  travelId={travelId}
                  type={type}
                  key={type}
                  period={budgetSummary.period}
                />
              ))}
            </div>
          </div>
        ))}
      </ScreenDrawer>
    </>
  );
}
