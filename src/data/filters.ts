import type { CategoryType } from "./categories";

export const FilterFields = ["type"] as const;

export type FilterField = (typeof FilterFields)[number];

export type UnknownFilter = {
  field: undefined;
  value: undefined;
};

export type TransactionTypeFilter = {
  field: "type";
  value: CategoryType | undefined;
};

export type Filter = UnknownFilter | TransactionTypeFilter;
