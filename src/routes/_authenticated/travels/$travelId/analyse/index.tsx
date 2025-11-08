import { useState } from "react";

import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { ListFilterPlus, Search } from "lucide-react";

import type { Filter } from "@/data/filters";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { TransactionFilter } from "@/components/transactions/transaction-filter";
import { TransactionInsights } from "@/components/transactions/transactions-insights";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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

  const [filters, setFilters] = useState<Filter[]>([]);
  const [search, setSearch] = useState("");
  const addFilter = (filter: Filter) => {
    setFilters((prev) => [...prev, filter]);
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.title.toLowerCase().includes(search.toLowerCase()) &&
      filters.every((filter) => {
        if (filter.value === undefined) return true;
        if (filter.field === "type") {
          return transaction.type === filter.value;
        }
        if (filter.field === "category") {
          if (filter.value === null) {
            return transaction.category === null;
          }
          return transaction.category === filter.value;
        }
        return true;
      }),
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
          <div className="space-y-2">
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
                <InputGroupAddon align="inline-end">
                  {(search.length > 0 || filters.length > 0) && (
                    <>
                      {filteredTransactions.length} result
                      {filteredTransactions.length > 1 ? "s" : ""}
                    </>
                  )}
                  <InputGroupButton
                    className="text-secondary-foreground"
                    onClick={() =>
                      addFilter({ field: undefined, value: undefined })
                    }
                  >
                    <ListFilterPlus />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
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
                    travelId={travelId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full py-4 px-4 shadow-up pb-10 bg-background rounded-t-lg flex-1 translate-y-0">
          <TransactionInsights
            transactions={filteredTransactions}
            travelId={travelId}
          />
        </div>
      </ScreenDrawer>
    </>
  );
}
