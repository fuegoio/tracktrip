import type { Transaction } from "@/data/transactions";
import { TransactionRow } from "./transaction-row";
import dayjs from "dayjs";

export const TransactionsGroup = ({
  date,
  transactions,
}: {
  date: Date;
  transactions: Transaction[];
}) => {
  // Sort the transactions in descending order
  const sortedTransactions = transactions.sort((a, b) => {
    return dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix();
  });

  return (
    <div className="mt-4">
      <div className="px-2.5 text-subtle-foreground text-xs mb-2">
        {dayjs(date).format("DD MMMM YYYY")}
      </div>

      <div className="space-y-1">
        {sortedTransactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
};
