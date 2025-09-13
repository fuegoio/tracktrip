import { ArrowRight, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Budget } from "../budget";
import { TransactionsGroup } from "../transactions-group";

export const Transactions = () => {
  return (
    <div className="w-full py-4 px-2 rounded-2xl shadow-up">
      <div className="flex px-2 items-center gap-3">
        <div className="text-sm font-semibold text-foreground flex-1">
          Recent transactions
        </div>
        <Button variant="outline" size="icon" className="size-6">
          <Plus className="size-4" />
        </Button>
        <Button variant="secondary" size="icon" className="size-6">
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <TransactionsGroup />
      <TransactionsGroup />
    </div>
  );
};
