import { eq, useLiveQuery } from "@tanstack/react-db";

import { cn } from "@/lib/utils";
import { categoriesCollection } from "@/store/collections";

export const CategoryBadge = ({
  categoryId,
  className,
}: {
  categoryId: string;
  className?: string;
}) => {
  const { data: categories } = useLiveQuery((q) =>
    q
      .from({ categories: categoriesCollection })
      .where(({ categories }) => eq(categories.id, categoryId)),
  );

  const category = categories[0];
  if (!category) return null;

  return (
    <div
      className={cn(
        "rounded-full size-7 flex items-center justify-center text-sm inset-ring-4 inset-ring-white/40",
        category.color,
        className,
      )}
    >
      {category.emoji}
    </div>
  );
};
