import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { budgetsCollection } from "@/store/collections";
import { and, eq, not, useLiveQuery } from "@tanstack/react-db";
import { BudgetSummary } from "../budget-summary";

export const Budgets = ({ travelId }: { travelId: string }) => {
  const { data: mainBudgets } = useLiveQuery((q) =>
    q
      .from({ budgets: budgetsCollection })
      .where(({ budgets }) =>
        and(eq(budgets.travel, travelId), not(eq(budgets.categoryType, null))),
      ),
  );

  return (
    <div className="w-full py-4 px-2 rounded-2xl shadow-up">
      <div className="flex justify-between px-2 items-center">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Budgets by category
          </div>
          <div className="text-xs text-subtle-foreground">For today</div>
        </div>
        <Button variant="secondary" size="icon" className="size-6">
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="flex px-4 justify-between items-center mt-4">
        {mainBudgets.map((budget) => (
          <BudgetSummary budget={budget} key={budget.id} />
        ))}
      </div>
    </div>
  );
};
