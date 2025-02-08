import { z } from "zod";

export const LocationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  postcode: z.string().min(1, { message: "Postcode is required" }),
  streetAddress: z.string().min(1, { message: "Street address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  mapLink: z.string().url({ message: "Must be a valid URL" }).optional(),
});

export type Location = z.infer<typeof LocationSchema>;
