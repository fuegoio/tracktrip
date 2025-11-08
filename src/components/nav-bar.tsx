import { useRouterState } from "@tanstack/react-router";
import {
  ChartPie,
  Home,
  List,
  Plus,
  User,
  type LucideIcon,
} from "lucide-react";

import { NavigationButton } from "./navigation-button";
import { NewTransactionDrawer } from "./transactions/new-transaction-drawer";
import { Button } from "./ui/button";

import type { Travel } from "@/data/travels";

import { cn } from "@/lib/utils";

export type NavItem = {
  icon: LucideIcon;
  path: "" | "/transactions" | "/users/me" | "/analyse";
};

const navItemsLeft: NavItem[] = [
  { icon: Home, path: "" },
  { icon: List, path: "/transactions" },
];

const navItemsRight: NavItem[] = [
  { icon: ChartPie, path: "/analyse" },
  { icon: User, path: "/users/me" },
];

export const NavBar = ({
  travel,
  userId,
}: {
  travel: Travel;
  userId: string;
}) => {
  const location = useRouterState({ select: (s) => s.location });
  const travelLocation = location.pathname.split("/")[3];

  const isActive = (item: NavItem) =>
    item.path === `/${travelLocation}` ||
    (item.path === "" && travelLocation === undefined);

  return (
    <nav
      role="navigation"
      aria-label="navigation"
      data-slot="navigation"
      className="w-full pt-1 pb-3 px-6 shadow-up flex items-center justify-between absolute bottom-0 bg-white rounded-t-xl"
    >
      {navItemsLeft.map((item, index) => (
        <NavigationButton
          key={index}
          icon={item.icon}
          path={item.path}
          active={isActive(item)}
        />
      ))}

      <NewTransactionDrawer travel={travel} userId={userId}>
        <Button
          size="icon"
          className={cn(
            "shadow-none",
            "size-14 mb-2 rounded-full ring-8 ring-white -translate-y-4 shadow-up",
          )}
        >
          <Plus className="size-8" />
        </Button>
      </NewTransactionDrawer>

      {navItemsRight.map((item, index) => (
        <NavigationButton
          key={index}
          icon={item.icon}
          path={item.path}
          active={isActive(item)}
        />
      ))}
    </nav>
  );
};
