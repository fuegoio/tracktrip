import dayjs from "dayjs";

import { TransactionRow } from "./transaction-row";

import type { Transaction } from "@/data/transactions";

export const TransactionsGroup = ({
  date,
  transactions,
  userId,
  travelId,
}: {
  date: Date;
  transactions: Transaction[];
  userId: string;
  travelId: string;
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
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            userId={userId}
            travelId={travelId}
          />
        ))}
      </div>
    </div>
  );
};
