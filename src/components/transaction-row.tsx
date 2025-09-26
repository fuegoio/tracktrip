import type { Transaction } from "@/data/transactions";
import { CategoryBadge } from "./category-badge";
import { CategoryTypeBadge } from "./category-type-badge";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { placesCollection } from "@/store/collections";

export const TransactionRow = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  const { data: places } = useLiveQuery(
    (q) =>
      q
        .from({ places: placesCollection })
        .where(({ places }) => eq(places.id, transaction.place)),
    [transaction.place],
  );
  const transactionPlace = places[0];

  return (
    <div className="flex items-center gap-4 h-10 rounded bg-subtle px-3">
      {transaction.category ? (
        <CategoryBadge categoryId={transaction.category} />
      ) : (
        <CategoryTypeBadge categoryType={transaction.type} />
      )}
      <div className="text-xs font-medium text-foreground">
        {transaction.title}
      </div>
      {transaction.place && (
        <div className="text-xs text-muted-foreground">
          {transactionPlace.name}
        </div>
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
