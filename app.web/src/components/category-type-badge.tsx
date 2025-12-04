import {
  categoryTypeToColor,
  categoryTypeToEmoji,
  type CategoryType,
} from "@/data/categories";
import { cn } from "@/lib/utils";

export const CategoryTypeBadge = ({
  categoryType,
  className,
}: {
  categoryType: CategoryType;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "rounded-full size-7 flex items-center justify-center text-sm inset-ring-4 inset-ring-white/40",
        categoryTypeToColor[categoryType],
        className,
      )}
    >
      {categoryTypeToEmoji[categoryType]}
    </div>
  );
};
