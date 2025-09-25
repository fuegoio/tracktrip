import type { Transaction } from "@/data/transactions";
import { CategoryBadge } from "./category-badge";

export const TransactionRow = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  return (
    <div className="flex items-center gap-4 h-10 rounded bg-subtle px-3">
      <CategoryBadge categoryId={transaction.category} />
      <div className="text-xs font-medium text-foreground">
        {transaction.title}
      </div>
      {transaction.place && (
        <div className="text-xs text-muted-foreground">{transaction.place}</div>
      )}
      <div className="flex-1" />
      <div className="text-xs font-mono text-foreground">
        {transaction.amount.toLocaleString(undefined, {
          style: "currency",
          currency: transaction.currency,
        })}
      </div>
    </div>
  );
};
