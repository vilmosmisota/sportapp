import { z } from "zod";

export const MetaSchema = z
  .object({
    note: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

export type Meta = z.infer<typeof MetaSchema>;
