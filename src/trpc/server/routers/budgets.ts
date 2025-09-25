import { router, authedProcedure } from "@/trpc/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { TrpcSync } from "trpc-db-collection/server";
import { db } from "@/db";
import {
  budgetsTable,
  eventsTable,
  travelsTable,
  travelsUsersTable,
  usersTable,
} from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "@/db/zod";
import { drizzleEventsAdapter } from "../sync";
import { and, eq, gt } from "drizzle-orm";
import type { Budget } from "@/data/budgets";

const budgetsRouterSync = new TrpcSync<Budget>();

export const budgetsRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const budgets = await db
      .select({ budget: budgetsTable })
      .from(budgetsTable)
      .innerJoin(travelsTable, eq(budgetsTable.travel, travelsTable.id))
      .innerJoin(
        travelsUsersTable,
        eq(travelsTable.id, travelsUsersTable.travel),
      )
      .where(eq(travelsUsersTable.user, ctx.session.user.id));

    return budgets.map((row) => row.budget);
  }),

  create: authedProcedure
    .input(
      createInsertSchema(budgetsTable)
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

      const dbBudget = (
        await db
          .insert(budgetsTable)
          .values({
            id: crypto.randomUUID(),
            ...input,
          })
          .returning()
      )[0];

      if (!dbBudget) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create budget",
        });
      }

      const eventId = await budgetsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: dbTravel.map((row) => row.travels_users.id),
        event: {
          action: "insert",
          data: dbBudget,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Budget>(ctx.session.user.id, "budget", event),
      });

      return {
        item: dbBudget,
        eventId,
      };
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createUpdateSchema(budgetsTable).omit({
          id: true,
          travel: true,
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dbBudget = (
        await db
          .select()
          .from(budgetsTable)
          .innerJoin(travelsTable, eq(budgetsTable.travel, travelsTable.id))
          .where(
            and(
              eq(budgetsTable.id, input.id),
              eq(travelsTable.ownerId, ctx.session.user.id),
            ),
          )
          .limit(1)
      )[0];

      if (!dbBudget) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Budget not found",
        });
      }

      const updatedBudget = (
        await db
          .update(budgetsTable)
          .set(input.data)
          .where(eq(budgetsTable.id, input.id))
          .returning()
      )[0];

      if (!updatedBudget) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update budget",
        });
      }

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .innerJoin(usersTable, eq(travelsUsersTable.user, usersTable.id))
        .where(eq(travelsUsersTable.travel, input.id));

      const eventId = await budgetsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travelUsers.map((row) => row.users.id),
        event: {
          action: "update",
          data: updatedBudget,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Budget>(ctx.session.user.id, "budgets", event),
      });

      return {
        item: updatedBudget,
        eventId,
      };
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dbBudget = (
        await db
          .select()
          .from(budgetsTable)
          .innerJoin(travelsTable, eq(budgetsTable.travel, travelsTable.id))
          .where(
            and(
              eq(budgetsTable.id, input.id),
              eq(travelsTable.ownerId, ctx.session.user.id),
            ),
          )
          .limit(1)
      )[0];

      if (!dbBudget) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Budget not found",
        });
      }

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .innerJoin(usersTable, eq(travelsUsersTable.user, usersTable.id))
        .where(eq(travelsUsersTable.travel, input.id));

      await db.delete(budgetsTable).where(eq(budgetsTable.id, input.id));

      const eventId = await budgetsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travelUsers.map((row) => row.users.id),
        event: {
          action: "delete",
          data: dbBudget.budgets,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Budget>(ctx.session.user.id, "budgets", event),
      });

      return {
        item: dbBudget.budgets,
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
      yield* budgetsRouterSync.eventsSubscription({
        userId: opts.ctx.session.user.id,
        signal: opts.signal,
        lastEventId: opts.input?.lastEventId,
        fetchLastEvents: async (lastEventId) => {
          const events = await db
            .select()
            .from(eventsTable)
            .where(
              and(
                eq(eventsTable.router, "budgets"),
                eq(eventsTable.userId, opts.ctx.session.user.id),
                gt(eventsTable.id, lastEventId),
              ),
            );

          return events.map((event) => ({
            ...event,
            data: event.data as Budget,
          }));
        },
      });
    }),
});

