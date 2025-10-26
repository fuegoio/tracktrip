import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { CheckCircle, X } from "lucide-react";
import z from "zod";

import { TransactionAdditionalForm } from "./transaction-additional-form";
import { TransactionBaseForm } from "./transaction-base-form";
import { useTransactionDrawerStore } from "./transaction-drawer-store";
import { TransactionHeader } from "./transaction-header";
import {
  additionalTransactionSchema,
  baseTransactionSchema,
} from "./transaction-schemas";

import type { Transaction } from "@/data/transactions";
import type { Travel } from "@/data/travels";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Form } from "@/components/ui/form";
import { transactionsCollection } from "@/store/collections";

export const NewTransactionDrawer = ({
  travel,
  userId,
  children,
}: {
  travel: Travel;
  userId: string;
  children: React.ReactNode;
}) => {
  const { openDrawer } = useTransactionDrawerStore();

  const [isOpen, setIsOpen] = useState(false);
  const [createdTransaction, setCreatedTransaction] =
    useState<Transaction | null>(null);

  const createTransactionForm = useForm<z.infer<typeof baseTransactionSchema>>({
    resolver: zodResolver(baseTransactionSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      currency: "EUR",
      user: userId,
      users: null,
    },
  });

  const completeTransactionForm = useForm<
    z.infer<typeof additionalTransactionSchema>
  >({
    resolver: zodResolver(additionalTransactionSchema),
    defaultValues: {
      category: null,
      place: null,
      days: 1,
      departureDate: null,
    },
  });

  const onSubmitCreateTransaction = (
    values: z.infer<typeof baseTransactionSchema>,
  ) => {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      ...values,
      description: values.description ?? null,
      travel: travel.id,
      createdAt: new Date(),

      category: null,
      place: null,
      days: null,
    };

    transactionsCollection.insert(transaction);

    createTransactionForm.reset();
    setCreatedTransaction(transaction);
  };

  const onSubmitCompleteTransaction = (
    values: z.infer<typeof additionalTransactionSchema>,
  ) => {
    if (!createdTransaction) return;

    transactionsCollection.update(createdTransaction.id, (transaction) => {
      Object.assign(transaction, values);

      if (values.departureDate) {
        transaction.days =
          Math.ceil(
            dayjs(values.departureDate).diff(
              dayjs(createdTransaction.date),
              "day",
              true,
            ),
          ) + (transaction.type === "accommodation" ? 0 : 1);
      } else {
        transaction.days = 1;
      }
    });

    closeDrawer();
    openDrawer(createdTransaction.id);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    createTransactionForm.reset();
    completeTransactionForm.reset();
    setCreatedTransaction(null);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} onClose={closeDrawer}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="px-6 overflow-y-auto py-5">
          <div className="flex justify-between">
            <div>
              <DrawerTitle className="font-semibold text-lg text-foreground">
                Add a transaction
              </DrawerTitle>
              <DrawerDescription>
                Add a transaction to your travel.
              </DrawerDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={closeDrawer}>
              <X className="size-5" />
            </Button>
          </div>

          {createdTransaction === null ? (
            <Form {...createTransactionForm}>
              <form
                onSubmit={createTransactionForm.handleSubmit(
                  onSubmitCreateTransaction,
                )}
                className="space-y-4 mt-5"
              >
                <TransactionBaseForm travel={travel} />

                <div className="h-px bg-border" />

                <Button type="submit" className="w-full" size="lg">
                  Save transaction
                  <CheckCircle className="size-4" />
                </Button>
              </form>
            </Form>
          ) : (
            <div>
              <div className="h-px bg-border mt-4" />
              <TransactionHeader transaction={createdTransaction} />
              <div className="h-px bg-border" />
              <Form {...completeTransactionForm}>
                <form
                  onSubmit={completeTransactionForm.handleSubmit(
                    onSubmitCompleteTransaction,
                  )}
                  className="space-y-4 mt-6"
                >
                  <TransactionAdditionalForm
                    travel={travel}
                    transactionType={createdTransaction.type}
                    transactionDate={createdTransaction.date}
                  />

                  <div className="h-px bg-border mt-6" />

                  <Button type="submit" className="w-full" size="lg">
                    Complete transaction
                  </Button>
                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    variant="secondary"
                    onClick={closeDrawer}
                  >
                    Skip
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
