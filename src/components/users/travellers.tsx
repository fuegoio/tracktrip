import { EllipsisVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteUserDrawer } from "@/components/users/invite-user-drawer";
import { useTravel } from "@/lib/params";

export const Travellers = ({
  travelId,
  onboarding,
}: {
  travelId: string;
  onboarding?: boolean;
}) => {
  const travel = useTravel({ id: travelId });

  // TODO: Implement user deletion

  return (
    <div className="px-5 pb-4 space-y-4">
      <div className="pb-4">
        <div className="text-sm font-semibold text-foreground">Travellers</div>
        <div className="text-xs text-subtle-foreground">
          Invite a traveller to this travel or manage existing ones.
        </div>
      </div>

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
          {user.role !== "owner" && (
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
          )}
        </div>
      ))}

      <div className="h-px bg-border" />

      <InviteUserDrawer travelId={travelId} />
    </div>
  );
};
