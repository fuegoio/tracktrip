import type { Budget, BudgetPeriod } from "@/data/budgets";
import { CategoryBadge } from "./category-badge";
import { AnimatedCircularProgressBar } from "./ui/circular-progress";
import { CategoryTypeBadge } from "./category-type-badge";
import { and, eq, gt, lt, useLiveQuery } from "@tanstack/react-db";
import { transactionsCollection } from "@/store/collections";
import { useTravel } from "@/lib/params";
import dayjs from "dayjs";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const BudgetSummary = ({
  budget,
  period,
  compact = false,
}: {
  budget: Budget;
  period: BudgetPeriod;
  compact?: boolean;
}) => {
  const now = dayjs.utc();
  const travel = useTravel({ id: budget.travel });
  const startOfTravel = dayjs(travel.startDate).startOf("day");
  const endOfTravel = dayjs(travel.endDate).add(1, "day").startOf("day");

  const startOfPeriod =
    period === "travel" || period === "travelUntilNow"
      ? startOfTravel
      : now.subtract(1, period).add(1, "day").startOf("day") > startOfTravel
        ? now.subtract(1, period).add(1, "day").startOf("day")
        : startOfTravel;
  const endOfPeriod =
    period === "travel" ? endOfTravel : now.add(1, "day").startOf("day");

  const { data: periodTransactions } = useLiveQuery((q) => {
    return q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) =>
        and(
          eq(transactions.travel, travel.id),
          budget.categoryType
            ? eq(transactions.type, budget.categoryType)
            : true,
          budget.category ? eq(transactions.category, budget.category) : true,
        ),
      );
  });

  const periodTransactionsAmount = periodTransactions.reduce(
    (acc, transaction) => {
      const transactionDate = transaction.activationDate || transaction.date;
      const activationStart = dayjs(transactionDate);
      const activationEnd = activationStart.add(transaction.days ?? 1, "day");

      // Calculate overlap with the period
      const overlapStart =
        activationStart > startOfPeriod ? activationStart : startOfPeriod;
      const overlapEnd =
        activationEnd < endOfPeriod ? activationEnd : endOfPeriod;

      if (overlapStart <= overlapEnd) {
        const numberOfDaysInPeriod = Math.ceil(
          overlapEnd.diff(overlapStart, "day", true),
        );
        console.log(numberOfDaysInPeriod);
        return (
          acc +
          (transaction.amount / (transaction.days ?? 1)) * numberOfDaysInPeriod
        );
      }
      return acc;
    },
    0,
  );

  const daysOfPeriod = endOfPeriod.diff(startOfPeriod, "day");
  const budgetAmount = budget.amount * daysOfPeriod;

  const budgetPercentage =
    budget.amount > 0 ? (periodTransactionsAmount / budgetAmount) * 100 : 0;

  if (!compact) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          {budget.categoryType && (
            <>
              <CategoryTypeBadge categoryType={budget.categoryType} />
              <span className="text-foreground capitalize text-xs font-medium">
                {budget.categoryType}
              </span>
            </>
          )}
          {budget.category && <CategoryBadge categoryId={budget.category} />}
          <div className="flex-1" />
          {budgetPercentage > 100 && (
            <div className="text-destructive flex items-center gap-1">
              <TriangleAlert className="size-4" />
              <span className="text-xs">
                +
                {(budgetPercentage - 100).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
                %
              </span>
            </div>
          )}
          <Button size="icon" variant="secondary" className="size-5" asChild>
            <Link
              to="/travels/$travelId/transactions"
              params={{ travelId: travel.id }}
            >
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>

        <Progress value={budgetPercentage} />
        <div className="flex items-center justify-between">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <AnimatedCircularProgressBar
        className="size-14"
        value={budgetPercentage}
        gaugePrimaryColor="var(--color-subtle-foreground)"
        gaugeSecondaryColor="var(--color-muted)"
      >
        {budget.categoryType && (
          <CategoryTypeBadge categoryType={budget.categoryType} />
        )}
        {budget.category && <CategoryBadge categoryId={budget.category} />}

        {budgetPercentage > 100 && (
          <div className="p-0.5 rounded-full bg-background/70 absolute bottom-3 right-3 text-destructive">
            <TriangleAlert className="size-3" />
          </div>
        )}
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
