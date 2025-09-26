import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/travels/$travelId/settings/budgets',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/travels/$travelId/settings/budgets"!</div>
}
