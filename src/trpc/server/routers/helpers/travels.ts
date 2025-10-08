import { db } from "@/db";
import { travelsUsersTable } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const getTravelUser = async ({
  travelId,
  userId,
}: {
  travelId: string;
  userId: string;
}) => {
  return (
    await db
      .select()
      .from(travelsUsersTable)
      .where(
        and(
          eq(travelsUsersTable.user, userId),
          eq(travelsUsersTable.travel, travelId),
        ),
      )
  ).at(0);
};

export const checkTravelPermission = async ({
  travelId,
  userId,
}: {
  travelId: string;
  userId: string;
}) => {
  if (!(await getTravelUser({ travelId, userId }))) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Travel not found",
    });
  }
};
