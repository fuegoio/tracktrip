import z from "zod";

/**
 * Schema for a travel.
 * A travel is a group of transactions that are related to a specific trip.
 */
export const travelsSchema = z.object({
  /**
   * The unique identifier for the travel.
   */
  id: z.uuid(),
  /**
   * The name of the travel.
   */
  name: z.string(),
  /**
   * The emoji representing the travel.
   */
  emoji: z.string(),
  /**
   * The currency used for the travel.
   */
  currency: z.string(),
  /**
   * The start date of the travel.
   */
  startDate: z.string(),
  /**
   * The end date of the travel.
   */
  endDate: z.string(),
});

/**
 * Schema for a transaction object.
 * A transaction is a money movement that records something.
 */
export const transactionsSchema = z.object({
  /**
   * The unique identifier for the transaction.
   */
  id: z.uuid(),
  /**
   * The travel this transaction belongs to.
   */
  travel: z.uuid(),
  /**
   * The date of the transaction.
   * This will be used to group transactions by days.
   */
  date: z.string(),
  /**
   * The user who paid for the transaction.
   */
  user: z.uuid(),
  /**
   * The amount of the transaction.
   */
  amount: z.number(),
  /**
   * The currency of the transaction.
   * If this is not the same as the currency of the travel, it will be converted.
   */
  currency: z.string(),
  /**
   * The title of the transaction.
   * This is what is displayed in the list of transactions.
   */
  title: z.string(),
  /**
   * The description of the transaction.
   * Can be used to add more details about the transaction.
   */
  description: z.string().optional(),
  /**
   * Where the transaction took place.
   * This is useful for grouping transactions by location, like cities or countries.
   */
  place: z.string().optional(),
  /**
   * The category of the transaction.
   * This is used to group transactions by category.
   */
  category: z.string(),
  /**
   * The subcategory of the transaction.
   * This is used to group transactions by subcategory.
   */
  subcategory: z.string().optional(),
  /**
   * The number of days the transaction applies to.
   * Quite useful for housing or groceries.
   */
  days: z.number().default(1),
});

/**
 * Schema for a user object.
 * A user represents someone who is part of the travel.
 */
export const usersSchema = z.object({
  /**
   * The unique identifier for the user.
   */
  id: z.uuid(),
  /**
   * The travel this user belongs to.
   */
  travel: z.uuid(),
  /**
   * The name of the user.
   */
  name: z.string(),
  /**
   * The emoji representing the user.
   */
  emoji: z.string(),
  /**
   * The email address of the user.
   */
  email: z.email(),
});

/**
 * Schema for a custom category.
 * There are already some categories, but users can add their own.
 */
export const customCategoriesSchema = z.object({
  /**
   * The unique identifier for the category.
   */
  id: z.uuid(),
  /**
   * The travel this category belongs to.
   */
  travel: z.uuid(),
  /**
   * The name of the category.
   */
  name: z.string(),
  /**
   * The emoji representing the category.
   */
  emoji: z.string(),
});

/**
 * Schema for a custom subcategory.
 * Like categories, there are already some subcategories, but users can add their own.
 */
export const customSubcategoriesSchema = z.object({
  /**
   * The unique identifier for the subcategory.
   */
  id: z.uuid(),
  /**
   * The category this subcategory belongs to.
   */
  category: z.string(),
  /**
   * The name of the subcategory.
   */
  name: z.string(),
  /**
   * The emoji representing the subcategory.
   */
  emoji: z.string(),
});

/**
 * Schema for a budget object.
 */
export const budgetsSchema = z.object({
  /**
   * The unique identifier for the budget.
   */
  id: z.uuid(),
  /**
   * The travel this category belongs to.
   */
  travel: z.uuid(),
  /**
   * The amount allocated for the budget.
   */
  amount: z.number(),
  /**
   * The category this budget applies to.
   */
  category: z.string().optional(),
  /**
   * The subcategory this budget applies to.
   */
  subcategory: z.string().optional(),
  /**
   * The period of the budget.
   */
  days: z.number().default(1),
});
