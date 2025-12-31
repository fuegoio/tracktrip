import dayjs from "dayjs";

import { TransactionsGroup } from "../transactions-group";

import type { Transaction } from "@/data/transactions";

export const TransactionsByDate = ({
  transactions,
  userId,
  travelId,
}: {
  transactions: Transaction[];
  userId: string;
  travelId: string;
}) => {
  const transactionsGroupedByDate = transactions.reduce(
    (acc, transaction) => {
      const date = dayjs(transaction.date).format("YYYY-MM-DD");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({ ...transaction, date: new Date(transaction.date) });
      return acc;
    },
    {} as Record<string, Transaction[]>,
  );

  // Sort the dates in descending order
  const sortedDates = Object.keys(transactionsGroupedByDate || {}).sort(
    (a, b) => {
      return dayjs(b).unix() - dayjs(a).unix();
    },
  );

  return sortedDates.map((date) => (
    <TransactionsGroup
      key={date}
      date={new Date(date)}
      transactions={transactionsGroupedByDate[date]!}
      userId={userId}
      travelId={travelId}
    />
  ));
};
