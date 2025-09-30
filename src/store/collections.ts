import { createCollection } from "@tanstack/react-db";
import { trpcCollectionOptions } from "trpc-db-collection";
import { trpcClient } from "@/trpc/client";
import type { Travel } from "@/data/travels";
import type { Transaction } from "@/data/transactions";
import type { Category } from "@/data/categories";
import type { Budget } from "@/data/budgets";
import type { Place } from "@/data/places";

export const transactionsCollection = createCollection(
  trpcCollectionOptions<Transaction>({
    name: "transactions",
    trpcRouter: trpcClient.transactions,
  }),
);

export const categoriesCollection = createCollection(
  trpcCollectionOptions<Category>({
    name: "categories",
    trpcRouter: trpcClient.categories,
  }),
);

export const travelsCollection = createCollection(
  trpcCollectionOptions<Travel>({
    name: "travels",
    trpcRouter: trpcClient.travels,
  }),
);

export const budgetsCollection = createCollection(
  trpcCollectionOptions<Budget>({
    name: "budgets",
    trpcRouter: trpcClient.budgets,
  }),
);

export const placesCollection = createCollection(
  trpcCollectionOptions<Place>({
    name: "places",
    trpcRouter: trpcClient.places,
  }),
);
