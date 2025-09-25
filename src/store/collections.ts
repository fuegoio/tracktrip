import { createCollection } from "@tanstack/react-db";
import { trpcCollectionOptions } from "trpc-db-collection";
import { trpc } from "@/trpc/client";
import type { Travel } from "@/data/travels";
import type { Transaction } from "@/data/transactions";
import type { Category } from "@/data/categories";
import type { Budget } from "@/data/budgets";
import type { Place } from "@/data/places";

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
  trpcCollectionOptions<Budget>({
    trpcRouter: trpc.budgets,
  }),
);

export const placesCollection = createCollection(
  trpcCollectionOptions<Place>({
    trpcRouter: trpc.places,
  }),
);
