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
import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { AmountInput } from "../ui/amount-input";
import { CategoryTypes, categoryTypeToEmoji } from "@/data/categories";
import type { Transaction } from "@/data/transactions";
import { CategoryTypeBadge } from "../category-type-badge";
import dayjs from "dayjs";
import { PlacesInput } from "../places/places-input";

const createTransactionSchema = z.object({
  title: z.string("Name is required.").min(1, "Name is required."),
  description: z.string().optional(),
  date: z.date(),
  user: z.string(),
  amount: z.coerce
    .number<number>("Amount is required")
    .positive("Amount must be positive."),
  currency: z.string(),
  type: z.enum(CategoryTypes, "Type is required."),
});

const completeTransactionSchema = z.object({
  category: z.string().optional(),
  place: z.string().optional(),
  days: z.number().optional(),
  meals: z.number().optional(),
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
  const [isOpen, setIsOpen] = useState(false);
  const [createdTransaction, setCreatedTransaction] =
    useState<Transaction | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const createTransactionForm = useForm<
    z.infer<typeof createTransactionSchema>
  >({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      currency: "EUR",
      user: userId,
    },
  });

  const completeTransactionForm = useForm<
    z.infer<typeof completeTransactionSchema>
  >({
    resolver: zodResolver(completeTransactionSchema),
  });

  const onSubmitCreateTransaction = (
    values: z.infer<typeof createTransactionSchema>,
  ) => {
    const transaction = {
      id: crypto.randomUUID(),
      ...values,
      travel: travel.id,
      description: values.description ?? null,
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
    values: z.infer<typeof completeTransactionSchema>,
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

  const { data: categories } = useLiveQuery(
    (q) =>
      q
        .from({ categories: categoriesCollection })
        .where(({ categories }) =>
          and(
            eq(categories.travel, travel.id),
            eq(categories.type, createdTransaction?.type),
          ),
        ),
    [createdTransaction],
  );

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setIsOpen}
      onClose={() => {
        createTransactionForm.reset();
        completeTransactionForm.reset();
        setCreatedTransaction(null);
      }}
    >
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

          {createdTransaction === null ? (
            <Form {...createTransactionForm}>
              <form
                onSubmit={createTransactionForm.handleSubmit(
                  onSubmitCreateTransaction,
                )}
                className="space-y-4 mt-6"
              >
                <FormField
                  control={createTransactionForm.control}
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
                  control={createTransactionForm.control}
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
                  control={createTransactionForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <AmountInput
                          amountDefaultValue={field.value}
                          onAmountChange={field.onChange}
                          currencyDefaultValue={createTransactionForm.getValues(
                            "currency",
                          )}
                          onCurrencyChange={(currency) =>
                            createTransactionForm.setValue("currency", currency)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createTransactionForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
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
                  control={createTransactionForm.control}
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
                  control={createTransactionForm.control}
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
          ) : (
            <div>
              <div className="flex flex-col w-full justify-center items-center py-6 gap-1">
                <CategoryTypeBadge
                  categoryType={createdTransaction.type}
                  className="size-16 text-3xl"
                />
                <div className="text-center">
                  <div className="text-lg font-medium">
                    {createdTransaction.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dayjs(createdTransaction.date).format("DD/MM/YYYY")}
                  </div>
                </div>
                <div className="font-mono">
                  {createdTransaction.amount.toLocaleString(undefined, {
                    style: "currency",
                    currency: createdTransaction.currency,
                  })}
                </div>
              </div>
              <div className="h-px bg-border" />
              <Form {...completeTransactionForm}>
                <form
                  onSubmit={completeTransactionForm.handleSubmit(
                    onSubmitCompleteTransaction,
                  )}
                  className="space-y-4 mt-6"
                >
                  <FormField
                    control={completeTransactionForm.control}
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
                                <span className="capitalize">
                                  {category.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={completeTransactionForm.control}
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

                  <div className="h-px bg-border" />

                  <Button type="submit" className="w-full" size="lg">
                    Complete transaction
                  </Button>
                  <DrawerClose asChild>
                    <Button
                      type="button"
                      className="w-full"
                      size="lg"
                      variant="secondary"
                    >
                      Skip
                    </Button>
                  </DrawerClose>
                </form>
              </Form>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
