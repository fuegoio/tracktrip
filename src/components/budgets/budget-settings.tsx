import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "../ui/drawer";
import { CategoryTypes, type CategoryType } from "@/data/categories";
import type { Budget } from "@/data/budgets";
import { useLiveQuery, eq } from "@tanstack/react-db";
import { budgetsCollection } from "@/store/collections";
import { trpcClient } from "@/trpc/client";
import { CategoryTypeBadge } from "../category-type-badge";
import { useTravel } from "@/lib/params";

interface BudgetSettingsProps {
  travelId: string;
}

export const BudgetSettings = ({ travelId }: BudgetSettingsProps) => {
  const [selectedCategoryType, setSelectedCategoryType] =
    useState<CategoryType | null>(null);
  const [amount, setAmount] = useState<number | "">("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const budgetsQuery = useLiveQuery(
    (q) =>
      q
        .from({ budgets: budgetsCollection })
        .where(({ budgets }) => eq(budgets.travel, travelId)),
    [travelId],
  );

  const existingBudgets = budgetsQuery.data || [];

  const travel = useTravel({ id: travelId });

  const handleCreateBudget = async () => {
    if (!selectedCategoryType || amount === "") return;

    try {
      await trpcClient.budgets.create.mutate({
        travel: travelId,
        categoryType: selectedCategoryType,
        category: null, // Not implementing category budgets yet
        amount: Number(amount),
      });
      setSelectedCategoryType(null);
      setAmount("");
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Failed to create budget:", error);
    }
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget || amount === "") return;

    try {
      await trpcClient.budgets.update.mutate({
        id: editingBudget.id,
        data: {
          amount: Number(amount),
        },
      });
      setEditingBudget(null);
      setAmount("");
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Failed to update budget:", error);
    }
  };

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setSelectedCategoryType(budget.categoryType);
    setAmount(budget.amount);
    setIsDrawerOpen(true);
  };

  const handleAddClick = (type: CategoryType) => {
    setEditingBudget(null);
    setSelectedCategoryType(type);
    setAmount("");
    setIsDrawerOpen(true);
  };

  return (
    <>
      <div className="space-y-6 px-5">
        <div>
          {CategoryTypes.map((type: CategoryType) => {
            const budget = existingBudgets.find((b) => b.categoryType === type);
            return (
              <div key={type} className="space-y-2 border-t py-4">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryTypeBadge categoryType={type} />
                    <div className="font-medium text-sm capitalize">{type}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {budget ? (
                      <div className="text-sm font-mono">
                        {budget.amount.toLocaleString(undefined, {
                          style: "currency",
                          currency: travel.currency,
                        })}{" "}
                        / day
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No budget
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  {budget ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditClick(budget)}
                      className="w-full"
                    >
                      Edit budget
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddClick(type)}
                      className="w-full"
                    >
                      Add budget
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {editingBudget ? "Edit Budget" : "Add Budget"}
              </DrawerTitle>
              <DrawerDescription>
                {editingBudget
                  ? `Update the budget amount for ${editingBudget.categoryType}`
                  : `Create a new budget for ${selectedCategoryType}`}
              </DrawerDescription>
            </DrawerHeader>
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.valueAsNumber || "")}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setEditingBudget(null);
                  setAmount("");
                }}
              >
                Cancel
              </Button>
              {editingBudget ? (
                <Button onClick={handleUpdateBudget} disabled={amount === ""}>
                  Update Budget
                </Button>
              ) : (
                <Button
                  onClick={handleCreateBudget}
                  disabled={!selectedCategoryType || amount === ""}
                >
                  Create Budget
                </Button>
              )}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};
