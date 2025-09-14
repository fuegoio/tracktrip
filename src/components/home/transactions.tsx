import { ArrowRight, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { TransactionsGroup } from "../transactions-group";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { transactionsCollection } from "@/store/collections";
import type { Transaction } from "@/data/transactions";
import { Link } from "@tanstack/react-router";

export const Transactions = ({ travelId }: { travelId: string }) => {
  const transactions = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) => eq(transactions.travel, travelId)),
  );

  const transactionsGroupedByDate = transactions.data.reduce(
    (acc, transaction) => {
      const date = transaction.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({ ...transaction, date: new Date(transaction.date) });
      return acc;
    },
    {} as Record<string, Transaction[]>,
  );

  return (
    <div className="w-full py-4 px-2 rounded-2xl shadow-up">
      <div className="flex px-2 items-center gap-3">
        <div className="text-sm font-semibold text-foreground flex-1">
          Recent transactions
        </div>
        <Button variant="outline" size="icon" className="size-6" asChild>
          <Link to="/travels/$travelId/transactions/new" params={{ travelId }}>
            <Plus className="size-4" />
          </Link>
        </Button>
        <Button variant="secondary" size="icon" className="size-6">
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {Object.entries(transactionsGroupedByDate).map(([date, transactions]) => (
        <TransactionsGroup
          key={date}
          date={new Date(date)}
          transactions={transactions}
        />
      ))}
    </div>
  );
};
