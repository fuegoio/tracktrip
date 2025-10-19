import { useState } from "react";

import { eq, and, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, notFound } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  LabelList,
  Legend,
} from "recharts";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  categoryTypeToColor,
  categoryTypeToEmoji,
  isCategoryType,
} from "@/data/categories";
import { getIntervalsBetweenDates } from "@/lib/dayjs";
import { useTravel } from "@/lib/params";
import { transactionsCollection } from "@/store/collections";
import { categoriesCollection } from "@/store/collections";

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

  const { data: categories } = useLiveQuery((q) =>
    q
      .from({ categories: categoriesCollection })
      .where(({ categories }) =>
        and(eq(categories.travel, travelId), eq(categories.type, categoryType)),
      ),
  );

  const transactionsSum = travelTransactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0,
  );

  // Always include a synthetic "No category" category
  const allCategories = [
    {
      id: "no-category",
      name: "No category",
      color: "var(--muted-foreground)",
    },
    ...categories.map((category) => ({
      ...category,
      color: `var(--color-${categoryTypeToColor[category.type].replace("bg-", "")})`,
    })),
  ];

  console.log(allCategories);

  function sumTransactionsByPeriod() {
    const startOfTravel = dayjs(travel.startDate).startOf("day");
    const periodsSinceStart = getIntervalsBetweenDates(
      startOfTravel,
      dayjs(),
      period,
    );

    const result = periodsSinceStart.map((periodDate) => {
      const periodData: Record<string, any> = { period: periodDate };
      allCategories.forEach((cat) => {
        periodData[`category_${cat.id}`] = 0;
      });
      return periodData;
    });

    travelTransactions.forEach((transaction) => {
      const transactionPeriod = dayjs(transaction.date)
        .startOf(period)
        .format("YYYY-MM-DD");
      const periodIndex = periodsSinceStart.indexOf(transactionPeriod);
      if (periodIndex === -1) return;

      const categoryKey = transaction.category
        ? `category_${transaction.category}`
        : "category_no-category";
      result[periodIndex]![categoryKey] += transaction.amount;
    });

    return result;
  }

  const transactionsByPeriod = sumTransactionsByPeriod();

  // Create chart config
  const chartConfig: ChartConfig = {};
  if (transactionsByPeriod.length > 0) {
    allCategories.forEach((category) => {
      chartConfig[`category_${category.id}`] = {
        label: category.name,
        color: category.color,
      };
    });
  }

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
        <div className="mt-6 mb-2">
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
          {transactionsByPeriod.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No transactions found for this category type.
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[200px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={transactionsByPeriod}
                stackOffset="sign"
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
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
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                      valueFormatter={(value) =>
                        value.toLocaleString(undefined, {
                          style: "currency",
                          currency: travel.currency,
                        })
                      }
                    />
                  }
                />

                {allCategories.map((category) => {
                  const hasData = transactionsByPeriod.some(
                    (periodData) => periodData[`category_${category.id}`] > 0,
                  );
                  if (!hasData) return null;
                  return (
                    <Bar
                      key={category.id}
                      dataKey={`category_${category.id}`}
                      fill={`var(--color-category_${category.id}`}
                      stackId="a"
                    />
                  );
                })}
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </ScreenDrawer>
    </>
  );
}
