export const CategoryTypes = [
  "food",
  "accommodation",
  "transport",
  "activity",
  "other",
] as const;

export const isCategoryType = (value: string): value is CategoryType =>
  CategoryTypes.includes(value as CategoryType);

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

export const categoryTypeToColorHex: Record<CategoryType, string> = {
  food: "#fecdd3",
  accommodation: "#bbf7d0",
  transport: "#c7d2fe",
  activity: "#fef08a",
  other: "#e5e7eb",
};

export const categoryTypeToDefaultName: Record<CategoryType, string> = {
  food: "Restaurant",
  accommodation: "Hotel",
  transport: "Train",
  activity: "Bar / Coffee",
  other: "Shopping",
};

export type Category = {
  id: string;
  travel: string;
  type: CategoryType;
  name: string;
  emoji: string;
};
