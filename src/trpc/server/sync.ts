import type { TrpcItem } from "trpc-db-collection";
import type { TrpcSyncEvent } from "trpc-db-collection/server";

import { db } from "@/db";
import { eventsTable } from "@/db/schema";

export const drizzleEventsAdapter = async <TItem extends TrpcItem>(
  router: string,
  event: Omit<TrpcSyncEvent<TItem>, "id">,
): Promise<TrpcSyncEvent<TItem>> => {
  const savedEvents = await db
    .insert(eventsTable)
    .values({
      router,
      userId: event.userId,
      action: event.action,
      data: event.data,
    })
    .returning();

  const savedEvent = savedEvents[0];
  if (!savedEvent) {
    throw new Error("Failed to save event");
  }

  return {
    id: savedEvent.id,
    userId: event.userId,
    action: event.action,
    data: event.data,
  };
};
