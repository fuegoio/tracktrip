import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ArrowLeftRight, ArrowRight, MapPin, Tag, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import type { Travel } from "@/data/travels";

const travelLinks = [
  { name: "Peoples", path: "/users", icon: User },
  { name: "Categories", path: "/categories", icon: Tag },
  { name: "Places", path: "/places", icon: MapPin },
] as const;

export const TravelMenu = ({ travel }: { travel: Travel }) => {
  const clearTravelId = () => {
    localStorage.removeItem("travelId");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="text-2xl leading-none px-1 relative z-10 select-none cursor-pointer">
          {travel.emoji}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 min-w-56 rounded-lg"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <span className="text-3xl leading-none">{travel.emoji}</span>
            <div className="flex-1 text-left leading-tight">
              <span className="truncate font-medium">{travel.name}</span>
              <span className="text-muted-foreground text-xs inline-flex gap-2 items-center">
                {dayjs(travel.startDate).format("MMM D, YYYY")}
                <ArrowRight className="size-3" />
                {dayjs(travel.endDate).format("MMM D, YYYY")}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {travelLinks.map((link) => (
          <DropdownMenuItem asChild key={link.path}>
            <Link
              to={`/travels/$travelId${link.path}`}
              params={{ travelId: travel.id }}
            >
              <link.icon />
              {link.name}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild onClick={clearTravelId}>
          <Link to="/">
            <ArrowLeftRight />
            Switch travel
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
