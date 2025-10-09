import type { Transaction } from "@/data/transactions";
import { TransactionsGroup } from "../transactions-group";
import dayjs from "dayjs";

export const TransactionsByDate = ({
  transactions,
}: {
  transactions: Transaction[];
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
    />
  ));
};
