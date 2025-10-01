import type { Budget } from "@/data/budgets";
import { CategoryBadge } from "./category-badge";
import { AnimatedCircularProgressBar } from "./ui/circular-progress";
import { CategoryTypeBadge } from "./category-type-badge";
import { and, eq, gt, lt, useLiveQuery } from "@tanstack/react-db";
import { transactionsCollection } from "@/store/collections";
import { endOfDay, startOfDay } from "date-fns";
import { useTravel } from "@/lib/params";

export const BudgetSummary = ({ budget }: { budget: Budget }) => {
  const today = new Date();

  const travel = useTravel({ id: budget.travel });
  const { data: todayTransactions } = useLiveQuery((q) => {
    return q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) =>
        and(
          gt(transactions.date, startOfDay(today)),
          lt(transactions.date, endOfDay(today)),
          budget.categoryType
            ? eq(transactions.type, budget.categoryType)
            : true,
          budget.category ? eq(transactions.category, budget.category) : true,
        ),
      );
  });
  const todayTransactionsAmount = todayTransactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0,
  );

  return (
    <div className="flex flex-col items-center">
      <AnimatedCircularProgressBar
        className="size-14"
        value={
          budget.amount > 0
            ? (todayTransactionsAmount / budget.amount) * 100
            : 0
        }
        gaugePrimaryColor="var(--color-subtle-foreground)"
        gaugeSecondaryColor="var(--color-muted)"
      >
        {budget.categoryType && (
          <CategoryTypeBadge categoryType={budget.categoryType} />
        )}
        {budget.category && <CategoryBadge categoryId={budget.category} />}
      </AnimatedCircularProgressBar>
      <div className="font-mono font-medium text-xs text-foreground mt-1">
        {todayTransactionsAmount.toLocaleString(undefined, {
          style: "currency",
          currency: travel.currency,
        })}
      </div>
      {budget.amount > 0 ? (
        <div className="font-mono text-xs text-muted-foreground">
          {budget.amount.toLocaleString(undefined, {
            style: "currency",
            currency: travel.currency,
          })}
        </div>
      ) : (
        <div className="font-mono text-xs text-muted-foreground"> - </div>
      )}
    </div>
  );
};
