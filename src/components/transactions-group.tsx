import type { Transaction } from "@/data/transactions";
import { TransactionRow } from "./transaction-row";

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
        {date.toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </div>

      <div className="space-y-1">
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
};
