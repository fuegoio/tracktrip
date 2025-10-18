import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Area, AreaChart } from "recharts";

import { Budgets } from "@/components/home/budgets";
import { Transactions } from "@/components/home/transactions";
import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { ChartContainer } from "@/components/ui/chart";
import { getWeeksBetweenDates } from "@/lib/dayjs";
import { useTravel } from "@/lib/params";
import { transactionsCollection } from "@/store/collections";

export const Route = createFileRoute("/_authenticated/travels/$travelId/")({
  component: TravelIndex,
});

function TravelIndex() {
  const params = Route.useParams();
  const travel = useTravel({ id: params.travelId });

  const { session } = Route.useRouteContext();
  const userId = session.user.id;

  const { data: travelTransactions } = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) => eq(transactions.travel, params.travelId)),
  );
  const transactionsSum = travelTransactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0,
  );

  function sumTransactionsByWeek() {
    const startOfTravel = dayjs(travel.startDate).startOf("day");
    const periodsSinceStart = getWeeksBetweenDates(startOfTravel, dayjs());
    const result = periodsSinceStart.map((week) => ({
      week: dayjs(week).startOf("week").format("YYYY-MM-DD"),
      sum: 0,
    }));

    travelTransactions.forEach((transaction) => {
      const transactionWeek = dayjs(transaction.date)
        .startOf("week")
        .format("YYYY-MM-DD");
      const weekIndex = periodsSinceStart.indexOf(transactionWeek);
      if (weekIndex !== -1) {
        result[weekIndex]!.sum += transaction.amount;
      }
    });

    return result;
  }

  const transactionsByPeriod = sumTransactionsByWeek();

  const today = new Date();
  const todayTransactionsSum = travelTransactions
    .filter((transaction) => dayjs(transaction.date).isSame(today, "day"))
    .reduce((acc, transaction) => {
      return acc + transaction.amount;
    }, 0);

  const travelersCount = travel.users.length;
  const travelersCost = transactionsSum / travelersCount;

  const travelProgressInDays = dayjs(today).diff(
    dayjs(travel.startDate),
    "day",
  );
  const travelDurationInDays = dayjs(travel.endDate).diff(
    dayjs(travel.startDate),
    "day",
  );
  const travelForecast =
    today <= travel.endDate
      ? transactionsSum * (travelDurationInDays / travelProgressInDays)
      : undefined;

  return (
    <>
      <ScreenHeader>
        <div className="font-semibold text-xl text-foreground">Hi Alexis,</div>
        <div className="mt-1 text-muted-foreground text-sm">
          What are we doing today?
        </div>

        <div className="my-2 relative z-0">
          <div className="relative z-10 from-card bg-gradient-to-r to-transparent from-50% to-100% h-full py-4">
            <div className="text-subtle-foreground">Total travel cost</div>
            <div className="text-5xl text-foreground font-mono mt-1">
              {transactionsSum.toLocaleString(undefined, {
                style: "currency",
                currency: travel.currency,
              })}
            </div>
          </div>

          <ChartContainer
            config={{
              sum: {
                label: "Sum",
                color: "var(--foreground)",
              },
            }}
            className="aspect-auto h-full w-1/2 absolute right-0 top-0 z-0 opacity-50"
          >
            <AreaChart data={transactionsByPeriod}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-sum)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-sum)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="sum"
                type="natural"
                fill="url(#fill)"
                stroke="var(--color-sum)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-3">
          <div className="border-l-2 border-foreground px-4">
            <div className="text-sm text-subtle-foreground">Today cost</div>
            <div className="text-foreground font-mono font-semibold">
              {todayTransactionsSum.toLocaleString(undefined, {
                style: "currency",
                currency: travel.currency,
              })}
            </div>
          </div>
          <div className="border-l-2 border-muted-foreground px-4">
            <div className="text-sm text-subtle-foreground">Per people</div>
            <div className="text-foreground font-mono font-semibold">
              {travelersCost.toLocaleString(undefined, {
                style: "currency",
                currency: travel.currency,
              })}
            </div>
          </div>
          {travelForecast !== undefined && (
            <div className="border-l-2 border-border px-4">
              <div className="text-sm text-subtle-foreground">Forecast</div>
              <div className="text-subtle-foreground font-mono font-semibold">
                {travelForecast.toLocaleString(undefined, {
                  style: "currency",
                  currency: travel.currency,
                })}
              </div>
            </div>
          )}
        </div>
      </ScreenHeader>

      <ScreenDrawer asChild>
        <Budgets travelId={travel.id} />
        <Transactions travelId={travel.id} userId={userId} />
      </ScreenDrawer>
    </>
  );
}
