import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Budget } from "../budget";

export const Budgets = () => {
  return (
    <div className="w-full py-4 px-2 rounded-2xl shadow-up">
      <div className="flex justify-between px-2 items-center">
        <div>
          <div className="text-sm font-semibold text-slate-800">
            Budgets by category
          </div>
          <div className="text-xs text-slate-500">For today</div>
        </div>
        <Button variant="secondary" size="icon" className="size-6">
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="flex px-4 justify-between items-center mt-4">
        <Budget />
        <Budget />
        <Budget />
      </div>
    </div>
  );
};
