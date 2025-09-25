import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/travels/$travelId/settings/users',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/travels/$travelId/settings/users"!</div>
}
