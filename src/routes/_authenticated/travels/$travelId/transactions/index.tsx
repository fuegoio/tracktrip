import { TransactionsByDate } from "@/components/transactions/transactions-by-date";
import { transactionsCollection } from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { ListFilterPlus, Plus, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useState } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewTransactionDrawer } from "@/components/transactions/new-transaction-drawer";
import { useTravel } from "@/lib/params";
import type { Filter } from "@/data/filters";
import { TransactionFilter } from "@/components/transactions/transaction-filter";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/transactions/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { travelId } = Route.useParams();
  const { session } = Route.useRouteContext();
  const [search, setSearch] = useState("");

  const travel = useTravel({
    id: travelId,
  });

  const transactions = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) => eq(transactions.travel, travelId)),
  );

  const [filters, setFilters] = useState<Filter[]>([]);
  const addFilter = (filter: Filter) => {
    setFilters((prev) => [...prev, filter]);
  };

  const filteredTransactions = transactions.data.filter(
    (transaction) =>
      transaction.title.toLowerCase().includes(search.toLowerCase()) &&
      filters.every((filter) => {
        if (filter.value === undefined) return true;
        if (filter.field === "type") {
          return transaction.type === filter.value;
        }
        return true;
      }),
  );

  return (
    <div className="w-full py-4 px-2">
      <div className="flex px-2 items-center">
        <div className="text-2xl font-semibold text-foreground flex-1 min-w-0">
          Transactions
        </div>
      </div>
      <div className="h-[1px] bg-border/50 mx-2 my-2" />
      {transactions.data.length > 0 && (
        <>
          <div className="px-2 space-y-2">
            <div className="flex gap-2">
              <InputGroup className="h-9 bg-background border-input">
                <InputGroupInput
                  name="search-transactions"
                  placeholder="Search..."
                  value={search}
                  className="h-9"
                  onChange={(event) => setSearch(event.target.value)}
                />
                <InputGroupAddon className="text-secondary-foreground">
                  <Search />
                </InputGroupAddon>
                {search.length > 0 && (
                  <InputGroupAddon align="inline-end">
                    {filteredTransactions.length} result
                    {filteredTransactions.length > 1 ? "s" : ""}
                  </InputGroupAddon>
                )}
              </InputGroup>
              <Button
                size="icon"
                variant="outline"
                className="size-9"
                onClick={() =>
                  addFilter({ field: undefined, value: undefined })
                }
              >
                <ListFilterPlus />
              </Button>
            </div>

            {filters.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {filters.map((filter, index) => (
                  <TransactionFilter
                    key={index}
                    filter={filter}
                    onChange={(newFilter) => {
                      setFilters((previous) =>
                        previous.map((f) => (f === filter ? newFilter : f)),
                      );
                    }}
                    onDelete={() => {
                      setFilters((previous) =>
                        previous.filter((f) => f !== filter),
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="h-[1px] bg-border/50 mx-2 my-2" />

          <TransactionsByDate
            transactions={filteredTransactions}
            userId={session.user.id}
          />
        </>
      )}

      {filteredTransactions.length === 0 && (
        <Empty className="py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <List />
            </EmptyMedia>
            <EmptyTitle>No transaction found</EmptyTitle>
            <EmptyDescription>
              {search.length === 0
                ? "There is no transaction created for this travel yet."
                : "There isn't any transaction matching your filters."}
            </EmptyDescription>
          </EmptyHeader>
          {search.length === 0 && (
            <EmptyContent>
              <NewTransactionDrawer travel={travel} userId={session.user.id}>
                <Button>Create transaction</Button>
              </NewTransactionDrawer>
            </EmptyContent>
          )}
        </Empty>
      )}
    </div>
  );
}
