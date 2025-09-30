import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";
import { travelsCollection } from "@/store/collections";
import { useEffect } from "react";
import { ArrowRight, ChevronRight, Plus } from "lucide-react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  const navigate = Route.useNavigate();

  const { data: travels } = useLiveQuery((q) =>
    q.from({ travels: travelsCollection }),
  );

  useEffect(() => {
    if (travelsCollection.isReady() && travels.length === 0) {
      navigate({ to: "/travels/new" });
    }
  }, [navigate, travels.length]);

  return (
    <div className="p-5 pt-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-2xl">Your travels</div>
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

      <div className="flex flex-col gap-4 mt-6">
        {travels.map((travel) => (
          <Link
            to="/travels/$travelId"
            params={{
              travelId: travel.id,
            }}
            className="flex items-center justify-between py-3 px-4 text-foreground border rounded-lg gap-2 text-lg shadow-sm"
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
      </div>
    </div>
  );
}
