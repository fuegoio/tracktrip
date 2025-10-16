import { Link } from "@tanstack/react-router";
import { ArrowLeftRight } from "lucide-react";

import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";

import type { Travel } from "@/data/travels";
import type { User } from "better-auth";

export const TopBar = ({ travel, user }: { travel: Travel; user: User }) => {
  const clearTravelId = () => {
    localStorage.removeItem("travelId");
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 absolute">
      <Button variant="default" size="icon" asChild onClick={clearTravelId}>
        <Link to="/">
          <ArrowLeftRight className="size-4 text-primary-foreground" />
        </Link>
      </Button>

      <div className="text-2xl leading-none">{travel.emoji}</div>

      <UserMenu user={user} />
    </div>
  );
};
