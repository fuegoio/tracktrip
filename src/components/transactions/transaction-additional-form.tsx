import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { and, eq, useLiveQuery } from "@tanstack/react-db";
import dayjs from "dayjs";
import { CalendarIcon, Minus, Plus } from "lucide-react";
import z from "zod";

import { PlacesInput } from "../places/places-input";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import type { additionalTransactionSchema } from "./transaction-schemas";
import type { CategoryType } from "@/data/categories";
import type { Travel } from "@/data/travels";

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
import { categoriesCollection } from "@/store/collections";

export const TransactionAdditionalForm = ({
  travel,
  transactionType,
}: {
  travel: Travel;
  transactionType: CategoryType;
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const form = useFormContext<z.infer<typeof additionalTransactionSchema>>();

  const { data: categories } = useLiveQuery(
    (q) =>
      q
        .from({ categories: categoriesCollection })
        .where(({ categories }) =>
          and(
            eq(categories.travel, travel.id),
            eq(categories.type, transactionType),
          ),
        ),
    [transactionType],
  );

  return (
    <>
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(value ?? null)}
              value={field.value ?? ""}
            >
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

      {["accommodation", "transport", "activity"].includes(transactionType) && (
        <>
          <FormField
            control={form.control}
            name="activationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of the {transactionType}</FormLabel>
                <FormControl>
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="secondary"
                        data-empty={!field.value}
                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal rounded-md h-10"
                      >
                        <CalendarIcon />
                        {field.value ? (
                          dayjs(field.value).format("LL")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        timeZone="UTC"
                        selected={field.value ?? undefined}
                        onSelect={(date) => {
                          field.onChange(date ?? null);
                          setIsDatePickerOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="days"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Days of the {transactionType}</FormLabel>
                <FormControl>
                  <ButtonGroup className="w-full">
                    <Button
                      variant="secondary"
                      className="h-10 shadow-none"
                      type="button"
                      onClick={() => field.onChange((field.value ?? 1) - 1)}
                    >
                      <Minus />
                    </Button>
                    <Input
                      {...field}
                      value={field.value ?? "1"}
                      className="text-center border-r-0"
                    />
                    <Button
                      variant="secondary"
                      className="h-10 shadow-none"
                      type="button"
                      onClick={() => field.onChange((field.value ?? 1) + 1)}
                    >
                      <Plus />
                    </Button>
                  </ButtonGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
};
