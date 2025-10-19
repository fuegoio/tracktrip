import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { CategoryBadge } from "../category-badge";
import { CategoryTypeBadge } from "../category-type-badge";
import { Button } from "../ui/button";

import { useTransactionDrawerStore } from "./transaction-drawer-store";

import type { Transaction } from "@/data/transactions";
import type { TravelUser } from "@/data/travels";

export const TransactionNotification = ({
  transaction,
  user,
  ...props
}: {
  transaction: Transaction;
  user: TravelUser;
}) => {
  return (
    <div className="flex gap-2 items-center" {...props}>
      {transaction.category ? (
        <CategoryBadge categoryId={transaction.category} />
      ) : (
        <CategoryTypeBadge categoryType={transaction.type} />
      )}
      {transaction.title} has been added by {user.name}.
    </div>
  );
};

const TransactionNotificationAction = ({
  transaction,
  ...props
}: {
  transaction: Transaction;
}) => {
  const { openDrawer } = useTransactionDrawerStore();

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => openDrawer(transaction)}
      className="size-6"
      data-button="true"
      data-action="true"
      {...props}
    >
      <ArrowRight className="size-3" />
    </Button>
  );
};

export const sendTransactionNotification = (
  transaction: Transaction,
  user: TravelUser,
) => {
  toast(<TransactionNotification transaction={transaction} user={user} />, {
    action: <TransactionNotificationAction transaction={transaction} />,
  });
};
