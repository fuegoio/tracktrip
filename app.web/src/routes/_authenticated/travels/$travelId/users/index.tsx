import { createFileRoute } from "@tanstack/react-router";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Travellers } from "@/components/users/travellers";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/users/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { travelId } = Route.useParams();
  const { session } = Route.useRouteContext();

  return (
    <>
      <ScreenHeader>
        <div className="font-semibold text-2xl">Travellers</div>
        <div className="text-muted-foreground text-sm mt-1">
          Who is traveling with you.
        </div>
      </ScreenHeader>

      <ScreenDrawer>
        <Travellers travelId={travelId} currentUser={session.user} />
      </ScreenDrawer>
    </>
  );
}
