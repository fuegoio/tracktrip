import { NavBar } from "@/components/nav-bar";
import { TopBar } from "@/components/top-bar";
import { useTravel } from "@/lib/params";
import { travelsCollection } from "@/store/collections";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/travels/$travelId")({
  component: RouteComponent,
  loader: ({ params: { travelId } }) => {
    const travel = travelsCollection.get(travelId);
    if (!travel) {
      throw notFound();
    }

    window.localStorage.setItem("travelId", travelId);
  },
});

function RouteComponent() {
  const params = Route.useParams();
  const { session } = Route.useRouteContext();
  const userId = session.user.id;

  const travel = useTravel({ id: params.travelId });

  return (
    <>
      <div className="pb-20">
        <TopBar travel={travel} user={session.user} />

        <Outlet />
      </div>
      <NavBar travel={travel} userId={userId} />
    </>
  );
}
