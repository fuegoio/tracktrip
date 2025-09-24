import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import type { Travel } from "@/data/travels";
import { NewTransactionDrawer } from "./transactions/new-transaction-drawer";

export const TopBar = ({
  travel,
  userId,
}: {
  travel: Travel;
  userId: string;
}) => {
  return (
    <div className="w-full flex items-center justify-between p-4">
      <Button variant="ghost" size="icon">
        <Menu className="size-5" />
      </Button>

      <div className="text-3xl">{travel.emoji}</div>

      <NewTransactionDrawer travel={travel} userId={userId} />
    </div>
  );
};
