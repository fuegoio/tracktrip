import { useEffect, useState } from "react";

import { Link, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { motion, useAnimation } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowRight,
  Cog,
  DoorOpen,
  Trash,
  Users,
} from "lucide-react";

import { EditTravelSettings } from "./travels/edit-travel-settings";
import { Button } from "./ui/button";
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
import { trpcClient } from "@/trpc/client";

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
  const [quitOpen, setQuitOpen] = useState(false);

  const clearTravelId = () => {
    localStorage.removeItem("travelId");
  };

  const deleteTravel = async () => {
    clearTravelId();
    await navigate({ to: "/travels" });
    travelsCollection.delete(travel.id);
  };

  const quitTravel = async () => {
    clearTravelId();
    await navigate({ to: "/travels" });
    await trpcClient.travels.quit.mutate({ id: travel.id });
  };

  const userIsAdmin =
    travel.users.find((user) => user.id === userId)?.role === "owner";

  const controls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      await controls.start("visible"); // Animate to visible
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      await controls.start("hidden"); // Animate back to hidden
    };
    sequence();
  }, [controls]);

  const textVariants = {
    hidden: {
      width: 0,
      marginLeft: 0,
      marginRight: 0,
      opacity: 0,
    },
    visible: {
      width: "auto",
      marginLeft: 8,
      marginRight: 8,
      opacity: 1,
    },
  } as const;

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

      <AlertDialog open={quitOpen} onOpenChange={setQuitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will be removed from this
              travel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={quitTravel}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="dark h-9 relative z-0 px-1.5 gap-0"
          >
            <div className="text-2xl leading-none">{travel.emoji}</div>
            <motion.div
              className="mt-1 font-medium"
              initial="hidden"
              animate={controls}
              variants={textVariants}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ overflow: "hidden", whiteSpace: "nowrap" }}
            >
              {travel.name}
            </motion.div>
          </Button>
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

          {userIsAdmin ? (
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
          ) : (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setQuitOpen(true)}
            >
              <DoorOpen />
              Leave travel
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
