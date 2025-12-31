import { eq, useLiveQuery } from "@tanstack/react-db";

import { CategoryBadge } from "./category-badge";
import { CategoryTypeBadge } from "./category-type-badge";
import { useTransactionDrawerStore } from "./transactions/transaction-drawer-store";

import type { Transaction } from "@/data/transactions";

import { convertCurrency } from "@/lib/currency";
import { useTravel } from "@/lib/params";
import { cn } from "@/lib/utils";
import { placesCollection } from "@/store/collections";

export const TransactionRow = ({
  transaction,
  userId,
  travelId,
}: {
  transaction: Transaction;
  userId: string;
  travelId: string;
}) => {
  const { data: places } = useLiveQuery(
    (q) =>
      q
        .from({ places: placesCollection })
        .where(({ places }) => eq(places.id, transaction.place)),
    [transaction.place],
  );
  const transactionPlace = places[0];

  const travel = useTravel({ id: travelId });
  const isUserConcerned =
    transaction.users === null || transaction.users.includes(userId);

  const { openDrawer } = useTransactionDrawerStore();

  // Convert the amount to travel currency if needed
  const convertedAmount = convertCurrency(
    transaction.amount,
    transaction.currency,
    travel,
  );

  const showConversion = transaction.currency !== travel.currency;

  return (
    <div
      className={cn(
        "flex items-center gap-4 h-10 rounded-lg bg-subtle px-3 inset-ring-2 inset-ring-white/40 border border-border/20",
        !isUserConcerned && "opacity-50",
      )}
      onClick={() => openDrawer(transaction.id)}
    >
      {transaction.category ? (
        <CategoryBadge categoryId={transaction.category} />
      ) : (
        <CategoryTypeBadge categoryType={transaction.type} />
      )}
      <div className="text-xs font-medium text-foreground text-ellipsis min-w-0 overflow-hidden whitespace-nowrap">
        {transaction.title}
      </div>
      {transactionPlace && (
        <div className="text-xs text-muted-foreground">
          {transactionPlace.name}
        </div>
      )}
      <div className="flex-1" />
      <div className="text-xs font-mono text-foreground flex gap-2">
        {showConversion && (
          <span className="text-xs text-muted-foreground">
            {convertedAmount.toLocaleString(undefined, {
              style: "currency",
              currency: travel.currency,
            })}
          </span>
        )}
        <span>
          {transaction.amount.toLocaleString(undefined, {
            style: "currency",
            currency: transaction.currency,
          })}
        </span>
      </div>
    </div>
  );
};
