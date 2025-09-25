import { ArrowRight, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { TransactionsGroup } from "../transactions-group";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { transactionsCollection } from "@/store/collections";
import type { Transaction } from "@/data/transactions";
import dayjs from "dayjs";
import { NewTransactionDrawer } from "../transactions/new-transaction-drawer";
import { useTravel } from "@/lib/params";

export const Transactions = ({
  travelId,
  userId,
}: {
  travelId: string;
  userId: string;
}) => {
  const transactions = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) => eq(transactions.travel, travelId)),
  );

  const travel = useTravel({ id: travelId });

  const transactionsGroupedByDate = transactions.data.reduce(
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

  return (
    <div className="w-full py-4 px-2 rounded-2xl shadow-up">
      <div className="flex px-2 items-center gap-3">
        <div className="text-sm font-semibold text-foreground flex-1">
          Recent transactions
        </div>
        <NewTransactionDrawer travel={travel} userId={userId}>
          <Button variant="outline" size="icon" className="size-6">
            <Plus className="size-4" />
          </Button>
        </NewTransactionDrawer>
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
