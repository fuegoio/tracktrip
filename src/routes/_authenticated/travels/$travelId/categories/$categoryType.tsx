import { createFileRoute, notFound } from "@tanstack/react-router";

import { CategoryTypeBadge } from "@/components/category-type-badge";
import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { isCategoryType } from "@/data/categories";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/categories/$categoryType",
)({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    const { categoryType } = params;

    if (!isCategoryType(categoryType)) {
      throw notFound();
    }

    return {
      categoryType: categoryType,
    };
  },
});

function RouteComponent() {
  const { travelId } = Route.useParams();
  const { categoryType } = Route.useRouteContext();

  return (
    <>
      <ScreenHeader className="flex flex-col justify-center items-center w-full gap-2">
        <CategoryTypeBadge
          categoryType={categoryType}
          className="size-12 text-2xl"
        />
        <div className="text-foreground capitalize text-2xl font-medium">
          {categoryType}
        </div>
      </ScreenHeader>

      <ScreenDrawer className="space-y-2 px-4">
        <div className="mt-4 space-y-4"></div>
      </ScreenDrawer>
    </>
  );
}
