import type { Transaction } from "@/store/types";
import { CategoryBadge } from "./category-badge";
import { firstPartyCategoriesList } from "@/data/categories";

export const Transaction = ({ transaction }: { transaction?: Transaction }) => {
  return (
    <div className="flex items-center gap-4 h-10 rounded bg-subtle px-3">
      <CategoryBadge category={firstPartyCategoriesList[0]} />
      <div className="text-xs font-medium text-foreground">AirBnB</div>
      <div className="text-xs text-muted-foreground">New Castle</div>
      <div className="flex-1" />
      <div className="text-xs font-mono text-foreground">120.00€</div>
    </div>
  );
};
