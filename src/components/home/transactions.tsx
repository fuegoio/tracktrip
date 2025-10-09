import { ArrowRight, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { transactionsCollection } from "@/store/collections";
import { NewTransactionDrawer } from "../transactions/new-transaction-drawer";
import { useTravel } from "@/lib/params";
import { Link } from "@tanstack/react-router";
import { TransactionsByDate } from "../transactions/transactions-by-date";

const RECENT_TRANSACTIONS_LIMIT = 10;

export const Transactions = ({
  travelId,
  userId,
}: {
  travelId: string;
  userId: string;
}) => {
  const { data: transactions } = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) => eq(transactions.travel, travelId))
      .orderBy(({ transactions }) => transactions.date, "desc"),
  );
  const recentTransactions = transactions.slice(0, RECENT_TRANSACTIONS_LIMIT);
  const travel = useTravel({ id: travelId });

  return (
    <div className="w-full py-4 px-2 shadow-up pb-10">
      <div className="flex px-2 items-center gap-3">
        <div className="text-sm font-semibold text-foreground flex-1">
          Recent transactions
        </div>
        <NewTransactionDrawer travel={travel} userId={userId}>
          <Button variant="outline" size="icon" className="size-6">
            <Plus className="size-4" />
          </Button>
        </NewTransactionDrawer>
        <Button variant="secondary" size="icon" className="size-6" asChild>
          <Link to="/travels/$travelId/transactions" params={{ travelId }}>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <TransactionsByDate transactions={recentTransactions} userId={userId} />

      {transactions.length > RECENT_TRANSACTIONS_LIMIT && (
        <div className="flex justify-end mt-2">
          <Button variant="link" asChild>
            <Link to="/travels/$travelId/transactions" params={{ travelId }}>
              View all transactions
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
