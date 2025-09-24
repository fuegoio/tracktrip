import { createCollection } from "@tanstack/react-db";
import { localStorageCollectionOptions } from "@tanstack/react-db";
import { budgetsSchema } from "./schemas";
import { trpcCollectionOptions } from "trpc-db-collection";
import { trpc } from "@/trpc/client";
import type { Travel } from "@/data/travels";
import type { Transaction } from "@/data/transactions";
import type { Category } from "@/data/categories";

export const transactionsCollection = createCollection(
  trpcCollectionOptions<Transaction>({
    trpcRouter: trpc.transactions,
  }),
);

export const categoriesCollection = createCollection(
  trpcCollectionOptions<Category>({
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
