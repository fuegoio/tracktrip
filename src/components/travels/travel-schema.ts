import z from "zod";

export const travelSettingsFormSchema = z
  .object({
    name: z.string("Name is required.").min(1, "Name is required."),
    emoji: z.string(),
    currency: z.string(),
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "End date must be after start date.",
    path: ["endDate"], // This will attach the error to the endDate field
  });
