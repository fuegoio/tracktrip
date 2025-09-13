import { CategoryBadge } from "./category-badge";
import { AnimatedCircularProgressBar } from "./ui/circular-progress";

export const Budget = () => {
  return (
    <div className="flex flex-col items-center">
      <AnimatedCircularProgressBar
        className="size-14"
        value={10}
        gaugePrimaryColor="var(--color-slate-700)"
        gaugeSecondaryColor="var(--color-slate-200)"
      >
        <CategoryBadge />
      </AnimatedCircularProgressBar>
      <div className="font-mono font-medium text-xs text-slate-800 mt-1">
        13.4€
      </div>
      <div className="font-mono text-xs text-slate-400">100.00€</div>
    </div>
  );
};
