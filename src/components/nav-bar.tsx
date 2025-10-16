import { useRouterState } from "@tanstack/react-router";
import {
  Cog,
  Gauge,
  Home,
  List,
  Plus,
  type LucideIcon,
} from "lucide-react";

import { NavigationButton } from "./navigation-button";
import { NewTransactionDrawer } from "./transactions/new-transaction-drawer";
import { Button } from "./ui/button";

import type { Travel } from "@/data/travels";

export type NavItem = {
  icon: LucideIcon;
  path: "" | "/transactions" | "/settings" | "/budgets";
};

const navItemsLeft: NavItem[] = [
  { icon: Home, path: "" },
  { icon: List, path: "/transactions" },
];

const navItemsRight: NavItem[] = [
  { icon: Gauge, path: "/budgets" },
  { icon: Cog, path: "/settings" },
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
      className="w-full py-5 px-6 shadow-up flex items-center justify-between absolute bottom-0 bg-white max-w-md rounded-t-xl"
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
        <Button size="icon" className="size-10 mb-2 rounded-full">
          <Plus className="size-6" />
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
