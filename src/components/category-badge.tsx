import type { Category } from "@/data/categories";
import { cn } from "@/lib/utils";

export const CategoryBadge = ({ category }: { category: Category }) => {
  return (
    <div
      className={cn(
        "rounded-full size-7 flex items-center justify-center text-sm",
        category.color,
      )}
    >
      {category.emoji}
    </div>
  );
};
