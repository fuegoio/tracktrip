import { categoriesRouter } from "./routers/categories";
import { transactionsRouter } from "./routers/transactions";
import { travelsRouter } from "./routers/travels";
import { router } from "./trpc";

export const appRouter = router({
  travels: travelsRouter,
  categories: categoriesRouter,
  transactions: transactionsRouter,
});

export type AppRouter = typeof appRouter;
