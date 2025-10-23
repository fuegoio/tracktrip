import { useState } from "react";
import { useFormContext } from "react-hook-form";

import dayjs from "dayjs";
import { CalendarIcon, Info } from "lucide-react";
import z from "zod";

import { AmountInput } from "../ui/amount-input";
import { UserAvatar } from "../users/user-avatar";

import { UsersDropdown } from "./users-dropdown";

import type { baseTransactionSchema } from "./transaction-schemas";
import type { Travel } from "@/data/travels";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CategoryTypes, categoryTypeToEmoji } from "@/data/categories";

export const TransactionBaseForm = ({
  travel,
  onTypeChange,
}: {
  travel: Travel;
  onTypeChange?: (type: string) => void;
}) => {
  const form = useFormContext<z.infer<typeof baseTransactionSchema>>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Restaurant" {...field} className="h-10" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="flex-1">
            <div className="flex items-center justify-between">
              <FormLabel>Description</FormLabel>
              <span className="text-muted-foreground text-xs">Optional</span>
            </div>
            <FormControl>
              <Textarea
                placeholder="A great place"
                {...field}
                value={field.value ?? ""}
                rows={2}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <AmountInput
                amountDefaultValue={field.value}
                onAmountChange={field.onChange}
                currencyDefaultValue={form.getValues("currency")}
                onCurrencyChange={(currency) =>
                  form.setValue("currency", currency)
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onTypeChange?.(value);
              }}
              value={field.value}
            >
              <FormControl className="w-full">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CategoryTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {categoryTypeToEmoji[type]}{" "}
                    <span className="capitalize">{type}</span>
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
        name="date"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Date</FormLabel>
              {["accommodation", "transport", "activity"].includes(
                form.watch("type"),
              ) && (
                <FormDescription className="flex items-center text-xs">
                  <Info className="size-3 mr-1" />
                  {form.watch("type") === "accommodation" &&
                    "The first day of your stay."}
                  {form.watch("type") === "transport" &&
                    "The day you will take the transport."}
                  {form.watch("type") === "activity" &&
                    "The day you will do the activity."}
                </FormDescription>
              )}
            </div>
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
                      <span>Pick the date it will happen</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    timeZone="UTC"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
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

      <div className="flex gap-2">
        <FormField
          control={form.control}
          name="user"
          render={({ field }) => (
            <FormItem className="flex-1 max-w-2/3">
              <FormLabel>Who paid</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl className="w-full">
                  <SelectTrigger className="min-w-0">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {travel.users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <UserAvatar user={user} className="size-5" />
                      <span className="truncate">{user.name}</span>
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
          name="users"
          render={({ field }) => (
            <FormItem className="flex-1 max-w-1/3">
              <FormLabel>For who</FormLabel>
              <UsersDropdown
                travel={travel}
                value={field.value}
                onChange={field.onChange}
              />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
