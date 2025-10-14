import { Button } from "@/components/ui/button";
import { placesCollection } from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, EllipsisVertical, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewPlaceDrawer } from "@/components/places/new-place-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { ScreenDrawer } from "@/components/layout/screen-drawer";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/settings/places",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { travelId } = Route.useParams();

  const { data: places } = useLiveQuery((q) =>
    q
      .from({ places: placesCollection })
      .where(({ places }) => eq(places.travel, travelId)),
  );

  return (
    <>
      <ScreenHeader>
        <div className="flex items-center">
          <Button
            variant="ghost"
            asChild
            className="text-subtle-foreground"
            size="icon"
          >
            <Link from={Route.fullPath} to="..">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="ml-2 font-semibold text-xl">Places</div>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          Manage places for your travel expenses.
        </div>
      </ScreenHeader>

      <ScreenDrawer className="px-5 pb-4 space-y-4">
        <NewPlaceDrawer travelId={travelId} />

        <div className="h-px bg-border" />

        {places?.map((place) => (
          <div key={place.id} className="flex items-center gap-2 h-8">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="font-medium text-sm flex-1">{place.name}</div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => placesCollection.delete(place.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </ScreenDrawer>
    </>
  );
}

