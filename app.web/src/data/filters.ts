import type { CategoryType } from "./categories";

export const FilterFields = ["type", "category"] as const;

export type FilterField = (typeof FilterFields)[number];

export type UnknownFilter = {
  field: undefined;
  value: undefined;
};

export type TransactionTypeFilter = {
  field: "type";
  value: CategoryType | undefined;
};

export type TransactionCategoryFilter = {
  field: "category";
  value: string | undefined | null; // category ID
};

export type Filter =
  | UnknownFilter
  | TransactionTypeFilter
  | TransactionCategoryFilter;
