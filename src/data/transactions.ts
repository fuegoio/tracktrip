export type Transaction = {
  id: string;
  travel: string;
  title: string;
  user: string;
  category: string;
  amount: number;
  date: Date;
  currency: string;

  description: string | null;
  place: string | null;
  days: number | null;
};
