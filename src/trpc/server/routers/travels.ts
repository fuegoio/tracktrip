import { router, authedProcedure } from "@/trpc/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { TrpcSync } from "trpc-db-collection/server";
import type { Travel } from "@/data/travels";
import { db } from "@/db";
import {
  eventsTable,
  travelsTable,
  travelsUsersTable,
  usersTable,
} from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "@/db/zod";
import { drizzleEventsAdapter } from "../sync";
import { and, eq, gt, inArray } from "drizzle-orm";

const travelsRouterSync = new TrpcSync<Travel>();

export const travelsRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const travels = await db
      .select()
      .from(travelsTable)
      .innerJoin(
        travelsUsersTable,
        eq(travelsTable.id, travelsUsersTable.travel),
      )
      .where(eq(travelsUsersTable.user, ctx.session.user.id));

    const travelsUsers = await db
      .select()
      .from(travelsUsersTable)
      .innerJoin(usersTable, eq(travelsUsersTable.user, usersTable.id))
      .where(
        inArray(
          travelsUsersTable.travel,
          travels.map((t) => t.travels.id),
        ),
      );

    return travels.map(({ travels: travel }) => {
      const travelUsers = travelsUsers.filter(
        (user) => user.travels_users.travel === travel.id,
      );

      return {
        ...travel,
        users: travelUsers.map((travelUser) => ({
          id: travelUser.users.id,
          name: travelUser.users.name,
          email: travelUser.users.email,
          image: travelUser.users.image,
          role:
            travel.ownerId === travelUser.users.id
              ? ("owner" as const)
              : ("member" as const),
        })),
      };
    });
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
            image: ctx.session.user.image ?? null,
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
        saveEvent: (event) => drizzleEventsAdapter<Travel>("travels", event),
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

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .innerJoin(usersTable, eq(travelsUsersTable.user, usersTable.id))
        .where(eq(travelsUsersTable.travel, input.id));

      const travel: Travel = {
        ...updatedTravel,
        users: travelUsers.map((row) => ({
          id: row.users.id,
          name: row.users.name,
          email: row.users.email,
          image: row.users.image,
          role: updatedTravel.ownerId === row.users.id ? "owner" : "member",
        })),
      };

      const eventId = await travelsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travel.users.map((user) => user.id),
        event: {
          action: "update",
          data: travel,
        },
        saveEvent: (event) => drizzleEventsAdapter<Travel>("travels", event),
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

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .innerJoin(usersTable, eq(travelsUsersTable.user, usersTable.id))
        .where(eq(travelsUsersTable.travel, input.id));

      const travel: Travel = {
        ...dbTravel,
        users: travelUsers.map((row) => ({
          id: row.users.id,
          name: row.users.name,
          email: row.users.email,
          image: row.users.image,
          role: dbTravel.ownerId === row.users.id ? "owner" : "member",
        })),
      };

      await db.delete(travelsTable).where(eq(travelsTable.id, input.id));

      const eventId = await travelsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travel.users.map((user) => user.id),
        event: {
          action: "delete",
          data: travel,
        },
        saveEvent: (event) => drizzleEventsAdapter<Travel>("travels", event),
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

  inviteUser: authedProcedure
    .input(z.object({ id: z.string(), email: z.string().email() }))
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

      const user = (
        await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, input.email))
          .limit(1)
      )[0];

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .innerJoin(usersTable, eq(travelsUsersTable.user, usersTable.id))
        .where(eq(travelsUsersTable.travel, input.id));

      if (travelUsers.find((row) => row.users.id === user.id)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already in travel.",
        });
      }

      await db.insert(travelsUsersTable).values({
        id: crypto.randomUUID(),
        travel: dbTravel.id,
        user: user.id,
      });

      const travel: Travel = {
        ...dbTravel,
        users: [...travelUsers.map((row) => row.users), user].map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: dbTravel.ownerId === user.id ? "owner" : "member",
        })),
      };

      const eventId = await travelsRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travel.users.map((user) => user.id),
        event: {
          action: "update",
          data: travel,
        },
        saveEvent: (event) => drizzleEventsAdapter<Travel>("travels", event),
      });

      return {
        item: travel,
        eventId,
      };
    }),
});
