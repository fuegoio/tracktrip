import type { Budget } from "@/data/budgets";
import { CategoryBadge } from "./category-badge";
import { AnimatedCircularProgressBar } from "./ui/circular-progress";
import { CategoryTypeBadge } from "./category-type-badge";
import { and, eq, gt, lt, sum, useLiveQuery } from "@tanstack/react-db";
import { transactionsCollection } from "@/store/collections";
import { endOfDay, startOfDay } from "date-fns";

export const BudgetSummary = ({ budget }: { budget: Budget }) => {
  const today = new Date();

  const { data: todayTransactions } = useLiveQuery((q) => {
    return q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) =>
        and(
          gt(transactions.date, startOfDay(today)),
          lt(transactions.date, endOfDay(today)),
          budget.categoryType
            ? eq(transactions.type, budget.categoryType)
            : undefined,
          budget.category
            ? eq(transactions.category, budget.category)
            : undefined,
        ),
      )
      .select(({ transactions }) => ({
        totalAmount: sum(transactions.amount),
      }));
  });

  return (
    <div className="flex flex-col items-center">
      <AnimatedCircularProgressBar
        className="size-14"
        value={10}
        gaugePrimaryColor="var(--color-subtle-foreground)"
        gaugeSecondaryColor="var(--color-muted)"
      >
        {budget.categoryType && (
          <CategoryTypeBadge categoryType={budget.categoryType} />
        )}
        {budget.category && <CategoryBadge categoryId={budget.category} />}
      </AnimatedCircularProgressBar>
      <div className="font-mono font-medium text-xs text-foreground mt-1">
        {todayTransactions[0]?.totalAmount || 0}
      </div>
      <div className="font-mono text-xs text-muted-foreground">
        {budget.amount}
      </div>
    </div>
  );
};
