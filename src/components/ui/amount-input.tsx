import { useState } from "react";
import { Check, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AmountInput({
  amountDefaultValue,
  currencyDefaultValue,
  onAmountChange,
  onCurrencyChange,
}: {
  amountDefaultValue?: number;
  currencyDefaultValue: string;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState(currencyDefaultValue);
  const [amount, setAmount] = useState(amountDefaultValue?.toString() ?? "");

  const supportedCurrencyCodes = Intl.supportedValuesOf("currency");
  const supportedCurrencies = supportedCurrencyCodes.map((code) => {
    // Try to get the currency symbol
    let symbol = "";
    try {
      symbol =
        new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: code,
        })
          .formatToParts(1)
          .find((part) => part.type === "currency")?.value || code;
    } catch (e) {
      symbol = code;
    }

    return {
      value: code,
      label: code,
      symbol: symbol,
    };
  });
  const selectedCurrency = supportedCurrencies.find(
    (c) => c.value === currency,
  );

  return (
    <div
      className={cn(
        "flex items-center rounded-md border border-transparent focus-within:border-ring bg-input/50 focus-within:bg-background ring-offset-background transition-colors focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2 h-10",
      )}
    >
      <span className="pl-3 pr-1 text-muted-foreground text-sm">
        {selectedCurrency?.symbol}
      </span>
      <input
        type="text"
        placeholder="12.99"
        inputMode="decimal"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value.replace(/[^\d.]/g, ""));
          onAmountChange(parseFloat(e.target.value.replace(/[^\d.]/g, "")));
        }}
        className="flex-1 text-sm bg-transparent py-1 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 px-3 focus:outline-none"
          >
            <span className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              {selectedCurrency?.label}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-0">
          <Command>
            <CommandInput placeholder="Search currency..." />
            <CommandList>
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandGroup>
                {supportedCurrencies.map((c) => (
                  <CommandItem
                    key={c.value}
                    value={c.value}
                    onSelect={(val) => {
                      setCurrency(val);
                      onCurrencyChange(val);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        currency === c.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {c.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
