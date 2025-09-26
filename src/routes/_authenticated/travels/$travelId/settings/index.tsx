import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Tag, User } from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/settings/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="px-5 py-6">
        <div className="font-semibold text-xl">Settings</div>
        <div className="text-muted-foreground text-sm mt-1">
          Control your travel experience easily from here.
        </div>
      </div>

      <div className="px-5 space-y-2">
        <div className="text-muted-foreground text-xs font-medium">Travel</div>
        <Link
          from={Route.fullPath}
          to="./users"
          className="w-full h-10 flex items-center font-medium gap-2"
        >
          <div className="flex items-center justify-center rounded-full size-8 bg-muted">
            <User className="size-4" />
          </div>
          People
          <div className="flex-1" />
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
        <Link
          from={Route.fullPath}
          to="./categories"
          className="w-full h-10 flex items-center font-medium gap-2"
        >
          <div className="flex items-center justify-center rounded-full size-8 bg-muted">
            <Tag className="size-4" />
          </div>
          Categories
          <div className="flex-1" />
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </>
  );
}
