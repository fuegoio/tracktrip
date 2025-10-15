import type { Budget, BudgetPeriod } from "@/data/budgets";
import { CategoryBadge } from "./category-badge";
import { AnimatedCircularProgressBar } from "./ui/circular-progress";
import { CategoryTypeBadge } from "./category-type-badge";
import { and, eq, gt, lt, useLiveQuery } from "@tanstack/react-db";
import { transactionsCollection } from "@/store/collections";
import { useTravel } from "@/lib/params";
import dayjs from "dayjs";

export const BudgetSummary = ({
  budget,
  period,
}: {
  budget: Budget;
  period: BudgetPeriod;
}) => {
  const now = dayjs();
  const travel = useTravel({ id: budget.travel });
  const startOfTravel = dayjs(travel.startDate).startOf("day");
  const endOfTravel = dayjs(travel.endDate).endOf("day");

  const startOfPeriod =
    period === "travel" || period === "travelUntilNow"
      ? startOfTravel
      : now.subtract(1, period).endOf("day") > startOfTravel
        ? now.subtract(1, period).endOf("day")
        : startOfTravel;
  const endOfPeriod = period === "travel" ? endOfTravel : now.endOf("day");

  const { data: periodTransactions } = useLiveQuery((q) => {
    return q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) =>
        and(
          eq(transactions.travel, travel.id),
          gt(transactions.date, startOfPeriod.toDate()),
          lt(transactions.date, endOfPeriod.toDate()),
          budget.categoryType
            ? eq(transactions.type, budget.categoryType)
            : true,
          budget.category ? eq(transactions.category, budget.category) : true,
        ),
      );
  });
  const periodTransactionsAmount = periodTransactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0,
  );

  const daysOfPeriod = endOfPeriod.diff(startOfPeriod, "day");
  const budgetAmount = budget.amount * daysOfPeriod;

  return (
    <div className="flex flex-col items-center">
      <AnimatedCircularProgressBar
        className="size-14"
        value={
          budget.amount > 0
            ? (periodTransactionsAmount / budgetAmount) * 100
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
        {periodTransactionsAmount.toLocaleString(undefined, {
          style: "currency",
          currency: travel.currency,
        })}
      </div>
      {budgetAmount > 0 ? (
        <div className="font-mono text-xs text-muted-foreground">
          {budgetAmount.toLocaleString(undefined, {
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
