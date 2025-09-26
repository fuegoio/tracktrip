import { NewCategoryDrawer } from "@/components/categories/new-category-drawer";
import { CategoryBadge } from "@/components/category-badge";
import { Button } from "@/components/ui/button";
import { categoriesCollection } from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/settings/categories",
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
      <div className="px-1 py-4">
        <Button variant="ghost" asChild className="text-subtle-foreground">
          <Link from={Route.fullPath} to="..">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="px-5 pb-6">
        <div className="font-semibold text-xl">Categories</div>
        <div className="text-muted-foreground text-sm mt-1">
          Configure how you want to categorize your expenses.
        </div>
      </div>

      <div className="px-5 pb-4 space-y-4">
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
      </div>
    </>
  );
}
