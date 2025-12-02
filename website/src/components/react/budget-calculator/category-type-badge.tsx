import {
  categoryTypeToColor,
  categoryTypeToEmoji,
  type CategoryType,
} from "./categories";
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
        "shrink-0 rounded-full size-9 flex items-center justify-center text-sm inset-ring-4 inset-ring-white/40",
        categoryTypeToColor[categoryType],
        className,
      )}
    >
      {categoryTypeToEmoji[categoryType]}
    </div>
  );
};
