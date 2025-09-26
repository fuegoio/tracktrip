import {
  Drawer,
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
import { categoriesCollection, placesCollection } from "@/store/collections";
import { Button } from "../ui/button";
import { useTravel } from "@/lib/params";

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
        .where(({ categories }) => eq(categories.id, transaction.category)),
    [transaction.category],
  );
  const transactionCategory = categories[0];

  const { data: places } = useLiveQuery(
    (q) =>
      q
        .from({ places: placesCollection })
        .where(({ places }) => eq(places.id, transaction.place)),
    [transaction.place],
  );
  const transactionPlace = places[0];

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

          <div className="h-px bg-border" />

          <div className="space-y-4 py-6">
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

            {transactionCategory && (
              <div>
                <Label className="font-semibold">Category</Label>
                <p className="text-sm text-subtle-foreground">
                  {transactionCategory.name}
                </p>
              </div>
            )}

            {transactionPlace && (
              <div>
                <Label className="font-semibold">Place</Label>
                <p className="text-sm text-subtle-foreground">
                  {transactionPlace.name}
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          <Button
            type="button"
            className="w-full mt-6"
            size="lg"
            variant="secondary"
          >
            Edit
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
