import { eq, and, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, EllipsisVertical } from "lucide-react";

import { NewCategoryDrawer } from "@/components/categories/new-category-drawer";
import { CategoryBadge } from "@/components/category-badge";
import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isCategoryType } from "@/data/categories";
import { categoriesCollection } from "@/store/collections";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/categories/$categoryType/manage",
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

  const { data: categories } = useLiveQuery((q) =>
    q
      .from({ categories: categoriesCollection })
      .where(({ categories }) =>
        and(eq(categories.travel, travelId), eq(categories.type, categoryType)),
      ),
  );

  return (
    <>
      <ScreenHeader>
        <div className="flex items-center">
          <Button
            variant="ghost"
            asChild
            className="text-subtle-foreground"
            size="icon"
          >
            <Link from={Route.fullPath} to="..">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="font-semibold text-xl">
            <span className="capitalize">{categoryType}</span> categories
          </div>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          Manage categories for {categoryType} expenses.
        </div>
      </ScreenHeader>

      <ScreenDrawer className="px-5 pb-4 space-y-4">
        <NewCategoryDrawer travelId={travelId} categoryType={categoryType} />

        <div className="h-px bg-border" />

        {categories?.map((category) => (
          <div key={category.id} className="flex items-center gap-2 h-8">
            <CategoryBadge categoryId={category.id} />
            <div className="font-medium text-sm flex-1">{category.name}</div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => categoriesCollection.delete(category.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </ScreenDrawer>
    </>
  );
}
