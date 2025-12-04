import { budgetsRouter } from "./routers/budgets";
import { categoriesRouter } from "./routers/categories";
import { placesRouter } from "./routers/places";
import { transactionsRouter } from "./routers/transactions";
import { travelsRouter } from "./routers/travels";
import { router } from "./trpc";

export const appRouter = router({
  travels: travelsRouter,
  categories: categoriesRouter,
  transactions: transactionsRouter,
  places: placesRouter,
  budgets: budgetsRouter,
});

export type AppRouter = typeof appRouter;

