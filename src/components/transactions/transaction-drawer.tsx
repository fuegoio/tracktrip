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
  placesCollection,
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
import { EditTransactionDrawer } from "./edit-transaction-drawer";

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

  const transactionCategory =
    useLiveQuery(
      (q) =>
        q
          .from({ categories: categoriesCollection })
          .where(({ categories }) => eq(categories.id, transaction.category)),
      [transaction.category],
    ).data.at(0)?.name ?? "No category";

  const transactionPlace =
    useLiveQuery(
      (q) =>
        q
          .from({ places: placesCollection })
          .where(({ places }) => eq(places.id, transaction.place)),
      [transaction.place],
    ).data.at(0)?.name ?? "No place";

  const deleteTransaction = () => {
    transactionsCollection.delete(transaction.id);
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
              <Label className="font-semibold">Category</Label>
              <p className="text-sm text-subtle-foreground capitalize">
                {transactionCategory}
              </p>
            </div>

            <div>
              <Label className="font-semibold">Paid by</Label>
              <p className="text-sm text-subtle-foreground capitalize">
                {transactionUser.name}
              </p>
            </div>

            <div>
              <Label className="font-semibold">Place</Label>
              <p className="text-sm text-subtle-foreground capitalize">
                {transactionPlace}
              </p>
            </div>
          </div>

          <div className="h-px bg-border my-2" />

          <EditTransactionDrawer transaction={transaction} travel={travel}>
            <Button
              type="button"
              className="w-full mt-2"
              size="lg"
              variant="secondary"
            >
              Edit
            </Button>
          </EditTransactionDrawer>
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
