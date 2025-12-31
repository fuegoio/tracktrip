import { eq, useLiveQuery } from "@tanstack/react-db";
import dayjs from "dayjs";

import { placesCollection, transactionsCollection } from "@/store/collections";

export const usePlaces = ({ travelId }: { travelId: string }) => {
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
  return (places || []).map((place) => {
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
};
