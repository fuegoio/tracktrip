import type { Travel } from "@/data/travels";

export function convertCurrency(
  amount: number,
  currency: string,
  travel: Travel,
): number {
  // If currencies are the same, no conversion needed
  if (currency === travel.currency) {
    return amount;
  }

  // Find the conversion rate
  const rate = travel.currencyRates?.find((r) => r.currency === currency);

  // If no rate found, return the original amount (no conversion)
  if (!rate) {
    return amount;
  }

  // Apply the conversion rate
  return amount / rate.rate;
}

export function getCurrencySymbol(currency: string): string {
  try {
    return (
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency,
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value || currency
    );
  } catch (_error) {
    return currency;
  }
}

export function formatCurrency(
  amount: number,
  currency: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency,
    ...options,
  }).format(amount);
}
