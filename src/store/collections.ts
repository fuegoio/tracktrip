import { createCollection } from "@tanstack/react-db";
import { trpcCollectionOptions } from "trpc-db-collection";
import { trpcClient } from "@/trpc/client";
import type { Travel } from "@/data/travels";
import type { Transaction } from "@/data/transactions";
import type { Category } from "@/data/categories";
import type { Budget } from "@/data/budgets";
import type { Place } from "@/data/places";
import SuperJSON from "superjson";

export const transactionsCollection = createCollection(
  trpcCollectionOptions<Transaction>({
    name: "transactions",
    trpcRouter: trpcClient.transactions,
    localStorage: true,
    serializer: SuperJSON,
  }),
);

export const categoriesCollection = createCollection(
  trpcCollectionOptions<Category>({
    name: "categories",
    trpcRouter: trpcClient.categories,
    localStorage: true,
    serializer: SuperJSON,
  }),
);

export const travelsCollection = createCollection(
  trpcCollectionOptions<Travel>({
    name: "travels",
    trpcRouter: trpcClient.travels,
    localStorage: true,
    serializer: SuperJSON,
  }),
);

export const budgetsCollection = createCollection(
  trpcCollectionOptions<Budget>({
    name: "budgets",
    trpcRouter: trpcClient.budgets,
    localStorage: true,
    serializer: SuperJSON,
  }),
);

export const placesCollection = createCollection(
  trpcCollectionOptions<Place>({
    name: "places",
    trpcRouter: trpcClient.places,
    localStorage: true,
    serializer: SuperJSON,
  }),
);
