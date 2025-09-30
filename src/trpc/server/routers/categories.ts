import { router, authedProcedure } from "@/trpc/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { TrpcSync } from "trpc-db-collection/server";
import { db } from "@/db";
import {
  categoriesTable,
  eventsTable,
  travelsTable,
  travelsUsersTable,
  usersTable,
} from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "@/db/zod";
import { drizzleEventsAdapter } from "../sync";
import { and, eq, gt } from "drizzle-orm";
import type { Category } from "@/data/categories";

const categoriesRouterSync = new TrpcSync<Category>();

export const categoriesRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const categories = await db
      .select({ category: categoriesTable })
      .from(categoriesTable)
      .innerJoin(travelsTable, eq(categoriesTable.travel, travelsTable.id))
      .innerJoin(
        travelsUsersTable,
        eq(travelsTable.id, travelsUsersTable.travel),
      )
      .where(eq(travelsUsersTable.user, ctx.session.user.id));

    return categories.map((row) => row.category);
  }),

  create: authedProcedure
    .input(
      createInsertSchema(categoriesTable)
        .omit({
          id: true,
        })
        .extend({
          id: z.uuid().optional(),
        }),
    )
    .mutation(async ({ input, ctx }) => {
      const dbTravel = await db
        .select()
        .from(travelsTable)
        .innerJoin(
          travelsUsersTable,
          eq(travelsTable.id, travelsUsersTable.travel),
        )
        .where(
          and(
            eq(travelsTable.id, input.travel),
            eq(travelsTable.ownerId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (dbTravel.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Travel not found",
        });
      }

      const dbCategory = (
        await db
          .insert(categoriesTable)
          .values({
            id: crypto.randomUUID(),
            ...input,
          })
          .returning()
      )[0];

      if (!dbCategory) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create category",
        });
      }

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .where(eq(travelsUsersTable.travel, input.travel));

      const eventId = await categoriesRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travelUsers.map((row) => row.user),
        event: {
          action: "insert",
          data: dbCategory,
        },
        saveEvent: (event) => drizzleEventsAdapter<Category>("category", event),
      });

      return {
        item: dbCategory,
        eventId,
      };
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createUpdateSchema(categoriesTable).omit({
          id: true,
          travel: true,
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dbCategory = (
        await db
          .select()
          .from(categoriesTable)
          .innerJoin(travelsTable, eq(categoriesTable.travel, travelsTable.id))
          .where(
            and(
              eq(categoriesTable.id, input.id),
              eq(travelsTable.ownerId, ctx.session.user.id),
            ),
          )
          .limit(1)
      )[0];

      if (!dbCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const updatedCategory = (
        await db
          .update(categoriesTable)
          .set(input.data)
          .where(eq(categoriesTable.id, input.id))
          .returning()
      )[0];

      if (!updatedCategory) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update category",
        });
      }

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .where(eq(travelsUsersTable.travel, dbCategory.categories.travel));

      const eventId = await categoriesRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travelUsers.map((row) => row.user),
        event: {
          action: "update",
          data: updatedCategory,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Category>("categories", event),
      });

      return {
        item: updatedCategory,
        eventId,
      };
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dbCategory = (
        await db
          .select()
          .from(categoriesTable)
          .innerJoin(travelsTable, eq(categoriesTable.travel, travelsTable.id))
          .where(
            and(
              eq(categoriesTable.id, input.id),
              eq(travelsTable.ownerId, ctx.session.user.id),
            ),
          )
          .limit(1)
      )[0];

      if (!dbCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .where(eq(travelsUsersTable.travel, dbCategory.categories.travel));

      await db.delete(categoriesTable).where(eq(categoriesTable.id, input.id));

      const eventId = await categoriesRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travelUsers.map((row) => row.user),
        event: {
          action: "delete",
          data: dbCategory.categories,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Category>("categories", event),
      });

      return {
        item: dbCategory.categories,
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
      yield* categoriesRouterSync.eventsSubscription({
        userId: opts.ctx.session.user.id,
        signal: opts.signal,
        lastEventId: opts.input?.lastEventId,
        fetchLastEvents: async (lastEventId) => {
          const events = await db
            .select()
            .from(eventsTable)
            .where(
              and(
                eq(eventsTable.router, "categories"),
                eq(eventsTable.userId, opts.ctx.session.user.id),
                gt(eventsTable.id, lastEventId),
              ),
            );

          return events.map((event) => ({
            ...event,
            data: event.data as Category,
          }));
        },
      });
    }),
});
