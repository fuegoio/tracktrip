import { NavBar } from "@/components/nav-bar";
import { TopBar } from "@/components/top-bar";
import { useTravel } from "@/lib/params";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/travels/$travelId")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const { session } = Route.useRouteContext();
  const userId = session.user.id;

  const travel = useTravel({ id: params.travelId });

  return (
    <>
      <div className="pb-20 pt-14">
        <TopBar travel={travel} userId={userId} />

        <Outlet />
      </div>
      <NavBar />
    </>
  );
}
