import { firstPartyCategoriesList } from "@/data/categories";
import { cn } from "@/lib/utils";

export const CategoryBadge = ({ categoryId }: { categoryId: string }) => {
  const category = firstPartyCategoriesList.find((c) => c.id === categoryId);
  if (!category) return null;

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
