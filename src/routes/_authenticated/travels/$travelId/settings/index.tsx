import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, MapPin, Tag, User } from "lucide-react";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/settings/",
)({
  component: RouteComponent,
});

const travelLinks = [
  { name: "People", path: "./users", icon: User },
  { name: "Categories", path: "./categories", icon: Tag },
  { name: "Places", path: "./places", icon: MapPin },
] as const;

function RouteComponent() {
  return (
    <>
      <ScreenHeader>
        <div className="font-semibold text-xl">Settings</div>
        <div className="text-muted-foreground text-sm mt-1">
          Control your travel experience easily from here.
        </div>
      </ScreenHeader>

      <ScreenDrawer className="space-y-2 px-5 py-6">
        {travelLinks.map((link) => (
          <Link
            from={Route.fullPath}
            key={link.path}
            to={link.path}
            className="w-full h-10 flex items-center font-medium gap-2"
          >
            <div className="flex items-center justify-center rounded-full size-8 bg-muted">
              <link.icon className="size-4" />
            </div>
            {link.name}
            <div className="flex-1" />
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </ScreenDrawer>
    </>
  );
}
