import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import type { NavItem } from "./nav-bar";

export const NavigationButton = ({
  icon,
  active,
  path,
  onClick,
}: {
  icon: LucideIcon;
  active: boolean;
  path: NavItem["path"];
  onClick?: () => void;
}) => {
  const location = useRouterState({ select: (s) => s.location });
  const travelId = location.pathname.split("/")[2];
  if (!travelId) return null;

  const Icon = icon;
  return (
    <Link
      to={`/travels/$travelId${path}`}
      params={{ travelId: travelId }}
      className="flex flex-col items-center justify-center gap-1"
    >
      <Button variant="ghost" size="icon" className="size-10" onClick={onClick}>
        <Icon
          className={cn(
            "size-6 transition-colors",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        />
      </Button>
      <div
        className={cn(
          "h-1 w-1 rounded-full bg-foreground transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
};
