import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery, eq } from "@tanstack/react-db";
import * as z from "zod";

import { CategoryTypeBadge } from "../category-type-badge";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";

import { CategoryTypes, type CategoryType } from "@/data/categories";
import { useTravel } from "@/lib/params";
import { budgetsCollection } from "@/store/collections";
import dayjs from "dayjs";

interface BudgetSettingsProps {
  travelId: string;
}

// Define validation schema
const budgetSchema = z.object({
  budgets: z.record(
    z.enum(CategoryTypes),
    z.object({
      amount: z
        .number()
        .min(0, "Amount must be positive")
        .nullable()
        .optional(),
    }),
  ),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export const BudgetSettings = ({ travelId }: BudgetSettingsProps) => {
  const budgetsQuery = useLiveQuery(
    (q) =>
      q
        .from({ budgets: budgetsCollection })
        .where(({ budgets }) => eq(budgets.travel, travelId)),
    [travelId],
  );
  const existingBudgets = budgetsQuery.data || [];
  const travel = useTravel({ id: travelId });

  const { register, handleSubmit, watch } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budgets: CategoryTypes.reduce(
        (acc, categoryType) => {
          const existing = existingBudgets.find(
            (b) => b.categoryType === categoryType,
          );
          acc[categoryType] = { amount: existing ? existing.amount : null };
          return acc;
        },
        {} as Record<CategoryType, { amount: number | null }>,
      ),
    },
  });

  const totalBudget = Object.values(watch("budgets")).reduce(
    (sum, { amount }) => sum + (amount || 0),
    0,
  );

  const travelDurationInDays = dayjs(travel.endDate).diff(
    dayjs(travel.startDate),
    "day",
  );

  const totalForecast = totalBudget * travelDurationInDays;

  const onSubmit = async (data: BudgetFormValues) => {
    try {
      for (const [categoryType, { amount }] of Object.entries(data.budgets)) {
        const existing = existingBudgets.find(
          (b) => b.categoryType === categoryType,
        );
        if (existing) {
          budgetsCollection.update(existing.id, (budget) => ({
            ...budget,
            amount,
          }));
        } else if (amount) {
          budgetsCollection.insert({
            id: crypto.randomUUID(),
            travel: travelId,
            categoryType: categoryType as CategoryType,
            category: null,
            amount,
          });
        }
      }
    } catch (error) {
      console.error("Failed to save budgets:", error);
    }
  };

  return (
    <div className="space-y-6 px-3">
      <div>
        <div className="text-sm font-semibold text-foreground">
          Expense types
        </div>
        <div className="text-xs text-subtle-foreground">
          Set a budget for each type of expense and evaluate your total
          spending.
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Category Budget Rows */}
        <div>
          {CategoryTypes.map((type) => {
            return (
              <div key={type} className="space-y-2 border-b py-4">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryTypeBadge categoryType={type} />
                    <div className="font-medium text-sm capitalize">{type}</div>
                  </div>

                  <InputGroup className="w-44">
                    <InputGroupInput
                      placeholder="10"
                      step="0.01"
                      {...register(`budgets.${type}.amount` as const, {
                        valueAsNumber: true,
                      })}
                    />

                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{travel.currency} / day</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Budget Row */}
        <div className="space-y-2 border-b py-4">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="font-medium text-sm">Daily budget</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-mono">
                {totalBudget.toLocaleString(undefined, {
                  style: "currency",
                  currency: travel.currency,
                })}{" "}
                / day
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="font-medium text-sm">Travel duration</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-subtle-foreground text-sm">x</div>
              <div className="text-sm font-mono">
                {travelDurationInDays} days
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="font-medium text-sm">Travel forecast</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-subtle-foreground text-sm">=</div>
              <div className="text-sm font-mono">
                {totalForecast.toLocaleString(undefined, {
                  style: "currency",
                  currency: travel.currency,
                })}
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Save budgets
        </Button>
      </form>
    </div>
  );
};
