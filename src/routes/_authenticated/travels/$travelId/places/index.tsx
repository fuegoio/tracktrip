import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
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
          <MapPin className="size-6" />
          <span className="text-foreground capitalize text-2xl font-medium">
            All Places
          </span>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          A summary of all places and their expenses for this travel.
        </div>
      </ScreenHeader>

      <ScreenDrawer asChild>
        <div className="w-full p-4 bg-background rounded-t-lg translate-y-4 z-0 pb-8">
          <div className="text-sm font-semibold text-foreground mb-4">
            Places Overview
          </div>

          {places && places.length > 0 ? (
            <div className="space-y-6">
              {places.map((place) => {
                const placeStats = calculatePlaceStats(place.id);

                return (
                  <div key={place.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📍</span>
                        <span className="text-lg font-medium">
                          {place.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Total Cost
                        </div>
                        <div className="text-lg font-mono font-semibold">
                          {placeStats.totalCost.toLocaleString(undefined, {
                            style: "currency",
                            currency: travel.currency,
                          })}
                        </div>
                      </div>
                    </div>

                    {placeStats.startDate && placeStats.endDate && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span>
                            {dayjs(placeStats.startDate).format("MMM D, YYYY")}
                            <ArrowRight className="inline-block mx-1 size-4" />
                            {dayjs(placeStats.endDate).format("MMM D, YYYY")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>
                            {placeStats.days} day
                            {placeStats.days !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    )}

                    {placeStats.categoryBreakdown.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs text-muted-foreground mb-2">
                          Category Breakdown
                        </div>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pr-4">
                          {placeStats.categoryBreakdown.map((category) => (
                            <div
                              key={category.type}
                              className="border-l-2 px-3 min-w-[120px]"
                              style={{ borderColor: category.color }}
                            >
                              <div className="flex items-baseline gap-1 mb-1">
                                {category.emoji && (
                                  <div className="text-xs">
                                    {category.emoji}
                                  </div>
                                )}
                                <div className="text-xs text-subtle-foreground whitespace-nowrap">
                                  {category.name}
                                </div>
                              </div>
                              <div className="text-foreground font-mono font-semibold text-sm">
                                {category.total.toLocaleString(undefined, {
                                  style: "currency",
                                  currency: travel.currency,
                                })}
                              </div>
                            </div>
                          ))}
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
        </div>
      </ScreenDrawer>
    </>
  );
}

