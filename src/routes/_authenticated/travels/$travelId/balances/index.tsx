import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { List } from "lucide-react";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { TransactionsByDate } from "@/components/transactions/transactions-by-date";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useTravel } from "@/lib/params";
import { transactionsCollection } from "@/store/collections";
import { UserAvatar } from "@/components/users/user-avatar";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/balances/",
)({
  component: UserSpendingSummary,
});

function UserSpendingSummary() {
  const { travelId } = Route.useParams();
  const { session } = Route.useRouteContext();

  const travel = useTravel({
    id: travelId,
  });

  const { data: transactions } = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) => eq(transactions.travel, travelId)),
  );

  const getTransactionsForUser = (userId: string) => {
    return transactions
      .map((transaction) => {
        let amount;
        if (transaction.users === null) {
          amount = transaction.amount / travel.users.length;
        } else if (transaction.users.includes(userId)) {
          amount = transaction.amount / transaction.users.length;
        } else {
          amount = null;
        }

        return { ...transaction, amount: amount };
      })
      .filter((transaction) => transaction.amount !== null);
  };

  const getTotalSpent = (userId: string) => {
    return getTransactionsForUser(userId)
      .filter((transaction) => transaction.user === userId)
      .reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0);
  };

  const getTotalPaid = (userId: string) => {
    return transactions
      .filter((transaction) => transaction.user === userId)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const totalSpent = getTotalSpent(session.user.id);
  const transactionsPaidByMe = getTotalPaid(session.user.id);

  return (
    <>
      <ScreenHeader>
        <div className="flex items-center gap-2">
          <span className="text-foreground text-2xl font-medium">
            Your spendings
          </span>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          A summary of your expenses for this travel.
        </div>
        <div className="pt-6 pb-2">
          <div className="text-subtle-foreground text-sm">
            Total cost for you
          </div>
          <div className="text-4xl text-foreground font-mono mt-1">
            {totalSpent.toLocaleString(undefined, {
              style: "currency",
              currency: travel.currency,
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 mt-4">
          <div className="border-l-2 border-foreground px-4">
            <div className="text-sm text-subtle-foreground">Paid by me</div>
            <div className="text-foreground font-mono font-semibold">
              {transactionsPaidByMe.toLocaleString(undefined, {
                style: "currency",
                currency: travel.currency,
              })}
            </div>
          </div>
          <div className="border-l-2 border-muted-foreground px-4">
            <div className="text-sm text-subtle-foreground">
              {totalSpent > transactionsPaidByMe
                ? "Owned to others"
                : "Owned to me"}
            </div>
            <div className="text-foreground font-mono font-semibold">
              {Math.abs(totalSpent - transactionsPaidByMe).toLocaleString(
                undefined,
                {
                  style: "currency",
                  currency: travel.currency,
                },
              )}
            </div>
          </div>
        </div>
      </ScreenHeader>

      <ScreenDrawer asChild>
        <div className="w-full p-4 shadow-up bg-background rounded-t-lg translate-y-4 z-0 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">
                All travellers spendings
              </div>
              <div className="text-xs text-subtle-foreground">
                Who owes you and who you owe
              </div>
            </div>
          </div>

          <div className="py-2 space-y-2">
            {travel.users.map((user) => (
              <div className="flex items-center gap-2 mt-4" key={user.id}>
                <div className="flex-1 flex items-center gap-2">
                  <UserAvatar user={user} className="size-5" />
                  <span className="flex-1 truncate font-medium text-sm">
                    {user.name}
                  </span>
                </div>
                <div className="text-foreground font-mono text-sm">
                  {getTotalSpent(user.id).toLocaleString(undefined, {
                    style: "currency",
                    currency: travel.currency,
                  })}{" "}
                  -{" "}
                  <span className="text-subtle-foreground">
                    {getTotalPaid(user.id).toLocaleString(undefined, {
                      style: "currency",
                      currency: travel.currency,
                    })}
                  </span>{" "}
                  ={" "}
                  <span className="text-foreground font-semibold">
                    {Math.abs(
                      getTotalSpent(user.id) - getTotalPaid(user.id),
                    ).toLocaleString(undefined, {
                      style: "currency",
                      currency: travel.currency,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full py-4 px-2 shadow-up pb-10 bg-background rounded-t-lg flex-1 translate-y-0">
          <div className="flex px-2 items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">
                Your transactions
              </div>
              <div className="text-xs text-subtle-foreground">
                Since the beginning
              </div>
            </div>
          </div>

          <TransactionsByDate
            transactions={transactions}
            userId={session.user.id}
          />

          {transactions.length === 0 && (
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <List />
                </EmptyMedia>
                <EmptyTitle>No transactions yet</EmptyTitle>
                <EmptyDescription>
                  There is no transaction created of this type yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </ScreenDrawer>
    </>
  );
}
