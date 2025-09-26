import dayjs from "dayjs";
import { CategoryTypeBadge } from "../category-type-badge";
import type { Transaction } from "@/data/transactions";

export const TransactionHeader = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  return (
    <div className="flex flex-col w-full justify-center items-center py-6 gap-1">
      <CategoryTypeBadge
        categoryType={transaction.type}
        className="size-16 text-3xl"
      />
      <div className="text-center">
        <div className="text-xl font-semibold">{transaction.title}</div>
        <div className="text-xs text-muted-foreground">
          {dayjs(transaction.date).format("DD/MM/YYYY")}
        </div>
      </div>
      <div className="font-mono font-medium">
        {transaction.amount.toLocaleString(undefined, {
          style: "currency",
          currency: transaction.currency,
        })}
      </div>
    </div>
  );
};
