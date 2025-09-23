import { createCollection } from "@tanstack/react-db";
import { localStorageCollectionOptions } from "@tanstack/react-db";
import { budgetsSchema, transactionsSchema } from "./schemas";
import { trpcCollectionOptions } from "trpc-db-collection";
import { trpc } from "@/trpc/client";
import type { Travel } from "@/data/travels";

export const transactionsCollection = createCollection(
  localStorageCollectionOptions({
    id: "transactions",
    storageKey: "transactions",
    getKey: (item) => item.id,
    schema: transactionsSchema,
  }),
);

export const categoriesCollection = createCollection(
  trpcCollectionOptions({
    trpcRouter: trpc.categories,
  }),
);

export const travelsCollection = createCollection(
  trpcCollectionOptions<Travel>({
    trpcRouter: trpc.travels,
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
