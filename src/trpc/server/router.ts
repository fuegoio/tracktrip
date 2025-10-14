import { categoriesRouter } from "./routers/categories";
import { transactionsRouter } from "./routers/transactions";
import { travelsRouter } from "./routers/travels";
import { placesRouter } from "./routers/places";
import { budgetsRouter } from "./routers/budgets";
import { router } from "./trpc";

export const appRouter = router({
  travels: travelsRouter,
  categories: categoriesRouter,
  transactions: transactionsRouter,
  places: placesRouter,
  budgets: budgetsRouter,
});

export type AppRouter = typeof appRouter;

