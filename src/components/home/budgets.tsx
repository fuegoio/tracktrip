import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Budget } from "../budget";
import { categoriesCollection } from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";

export const Budgets = ({ travelId }: { travelId: string }) => {
  const { data: categories } = useLiveQuery((q) =>
    q
      .from({ categories: categoriesCollection })
      .where(({ categories }) => eq(categories.travel, travelId)),
  );

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
        {categories.map((category) => (
          <Budget categoryId={category.id} key={category.id} />
        ))}
      </div>
    </div>
  );
};
