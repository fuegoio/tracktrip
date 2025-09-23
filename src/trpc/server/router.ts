import { categoriesRouter } from "./routers/categories";
import { travelsRouter } from "./routers/travels";
import { router } from "./trpc";

export const appRouter = router({
  travels: travelsRouter,
  categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;
