import { createCollection } from "@tanstack/react-db";
import { localStorageCollectionOptions } from "@tanstack/react-db";
import {
  budgetsSchema,
  categoriesSchema,
  subcategoriesSchema,
  transactionsSchema,
  travelsSchema,
  usersSchema,
} from "./schemas";

export const transactionsCollection = createCollection(
  localStorageCollectionOptions({
    id: "transactions",
    storageKey: "transactions",
    getKey: (item) => item.id,
    schema: transactionsSchema,
  }),
);

export const usersCollection = createCollection(
  localStorageCollectionOptions({
    id: "users",
    storageKey: "users",
    getKey: (item) => item.id,
    schema: usersSchema,
  }),
);

export const categoriesCollection = createCollection(
  localStorageCollectionOptions({
    id: "categories",
    storageKey: "categories",
    getKey: (item) => item.id,
    schema: categoriesSchema,
  }),
);

export const subcategoriesCollection = createCollection(
  localStorageCollectionOptions({
    id: "subcategories",
    storageKey: "subcategories",
    getKey: (item) => item.id,
    schema: subcategoriesSchema,
  }),
);

export const travelsCollection = createCollection(
  localStorageCollectionOptions({
    id: "travels",
    storageKey: "travels",
    getKey: (item) => item.id,
    schema: travelsSchema,
  }),
);

export const budgetsCollection = createCollection(
  localStorageCollectionOptions({
    id: "budgets",
    storageKey: "budgets",
    getKey: (item) => item.id,
    schema: budgetsSchema,
  }),
);
