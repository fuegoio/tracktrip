import {
  ChartColumn,
  Cog,
  Home,
  List,
  ScanQrCode,
  type LucideIcon,
} from "lucide-react";
import { NavigationButton } from "./navigation-button";
import { useRouterState } from "@tanstack/react-router";

export type NavItem = {
  icon: LucideIcon;
  path: "" | "/transactions" | "/settings";
};

const navItems: NavItem[] = [
  { icon: Home, path: "" },
  { icon: List, path: "/transactions" },
  { icon: ScanQrCode, path: "" },
  { icon: ChartColumn, path: "" },
  { icon: Cog, path: "/settings" },
];

export const NavBar = () => {
  const location = useRouterState({ select: (s) => s.location });
  const travelLocation = location.pathname.split("/")[3];

  const activeIndex = navItems.findIndex(
    (item) =>
      item.path === `/${travelLocation}` ||
      (item.path === "" && travelLocation === undefined),
  );

  return (
    <nav
      role="navigation"
      aria-label="navigation"
      data-slot="navigation"
      className="w-full py-5 px-6 rounded-t-2xl shadow-up flex items-center justify-between fixed bottom-0 bg-white"
    >
      {navItems.map((item, index) => (
        <NavigationButton
          key={index}
          icon={item.icon}
          path={item.path}
          active={index === activeIndex}
        />
      ))}
    </nav>
  );
};
