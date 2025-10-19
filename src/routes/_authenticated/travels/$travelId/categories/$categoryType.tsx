import { useState } from "react";

import { eq, and, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, notFound } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { categoryTypeToEmoji, isCategoryType } from "@/data/categories";
import { getIntervalsBetweenDates } from "@/lib/dayjs";
import { useTravel } from "@/lib/params";
import { transactionsCollection } from "@/store/collections";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/categories/$categoryType",
)({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    const { categoryType } = params;

    if (!isCategoryType(categoryType)) {
      throw notFound();
    }

    return {
      categoryType: categoryType,
    };
  },
});

function RouteComponent() {
  const { travelId } = Route.useParams();
  const { categoryType } = Route.useRouteContext();
  const [period, setPeriod] = useState<"week" | "day">("day");

  const travel = useTravel({
    id: travelId,
  });

  const { data: travelTransactions } = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) =>
        and(
          eq(transactions.travel, travelId),
          eq(transactions.type, categoryType),
        ),
      ),
  );
  const transactionsSum = travelTransactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0,
  );

  function sumTransactionsByWeek() {
    const startOfTravel = dayjs(travel.startDate).startOf("day");
    const periodsSinceStart = getIntervalsBetweenDates(
      startOfTravel,
      dayjs(),
      period,
    );
    const result = periodsSinceStart.map((week) => ({
      week,
      sum: 0,
    }));

    travelTransactions.forEach((transaction) => {
      const transactionWeek = dayjs(transaction.date)
        .startOf(period)
        .format("YYYY-MM-DD");
      const weekIndex = periodsSinceStart.indexOf(transactionWeek);
      if (weekIndex !== -1) {
        result[weekIndex]!.sum += transaction.amount;
      }
    });

    return result;
  }

  const transactionsByPeriod = sumTransactionsByWeek();

  return (
    <>
      <ScreenHeader>
        <div className="flex items-center gap-2">
          <span className="text-xl">{categoryTypeToEmoji[categoryType]}</span>
          <span className="text-foreground capitalize text-2xl font-medium">
            {categoryType}
          </span>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          A summary of your {categoryType} expenses for this travel.
        </div>

        <div className="my-2 relative z-0">
          <div className="relative z-10 from-card bg-gradient-to-r to-transparent from-50% to-100% h-full py-4">
            <div className="text-subtle-foreground text-sm">
              Total {categoryType} cost
            </div>
            <div className="text-3xl text-foreground font-mono mt-1">
              {transactionsSum.toLocaleString(undefined, {
                style: "currency",
                currency: travel.currency,
              })}
            </div>
          </div>
        </div>
      </ScreenHeader>

      <ScreenDrawer className="space-y-2 px-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">
              Expense evolution
            </div>
            <div className="text-xs text-subtle-foreground">
              Since the beginning
            </div>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            value={period}
            onValueChange={(value: "day" | "week") => setPeriod(value)}
            size="sm"
          >
            <ToggleGroupItem value="day" className="text-sm">
              1D
            </ToggleGroupItem>
            <ToggleGroupItem value="week" className="text-sm">
              7D
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mt-4 space-y-4">
          <ChartContainer
            config={{
              sum: {
                label: "Expense",
                color: "var(--foreground)",
              },
            }}
            className="aspect-auto h-[200px] w-full"
          >
            <BarChart accessibilityLayer data={transactionsByPeriod}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="sum"
                    formatter={(value) => {
                      return (
                        <span className="font-mono text-sm font-medium">
                          {value.toLocaleString(undefined, {
                            style: "currency",
                            currency: travel.currency,
                          })}
                        </span>
                      );
                    }}
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />
              <Bar dataKey="sum" fill={`var(--color-sum)`} />
            </BarChart>
          </ChartContainer>
        </div>
      </ScreenDrawer>
    </>
  );
}
