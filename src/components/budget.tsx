import { CategoryBadge } from "./category-badge";
import { AnimatedCircularProgressBar } from "./ui/circular-progress";

export const Budget = ({ categoryId }: { categoryId: string }) => {
  return (
    <div className="flex flex-col items-center">
      <AnimatedCircularProgressBar
        className="size-14"
        value={10}
        gaugePrimaryColor="var(--color-subtle-foreground)"
        gaugeSecondaryColor="var(--color-muted)"
      >
        <CategoryBadge categoryId={categoryId} />
      </AnimatedCircularProgressBar>
      <div className="font-mono font-medium text-xs text-foreground mt-1">
        13.4€
      </div>
      <div className="font-mono text-xs text-muted-foreground">100.00€</div>
    </div>
  );
};
