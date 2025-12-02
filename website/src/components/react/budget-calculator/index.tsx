import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import * as z from "zod";

import { CategoryTypeBadge } from "./category-type-badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";

import { CategoryTypes, type CategoryType } from "./categories";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon, Minus, Plus } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { useState } from "react";
import { ButtonGroup } from "../ui/button-group";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

// Define validation schema
const budgetSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  currency: z.string(),
  travellers: z.number().min(1, "At least one traveller is required"),
  budgets: z.record(
    z.enum(CategoryTypes),
    z.object({
      amount: z
        .number()
        .min(0, "Amount must be positive")
        .nullable()
        .optional(),
    }),
  ),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export const BudgetCalculator = () => {
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  const { watch, register, setValue } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: dayjs().add(1, "week").toDate(),
      currency: "EUR",
      travellers: 1,
      budgets: CategoryTypes.reduce(
        (acc, categoryType) => {
          acc[categoryType] = { amount: null };
          return acc;
        },
        {} as Record<CategoryType, { amount: number | null }>,
      ),
    },
  });

  const totalBudget = Object.values(watch("budgets")).reduce(
    (sum, { amount }) => sum + (amount || 0),
    0,
  );

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const currency = watch("currency");
  const travellers = watch("travellers");

  const travelDurationInDays = dayjs(endDate).diff(dayjs(startDate), "day");
  const totalForecast = totalBudget * travelDurationInDays;

  const getTypeValue = (type: CategoryType) => {
    const value = watch(`budgets.${type}.amount`);
    if (value === null || value === undefined || isNaN(value)) return undefined;
    return value;
  };

  return (
    <form className="space-y-6 w-full">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Travel details</FieldLegend>
          <FieldDescription>
            Set the dates of your travel and the number of travellers.
          </FieldDescription>

          <FieldGroup className="sm:flex-row">
            <Field>
              <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                Start date of your trip
              </FieldLabel>
              <Popover
                open={isStartDatePickerOpen}
                onOpenChange={setIsStartDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    data-empty={!startDate}
                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal rounded-md h-10"
                  >
                    <CalendarIcon />
                    {startDate ? (
                      dayjs(startDate).format("MMM D, YYYY")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (!date) return;
                      setValue("startDate", date);
                      setIsStartDatePickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                End date of your trip
              </FieldLabel>
              <Popover
                open={isEndDatePickerOpen}
                onOpenChange={setIsEndDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    data-empty={!endDate}
                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal rounded-md h-10"
                  >
                    <CalendarIcon />
                    {endDate ? (
                      dayjs(endDate).format("MMM D, YYYY")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (!date) return;
                      setValue("endDate", date);
                      setIsEndDatePickerOpen(false);
                    }}
                    disabled={(date) => date < startDate}
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </FieldGroup>

          <Field>
            <FieldLabel htmlFor="checkout-7j9-card-name-43j">
              Number of travellers
            </FieldLabel>
            <ButtonGroup className="w-full">
              <Button
                variant="secondary"
                className="h-10 shadow-none"
                type="button"
                onClick={() => setValue("travellers", (travellers ?? 1) - 1)}
              >
                <Minus />
              </Button>
              <Input
                className="text-center border-r-0"
                {...register(`travellers` as const, {
                  valueAsNumber: true,
                })}
              />
              <Button
                variant="secondary"
                className="h-10 shadow-none"
                type="button"
                onClick={() => setValue("travellers", (travellers ?? 1) + 1)}
              >
                <Plus />
              </Button>
            </ButtonGroup>
          </Field>
        </FieldSet>
      </FieldGroup>

      <Separator />

      <FieldGroup className="mt-8">
        <FieldSet>
          <FieldLegend>Expense types</FieldLegend>
          <FieldDescription>
            Set a budget for each type of expense and evaluate your total
            spending.
          </FieldDescription>
          <FieldGroup>
            {/* Category Budget Rows */}
            {CategoryTypes.map((type) => {
              return (
                <div key={type} className="space-y-2 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <CategoryTypeBadge categoryType={type} />
                    <div className="flex-1">
                      <div className="font-medium text-sm capitalize">
                        {type}
                      </div>
                      <div className="text-subtle-foreground text-xs">
                        {getTypeValue(type) ? (
                          <>
                            Travel forecast:{" "}
                            <span className="font-mono">
                              {(
                                getTypeValue(type)! * travelDurationInDays
                              ).toLocaleString(undefined, {
                                style: "currency",
                                currency,
                              })}
                            </span>
                          </>
                        ) : (
                          "No budget set."
                        )}
                      </div>
                    </div>

                    <InputGroup className="w-44">
                      <InputGroupInput
                        placeholder="10"
                        step="0.01"
                        {...register(`budgets.${type}.amount` as const, {
                          valueAsNumber: true,
                        })}
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupText>{currency} / day</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </div>
              );
            })}
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      {/* Total Budget Row */}
      <div className="space-y-2 py-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <div className="font-medium">Daily budget</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="font-mono">
              {totalBudget.toLocaleString(undefined, {
                style: "currency",
                currency,
              })}{" "}
              / day
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <div className="font-medium">Travel forecast</div>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <div className="text-subtle-foreground">
              x {travelDurationInDays} days =
            </div>
            <div>
              {totalForecast.toLocaleString(undefined, {
                style: "currency",
                currency: currency,
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <div className="font-medium">Travel forecast per traveller</div>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <div className="text-subtle-foreground">/ {travellers} =</div>
            <div>
              {(totalForecast / travellers).toLocaleString(undefined, {
                style: "currency",
                currency,
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
