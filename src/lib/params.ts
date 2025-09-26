import { travelsCollection } from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { notFound } from "@tanstack/react-router";

export const useTravel = ({ id }: { id: string }) => {
  const { data: matchingTravels } = useLiveQuery((q) =>
    q
      .from({ travels: travelsCollection })
      .where(({ travels }) => eq(travels.id, id)),
  );

  const travel = matchingTravels[0];
  if (!travel) {
    throw notFound();
  }

  return travel;
};
