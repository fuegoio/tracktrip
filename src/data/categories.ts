export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

/**
 * Those first party categories are used to categorize transactions.
 * They will be used in an opinionated way to show data relevant to those categories.
 */
export const firstPartyCategoriesList: Category[] = [
  {
    id: "food",
    name: "Food",
    emoji: "🍔",
    color: "bg-rose-100",
  },
  {
    id: "accommodation",
    name: "Accommodation",
    emoji: "🏨",
    color: "bg-green-100",
  },
  {
    id: "transport",
    name: "Transport",
    emoji: "🚆",
    color: "bg-indigo-100",
  },
];
