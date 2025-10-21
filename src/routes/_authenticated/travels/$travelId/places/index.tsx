import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ArrowRight, MapPin } from "lucide-react";
import { capitalize } from "remeda";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import {
  CategoryTypes,
  categoryTypeToColorHex,
  categoryTypeToEmoji,
} from "@/data/categories";
import { useTravel } from "@/lib/params";
import { placesCollection, transactionsCollection } from "@/store/collections";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/places/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { travelId } = Route.useParams();

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

  // Calculate place statistics
  const calculatePlaceStats = (placeId) => {
    const placeTransactions = allTransactions.filter(
      (transaction) => transaction.place === placeId,
    );

    if (placeTransactions.length === 0) {
      return {
        startDate: null,
        endDate: null,
        days: 0,
        totalCost: 0,
        categoryBreakdown: [],
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

    // Calculate category breakdown
    const categoryBreakdown = CategoryTypes.map((categoryType) => {
      const sum = placeTransactions
        .filter((transaction) => transaction.type === categoryType)
        .reduce((acc, transaction) => acc + transaction.amount, 0);

      return {
        type: categoryType,
        emoji: categoryTypeToEmoji[categoryType],
        name: capitalize(categoryType),
        color: categoryTypeToColorHex[categoryType],
        total: sum,
      };
    }).filter((item) => item.total > 0);

    return {
      startDate,
      endDate,
      days,
      totalCost,
      categoryBreakdown,
    };
  };

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
        <div className="px-1">
          <div className="text-sm font-semibold text-foreground">
            All places
          </div>
          <div className="text-xs text-subtle-foreground">
            A list of all places and their expenses.
          </div>
        </div>

        {places && places.length > 0 ? (
          <div className="space-y-4">
            {places.map((place) => {
              const placeStats = calculatePlaceStats(place.id);

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

                  {placeStats.startDate && placeStats.endDate && (
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span>
                            {dayjs(placeStats.startDate).format("MMM D, YYYY")}
                            <ArrowRight className="inline mx-1 size-3" />
                            {dayjs(placeStats.endDate).format("MMM D, YYYY")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 border-l pl-4">
                          <span>
                            {placeStats.days} day
                            {placeStats.days !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="text-base font-mono">
                        {placeStats.totalCost.toLocaleString(undefined, {
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
