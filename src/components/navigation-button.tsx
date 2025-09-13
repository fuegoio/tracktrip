import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export const NavigationButton = ({
  icon,
  active,
  onClick,
}: {
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}) => {
  const Icon = icon;
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <Button variant="ghost" size="icon" className="size-10" onClick={onClick}>
        <Icon
          className={cn(
            "size-6 transition-colors",
            active ? "text-slate-800" : "text-slate-400",
          )}
        />
      </Button>
      <div
        className={cn(
          "h-1 w-1 rounded-full bg-slate-800 transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
};
