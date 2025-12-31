import { useState } from "react";

import dayjs from "dayjs";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

import type { Transaction } from "@/data/transactions";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CategoryTypes, categoryTypeToColorHex } from "@/data/categories";
import { convertCurrency } from "@/lib/currency";
import { getIntervalsBetweenDates } from "@/lib/dayjs";
import { useTravel } from "@/lib/params";

export const TransactionInsights = ({
  travelId,
  transactions,
}: {
  travelId: string;
  transactions: Transaction[];
}) => {
  const [period, setPeriod] = useState<"week" | "day">("day");

  const travel = useTravel({
    id: travelId,
  });

  const allCategoriesTypes = [
    ...CategoryTypes.map((categoryType) => {
      return {
        id: categoryType,
        color: categoryTypeToColorHex[categoryType],
      };
    }),
  ];

  function sumTransactionsByPeriod() {
    const startOfTravel = dayjs(travel.startDate).startOf("day");
    const periodsSinceStart = getIntervalsBetweenDates(
      startOfTravel,
      dayjs(),
      period,
    );

    const result = periodsSinceStart.map((periodDate) => {
      const periodData: Record<string, any> = { period: periodDate };
      allCategoriesTypes.forEach((cat) => {
        periodData[`type_${cat.id}`] = 0;
      });
      return periodData;
    });

    transactions.forEach((transaction) => {
      const transactionPeriod = dayjs(transaction.date)
        .startOf(period)
        .format("YYYY-MM-DD");
      const periodIndex = periodsSinceStart.indexOf(transactionPeriod);
      if (periodIndex === -1) return;

      const convertedAmount = convertCurrency(
        transaction.amount,
        transaction.currency,
        travel,
      );
      result[periodIndex]![`type_${transaction.type}`] += convertedAmount;
    });

    return result;
  }

  const transactionsByPeriod = sumTransactionsByPeriod();

  const chartConfig: ChartConfig = {};
  if (transactionsByPeriod.length > 0) {
    allCategoriesTypes.forEach((categoryType) => {
      chartConfig[`type_${categoryType.id}`] = {
        label:
          categoryType.id.substring(0, 1).toUpperCase() +
          categoryType.id.substring(1),
        color: categoryType.color,
      };
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Expenses evolution
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

              {allCategoriesTypes.map((category) => {
                return (
                  <Bar
                    key={category.id}
                    dataKey={`type_${category.id}`}
                    fill={`var(--color-type_${category.id}`}
                    stackId="a"
                  />
                );
              })}
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </>
  );
};
