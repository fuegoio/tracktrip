import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";

import type { Transaction } from "@/data/transactions";
import type { CurrencyRate } from "@/data/travels";

import { ScreenDrawer } from "@/components/layout/screen-drawer";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { useTravel } from "@/lib/params";
import { travelsCollection, transactionsCollection } from "@/store/collections";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/travels/$travelId/currencies/",
)({
  component: CurrenciesPage,
});

// Define validation schema for currency rates
const currencyRatesSchema = z.object({
  rates: z.record(
    z.string(), // currency code
    z.object({
      rate: z.number().min(0.0001, "Rate must be greater than 0"),
    }),
  ),
});

type CurrencyRatesFormValues = z.infer<typeof currencyRatesSchema>;

function CurrenciesPage() {
  const params = Route.useParams();
  const travel = useTravel({ id: params.travelId });

  const { data: transactions } = useLiveQuery((q) =>
    q
      .from({ transactions: transactionsCollection })
      .where(({ transactions }) => eq(transactions.travel, params.travelId)),
  );

  // Group transactions by currency
  const transactionsByCurrency = transactions.reduce(
    (acc, transaction) => {
      const currency = transaction.currency;
      if (!acc[currency]) {
        acc[currency] = [];
      }
      acc[currency].push(transaction);
      return acc;
    },
    {} as Record<string, Transaction[]>,
  );

  // Calculate totals for each currency
  const currencyTotals = Object.entries(transactionsByCurrency).map(
    ([currency, transactions]) => {
      const total = transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      );
      return { currency, total, count: transactions.length };
    },
  );

  // Sort by total amount (descending)
  currencyTotals.sort((a, b) => b.total - a.total);

  const { register, handleSubmit, watch } = useForm<CurrencyRatesFormValues>({
    resolver: zodResolver(currencyRatesSchema),
    defaultValues: {
      rates: currencyTotals.reduce(
        (acc, { currency }) => {
          // Find existing rate for this currency
          const existingRate = travel.currencyRates?.find(
            (r) => r.currency === currency,
          );
          acc[currency] = { rate: existingRate ? existingRate.rate : 1 };
          return acc;
        },
        {} as Record<string, { rate: number }>,
      ),
    },
  });

  const onSubmit = async (data: CurrencyRatesFormValues) => {
    try {
      // Convert form data to the expected CurrencyRate[] format
      const updatedRates: CurrencyRate[] = Object.entries(data.rates).map(
        ([currency, { rate }]) => ({
          currency,
          rate,
        }),
      );

      // Update travel with new rates
      travelsCollection.update(params.travelId, (travel) => {
        travel.currencyRates = updatedRates;
      });

      toast.success("Currency rates successfully saved.");
    } catch (error) {
      console.error("Failed to save currency rates:", error);
      toast.error("Failed to save currency rates");
    }
  };

  const getCurrencyRate = (currency: string) => {
    const value = watch(`rates.${currency}.rate`);
    if (value === null || value === undefined || isNaN(value)) return 1;
    return value;
  };

  if (currencyTotals.length === 0) {
    return (
      <>
        <ScreenHeader>
          <div className="font-semibold text-xl text-foreground">
            Currencies
          </div>
          <div className="mt-1 text-muted-foreground text-sm">
            Manage conversion rates between currencies.
          </div>

          <div className="my-4 relative z-0">
            <div className="relative z-10 from-card bg-gradient-to-r to-transparent from-50% to-100% h-full py-4">
              <div className="text-subtle-foreground text-sm">
                Travel currency
              </div>
              <div className="text-xl text-foreground font-mono mt-1">
                {travel.currency}
              </div>
            </div>
          </div>
        </ScreenHeader>

        <ScreenDrawer>
          <p className="text-sm text-muted-foreground text-center py-4">
            No transactions found for this travel.
          </p>
        </ScreenDrawer>
      </>
    );
  }

  return (
    <>
      <ScreenHeader>
        <div className="font-semibold text-xl text-foreground">Currencies</div>
        <div className="mt-1 text-muted-foreground text-sm">
          Manage conversion rates between currencies.
        </div>

        <div className="my-4 relative z-0">
          <div className="relative z-10 from-card bg-gradient-to-r to-transparent from-50% to-100% h-full py-4">
            <div className="text-subtle-foreground text-sm">
              Travel currency
            </div>
            <div className="text-xl text-foreground font-mono mt-1">
              {travel.currency}
            </div>
          </div>
        </div>
      </ScreenHeader>

      <ScreenDrawer>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-3">
          {/* Currency Rate Rows */}
          <div>
            {currencyTotals.map(({ currency, total, count }) => {
              const isBaseCurrency = currency === travel.currency;
              const rate = getCurrencyRate(currency);
              const convertedTotal = total / rate;

              return (
                <div key={currency} className="space-y-2 border-b py-4">
                  <div className="flex items-center gap-2 justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">{currency}</div>
                        {isBaseCurrency && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Base
                          </span>
                        )}
                      </div>
                      <div className="text-subtle-foreground text-xs">
                        {count} transaction{count > 1 ? "s" : ""} •{" "}
                        {total.toLocaleString(undefined, {
                          style: "currency",
                          currency: currency,
                        })}
                        {isBaseCurrency ? null : (
                          <>
                            <ArrowRight className="inline size-3 mx-1" />
                            {convertedTotal.toLocaleString(undefined, {
                              style: "currency",
                              currency: travel.currency,
                            })}
                          </>
                        )}
                      </div>
                    </div>

                    {!isBaseCurrency && (
                      <InputGroup className="w-44">
                        <InputGroupInput
                          placeholder="1"
                          step="0.0001"
                          {...register(`rates.${currency}.rate` as const, {
                            valueAsNumber: true,
                          })}
                        />

                        <InputGroupAddon align="inline-end">
                          <InputGroupText>
                            {currency} → 1 {travel.currency}
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button type="submit" className="w-full">
            Save currency rates
          </Button>
        </form>
      </ScreenDrawer>
    </>
  );
}

