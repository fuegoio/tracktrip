import { z } from "zod";

import { CategoryTypes } from "@/data/categories";

export const baseTransactionSchema = z.object({
  title: z.string("Name is required.").min(1, "Name is required."),
  description: z.string().nullable(),
  date: z.date(),
  user: z.string(),
  amount: z.coerce
    .number<number>("Amount is required.")
    .positive("Amount must be positive."),
  currency: z.string(),
  type: z.enum(CategoryTypes, "Type is required."),
  users: z.string().array().nonempty().nullable(),
});

export const additionalTransactionSchema = z.object({
  category: z.string().nullable(),
  place: z.string().nullable(),
  days: z
    .number()
    .positive("The number of days should be greater than 1.")
    .nullable(),
  departureDate: z.date().nullable(),
});
