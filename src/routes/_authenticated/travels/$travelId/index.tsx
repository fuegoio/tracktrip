import { Budgets } from "@/components/home/budgets";
import { Transactions } from "@/components/home/transactions";
import { useTravel } from "@/lib/params";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/travels/$travelId/")({
  component: TravelIndex,
});

function TravelIndex() {
  const params = Route.useParams();
  const travel = useTravel({ id: params.travelId });

  return (
    <>
      <div className="px-5 pb-6">
        <div className="font-semibold text-xl text-foreground">Hi Alexis,</div>
        <div className="mt-1 text-muted-foreground text-sm">
          What are we doing today?
        </div>

        <div className="mt-6">
          <div className="text-subtle-foreground">Total travel cost</div>
          <div className="text-5xl text-foreground font-mono mt-1">
            8405.30€
          </div>
        </div>

        <div className="grid grid-cols-3 mt-6">
          <div className="border-l-2 border-foreground px-4">
            <div className="text-sm text-subtle-foreground">Today cost</div>
            <div className="text-foreground font-mono font-semibold">5.30€</div>
          </div>
          <div className="border-l-2 border-muted-foreground px-4">
            <div className="text-sm text-subtle-foreground">Per people</div>
            <div className="text-foreground font-mono font-semibold">
              4045.30€
            </div>
          </div>
          <div className="border-l-2 border-border px-4">
            <div className="text-sm text-subtle-foreground">Forecast</div>
            <div className="text-subtle-foreground font-mono font-semibold">
              12905.30€
            </div>
          </div>
        </div>
      </div>

      <Budgets travelId={travel.id} />
      <Transactions travelId={travel.id} />
    </>
  );
}
