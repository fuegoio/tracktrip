import * as React from "react";

import { useMutation } from "@tanstack/react-query";
import { EllipsisVertical, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import type { User } from "better-auth";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteUserDrawer } from "@/components/users/invite-user-drawer";
import { useTravel } from "@/lib/params";
import { trpc } from "@/trpc/client";

export const Travellers = ({
  travelId,
  currentUser,
}: {
  travelId: string;
  currentUser: User;
}) => {
  const travel = useTravel({ id: travelId });

  const deleteUserMutation = useMutation(
    trpc.travels.deleteUser.mutationOptions({
      onSuccess: () => {
        toast.success("User deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete user");
      },
    }),
  );

  const currentUserRole = travel.users?.find(
    (user) => user.id === currentUser.id,
  )?.role;

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
          {currentUserRole === "owner" && user.role !== "owner" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={(e) => {
                        e.preventDefault();
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete traveller</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {user.name} from this
                        travel? This action cannot be undone.
                        <br />
                        <br />
                        Transactions created by this traveller will be deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={deleteUserMutation.status === "pending"}
                        onClick={() =>
                          deleteUserMutation.mutate({
                            userId: user.id,
                            travelId,
                          })
                        }
                      >
                        {deleteUserMutation.status === "pending" ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ))}

      {currentUserRole === "owner" && (
        <>
          <div className="h-px bg-border" />
          <InviteUserDrawer travelId={travelId} />
        </>
      )}
    </div>
  );
};
