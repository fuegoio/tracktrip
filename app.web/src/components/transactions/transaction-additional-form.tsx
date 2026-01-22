import { useEffect, useState } from "react";
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
  transactionDate,
}: {
  travel: Travel;
  transactionType: CategoryType;
  transactionDate: Date;
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

  useEffect(() => {
    const departureDate = form.getValues("departureDate");
    if (departureDate && departureDate < transactionDate) {
      form.setValue("departureDate", null, {
        shouldDirty: true,
      });
    }
  }, [transactionDate, form]);

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

      {(transactionType === "accommodation" ||
        transactionType === "transport") && (
        <FormField
          control={form.control}
          name="departureDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {transactionType === "accommodation" && "Day of departure"}
                {transactionType === "transport" &&
                  "Last day at the destination"}
              </FormLabel>
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
                      disabled={(date) =>
                        date < travel.startDate ||
                        date > travel.endDate ||
                        date <= transactionDate
                      }
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {["activity", "food", "other"].includes(transactionType) && (
        <FormField
          control={form.control}
          name="days"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Number of days for this expense</FormLabel>
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
      )}
    </>
  );
};
