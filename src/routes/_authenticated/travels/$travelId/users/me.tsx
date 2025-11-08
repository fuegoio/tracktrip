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

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/users/me",
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

  const transactionsWithCostProrated = transactions
    .map((transaction) => {
      let amount;
      if (transaction.users === null) {
        amount = transaction.amount / travel.users.length;
      } else if (transaction.users.includes(session.user.id)) {
        amount = transaction.amount / transaction.users.length;
      } else {
        amount = null;
      }

      return { ...transaction, amount: amount };
    })
    .filter((transaction) => transaction.amount !== null);

  const totalSpent = transactionsWithCostProrated.reduce((sum, transaction) => {
    return sum + (transaction.amount ?? 0);
  }, 0);

  const averagePerPerson = totalSpent / travel.users.length;

  return (
    <>
      <ScreenHeader>
        <div className="flex items-center gap-2">
          <span className="text-foreground capitalize text-2xl font-medium">
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
          <div className="text-3xl text-foreground font-mono mt-1">
            {averagePerPerson.toLocaleString(undefined, {
              style: "currency",
              currency: travel.currency,
            })}
          </div>
        </div>
      </ScreenHeader>

      <ScreenDrawer asChild>
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
