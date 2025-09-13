import type { Category } from "@/data/categories";
import { CategoryBadge } from "./category-badge";
import { AnimatedCircularProgressBar } from "./ui/circular-progress";

export const Budget = ({ category }: { category: Category }) => {
  return (
    <div className="flex flex-col items-center">
      <AnimatedCircularProgressBar
        className="size-14"
        value={10}
        gaugePrimaryColor="var(--color-subtle-foreground)"
        gaugeSecondaryColor="var(--color-muted)"
      >
        <CategoryBadge category={category} />
      </AnimatedCircularProgressBar>
      <div className="font-mono font-medium text-xs text-foreground mt-1">
        13.4€
      </div>
      <div className="font-mono text-xs text-muted-foreground">100.00€</div>
    </div>
  );
};
