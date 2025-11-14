import { useState } from "react";

import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ArrowLeftRight, ArrowRight, Cog, Users } from "lucide-react";

import { EditTravelSettings } from "./travels/edit-travel-settings";
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
  { name: "Travellers", path: "/users", icon: Users },
] as const;

export const TravelMenu = ({ travel }: { travel: Travel }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const clearTravelId = () => {
    localStorage.removeItem("travelId");
  };

  return (
    <>
      <EditTravelSettings
        travel={travel}
        isOpen={settingsOpen}
        setIsOpen={setSettingsOpen}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="text-2xl leading-none px-1 relative z-0 select-none cursor-pointer">
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
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Cog />
            Travel settings
          </DropdownMenuItem>
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
            <Link to="/travels">
              <ArrowLeftRight />
              Switch travel
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
