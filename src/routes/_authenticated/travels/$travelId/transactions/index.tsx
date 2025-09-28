import { TransactionsGroup } from "@/components/transactions-group";
import type { Transaction } from "@/data/transactions";
import { transactionsCollection } from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/transactions/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { travelId } = Route.useParams();
  const transactions = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) => eq(transactions.travel, travelId)),
  );

  const transactionsGroupedByDate = transactions.data?.reduce(
    (acc, transaction) => {
      const date = dayjs(transaction.date).format("YYYY-MM-DD");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({ ...transaction, date: new Date(transaction.date) });
      return acc;
    },
    {} as Record<string, Transaction[]>,
  );

  // Sort the dates in descending order
  const sortedDates = Object.keys(transactionsGroupedByDate || {}).sort(
    (a, b) => {
      return dayjs(b).unix() - dayjs(a).unix();
    },
  );

  return (
    <div className="w-full py-4 px-2">
      <div className="flex px-2 items-center gap-3">
        <div className="text-xl font-semibold text-foreground flex-1">
          Travel transactions
        </div>
      </div>
      {sortedDates.map((date) => (
        <TransactionsGroup
          key={date}
          date={new Date(date)}
          transactions={transactionsGroupedByDate[date]!}
        />
      ))}
    </div>
  );
}
