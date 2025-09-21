import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/auth";
import superjson from "superjson";

export const createContext = async ({ request }: { request: Request }) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return {
    session,
  };
};

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const procedure = t.procedure;

const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const authedProcedure = procedure.use(isAuthed);
