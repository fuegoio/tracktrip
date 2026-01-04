import { useState } from "react";

import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  CircleUser,
  ExternalLink,
  LogOut,
  MessageCircle,
} from "lucide-react";

import { ContactDrawer } from "./contact-drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { UserAvatar } from "./users/user-avatar";

import type { User } from "better-auth";

import { authClient } from "@/auth/client";

export const UserMenu = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);

  const logout = async () => {
    await authClient.signOut();
    await navigate({ to: "/login" });
    localStorage.clear();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UserAvatar
            user={user}
            className="outline-2 outline-offset-1 outline-border mr-1.5"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 min-w-56 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UserAvatar user={user} className="size-8" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/docs" target="_blank">
              <BookOpen />
              Documentation
              <div className="flex-1" />
              <ExternalLink />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setContactDrawerOpen(true)}>
            <MessageCircle />
            Contact us
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <CircleUser />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ContactDrawer
        open={contactDrawerOpen}
        onOpenChange={setContactDrawerOpen}
      />
    </>
  );
};
