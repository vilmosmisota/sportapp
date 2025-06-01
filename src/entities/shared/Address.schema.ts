import { z } from "zod";

export const AddressSchema = z.object({
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().optional(),
  mapLink: z.string().optional(),
});
