import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ArrowLeft, X } from "lucide-react";
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
import {
  additionalTransactionSchema,
  baseTransactionSchema,
} from "./transaction-schemas";

const formSchema = z.object({
  ...baseTransactionSchema.shape,
  ...additionalTransactionSchema.shape,
});

export const EditTransactionDrawer = ({
  travel,
  transaction,
  children,
}: {
  travel: Travel;
  transaction: Transaction;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const editTransactionForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...transaction,
      description: transaction.description ?? "",
      category: transaction.category ?? undefined,
      place: transaction.place ?? undefined,
      days: transaction.days ?? undefined,
      meals: transaction.meals ?? undefined,
    },
  });

  const onSubmitEditTransaction = (values: z.infer<typeof formSchema>) => {
    if (editTransactionForm.formState.isDirty) {
      transactionsCollection.update(transaction.id, (transaction) => {
        Object.assign(transaction, values);

        editTransactionForm.reset({
          ...transaction,
          description: transaction.description ?? "",
          category: transaction.category ?? undefined,
          place: transaction.place ?? undefined,
          days: transaction.days ?? undefined,
          meals: transaction.meals ?? undefined,
        });
      });
    }

    setIsOpen(false);
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setIsOpen}
      onClose={() => {
        editTransactionForm.reset();
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="px-6 overflow-y-auto py-5">
          <div className="flex justify-between">
            <div>
              <DrawerTitle className="font-semibold text-lg text-foreground">
                Edit a transaction
              </DrawerTitle>
              <DrawerDescription>
                Edit the transaction {transaction.title}.
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="size-5" />
              </Button>
            </DrawerClose>
          </div>

          <Form {...editTransactionForm}>
            <form
              onSubmit={editTransactionForm.handleSubmit(
                onSubmitEditTransaction,
              )}
              className="space-y-4 mt-6"
            >
              <TransactionBaseForm travel={travel} form={editTransactionForm} />

              <div className="h-px bg-border" />

              <TransactionAdditionalForm
                travel={travel}
                transaction={transaction}
                form={editTransactionForm}
              />

              <div className="h-px bg-border" />

              <Button type="submit" className="w-full" size="lg">
                Save transaction
              </Button>
              <DrawerClose asChild>
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
