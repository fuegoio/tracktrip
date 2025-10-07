import { router, authedProcedure } from "@/trpc/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { TrpcSync } from "trpc-db-collection/server";
import { db } from "@/db";
import {
  placesTable,
  eventsTable,
  travelsTable,
  travelsUsersTable,
  usersTable,
} from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "@/db/zod";
import { drizzleEventsAdapter } from "../sync";
import { and, eq, gt } from "drizzle-orm";
import type { Place } from "@/data/places";

const placesRouterSync = new TrpcSync<Place>();

export const placesRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const places = await db
      .select({ place: placesTable })
      .from(placesTable)
      .innerJoin(travelsTable, eq(placesTable.travel, travelsTable.id))
      .innerJoin(
        travelsUsersTable,
        eq(travelsTable.id, travelsUsersTable.travel),
      )
      .where(eq(travelsUsersTable.user, ctx.session.user.id));

    return places.map((row) => row.place);
  }),

  create: authedProcedure
    .input(
      createInsertSchema(placesTable)
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

      const dbPlace = (
        await db
          .insert(placesTable)
          .values({
            id: crypto.randomUUID(),
            ...input,
            name: input.name.trim(),
          })
          .returning()
      )[0];

      if (!dbPlace) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create place",
        });
      }

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .where(eq(travelsUsersTable.travel, input.travel));

      const eventId = await placesRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travelUsers.map((row) => row.user),
        event: {
          action: "insert",
          data: dbPlace,
        },
        saveEvent: (event) => drizzleEventsAdapter<Place>("place", event),
      });

      return {
        item: dbPlace,
        eventId,
      };
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createUpdateSchema(placesTable).omit({
          id: true,
          travel: true,
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dbPlace = (
        await db
          .select()
          .from(placesTable)
          .innerJoin(travelsTable, eq(placesTable.travel, travelsTable.id))
          .where(
            and(
              eq(placesTable.id, input.id),
              eq(travelsTable.ownerId, ctx.session.user.id),
            ),
          )
          .limit(1)
      )[0];

      if (!dbPlace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Place not found",
        });
      }

      const updatedPlace = (
        await db
          .update(placesTable)
          .set(input.data)
          .where(eq(placesTable.id, input.id))
          .returning()
      )[0];

      if (!updatedPlace) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update place",
        });
      }

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .where(eq(travelsUsersTable.travel, dbPlace.travels.id));

      const eventId = await placesRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travelUsers.map((row) => row.user),
        event: {
          action: "update",
          data: updatedPlace,
        },
        saveEvent: (event) => drizzleEventsAdapter<Place>("places", event),
      });

      return {
        item: updatedPlace,
        eventId,
      };
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dbPlace = (
        await db
          .select()
          .from(placesTable)
          .innerJoin(travelsTable, eq(placesTable.travel, travelsTable.id))
          .where(
            and(
              eq(placesTable.id, input.id),
              eq(travelsTable.ownerId, ctx.session.user.id),
            ),
          )
          .limit(1)
      )[0];

      if (!dbPlace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Place not found",
        });
      }

      const travelUsers = await db
        .select()
        .from(travelsUsersTable)
        .where(eq(travelsUsersTable.travel, dbPlace.travels.id));

      await db.delete(placesTable).where(eq(placesTable.id, input.id));

      const eventId = await placesRouterSync.registerEvent({
        currentUserId: ctx.session.user.id,
        otherUserIds: travelUsers.map((row) => row.user),
        event: {
          action: "delete",
          data: dbPlace.places,
        },
        saveEvent: (event) => drizzleEventsAdapter<Place>("places", event),
      });

      return {
        item: dbPlace.places,
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
      yield* placesRouterSync.eventsSubscription({
        userId: opts.ctx.session.user.id,
        signal: opts.signal,
        lastEventId: opts.input?.lastEventId,
        fetchLastEvents: async (lastEventId) => {
          const events = await db
            .select()
            .from(eventsTable)
            .where(
              and(
                eq(eventsTable.router, "places"),
                eq(eventsTable.userId, opts.ctx.session.user.id),
                gt(eventsTable.id, lastEventId),
              ),
            );

          return events.map((event) => ({
            ...event,
            data: event.data as Place,
          }));
        },
      });
    }),
});
