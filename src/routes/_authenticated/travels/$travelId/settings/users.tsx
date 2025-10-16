import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, EllipsisVertical } from "lucide-react";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteUserDrawer } from "@/components/users/invite-user-drawer";
import { useTravel } from "@/lib/params";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/settings/users",
)({
  component: RouteComponent,
});

/**
 * No optimistic update for inviting a user, because we don't know the user's id yet.
 * It's not really a problem as we don't want to support offline mode for this feature.
 */
function RouteComponent() {
  const { travelId } = Route.useParams();
  const travel = useTravel({ id: travelId });

  // TODO: Implement user deletion

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
          <div className="ml-2 font-semibold text-xl">People</div>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          Who is traveling with you.
        </div>
      </ScreenHeader>

      <ScreenDrawer className="px-5 pb-4 space-y-4">
        <InviteUserDrawer travelId={travelId} />

        <div className="h-px bg-border" />

        {travel.users?.map((user) => (
          <div key={user.id} className="flex items-center gap-2 h-8">
            <div className="font-medium text-sm flex-1">
              {user.name}

              {user.role === "owner" && (
                <Badge variant="secondary" className="ml-2">
                  Admin
                </Badge>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  variant="destructive"
                  // onClick={() => deleteUser(user.id)}
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
