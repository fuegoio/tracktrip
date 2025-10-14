import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { CategoryTypes } from "@/data/categories";
import { BudgetTypeSummary } from "../budgets/budget-type-summary";
import { Link } from "@tanstack/react-router";

export const Budgets = ({ travelId }: { travelId: string }) => {
  return (
    <div className="w-full py-4 px-2 shadow-up bg-background rounded-lg translate-y-4 z-0 pb-8">
      <div className="flex justify-between px-2 items-center">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Budgets by type
          </div>
          <div className="text-xs text-subtle-foreground">For today</div>
        </div>
        <Button variant="secondary" size="icon" className="size-6" asChild>
          <Link to="/travels/$travelId/settings/budgets" params={{ travelId }}>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="flex px-4 justify-between items-center mt-4">
        {CategoryTypes.map((type) => (
          <BudgetTypeSummary travelId={travelId} type={type} key={type} />
        ))}
      </div>
    </div>
  );
};
