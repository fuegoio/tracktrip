import { categoriesRouter } from "./routers/categories";
import { transactionsRouter } from "./routers/transactions";
import { travelsRouter } from "./routers/travels";
import { placesRouter } from "./routers/places";
import { router } from "./trpc";

export const appRouter = router({
  travels: travelsRouter,
  categories: categoriesRouter,
  transactions: transactionsRouter,
  places: placesRouter,
});

export type AppRouter = typeof appRouter;