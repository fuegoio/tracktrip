import { useState } from "react";

import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarIcon, Cog } from "lucide-react";

import type { BudgetPeriod } from "@/data/budgets";

import { BudgetTypeSummary } from "@/components/budgets/budget-type-summary";
import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
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
  "/_authenticated/travels/$travelId/budgets/",
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
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>("day");

  return (
    <>
      <ScreenHeader>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold text-2xl">Budgets</div>
          </div>
          <Button size="icon" variant="secondary" asChild>
            <Link to="./configure" from={Route.fullPath}>
              <Cog />
            </Link>
          </Button>
        </div>
        <div className="text-muted-foreground text-sm mt-1">
          How much you did spent in each category.
        </div>
      </ScreenHeader>

      <ScreenDrawer className="space-y-4 px-4">
        <Select
          onValueChange={(value: BudgetPeriod) => setSelectedPeriod(value)}
          value={selectedPeriod}
        >
          <SelectTrigger className="w-full bg-background border-input font-semibold">
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

        <div className="h-px bg-border" />

        <div className="mt-4 space-y-4">
          {CategoryTypes.map((type) => (
            <div
              className="rounded-lg p-4 bg-subtle border border-border/50 inset-ring-2 inset-ring-white/40"
              key={type}
            >
              <BudgetTypeSummary
                travelId={travelId}
                type={type}
                period={selectedPeriod}
              />
            </div>
          ))}
        </div>
      </ScreenDrawer>
    </>
  );
}
