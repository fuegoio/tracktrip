import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft, EllipsisVertical } from "lucide-react";
import { useTravel } from "@/lib/params";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteUserDrawer } from "@/components/users/invite-user-drawer";
import { Badge } from "@/components/ui/badge";

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

  const deleteUser = (_userId: string) => {};

  return (
    <>
      <div className="px-1 py-4">
        <Button variant="ghost" asChild className="text-subtle-foreground">
          <Link from={Route.fullPath} to="..">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="px-5 pb-6">
        <div className="font-semibold text-xl">People</div>
        <div className="text-muted-foreground text-sm mt-1">
          Who is traveling with you.
        </div>
      </div>

      <div className="px-5 pb-4 space-y-4">
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
                  onClick={() => deleteUser(user.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </>
  );
}
