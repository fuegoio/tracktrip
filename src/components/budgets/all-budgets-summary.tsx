import { eq, useLiveQuery } from "@tanstack/react-db";
import dayjs from "dayjs";
import { ArrowUp, TriangleAlert } from "lucide-react";

import { Badge } from "../ui/badge";
import { AnimatedCircularProgressBar } from "../ui/circular-progress";
import { Progress } from "../ui/progress";

import type { BudgetPeriod } from "@/data/budgets";

import { useTravel } from "@/lib/params";
import { budgetsCollection, transactionsCollection } from "@/store/collections";

export const AllBudgetsSummary = ({
  travelId,
  period,
  compact = false,
}: {
  travelId: string;
  period: BudgetPeriod;
  compact?: boolean;
}) => {
  const now = dayjs.utc();
  const travel = useTravel({
    id: travelId,
  });

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
      .where(({ transactions }) => eq(transactions.travel, travel.id));
  });

  const periodTransactionsAmount =
    periodTransactions?.reduce((acc, transaction) => {
      const transactionDate = transaction.date;
      const activationStart = dayjs(transactionDate);
      const activationEnd = activationStart.add(transaction.days ?? 1, "day");
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
    }, 0) || 0;

  const daysOfPeriod = endOfPeriod.diff(startOfPeriod, "day");

  // Ici, on calcule le budget total (à adapter selon votre logique métier)
  // Par exemple, somme de tous les budgets du voyage
  const { data: budgets } = useLiveQuery((q) =>
    q
      .from({ budgets: budgetsCollection })
      .where(({ budgets }) => eq(budgets.travel, travel.id)),
  );
  const budgetAmount =
    budgets?.reduce((acc, budget) => acc + budget.amount, 0) || 0;
  const budgetAmountForPeriod = budgetAmount * daysOfPeriod;

  const budgetPercentage =
    budgetAmount > 0
      ? (periodTransactionsAmount / budgetAmountForPeriod) * 100
      : 0;
  const amountLeft = budgetAmountForPeriod - periodTransactionsAmount;

  // Calcul de la moyenne (optionnel, comme dans l'original)
  const totalAmount =
    periodTransactions?.reduce((acc, transaction) => {
      const transactionDate = transaction.date;
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
    }, 0) || 0;
  const totalDays = Math.ceil(now.diff(startOfTravel, "day", true));
  const averageTransactionPerDay = totalDays > 0 ? totalAmount / totalDays : 0;
  const averagePeriodAmount = averageTransactionPerDay * daysOfPeriod;

  if (!compact) {
    return (
      <div className="border-b pb-5 pl-1">
        <div className="flex items-center gap-2 justify-between">
          <span className="text-subtle-foreground capitalize text-xs">
            Total
          </span>
        </div>
        <div className="flex items-center pb-2 pt-1">
          <div className="font-mono font-medium text-base text-foreground">
            {periodTransactionsAmount.toLocaleString(undefined, {
              style: "currency",
              currency: travel.currency,
            })}
          </div>
          {periodTransactionsAmount > 0 && period !== "travel" && (
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
            {budgetAmountForPeriod > 0 && (
              <>
                {amountLeft >= 0 ? "Amount left:" : "Over budget:"}{" "}
                <span className="font-mono">
                  {Math.abs(amountLeft).toLocaleString(undefined, {
                    style: "currency",
                    currency: travel.currency,
                  })}
                </span>
              </>
            )}
          </div>
          {budgetAmountForPeriod > 0 ? (
            <div className="font-mono text-xs text-subtle-foreground">
              {budgetAmountForPeriod.toLocaleString(undefined, {
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
      {budgetAmountForPeriod > 0 ? (
        <div className="font-mono text-xs text-muted-foreground">
          {budgetAmountForPeriod.toLocaleString(undefined, {
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
