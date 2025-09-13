import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { travelsCollection } from "../store/collections";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: travels } = useLiveQuery((q) =>
    q.from({ travels: travelsCollection }),
  );

  const activeTravel = travels.find(
    (t) =>
      new Date(t.startDate) < new Date() && new Date(t.endDate) > new Date(),
  );

  if (!activeTravel) {
    return (
      <div className="p-2">
        <h1 className="mt-4 text-slate-900">No active travel</h1>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b">
        <h1 className="font-light text-3xl mt-4 text-slate-900">
          {activeTravel.emoji} {activeTravel.name}
        </h1>
      </div>
    </>
  );
}
