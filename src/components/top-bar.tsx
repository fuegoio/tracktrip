import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import type { Travel } from "@/data/travels";
import { NewTransactionDrawer } from "./transactions/new-transaction-drawer";
import { Link } from "@tanstack/react-router";

export const TopBar = ({
  travel,
  userId,
}: {
  travel: Travel;
  userId: string;
}) => {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 rounded-b-xl shadow-xs bg-background fixed top-0 left-0 right-0 z-10">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/">
          <Menu className="size-5 text-subtle-foreground" />
        </Link>
      </Button>

      <div className="text-2xl leading-none">{travel.emoji}</div>

      <NewTransactionDrawer travel={travel} userId={userId} />
    </div>
  );
};
