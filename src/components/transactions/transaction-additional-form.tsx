import type { Travel } from "@/data/travels";

import { useForm } from "react-hook-form";
import z from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlacesInput } from "../places/places-input";
import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { categoriesCollection } from "@/store/collections";
import type { Transaction } from "@/data/transactions";
import type { additionalTransactionSchema } from "./transaction-schemas";

export const TransactionAdditionalForm = ({
  travel,
  form,
  transaction,
}: {
  travel: Travel;
  form: ReturnType<typeof useForm<z.infer<typeof additionalTransactionSchema>>>;
  transaction: Transaction;
}) => {
  const { data: categories } = useLiveQuery(
    (q) =>
      q
        .from({ categories: categoriesCollection })
        .where(({ categories }) =>
          and(
            eq(categories.travel, travel.id),
            eq(categories.type, transaction.type),
          ),
        ),
    [transaction.type],
  );

  return (
    <>
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl className="w-full">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.emoji}{" "}
                    <span className="capitalize">{category.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="place"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Place</FormLabel>
            <FormControl>
              <PlacesInput {...field} travelId={travel.id} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
