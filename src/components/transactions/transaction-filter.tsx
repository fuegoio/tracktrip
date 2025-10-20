import { useState } from "react";

import { SelectTrigger } from "@radix-ui/react-select";
import { useLiveQuery, eq } from "@tanstack/react-db";
import { X } from "lucide-react";

import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "../ui/select";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryTypes, categoryTypeToEmoji } from "@/data/categories";
import { FilterFields, type Filter, type FilterField } from "@/data/filters";
import { categoriesCollection } from "@/store/collections";

export const TransactionFilter = ({
  filter,
  onChange,
  onDelete,
  travelId,
}: {
  filter: Filter;
  onChange: (filter: Filter) => void;
  onDelete: () => void;
  travelId: string;
}) => {
  const [fieldDropdownOpen, setFieldDropdownOpen] = useState(
    filter.field === undefined,
  );
  const [valueDropdownOpen, setValueDropdownOpen] = useState(
    filter.field !== undefined && filter.value === undefined,
  );

  const onFieldSelectOpenChange = (open: boolean) => {
    setFieldDropdownOpen(open);

    if (!open) {
      setTimeout(() => {
        if (filter.field === undefined) {
          onDelete();
        }
      }, 100);
    }
  };

  const onValueSelectOpenChange = (open: boolean) => {
    if (!open) {
      if (filter.value === undefined) {
        onDelete();
      }
    }

    setValueDropdownOpen(open);
  };

  // Get categories for the current travel
  const { data: categories = [] } = useLiveQuery((q) =>
    q
      .from({ categories: categoriesCollection })
      .where(({ categories }) => eq(categories.travel, travelId)),
  );

  return (
    <ButtonGroup>
      <Select
        open={fieldDropdownOpen}
        onOpenChange={onFieldSelectOpenChange}
        onValueChange={(field: FilterField) => {
          onChange({ field, value: undefined });
          setValueDropdownOpen(true);
        }}
      >
        <SelectTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-dashed capitalize data-[placeholder]:text-muted-foreground data-[placeholder]:font-normal"
          >
            <SelectValue placeholder="Field" />
          </Button>
        </SelectTrigger>
        <SelectContent className="w-56" align="start">
          <SelectGroup>
            {FilterFields.map((field) => (
              <SelectItem key={field} value={field} className="capitalize">
                {field}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {filter.field !== undefined && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-dashed font-normal"
          >
            is
          </Button>
          <DropdownMenu
            open={valueDropdownOpen}
            onOpenChange={onValueSelectOpenChange}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-dashed font-normal"
              >
                {filter.field === "type" && filter.value && (
                  <>
                    {categoryTypeToEmoji[filter.value]}{" "}
                    <span className="capitalize">{filter.value}</span>
                  </>
                )}
                {filter.field === "category" && filter.value && (
                  <>
                    {categories.find((c) => c.id === filter.value)?.emoji}{" "}
                    <span className="capitalize">
                      {categories.find((c) => c.id === filter.value)?.name}
                    </span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {filter.field === "type" && (
                <>
                  <DropdownMenuLabel className="flex items-center gap-2">
                    Type is ...
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {CategoryTypes.map((type) => (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={filter.value === type}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onChange({
                              field: "type",
                              value: type,
                            });
                          }
                        }}
                      >
                        {categoryTypeToEmoji[type]}{" "}
                        <span className="capitalize">{type}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
              {filter.field === "category" && (
                <>
                  <DropdownMenuLabel className="flex items-center gap-2">
                    Category is ...
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuCheckboxItem
                      key="no-category"
                      checked={filter.value === null}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onChange({
                            field: "category",
                            value: null,
                          });
                        }
                      }}
                    >
                      No category
                    </DropdownMenuCheckboxItem>
                    {categories.map((category) => (
                      <DropdownMenuCheckboxItem
                        key={category.id}
                        checked={filter.value === category.id}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onChange({
                              field: "category",
                              value: category.id,
                            });
                          }
                        }}
                      >
                        {category.emoji}{" "}
                        <span className="capitalize">{category.name}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="icon"
            className="border-dashed"
            onClick={onDelete}
          >
            <X className="text-muted-foreground size-4" />
          </Button>
        </>
      )}
    </ButtonGroup>
  );
};
