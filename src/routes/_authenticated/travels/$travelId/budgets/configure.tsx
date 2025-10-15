import { createFileRoute } from "@tanstack/react-router";
import { BudgetSettings } from "@/components/budgets/budget-settings";
import { ScreenHeader } from "@/components/layout/screen-header";
import { ScreenDrawer } from "@/components/layout/screen-drawer";

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
        <div className="font-semibold text-2xl">Budgets</div>
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
