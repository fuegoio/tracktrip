import { budgetsRouter } from "./routers/budgets";
import { categoriesRouter } from "./routers/categories";
import { miscRouter } from "./routers/misc";
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
  misc: miscRouter,
});

export type AppRouter = typeof appRouter;
