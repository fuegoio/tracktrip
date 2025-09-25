export const CategoryTypes = [
  "food",
  "accommodation",
  "transport",
  "activity",
  "other",
] as const;

export type CategoryType = (typeof CategoryTypes)[number];

export const categoryTypeToEmoji: Record<CategoryType, string> = {
  food: "🍔",
  accommodation: "🏨",
  transport: "🚆",
  activity: "🎡",
  other: "💰",
};

export const categoryTypeToColor: Record<CategoryType, string> = {
  food: "bg-rose-100",
  accommodation: "bg-green-100",
  transport: "bg-indigo-100",
  activity: "bg-yellow-100",
  other: "bg-gray-100",
};

export const categoryTypeToDefaultName: Record<CategoryType, string> = {
  food: "Food",
  accommodation: "Accommodation",
  transport: "Transport",
  activity: "Activity",
  other: "Other",
};

export type Category = {
  id: string;
  travel: string;
  type: CategoryType;
  name: string;
  emoji: string;
  color: string;
};
