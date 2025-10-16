import dayjs from "dayjs";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import type { Transaction } from "@/data/transactions";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  CategoryTypes,
  categoryTypeToColor,
  type CategoryType,
} from "@/data/categories";

const chartConfig: ChartConfig = {};
CategoryTypes.forEach((type) => {
  chartConfig[`sumByType.${type}`] = {
    label: type,
    color: categoryTypeToColor[type].replace("bg-", ""),
  };
});

type TransactionsByWeek = {
  week: string;
  sumByType: Record<CategoryType, number>;
  transactions: Transaction[];
};

export const TransactionInsights = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const transactionsByWeekAndType = transactions.reduce((acc, transaction) => {
    const week = dayjs(transaction.date).startOf("week").format("YYYY-MM-DD");
    const existingWeek = acc.find((item) => item.week === week);
    if (existingWeek) {
      existingWeek.transactions.push(transaction);
      existingWeek.sumByType[transaction.type] += transaction.amount;
    } else {
      acc.push({
        transactions: [transaction],
        week,
        sumByType: {
          food: transaction.type === "food" ? transaction.amount : 0,
          accommodation:
            transaction.type === "accommodation" ? transaction.amount : 0,
          transport: transaction.type === "transport" ? transaction.amount : 0,
          activity: transaction.type === "activity" ? transaction.amount : 0,
          other: transaction.type === "other" ? transaction.amount : 0,
        },
      });
    }
    return acc;
  }, [] as TransactionsByWeek[]);

  const sortedTransactionsByWeek = transactionsByWeekAndType.toSorted((a, b) =>
    a.week > b.week ? 1 : -1,
  );

  return (
    <Card className="shadow-none mt-4">
      <CardHeader>
        <CardTitle>Transactions by week</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={sortedTransactionsByWeek}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {CategoryTypes.map((type, index) => (
              <Bar
                key={type}
                dataKey={`sumByType.${type}`}
                fill={`var(--color-${categoryTypeToColor[type].replace("bg-", "")})`}
                radius={
                  index === CategoryTypes.length - 1
                    ? [4, 4, 0, 0]
                    : [0, 0, 0, 0]
                }
                stackId="a"
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) =>
                    value.toLocaleString(undefined, {
                      style: "currency",
                      currency: "EUR",
                    })
                  }
                />
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
