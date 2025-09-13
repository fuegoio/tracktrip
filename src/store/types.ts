import type z from "zod";
import type { transactionsSchema, travelsSchema } from "./schemas";

export type Travel = z.infer<typeof travelsSchema>;

export type Transaction = z.infer<typeof transactionsSchema>;

export type Category = {
  name: string;
  emoji: string;
  color: string;
};
