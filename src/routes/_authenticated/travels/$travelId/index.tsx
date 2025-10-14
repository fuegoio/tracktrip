import { Budgets } from "@/components/home/budgets";
import { Transactions } from "@/components/home/transactions";
import { useTravel } from "@/lib/params";
import { transactionsCollection } from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";

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
      <div className="px-5 py-6 dark">
        <div className="font-semibold text-xl text-foreground">Hi Alexis,</div>
        <div className="mt-1 text-muted-foreground text-sm">
          What are we doing today?
        </div>

        <div className="mt-6">
          <div className="text-subtle-foreground">Total travel cost</div>
          <div className="text-5xl text-foreground font-mono mt-1">
            {transactionsSum.toLocaleString(undefined, {
              style: "currency",
              currency: travel.currency,
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 mt-6">
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
      </div>

      <Budgets travelId={travel.id} />
      <Transactions travelId={travel.id} userId={userId} />
    </>
  );
}
