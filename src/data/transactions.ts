export type Transaction = {
  id: string;
  title: string;
  user: string;
  category: string;
  subcategory?: string;
  amount: number;
  date: Date;
  description?: string;
  place?: string;
  currency: string;
  days: number;
};
