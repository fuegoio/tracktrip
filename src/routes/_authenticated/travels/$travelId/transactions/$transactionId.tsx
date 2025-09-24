import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/transactions/$transactionId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello toto</div>;
}
