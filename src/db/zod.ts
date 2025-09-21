import z from "zod";
import { createSchemaFactory } from "drizzle-zod";

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });
