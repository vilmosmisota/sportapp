import { z } from "zod";

export const LocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().default(""),
  postcode: z.string().optional().default(""),
  streetAddress: z.string().optional().default(""),
  city: z.string().optional().default(""),
  mapLink: z
    .union([z.string().url({ message: "Must be a valid URL" }), z.literal("")])
    .optional()
    .default(""),
});

export type Location = z.infer<typeof LocationSchema>;
