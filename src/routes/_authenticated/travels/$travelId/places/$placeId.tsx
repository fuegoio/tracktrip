import { useState } from "react";

import { eq, and, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, notFound } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ArrowRight, EllipsisVertical, List } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { capitalize } from "remeda";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { TransactionsByDate } from "@/components/transactions/transactions-by-date";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CategoryTypes,
  categoryTypeToColorHex,
  categoryTypeToEmoji,
} from "@/data/categories";
import { getIntervalsBetweenDates } from "@/lib/dayjs";
import { useTravel } from "@/lib/params";
import { placesCollection, transactionsCollection } from "@/store/collections";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/places/$placeId",
)({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    const { placeId } = params;
    return {
      placeId: placeId,
    };
  },
});

function RouteComponent() {
  const { travelId, placeId } = Route.useParams();
  const { session } = Route.useRouteContext();
  const userId = session.user.id;

  const [period, setPeriod] = useState<"week" | "day">("day");
  const travel = useTravel({
    id: travelId,
  });

  // Get the place details
  const place = useLiveQuery((q) =>
    q
      .from({ places: placesCollection })
      .where(({ places }) =>
        and(eq(places.travel, travelId), eq(places.id, placeId)),
      ),
  ).data[0];

  if (!place) {
    throw notFound();
  }

  // Get transactions for this place
  const { data: placeTransactions } = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) =>
        and(eq(transactions.travel, travelId), eq(transactions.place, placeId)),
      ),
  );

  // Calculate date range and duration for this place
  const calculatePlaceDateRange = () => {
    if (placeTransactions.length === 0) {
      return {
        startDate: null,
        endDate: null,
        days: 0,
      };
    }

    // Sort transactions by date
    const sortedTransactions = [...placeTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const startDate = sortedTransactions[0]?.date || null;
    const endDate =
      sortedTransactions[sortedTransactions.length - 1]?.date || null;

    // Calculate number of days (inclusive)
    const days =
      startDate && endDate
        ? dayjs(endDate).diff(dayjs(startDate), "day") + 1
        : 0;

    return {
      startDate,
      endDate,
      days,
    };
  };

  const { startDate, endDate, days } = calculatePlaceDateRange();

  const transactionsSum = placeTransactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0,
  );

  const getCategoryTypeTransactionsSum = (categoryType: string) => {
    return placeTransactions
      .filter((transaction) => transaction.type === categoryType)
      .reduce((acc, transaction) => acc + transaction.amount, 0);
  };

  // Create category type data with colors and sums
  const allCategoryTypes = CategoryTypes.map((categoryType) => {
    const sum = getCategoryTypeTransactionsSum(categoryType);
    return {
      type: categoryType,
      emoji: categoryTypeToEmoji[categoryType],
      name: capitalize(categoryType),
      color: categoryTypeToColorHex[categoryType],
      transactionSum: sum,
    };
  });

  // Sort category types by transaction sum (descending)
  const sortedCategoryTypes = [...allCategoryTypes].sort(
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
      const periodData: Record<string, number | string> = {
        period: periodDate,
      };
      allCategoryTypes.forEach((catType) => {
        periodData[`categoryType_${catType.type}`] = 0;
      });
      return periodData;
    });

    placeTransactions.forEach((transaction) => {
      const transactionPeriod = dayjs(transaction.date)
        .startOf(period)
        .format("YYYY-MM-DD");
      const periodIndex = periodsSinceStart.indexOf(transactionPeriod);
      if (periodIndex === -1) return;

      const categoryTypeKey = `categoryType_${transaction.type}`;
      result[periodIndex]![categoryTypeKey] += transaction.amount;
    });

    return result;
  }

  const transactionsByPeriod = sumTransactionsByPeriod();

  // Create chart config
  const chartConfig: ChartConfig = {};
  if (transactionsByPeriod.length > 0) {
    allCategoryTypes.forEach((categoryType) => {
      chartConfig[`categoryType_${categoryType.type}`] = {
        label: categoryType.name,
        color: categoryType.color,
      };
    });
  }

  return (
    <>
      <ScreenHeader>
        <div className="flex items-center gap-2">
          <span className="text-xl">📍</span>
          <span className="text-foreground capitalize text-2xl font-medium">
            {place.name}
          </span>
          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon">
                <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => placesCollection.delete(place.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          A summary of your expenses at {place.name} for this travel.
        </div>
        {startDate && endDate && (
          <div className="pt-4">
            <div className="text-subtle-foreground text-xs">Dates</div>
            <div className="text-muted-foreground text-sm flex items-center gap-4">
              <div className="flex items-center gap-2">
                {dayjs(startDate).format("MMM D, YYYY")}
                <ArrowRight className="inline-block mx-1 size-4" />
                {dayjs(endDate).format("MMM D, YYYY")}
              </div>
              <div className="border-l pl-4">
                {days} day{days !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        )}
        <div className="pt-6 pb-2">
          <div className="text-subtle-foreground text-sm">
            Total cost at {place.name}
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
            {sortedCategoryTypes.map((categoryType) => (
              <div
                key={categoryType.type}
                className="border-l-2 px-4"
                style={{ borderColor: categoryType.color }}
              >
                <div className="flex items-baseline gap-1">
                  {categoryType.emoji && (
                    <div className="text-xs">{categoryType.emoji}</div>
                  )}
                  <div className="text-xs text-subtle-foreground align-middle whitespace-nowrap">
                    <span className="capitalize">{categoryType.name}</span> cost
                  </div>
                </div>
                <div className="text-foreground font-mono font-semibold text-sm">
                  {categoryType.transactionSum.toLocaleString(undefined, {
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
                No transactions found for this place.
              </div>
            ) : (
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[200px] w-full"
              >
                <BarChart data={transactionsByPeriod}>
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

                  {allCategoryTypes.map((categoryType) => {
                    const hasData = transactionsByPeriod.some(
                      (periodData) =>
                        periodData[`categoryType_${categoryType.type}`] > 0,
                    );
                    if (!hasData) return null;
                    return (
                      <Bar
                        key={categoryType.type}
                        dataKey={`categoryType_${categoryType.type}`}
                        fill={`var(--color-categoryType_${categoryType.type}`}
                        stackId="a"
                      />
                    );
                  })}
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </div>

        <div className="w-full py-4 px-2 shadow-up pb-20 bg-background rounded-t-lg flex-1 translate-y-0">
          <div className="flex px-2 items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">
                <span className="capitalize">{place.name}</span> transactions
              </div>
              <div className="text-xs text-subtle-foreground">
                Since the beginning
              </div>
            </div>
          </div>

          <TransactionsByDate
            transactions={placeTransactions}
            userId={userId}
          />

          {placeTransactions.length === 0 && (
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <List />
                </EmptyMedia>
                <EmptyTitle>No transactions yet</EmptyTitle>
                <EmptyDescription>
                  There is no transaction created at this place yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </ScreenDrawer>
    </>
  );
}
