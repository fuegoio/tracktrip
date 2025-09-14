import { Menu, Plus } from "lucide-react";
import { Button } from "./ui/button";
import type { Travel } from "@/data/travels";
import { Link } from "@tanstack/react-router";

export const TopBar = ({ travel }: { travel: Travel }) => {
  return (
    <div className="w-full flex items-center justify-between p-4">
      <Button variant="ghost" size="icon">
        <Menu className="size-5" />
      </Button>

      <div className="text-3xl">{travel.emoji}</div>

      <Button size="icon" asChild>
        <Link
          to="/travels/$travelId/transactions/new"
          params={{ travelId: travel.id }}
        >
          <Plus className="size-5" />
        </Link>
      </Button>
    </div>
  );
};
