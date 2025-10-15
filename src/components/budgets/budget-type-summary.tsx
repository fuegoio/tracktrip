import type { CategoryType } from "@/data/categories";
import { budgetsCollection } from "@/store/collections";
import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { BudgetSummary } from "../budget-summary";
import type { BudgetPeriod } from "@/data/budgets";

export const BudgetTypeSummary = ({
  type,
  travelId,
  period,
  compact = false,
}: {
  type: CategoryType;
  travelId: string;
  period: BudgetPeriod;
  compact?: boolean;
}) => {
  const budget = useLiveQuery(
    (q) =>
      q
        .from({ budgets: budgetsCollection })
        .where(({ budgets }) =>
          and(eq(budgets.travel, travelId), eq(budgets.categoryType, type)),
        ),
    [travelId, type],
  ).data.at(0);

  if (!budget) {
    return (
      <BudgetSummary
        budget={{
          id: type,
          travel: travelId,
          categoryType: type,
          category: null,
          amount: 0,
        }}
        period={period}
        compact={compact}
      />
    );
  }

  return <BudgetSummary budget={budget} period={period} compact={compact} />;
};
