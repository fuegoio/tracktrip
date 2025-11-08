import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { TransactionInsights } from "@/components/transactions/transactions-insights";
import { transactionsCollection } from "@/store/collections";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/analyse/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { travelId } = Route.useParams();
  const { data: transactions } = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) => eq(transactions.travel, travelId)),
  );

  return (
    <>
      <ScreenHeader className="flex items-center">
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-semibold">Analyse</div>
          <div className="text-muted-foreground text-sm mt-1">
            Analyse closely your expenses to understand how you travel.
          </div>
        </div>
      </ScreenHeader>

      <ScreenDrawer asChild>
        <div className="w-full p-4 shadow-up bg-background rounded-t-lg translate-y-4 z-0 pb-8">
          <TransactionInsights
            transactions={transactions}
            travelId={travelId}
          />
        </div>
      </ScreenDrawer>
    </>
  );
}
