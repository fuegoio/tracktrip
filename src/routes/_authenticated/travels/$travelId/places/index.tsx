import { useState } from "react";

import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ArrowDownUp, ArrowRight } from "lucide-react";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTravel } from "@/lib/params";
import { placesCollection, transactionsCollection } from "@/store/collections";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/places/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { travelId } = Route.useParams();
  const [sortBy, setSortBy] = useState("name");

  const travel = useTravel({
    id: travelId,
  });

  // Get all places for this travel
  const { data: places } = useLiveQuery((q) =>
    q
      .from({ places: placesCollection })
      .where(({ places }) => eq(places.travel, travelId)),
  );

  // Get all transactions for this travel
  const { data: allTransactions } = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) => eq(transactions.travel, travelId)),
  );

  // Calculate place statistics and prepare data for sorting/display
  const placesWithStats = (places || []).map((place) => {
    const placeTransactions = allTransactions.filter(
      (transaction) => transaction.place === place.id,
    );

    if (placeTransactions.length === 0) {
      return {
        ...place,
        startDate: null,
        endDate: null,
        days: 0,
        totalCost: 0,
      };
    }

    // Sort transactions by date
    const sortedTransactions = [...placeTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const startDate = sortedTransactions[0]?.date || null;
    const endDate =
      sortedTransactions[sortedTransactions.length - 1]?.date || null;

    // Calculate number of days (inclusive)
    const days =
      startDate && endDate
        ? dayjs(endDate).diff(dayjs(startDate), "day") + 1
        : 0;

    // Calculate total cost
    const totalCost = placeTransactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0,
    );

    return {
      ...place,
      startDate,
      endDate,
      days,
      totalCost,
    };
  });

  // Sort places based on the selected criteria
  const sortedPlaces = [...placesWithStats].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        // Sort by start date (newest first)
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return (
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
      case "cost":
        return b.totalCost - a.totalCost;
      default:
        return 0;
    }
  });

  return (
    <>
      <ScreenHeader>
        <div className="flex items-center gap-2">
          <span className="text-foreground capitalize text-2xl font-medium">
            Places
          </span>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          A summary of all places and their expenses for this travel.
        </div>
      </ScreenHeader>

      <ScreenDrawer className="px-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="px-1">
            <div className="text-sm font-semibold text-foreground">
              All places
            </div>
            <div className="text-xs text-subtle-foreground">
              A list of all places and their expenses.
            </div>
          </div>
          <Select onValueChange={setSortBy} value={sortBy}>
            <SelectTrigger className="bg-background border-input" size="sm">
              <ArrowDownUp className="h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sortedPlaces && sortedPlaces.length > 0 ? (
          <div className="space-y-4 mt-4">
            {sortedPlaces.map((place) => {
              return (
                <div key={place.id} className="border-b py-4 px-1">
                  <div className="flex items-center justify-between">
                    <div className="text-base font-medium">{place.name}</div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="size-5"
                      asChild
                    >
                      <Link
                        to="/travels/$travelId/places/$placeId"
                        params={{
                          travelId: travel.id,
                          placeId: place.id,
                        }}
                      >
                        <ArrowRight className="size-3" />
                      </Link>
                    </Button>
                  </div>

                  {place.startDate && place.endDate && (
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {dayjs(place.startDate).format("MMM D, YYYY")}
                          <ArrowRight className="inline mx-1 size-3" />
                          {dayjs(place.endDate).format("MMM D, YYYY")}
                        </div>
                        <div className="flex items-center gap-1 border-l pl-4">
                          {place.days} day
                          {place.days !== 1 ? "s" : ""}
                        </div>
                      </div>

                      <div className="text-base font-mono">
                        {place.totalCost.toLocaleString(undefined, {
                          style: "currency",
                          currency: travel.currency,
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No places found for this travel.
          </div>
        )}
      </ScreenDrawer>
    </>
  );
}
