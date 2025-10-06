import { CategoryTypes } from "@/data/categories";
import { z } from "zod";

export const baseTransactionSchema = z.object({
  title: z.string("Name is required.").min(1, "Name is required."),
  description: z.string().optional(),
  date: z.date(),
  user: z.string(),
  amount: z.coerce
    .number<number>("Amount is required")
    .positive("Amount must be positive."),
  currency: z.string(),
  type: z.enum(CategoryTypes, "Type is required."),
});

export const additionalTransactionSchema = z.object({
  category: z.string().optional(),
  place: z.string().optional(),
  days: z.number().optional(),
  meals: z.number().optional(),
});
