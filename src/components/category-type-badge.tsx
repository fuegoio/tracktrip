import {
  categoryTypeToColor,
  categoryTypeToEmoji,
  type CategoryType,
} from "@/data/categories";
import { cn } from "@/lib/utils";

export const CategoryTypeBadge = ({
  categoryType,
}: {
  categoryType: CategoryType;
}) => {
  return (
    <div
      className={cn(
        "rounded-full size-7 flex items-center justify-center text-sm",
        categoryTypeToColor[categoryType],
      )}
    >
      {categoryTypeToEmoji[categoryType]}
    </div>
  );
};
