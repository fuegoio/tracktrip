import { FilterFields, type Filter, type FilterField } from "@/data/filters";
import { ButtonGroup } from "../ui/button-group";
import { Button } from "../ui/button";
import { CategoryTypes, categoryTypeToEmoji } from "@/data/categories";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { SelectTrigger } from "@radix-ui/react-select";

export const TransactionFilter = ({
  filter,
  onChange,
  onDelete,
}: {
  filter: Filter;
  onChange: (filter: Filter) => void;
  onDelete: () => void;
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
              <SelectItem key={field} value={field}>
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
                {categoryTypeToEmoji[filter.value]}{" "}
                <span className="capitalize">{filter.value}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
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
