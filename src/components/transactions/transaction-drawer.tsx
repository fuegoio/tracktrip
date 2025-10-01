import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { Transaction } from "@/data/transactions";
import type { ReactNode } from "react";
import { TransactionHeader } from "./transaction-header";
import { Label } from "../ui/label";
import { eq, useLiveQuery } from "@tanstack/react-db";
import {
  categoriesCollection,
  transactionsCollection,
} from "@/store/collections";
import { Button } from "../ui/button";
import { useTravel } from "@/lib/params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PlacesInput } from "../places/places-input";

export const TransactionDrawer = ({
  children,
  transaction,
}: {
  children: ReactNode;
  transaction: Transaction;
}) => {
  const travel = useTravel({ id: transaction.travel });
  if (!travel) throw new Error("Travel not found");

  const transactionUser = travel.users.find(
    (user) => user.id === transaction.user,
  );
  if (!transactionUser) throw new Error("User not found");

  const { data: categories } = useLiveQuery(
    (q) =>
      q
        .from({ categories: categoriesCollection })
        .where(({ categories }) => eq(categories.travel, transaction.travel)),
    [transaction.category],
  );

  const deleteTransaction = () => {
    transactionsCollection.delete(transaction.id);
  };

  const updateCategory = (category: string | null) => {
    transactionsCollection.update(transaction.id, (transaction) => {
      transaction.category = category;
    });
  };

  const updatePlace = (place: string | null) => {
    transactionsCollection.update(transaction.id, (transaction) => {
      transaction.place = place;
    });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="px-6 overflow-y-auto pt-2 pb-6">
          <DrawerTitle>
            <TransactionHeader transaction={transaction} />
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Transaction details
          </DrawerDescription>

          <div className="h-px bg-border mb-2" />

          <div className="space-y-4 py-2">
            {transaction.description && (
              <div>
                <Label className="font-semibold">Description</Label>
                <p className="text-sm text-subtle-foreground">
                  {transaction.description}
                </p>
              </div>
            )}

            <div>
              <Label className="font-semibold">Type</Label>
              <p className="text-sm text-subtle-foreground capitalize">
                {transaction.type}
              </p>
            </div>

            <div>
              <Label className="font-semibold">Paid by</Label>
              <p className="text-sm text-subtle-foreground capitalize">
                {transactionUser.name}
              </p>
            </div>
          </div>

          <div className="h-px bg-border my-2" />

          <div className="grid gap-2 py-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={transaction.category ?? undefined}
              onValueChange={updateCategory}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.emoji}{" "}
                    <span className="capitalize">{category.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 py-2">
            <Label htmlFor="place">Place</Label>
            <PlacesInput
              id="place"
              value={transaction.place ?? undefined}
              onChange={updatePlace}
              travelId={travel.id}
            />
          </div>

          <div className="h-px bg-border my-2" />

          <DrawerClose asChild>
            <Button
              type="button"
              className="w-full mt-2"
              size="lg"
              variant="secondary"
              onClick={deleteTransaction}
            >
              Delete
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
