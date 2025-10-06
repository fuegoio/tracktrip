import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CheckCircle, Plus, X } from "lucide-react";
import type { Travel } from "@/data/travels";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import { transactionsCollection } from "@/store/collections";
import type { Transaction } from "@/data/transactions";
import { TransactionBaseForm } from "./transaction-base-form";
import { TransactionAdditionalForm } from "./transaction-additional-form";
import { TransactionHeader } from "./transaction-header";
import {
  additionalTransactionSchema,
  baseTransactionSchema,
} from "./transaction-schemas";

export const NewTransactionDrawer = ({
  travel,
  userId,
  children,
}: {
  travel: Travel;
  userId: string;
  children?: React.ReactNode;
}) => {
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
    },
  });

  const completeTransactionForm = useForm<
    z.infer<typeof additionalTransactionSchema>
  >({
    resolver: zodResolver(additionalTransactionSchema),
  });

  const onSubmitCreateTransaction = (
    values: z.infer<typeof baseTransactionSchema>,
  ) => {
    const transaction = {
      id: crypto.randomUUID(),
      ...values,
      description: values.description ?? null,
      travel: travel.id,
      createdAt: new Date(),

      category: null,
      place: null,
      days: null,
      meals: null,
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
      transaction.category = values.category ?? null;
      transaction.place = values.place ?? null;
      transaction.days = values.days ?? null;
      transaction.meals = values.meals ?? null;
    });

    setIsOpen(false);
    completeTransactionForm.reset();
    setCreatedTransaction(null);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    createTransactionForm.reset();
    completeTransactionForm.reset();
    setCreatedTransaction(null);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} onClose={closeDrawer}>
      <DrawerTrigger asChild>
        {children ?? (
          <Button size="icon" variant="ghost">
            <Plus className="size-5" />
          </Button>
        )}
      </DrawerTrigger>
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
                className="space-y-4 mt-6"
              >
                <TransactionBaseForm
                  travel={travel}
                  form={createTransactionForm}
                />

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
                    transaction={createdTransaction}
                    form={completeTransactionForm}
                  />

                  <div className="h-px bg-border" />

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
