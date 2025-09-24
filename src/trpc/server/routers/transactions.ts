import { router, authedProcedure } from "@/trpc/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { TrpcSync } from "trpc-db-collection/server";
import { db } from "@/db";
import {
  transactionsTable,
  eventsTable,
  travelsTable,
  travelsUsersTable,
  usersTable,
} from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "@/db/zod";
import { drizzleEventsAdapter } from "../sync";
import { and, eq, gt } from "drizzle-orm";
import type { Transaction } from "@/data/transactions";

const transactionsRouterSync = new TrpcSync<Transaction>();

export const transactionsRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const transactions = await db
      .select({ transaction: transactionsTable })
      .from(transactionsTable)
      .innerJoin(travelsTable, eq(transactionsTable.travel, travelsTable.id))
      .innerJoin(
        travelsUsersTable,
        eq(travelsTable.id, travelsUsersTable.travel),
      )
      .where(eq(travelsUsersTable.user, ctx.session.user.id));

    return transactions.map((row) => row.transaction);
  }),

  create: authedProcedure
    .input(
      createInsertSchema(transactionsTable)
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
            eq(travelsUsersTable.user, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (dbTravel.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Travel not found",
        });
      }

      const dbTransaction = (
        await db
          .insert(transactionsTable)
          .values({
            id: crypto.randomUUID(),
            ...input,
          })
          .returning()
      )[0];

      if (!dbTransaction) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create transaction",
        });
      }

      const eventId = await transactionsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: dbTravel.map((row) => row.travels_users.id),
        event: {
          action: "insert",
          data: dbTransaction,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Transaction>(
            ctx.session.user.id,
            "transaction",
            event,
          ),
      });

      return {
        item: dbTransaction,
        eventId,
      };
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createUpdateSchema(transactionsTable).omit({
          id: true,
          travel: true,
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dbTransaction = (
        await db
          .select()
          .from(transactionsTable)
          .innerJoin(
            travelsTable,
            eq(transactionsTable.travel, travelsTable.id),
          )
          .innerJoin(
            travelsUsersTable,
            eq(transactionsTable.travel, travelsUsersTable.travel),
          )
          .where(
            and(
              eq(transactionsTable.id, input.id),
              eq(travelsUsersTable.user, ctx.session.user.id),
            ),
          )
          .limit(1)
      )[0];

      if (!dbTransaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      const updatedTransaction = (
        await db
          .update(transactionsTable)
          .set(input.data)
          .where(eq(transactionsTable.id, input.id))
          .returning()
      )[0];

      if (!updatedTransaction) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update transaction",
        });
      }

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .innerJoin(usersTable, eq(travelsUsersTable.user, usersTable.id))
        .where(eq(travelsUsersTable.travel, input.id));

      const eventId = await transactionsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travelUsers.map((row) => row.users.id),
        event: {
          action: "update",
          data: updatedTransaction,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Transaction>(
            ctx.session.user.id,
            "transactions",
            event,
          ),
      });

      return {
        item: updatedTransaction,
        eventId,
      };
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dbTransaction = (
        await db
          .select()
          .from(transactionsTable)
          .innerJoin(
            travelsTable,
            eq(transactionsTable.travel, travelsTable.id),
          )
          .innerJoin(
            travelsUsersTable,
            eq(transactionsTable.travel, travelsUsersTable.travel),
          )
          .where(
            and(
              eq(transactionsTable.id, input.id),
              eq(travelsUsersTable.user, ctx.session.user.id),
            ),
          )
          .limit(1)
      )[0];

      if (!dbTransaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .innerJoin(usersTable, eq(travelsUsersTable.user, usersTable.id))
        .where(eq(travelsUsersTable.travel, input.id));

      await db
        .delete(transactionsTable)
        .where(eq(transactionsTable.id, input.id));

      const eventId = await transactionsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travelUsers.map((row) => row.users.id),
        event: {
          action: "delete",
          data: dbTransaction.transactions,
        },
        saveEvent: (event) =>
          drizzleEventsAdapter<Transaction>(
            ctx.session.user.id,
            "transactions",
            event,
          ),
      });

      return {
        item: dbTransaction.transactions,
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
      yield* transactionsRouterSync.eventsSubscription({
        userId: opts.ctx.session.user.id,
        signal: opts.signal,
        lastEventId: opts.input?.lastEventId,
        fetchLastEvents: async (lastEventId) => {
          const events = await db
            .select()
            .from(eventsTable)
            .where(
              and(
                eq(eventsTable.router, "transactions"),
                eq(eventsTable.userId, opts.ctx.session.user.id),
                gt(eventsTable.id, lastEventId),
              ),
            );

          return events.map((event) => ({
            ...event,
            data: event.data as Transaction,
          }));
        },
      });
    }),
});
