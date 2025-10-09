import { ArrowLeftRight, Menu } from "lucide-react";
import { Button } from "./ui/button";
import type { Travel } from "@/data/travels";
import { Link } from "@tanstack/react-router";

export const TopBar = ({
  travel,
  userId,
}: {
  travel: Travel;
  userId: string;
}) => {
  const clearTravelId = () => {
    localStorage.removeItem("travelId");
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 border-b-border/50 border-b bg-background fixed top-0 left-0 right-0 z-10">
      <Button variant="ghost" size="icon" asChild onClick={clearTravelId}>
        <Link to="/">
          <ArrowLeftRight className="size-4 text-muted-foreground" />
        </Link>
      </Button>

      <div className="text-2xl leading-none">{travel.emoji}</div>

      <div data-slot="notifications" className="w-8"></div>
    </div>
  );
};
