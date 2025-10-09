import { TransactionsByDate } from "@/components/transactions/transactions-by-date";
import { transactionsCollection } from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";

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

  return (
    <div className="w-full py-4 px-2">
      <div className="flex px-2 items-center gap-3">
        <div className="text-xl font-semibold text-foreground flex-1">
          Travel transactions
        </div>
      </div>
      <TransactionsByDate transactions={transactions.data} />
    </div>
  );
}
