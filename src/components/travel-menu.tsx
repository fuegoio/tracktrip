import { useState } from "react";

import { Link, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ArrowLeftRight, ArrowRight, Cog, Trash, Users } from "lucide-react";

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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { travelsCollection } from "@/store/collections";

const travelLinks = [
  { name: "Travellers", path: "/users", icon: Users },
] as const;

export const TravelMenu = ({
  travel,
  userId,
}: {
  travel: Travel;
  userId: string;
}) => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const clearTravelId = () => {
    localStorage.removeItem("travelId");
  };

  const deleteTravel = async () => {
    clearTravelId();
    await navigate({ to: "/travels" });
    travelsCollection.delete(travel.id);
  };

  const userIsAdmin =
    travel.users.find((user) => user.id === userId)?.role === "owner";

  return (
    <>
      <EditTravelSettings
        travel={travel}
        isOpen={settingsOpen}
        setIsOpen={setSettingsOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              travel and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTravel}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

          {userIsAdmin && (
            <>
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Cog />
                Edit travel
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash />
                Delete travel
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
