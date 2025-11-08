import { useState } from "react";

import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarIcon, Cog } from "lucide-react";

import type { BudgetPeriod } from "@/data/budgets";

import { AllBudgetsSummary } from "@/components/budgets/all-budgets-summary";
import { BudgetTypeSummary } from "@/components/budgets/budget-type-summary";
import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { PlacesSummary } from "@/components/places/places-summary";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryTypes } from "@/data/categories";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/analyse/",
)({
  component: RouteComponent,
});

const budgetsSummaries = [
  {
    name: "Today",
    period: "day",
  },
  {
    name: "Last week",
    period: "week",
  },
  {
    name: "Last month",
    period: "month",
  },
  {
    name: "Until now",
    period: "travelUntilNow",
  },
  {
    name: "Whole travel",
    period: "travel",
  },
] as const;

function RouteComponent() {
  const { travelId } = Route.useParams();
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>("week");

  return (
    <>
      <ScreenHeader>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold text-2xl">Analyse</div>
          </div>
          <Button size="icon" variant="secondary" asChild>
            <Link to="../budgets/configure" from={Route.fullPath}>
              <Cog />
            </Link>
          </Button>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          Understand how much and where do you spend.
        </div>
      </ScreenHeader>

      <ScreenDrawer asChild>
        <div className="w-full p-4 shadow-up bg-background rounded-t-lg translate-y-4 z-0 pb-8">
          <div className="flex items-center justify-between">
            <div className="px-1">
              <div className="text-sm font-semibold text-foreground">
                Spendings by type
              </div>
              <div className="text-xs text-subtle-foreground">
                Each expense has a type to identify them.
              </div>
            </div>
            <Select
              onValueChange={(value: BudgetPeriod) => setSelectedPeriod(value)}
              value={selectedPeriod}
            >
              <SelectTrigger
                className="bg-background border-input font-semibold"
                size="sm"
              >
                <CalendarIcon />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {budgetsSummaries.map((summary) => (
                  <SelectItem
                    key={summary.period}
                    value={summary.period}
                    textValue={summary.name}
                  >
                    {summary.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-5 space-y-5">
            <AllBudgetsSummary travelId={travelId} period={selectedPeriod} />

            {CategoryTypes.map((type) => (
              <div className="border-b border-border/50 pb-5" key={type}>
                <BudgetTypeSummary
                  travelId={travelId}
                  type={type}
                  period={selectedPeriod}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full pt-4 pb-20 px-4 shadow-up bg-background rounded-t-lg flex-1 translate-y-0">
          <PlacesSummary travelId={travelId} />
        </div>
      </ScreenDrawer>
    </>
  );
}
