import type { CategoryType } from "./categories";

export type Transaction = {
  id: string;
  travel: string;
  title: string;
  user: string;
  amount: number;
  date: Date;
  currency: string;
  type: CategoryType;

  category: string | null;
  description: string | null;
  place: string | null;
  days: number | null;
  meals: number | null;
};
