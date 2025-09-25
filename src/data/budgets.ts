import type { CategoryType } from "./categories";

export type Budget = {
  id: string;
  travel: string;
  categoryType: CategoryType | null;
  category: string | null;
  amount: number;
};
