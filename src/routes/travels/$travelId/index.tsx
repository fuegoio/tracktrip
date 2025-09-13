import { TopBar } from "@/components/top-bar";
import { useTravel } from "@/lib/params";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/travels/$travelId/")({
  component: TravelIndex,
});

function TravelIndex() {
  const params = Route.useParams();
  const travel = useTravel({ id: params.travelId });

  return (
    <>
      <TopBar travel={travel} />

      <div className="px-5">
        <div className="font-semibold text-xl text-slate-700">Hi Alexis,</div>
        <div className="mt-1 text-slate-400 text-sm font-light">
          What are we doing today?
        </div>

        <div className="mt-6">
          <div className=" text-slate-500">Total travel cost</div>
          <div className="text-5xl text-slate-800 font-mono mt-1">8405.30€</div>
        </div>

        <div className="grid grid-cols-3 mt-6">
          <div className="border-l-2 border-slate-800 px-4">
            <div className="text-sm text-slate-500">Today cost</div>
            <div className="text-slate-800 font-mono font-semibold">5.30€</div>
          </div>
          <div className="border-l-2 border-slate-400 px-4">
            <div className="text-sm text-slate-500">Per people</div>
            <div className="text-slate-800 font-mono font-semibold">
              4045.30€
            </div>
          </div>
          <div className="border-l-2 border-slate-300 px-4">
            <div className="text-sm text-slate-500">Forecast</div>
            <div className="text-slate-500 font-mono font-semibold">
              12905.30€
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
