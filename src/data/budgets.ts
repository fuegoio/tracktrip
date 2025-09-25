import type { CategoryType } from "./categories";

export type Budget = {
  id: string;
  travel: string;
  categoryType?: CategoryType;
  category?: string;
  amount: number;
};
