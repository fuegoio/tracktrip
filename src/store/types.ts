import type z from "zod";
import type { travelsSchema } from "./schemas";

export type Travel = z.infer<typeof travelsSchema>;
