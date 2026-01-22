import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { X } from "lucide-react";
import z from "zod";

import { TransactionAdditionalForm } from "./transaction-additional-form";
import { TransactionBaseForm } from "./transaction-base-form";
import {
  additionalTransactionSchema,
  baseTransactionSchema,
} from "./transaction-schemas";

import type { Transaction } from "@/data/transactions";
import type { Travel } from "@/data/travels";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Form } from "@/components/ui/form";
import { transactionsCollection } from "@/store/collections";

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
      days: ["accommodation", "transportation"].includes(transaction.type)
        ? 1
        : transaction.days,
      departureDate: dayjs(transaction.date)
        .add(
          (transaction.days ?? 1) -
            (transaction.type === "accommodation" ? 0 : 1),
          "day",
        )
        .toDate(),
    },
  });

  const { isDirty } = editTransactionForm.formState;

  const onSubmitEditTransaction = (values: z.infer<typeof formSchema>) => {
    if (isDirty) {
      transactionsCollection.update(transaction.id, (transaction) => {
        Object.assign(transaction, values);

        if (values.departureDate) {
          transaction.days =
            Math.ceil(
              dayjs(values.departureDate).diff(dayjs(values.date), "day", true),
            ) + (transaction.type === "accommodation" ? 0 : 1);
        } else {
          transaction.days = 1;
        }

        editTransactionForm.reset({
          ...transaction,
          users: values.users,
        });
      });
    }

    setIsOpen(false);
  };

  const transactionType = editTransactionForm.watch("type");

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
              <TransactionBaseForm
                travel={travel}
                onTypeChange={() => {
                  editTransactionForm.setValue("category", null, {
                    shouldDirty: true,
                  });
                }}
              />

              <div className="h-px bg-border" />

              <TransactionAdditionalForm
                travel={travel}
                transactionType={transactionType}
                transactionDate={editTransactionForm.watch("date")}
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
