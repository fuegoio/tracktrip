import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ArrowLeft, CheckCircle, Plus } from "lucide-react";
import type { Travel } from "@/data/travels";

import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoriesCollection,
  transactionsCollection,
} from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { AmountInput } from "../ui/amount-input";

const formSchema = z.object({
  title: z.string("Name is required.").min(1, "Name is required."),
  description: z.string().optional(),
  date: z.date(),
  user: z.string(),
  amount: z.coerce
    .number<number>("Number is required")
    .positive("Amount must be positive."),
  currency: z.string(),
  place: z.string().optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  days: z.number(),
});

export const NewTransactionDrawer = ({
  travel,
  userId,
  children,
}: {
  travel: Travel;
  userId: string;
  children?: React.ReactNode;
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      currency: "EUR",
      days: 1,
      user: userId,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    transactionsCollection.insert({
      id: crypto.randomUUID(),
      ...values,
      travel: travel.id,
      description: values.description ?? null,
      place: values.place ?? null,
    });

    form.reset();
  };

  const { data: categories } = useLiveQuery((q) =>
    q
      .from({ categories: categoriesCollection })
      .where(({ categories }) => eq(categories.travel, travel.id)),
  );

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {children ?? (
          <Button size="icon">
            <Plus className="size-5" />
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-6 overflow-y-auto py-5">
          <div className="flex items-center gap-2">
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </DrawerClose>
            <DrawerTitle className="font-semibold text-lg text-foreground">
              Add a transaction
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Add a transaction to your travel.
            </DrawerDescription>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Restaurant"
                        {...field}
                        className="h-10"
                      />
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
                      <span className="text-sm text-muted-foreground">
                        Optional
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="A great place"
                        {...field}
                        className="h-10"
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                name="user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Who paid</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {travel.users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
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
                    <FormLabel>Date</FormLabel>
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
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
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

              <div className="h-px bg-border" />

              <Button type="submit" className="w-full" size="lg">
                Save transaction
                <CheckCircle className="size-4" />
              </Button>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
