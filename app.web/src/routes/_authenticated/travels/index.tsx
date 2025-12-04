import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ArrowRight, ChevronRight, List, Plus, TrainFront } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { UserMenu } from "@/components/user-menu";
import { travelsCollection } from "@/store/collections";

export const Route = createFileRoute("/_authenticated/travels/")({
  component: Index,
  loader: () => {
    const lastTravelId = window.localStorage.getItem("travelId");
    if (lastTravelId) {
      throw redirect({
        to: "/travels/$travelId",
        params: {
          travelId: lastTravelId,
        },
      });
    }

    window.localStorage.removeItem("travelId");
  },
});

function Index() {
  const { session } = Route.useRouteContext();

  const { data: travels } = useLiveQuery((q) =>
    q.from({ travels: travelsCollection }),
  );

  return (
    <>
      <div className="w-full flex items-center justify-between px-4 py-3 absolute h-15">
        <div className="flex items-center gap-2 font-semibold text-white">
          <div className="size-4 rounded-full bg-white mx-1" />
          Tracktrip
        </div>
        <div className="flex items-center gap-2">
          <UserMenu user={session.user} />
        </div>
      </div>

      <div className="p-5 pt-20 dark h-full flex flex-col">
        <div className="flex items-center justify-between dark">
          <div>
            <div className="font-semibold text-2xl text-foreground">
              Your travels
            </div>
            <div className="text-muted-foreground text-sm">
              Find all your travels here.
            </div>
          </div>
          <Button size="icon" asChild>
            <Link to="/travels/new">
              <Plus className="size-5" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 mt-6 flex-1">
          {travels.map((travel) => (
            <Link
              to="/travels/$travelId"
              params={{
                travelId: travel.id,
              }}
              className="bg-card flex items-center justify-between py-3 px-4 text-foreground border rounded-lg gap-2 text-lg shadow-sm"
              key={travel.id}
            >
              <div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl">{travel.emoji}</div>
                  <div className="font-medium">{travel.name}</div>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 ml-8 mt-1">
                  {dayjs(travel.startDate).format("DD/MM/YYYY")}
                  <ArrowRight className="size-3" />
                  {dayjs(travel.endDate).format("DD/MM/YYYY")}
                </div>
              </div>

              <ChevronRight className="text-muted-foreground" />
            </Link>
          ))}

          {travels.length === 0 && (
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TrainFront />
                </EmptyMedia>
                <EmptyTitle className="text-foreground">
                  You have no travel yet
                </EmptyTitle>
                <EmptyDescription>
                  There is no travel yet. Create one to get started.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <Link to="/travels/new">Create Travel</Link>
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </div>
      </div>
    </>
  );
}
