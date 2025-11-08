import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { EllipsisVertical } from "lucide-react";

import { NewCategoryDrawer } from "@/components/categories/new-category-drawer";
import { CategoryBadge } from "@/components/category-badge";
import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categoriesCollection } from "@/store/collections";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/categories/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { travelId } = Route.useParams();

  const { data: categories } = useLiveQuery((q) =>
    q
      .from({ categories: categoriesCollection })
      .where(({ categories }) => eq(categories.travel, travelId)),
  );

  return (
    <>
      <ScreenHeader>
        <div className="font-semibold text-xl">Categories</div>
        <div className="text-muted-foreground text-sm mt-1">
          Configure how you want to categorize your expenses.
        </div>
      </ScreenHeader>

      <ScreenDrawer className="px-5 pb-4 space-y-4">
        <NewCategoryDrawer travelId={travelId} />

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
