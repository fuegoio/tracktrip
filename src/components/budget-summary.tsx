import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ArrowRight, ArrowUp, TriangleAlert } from "lucide-react";

import { CategoryBadge } from "./category-badge";
import { CategoryTypeBadge } from "./category-type-badge";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AnimatedCircularProgressBar } from "./ui/circular-progress";
import { Progress } from "./ui/progress";

import type { Budget, BudgetPeriod } from "@/data/budgets";

import { useTravel } from "@/lib/params";
import { transactionsCollection } from "@/store/collections";

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

  const amountLeft = Math.max(budgetAmount - periodTransactionsAmount, 0);

  // Average computation
  const totalAmount = periodTransactions.reduce((acc, transaction) => {
    const transactionDate = transaction.activationDate || transaction.date;
    const activationStart = dayjs(transactionDate);
    const activationEnd = activationStart.add(transaction.days ?? 1, "day");
    const overlapStart =
      activationStart > startOfTravel ? activationStart : startOfTravel;
    const overlapEnd = activationEnd < now ? activationEnd : now;
    if (overlapStart <= overlapEnd) {
      const numberOfDaysInPeriod = Math.ceil(
        overlapEnd.diff(overlapStart, "day", true),
      );
      return (
        acc +
        (transaction.amount / (transaction.days ?? 1)) * numberOfDaysInPeriod
      );
    }
    return acc;
  }, 0);

  const totalDays = now.diff(startOfTravel, "day");
  const averageTransactionPerDay = totalDays > 0 ? totalAmount / totalDays : 0;
  const averagePeriodAmount = averageTransactionPerDay * daysOfPeriod;

  if (!compact) {
    return (
      <div className="flex gap-3">
        <Link
          to="/travels/$travelId/categories/$categoryType"
          params={{
            travelId: travel.id,
            categoryType: budget.categoryType,
          }}
        >
          <CategoryTypeBadge
            categoryType={budget.categoryType}
            className="size-10 text-lg rounded-lg"
          />
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-2 justify-between">
            {budget.categoryType && (
              <span className="text-subtle-foreground capitalize text-xs">
                {budget.categoryType}
              </span>
            )}
            {budget.category && <CategoryBadge categoryId={budget.category} />}

            {budget.categoryType && (
              <Button
                size="icon"
                variant="secondary"
                className="size-5"
                asChild
              >
                <Link
                  to="/travels/$travelId/categories/$categoryType"
                  params={{
                    travelId: travel.id,
                    categoryType: budget.categoryType,
                  }}
                >
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center pb-2 pt-1">
            <div className="font-mono font-medium text-base text-foreground">
              {periodTransactionsAmount.toLocaleString(undefined, {
                style: "currency",
                currency: travel.currency,
              })}
            </div>
            {periodTransactionsAmount > 0 && (
              <>
                {periodTransactionsAmount > averagePeriodAmount && (
                  <Badge className="ml-2" variant="secondary">
                    <ArrowUp className="size-3 text-rose-400" />+
                    {(
                      (periodTransactionsAmount - averagePeriodAmount) /
                      averagePeriodAmount
                    ).toLocaleString(undefined, {
                      style: "percent",
                      maximumFractionDigits: 0,
                    })}
                  </Badge>
                )}
                {periodTransactionsAmount < averagePeriodAmount && (
                  <Badge className="ml-2" variant="secondary">
                    <ArrowUp className="size-3 rotate-180 text-emerald-400" />-
                    {(
                      (averagePeriodAmount - periodTransactionsAmount) /
                      averagePeriodAmount
                    ).toLocaleString(undefined, {
                      style: "percent",
                      maximumFractionDigits: 0,
                    })}
                  </Badge>
                )}
              </>
            )}

            <div className="flex-1" />
            {budgetPercentage > 100 && (
              <Badge className="ml-2 bg-rose-100 border-transparent text-rose-400">
                <TriangleAlert className="size-3" />+
                {(budgetPercentage - 100).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
                %
              </Badge>
            )}
          </div>

          <Progress value={Math.min(budgetPercentage, 100)} />

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground mt-1">
              {budgetAmount > 0 && (
                <>
                  Amount left:{" "}
                  <span className="font-mono">
                    {amountLeft.toLocaleString(undefined, {
                      style: "currency",
                      currency: travel.currency,
                    })}
                  </span>
                </>
              )}
            </div>
            {budgetAmount > 0 ? (
              <div className="font-mono text-xs text-subtle-foreground">
                {budgetAmount.toLocaleString(undefined, {
                  style: "currency",
                  currency: travel.currency,
                })}
              </div>
            ) : (
              <div className="font-mono text-xs text-muted-foreground px-1">
                {" "}
                -{" "}
              </div>
            )}
          </div>
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
