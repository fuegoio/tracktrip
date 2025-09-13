/**
 * Those first party categories are used to categorize transactions.
 * They will be used in an opinionated way to show data relevant to those categories.
 */
export const firstPartyCategories = [
  "food",
  "accommodation",
  "transport",
] as const;

export const firstPartyCategoriesEmoji = {
  food: "🍔",
  accommodation: "🏨",
  transport: "🚆",
} as const;
