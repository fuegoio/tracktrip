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
      createInsertSchema(travelsTable)
        .omit({
          id: true,
          createdAt: true,
          ownerId: true,
        })
        .extend({
          id: z.uuid().optional(),
        }),
    )
    .mutation(async ({ input, ctx }) => {
      const dbTravel = (
        await db
          .insert(travelsTable)
          .values({
            id: crypto.randomUUID(),
            ...input,
            ownerId: ctx.session.user.id,
          })
          .returning()
      )[0];

      if (!dbTravel) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create travel",
        });
      }

      await db.insert(travelsUsersTable).values({
        id: crypto.randomUUID(),
        travel: dbTravel.id,
        user: ctx.session.user.id,
      });

      const travel: Travel = {
        ...dbTravel,
        users: [
          {
            id: ctx.session.user.id,
            name: ctx.session.user.name,
            email: ctx.session.user.email,
            role: "owner" as const,
          },
        ],
      };

      const eventId = await travelsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        event: {
          action: "insert",
          data: travel,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Travel>(ctx.session.user.id, "travels", event),
      });

      return {
        item: travel,
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
    .mutation(async ({ ctx, input }) => {
      const dbTravel = (
        await db
          .select()
          .from(travelsTable)
          .where(
            and(
              eq(travelsTable.id, input.id),
              eq(travelsTable.ownerId, ctx.session.user.id),
            ),
          )
          .limit(1)
      )[0];

      if (!dbTravel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Travel not found",
        });
      }

      const updatedTravel = (
        await db
          .update(travelsTable)
          .set(input.data)
          .where(eq(travelsTable.id, input.id))
          .returning()
      )[0];

      if (!updatedTravel) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update travel",
        });
      }

      const travel: Travel = {
        ...updatedTravel,
        users: [
          {
            id: ctx.session.user.id,
            name: ctx.session.user.name,
            email: ctx.session.user.email,
            role: "owner" as const,
          },
        ],
      };

      const eventId = await travelsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        event: {
          action: "update",
          data: travel,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Travel>(ctx.session.user.id, "travels", event),
      });

      return {
        item: travel,
        eventId,
      };
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dbTravel = (
        await db
          .select()
          .from(travelsTable)
          .where(
            and(
              eq(travelsTable.id, input.id),
              eq(travelsTable.ownerId, ctx.session.user.id),
            ),
          )
          .limit(1)
      )[0];

      if (!dbTravel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Travel not found",
        });
      }

      await db.delete(travelsTable).where(eq(travelsTable.id, input.id));

      const travel: Travel = {
        ...dbTravel,
        users: [
          {
            id: ctx.session.user.id,
            name: ctx.session.user.name,
            email: ctx.session.user.email,
            role: "owner" as const,
          },
        ],
      };

      const eventId = await travelsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        event: {
          action: "delete",
          data: travel,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Travel>(ctx.session.user.id, "travels", event),
      });

      return {
        item: travel,
        eventId,
      };
    }),

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
