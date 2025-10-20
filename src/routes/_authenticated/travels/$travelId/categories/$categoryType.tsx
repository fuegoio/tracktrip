import { useState } from "react";

import { eq, and, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, notFound } from "@tanstack/react-router";
import Color from "colorjs.io";
import dayjs from "dayjs";
import { List } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis } from "recharts";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { TransactionsByDate } from "@/components/transactions/transactions-by-date";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  categoryTypeToColorHex,
  categoryTypeToEmoji,
  isCategoryType,
} from "@/data/categories";
import { getIntervalsBetweenDates } from "@/lib/dayjs";
import { useTravel } from "@/lib/params";
import { budgetsCollection, transactionsCollection } from "@/store/collections";
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
  const { categoryType, session } = Route.useRouteContext();
  const userId = session.user.id;

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

  const getCategoryTransactionsSum = (categoryId: string) => {
    return travelTransactions
      .filter(
        (transaction) =>
          transaction.category ===
          (categoryId === "no-category" ? null : categoryId),
      )
      .reduce((acc, transaction) => acc + transaction.amount, 0);
  };

  const getCategoryColor = (index: number) => {
    const color = new Color(categoryTypeToColorHex[categoryType]);
    color.lch.c = 100;
    color.lch.l = 80 + (index / categories.length) * -50;
    return color;
  };

  // Always include a synthetic "No category" category and calculate transaction sums
  const allCategories = [
    ...categories.map((category, index) => {
      const sum = getCategoryTransactionsSum(category.id);
      return {
        ...category,
        color: getCategoryColor(index).toString(),
        transactionSum: sum,
      };
    }),
    {
      id: "no-category",
      emoji: undefined,
      name: "No category",
      color: "var(--muted-foreground)",
      transactionSum: getCategoryTransactionsSum("no-category"),
    },
  ];

  // Sort categories by transaction sum (descending)
  const sortedCategories = [...allCategories].sort(
    (a, b) => b.transactionSum - a.transactionSum,
  );

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

  const budget = useLiveQuery(
    (q) =>
      q
        .from({ budgets: budgetsCollection })
        .where(({ budgets }) =>
          and(
            eq(budgets.travel, travelId),
            eq(budgets.categoryType, categoryType),
          ),
        ),
    [travelId, categoryType],
  ).data.at(0);

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
        <div className="pt-6 pb-2">
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

        <div className="pt-4 relative overflow-hidden">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pr-10">
            {sortedCategories.map((category) => (
              <div
                key={category.id}
                className="border-l-2 px-4"
                style={{ borderColor: category.color }}
              >
                <div className="flex items-baseline gap-1">
                  {category.emoji && (
                    <div className="text-xs">{category.emoji}</div>
                  )}
                  <div className="text-xs text-subtle-foreground align-middle whitespace-nowrap">
                    {category.name} cost
                  </div>
                </div>
                <div className="text-foreground font-mono font-semibold text-sm">
                  {category.transactionSum.toLocaleString(undefined, {
                    style: "currency",
                    currency: travel.currency,
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-card to-transparent pointer-events-none"></div>
        </div>
      </ScreenHeader>

      <ScreenDrawer asChild>
        <div className="w-full p-4 shadow-up bg-background rounded-t-lg translate-y-4 z-0 pb-8">
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
              onValueChange={(value: "day" | "week" | "") => {
                if (value) setPeriod(value);
              }}
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
                <BarChart data={transactionsByPeriod}>
                  {budget && (
                    <ReferenceLine
                      y={budget.amount * (period === "day" ? 1 : 7)}
                      stroke="var(--color-muted-foreground)"
                      strokeDasharray="3 3"
                      opacity={0.3}
                    />
                  )}
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
                    trigger="hover"
                    content={
                      <ChartTooltipContent
                        className="min-w-[200px]"
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
        </div>

        <div className="w-full py-4 px-2 shadow-up pb-10 bg-background rounded-t-lg flex-1 translate-y-0">
          <div className="flex px-2 items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">
                <span className="capitalize">{categoryType}</span> transactions
              </div>
              <div className="text-xs text-subtle-foreground">
                Since the beginning
              </div>
            </div>
          </div>

          <TransactionsByDate
            transactions={travelTransactions}
            userId={userId}
          />

          {travelTransactions.length === 0 && (
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <List />
                </EmptyMedia>
                <EmptyTitle>No transactions yet</EmptyTitle>
                <EmptyDescription>
                  There is no transaction created of this type yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </ScreenDrawer>
    </>
  );
}
