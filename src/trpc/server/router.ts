import { travelsRouter } from "./routers/travels";
import { router } from "./trpc";

export const appRouter = router({
  travels: travelsRouter,
});

export type AppRouter = typeof appRouter;
