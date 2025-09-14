import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Budget } from "../budget";
import { firstPartyCategoriesList } from "@/data/categories";

export const Budgets = ({ travelId }: { travelId: string }) => {
  return (
    <div className="w-full py-4 px-2 rounded-2xl shadow-up">
      <div className="flex justify-between px-2 items-center">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Budgets by category
          </div>
          <div className="text-xs text-subtle-foreground">For today</div>
        </div>
        <Button variant="secondary" size="icon" className="size-6">
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="flex px-4 justify-between items-center mt-4">
        {firstPartyCategoriesList.map((category) => (
          <Budget categoryId={category.id} />
        ))}
      </div>
    </div>
  );
};
