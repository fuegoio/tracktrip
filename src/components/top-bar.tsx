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
    <div className="w-full flex items-center justify-between px-4 py-3 rounded-b-xl shadow-xs bg-background fixed top-0 left-0 right-0">
      <Button variant="ghost" size="icon">
        <Menu className="size-5 text-sidebar-foreground" />
      </Button>

      <div className="text-3xl leading-none">{travel.emoji}</div>

      <NewTransactionDrawer travel={travel} userId={userId} />
    </div>
  );
};
