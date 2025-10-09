import { TransactionsByDate } from "@/components/transactions/transactions-by-date";
import { transactionsCollection } from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/transactions/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { travelId } = Route.useParams();
  const { session } = Route.useRouteContext();
  const [search, setSearch] = useState("");

  const transactions = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) => eq(transactions.travel, travelId)),
  );

  const filteredTransactions = transactions.data.filter((transaction) =>
    transaction.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full py-4 px-2">
      <div className="flex px-2 items-center">
        <div className="text-2xl font-semibold text-foreground flex-1 min-w-0">
          Transactions
        </div>
        <InputGroup className="h-9 w-9 focus-within:w-full transition-all">
          <InputGroupInput
            name="search-transactions"
            placeholder="Search..."
            value={search}
            className="h-9 "
            onChange={(event) => setSearch(event.target.value)}
          />
          <InputGroupAddon className="pl-[9px] text-secondary-foreground">
            <Search />
          </InputGroupAddon>
          {search.length > 0 && (
            <InputGroupAddon align="inline-end">
              {filteredTransactions.length} result
              {filteredTransactions.length > 1 ? "s" : ""}
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      <TransactionsByDate
        transactions={filteredTransactions}
        userId={session.user.id}
      />
    </div>
  );
}
