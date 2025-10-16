import { eq, useLiveQuery } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import { ArrowRight, List } from "lucide-react";

import { TransactionsByDate } from "../transactions/transactions-by-date";
import { Button } from "../ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

import { transactionsCollection } from "@/store/collections";

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

  return (
    <div className="w-full py-4 px-2 shadow-up pb-10 bg-background rounded-t-lg flex-1 translate-y-0">
      <div className="flex px-2 items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">
            Recent transactions
          </div>
          <div className="text-xs text-subtle-foreground">
            Of the last few days
          </div>
        </div>
        <Button variant="secondary" size="icon" className="size-6" asChild>
          <Link to="/travels/$travelId/transactions" params={{ travelId }}>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <TransactionsByDate transactions={recentTransactions} userId={userId} />

      {recentTransactions.length === 0 && (
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <List />
            </EmptyMedia>
            <EmptyTitle>No transactions yet</EmptyTitle>
            <EmptyDescription>
              There is no transaction created for this travel yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

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
