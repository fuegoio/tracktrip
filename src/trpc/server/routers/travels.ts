import { router, authedProcedure } from "@/trpc/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { TrpcSync } from "trpc-db-collection/server";
import type { Travel } from "@/data/travels";
import { db } from "@/db";
import { eventsTable, travelsTable, travelsUsersTable } from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "@/db/zod";
import { drizzleEventsAdapter } from "../sync";
import { and, eq, gt } from "drizzle-orm";

const travelsRouterSync = new TrpcSync<Travel>();

export const travelsRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const travels = await db
      .select()
      .from(travelsTable)
      .leftJoin(
        travelsUsersTable,
        eq(travelsTable.id, travelsUsersTable.travel),
      )
      .where(eq(travelsUsersTable.user, ctx.session.user.id));

    return travels.map((travel) => ({
      ...travel.travels,
      users: [
        {
          id: ctx.session.user.id,
          name: ctx.session.user.name,
          email: ctx.session.user.email,
          role: "owner" as const,
        },
      ],
    }));
  }),

  create: authedProcedure
    .input(
      createInsertSchema(travelsTable).omit({
        id: true,
        createdAt: true,
        ownerId: true,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const travels = await db
        .insert(travelsTable)
        .values({
          ...input,
          id: crypto.randomUUID(),
          ownerId: ctx.session.user.id,
        })
        .returning();

      const travel = travels[0];
      if (!travel) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create travel",
        });
      }

      await db.insert(travelsUsersTable).values({
        id: crypto.randomUUID(),
        travel: travel.id,
        user: ctx.session.user.id,
      });

      const eventId = await travelsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        event: {
          action: "insert",
          data: travel,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Travel>(ctx.session.user.id, "todos", event),
      });

      return {
        item: {
          ...travel,
          users: [
            {
              id: ctx.session.user.id,
              name: ctx.session.user.name,
              email: ctx.session.user.email,
              role: "owner" as const,
            },
          ],
        },
        eventId,
      };
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createUpdateSchema(travelsTable).omit({
          id: true,
          createdAt: true,
          ownerId: true,
        }),
      }),
    )
    .mutation(async () => {}),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async () => {}),

  listen: authedProcedure
    .input(
      z
        .object({
          lastEventId: z.coerce.number().nullish(),
        })
        .optional(),
    )
    .subscription(async function* (opts) {
      yield* travelsRouterSync.eventsSubscription({
        userId: opts.ctx.session.user.id,
        signal: opts.signal,
        lastEventId: opts.input?.lastEventId,
        fetchLastEvents: async (lastEventId) => {
          const events = await db
            .select()
            .from(eventsTable)
            .where(
              and(
                eq(eventsTable.router, "travels"),
                eq(eventsTable.userId, opts.ctx.session.user.id),
                gt(eventsTable.id, lastEventId),
              ),
            );

          return events.map((event) => ({
            ...event,
            data: event.data as Travel,
          }));
        },
      });
    }),
});
