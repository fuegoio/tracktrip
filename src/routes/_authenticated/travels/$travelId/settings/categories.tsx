import { NewCategoryDrawer } from "@/components/categories/new-category-drawer";
import { Button } from "@/components/ui/button";
import { categoriesCollection } from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

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
      <div className="px-1 mb-4">
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

      <div className="px-5 pb-4">
        <NewCategoryDrawer travelId={travelId} />
      </div>

      <div className="px-5 space-y-2">
        {categories?.map((category) => (
          <div key={category.id} className="flex items-center gap-2">
            <div className="text-2xl">{category.emoji}</div>
            <div className="font-medium">{category.name}</div>
          </div>
        ))}
      </div>
    </>
  );
}
