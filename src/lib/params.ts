import { travelsCollection } from "@/store/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";

export const useTravel = ({ id }: { id: string }) => {
  const { data: matchingTravels } = useLiveQuery((q) =>
    q
      .from({ travels: travelsCollection })
      .where(({ travels }) => eq(travels.id, id)),
  );

  const travel = matchingTravels[0];
  if (!travel) {
    throw new Error("Travel not found");
  }

  return travel;
};
