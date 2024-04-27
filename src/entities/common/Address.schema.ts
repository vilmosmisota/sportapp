import { z } from "zod";

export const AddressSchema = z
  .object({
    street_address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country_code: z.string().optional(),
    map_link: z.string().optional(),
  })
  .transform((item) => {
    return {
      streetAddress: item.street_address,
      postalCode: item.postal_code,
      countryCode: item.country_code,
      mapLink: item.map_link,
      city: item.city,
      state: item.state,
    };
  });
