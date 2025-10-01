import { Check, ChevronsUpDown, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
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
import { useEffect, useState } from "react";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { placesCollection } from "@/store/collections";

export function PlacesInput({
  id,
  travelId,
  onChange,
  value: externalValue,
  defaultValue,
}: {
  id?: string;
  travelId: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(externalValue || defaultValue || "");
  const [query, setQuery] = useState("");

  const { data: places } = useLiveQuery((q) =>
    q
      .from({ places: placesCollection })
      .where(({ places }) => eq(places.travel, travelId)),
  );

  const createPlace = () => {
    const place = {
      id: crypto.randomUUID(),
      name: query,
      travel: travelId,
    };
    placesCollection.insert(place);

    setValue(place.id);
    setOpen(false);
    setQuery("");
    if (onChange) onChange(place.id);
  };

  useEffect(() => {
    setValue(externalValue ?? "");
  }, [externalValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start h-10 font-normal"
        >
          <MapPin className="h-4 w-4" />
          {value ? (
            places.find((place) => place.id === value)?.name
          ) : (
            <span className="text-subtle-foreground">
              Select or add place...
            </span>
          )}
          <div className="flex-1" />
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end" side="top">
        <Command
          filter={(value, search) => {
            if (value.startsWith("new:")) return 1;

            const place = places.find((place) => place.id === value);
            if (place?.name.includes(search)) return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder="Select or add a place..."
            className="h-9"
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandGroup>
              {places.map((place) => (
                <CommandItem
                  key={place.id}
                  value={place.id}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue;
                    setValue(newValue);
                    setOpen(false);
                    setQuery("");
                    if (onChange) onChange(newValue);
                  }}
                >
                  {place.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === place.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
              {query && (
                <CommandItem value={`new:${query}`} onSelect={createPlace}>
                  <Plus className="h-4 w-4" />
                  Create new place: "{query}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
