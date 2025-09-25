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
  return (
    <div className="mt-4">
      <div className="px-2 text-subtle-foreground text-xs mb-2">
        {dayjs(date).format("DD MMMM YYYY")}
      </div>

      <div className="space-y-1">
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
};
