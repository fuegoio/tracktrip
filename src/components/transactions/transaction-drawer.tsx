import { eq, useLiveQuery } from "@tanstack/react-db";
import dayjs from "dayjs";
import { ArrowRight } from "lucide-react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { UserAvatar } from "../users/user-avatar";

import { EditTransactionDrawer } from "./edit-transaction-drawer";
import { useTransactionDrawerStore } from "./transaction-drawer-store";
import { TransactionHeader } from "./transaction-header";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useTravel } from "@/lib/params";
import {
  categoriesCollection,
  placesCollection,
  transactionsCollection,
} from "@/store/collections";

export const TransactionDrawer = ({ travelId }: { travelId: string }) => {
  const { isOpen, transaction, closeDrawer } = useTransactionDrawerStore();

  // Move all hook calls before any early returns
  const travel = useTravel({ id: travelId });

  const transactionCategoryQuery = useLiveQuery(
    (q) =>
      q
        .from({ categories: categoriesCollection })
        .where(({ categories }) =>
          eq(categories.id, transaction?.category ?? ""),
        ),
    [transaction?.category],
  );

  const transactionPlaceQuery = useLiveQuery(
    (q) =>
      q
        .from({ places: placesCollection })
        .where(({ places }) => eq(places.id, transaction?.place ?? "")),
    [transaction?.place],
  );

  if (!transaction) return null;

  const transactionUser = travel.users.find(
    (user) => user.id === transaction.user,
  );
  if (!transactionUser) throw new Error("User not found");

  const transactionCategory =
    transactionCategoryQuery.data.at(0)?.name ?? "No category";
  const transactionPlace = transactionPlaceQuery.data.at(0)?.name ?? "No place";

  const deleteTransaction = () => {
    transactionsCollection.delete(transaction.id);
  };

  return (
    <Drawer open={isOpen} onOpenChange={closeDrawer}>
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
              <div className="flex items-center gap-1 mt-2">
                <UserAvatar user={transactionUser} className="size-5" />
                <span className="text-sm text-subtle-foreground">
                  {transactionUser.name}
                </span>
              </div>
            </div>

            <div>
              <Label className="font-semibold">For who</Label>
              <p className="text-sm text-subtle-foreground capitalize">
                {(transaction.users === null ||
                  transaction.users.length === travel.users.length) &&
                  "Everyone"}

                {transaction.users?.length === 1 &&
                  travel.users.length > 1 &&
                  travel.users.find((user) => user.id === transaction.users![0])
                    ?.name}

                {transaction.users &&
                transaction.users.length > 1 &&
                transaction.users.length < travel.users.length
                  ? `${transaction.users.length} people`
                  : ""}
              </p>
            </div>

            <div className="h-px bg-border mt-2 mb-3" />

            <div>
              <Label className="font-semibold">Place</Label>
              <p className="text-sm text-subtle-foreground capitalize">
                {transactionPlace}
              </p>
            </div>

            {["accommodation", "transport", "activity"].includes(
              transaction.type,
            ) && (
              <div>
                <Label className="font-semibold">
                  Date of {transaction.type}
                </Label>
                <div className="flex items-center text-sm text-subtle-foreground mt-1">
                  <div>
                    {dayjs(
                      transaction.activationDate || transaction.date,
                    ).format("LL")}
                  </div>
                  <ArrowRight className="mx-2 size-4 flex-1" />
                  <div>
                    {dayjs(transaction.activationDate || transaction.date)
                      .add((transaction.days ?? 1) - 1, "days")
                      .format("LL")}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-border my-2" />

          <div className="space-y-2">
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  className="w-full mt-2"
                  size="lg"
                  variant="secondary"
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this transaction.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <DrawerClose asChild>
                    <AlertDialogAction onClick={deleteTransaction}>
                      Delete
                    </AlertDialogAction>
                  </DrawerClose>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <DrawerClose asChild></DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
