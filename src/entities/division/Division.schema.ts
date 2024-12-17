import { z } from "zod";

export const DivisionSchema = z.object({
  age: z.string().nullable(),
  createdAt: z.string(),
  endDate: z.string().nullable(),
  gender: z.string().nullable(),
  id: z.number(),
  level: z.string().nullable(),
  name: z.string().nullable(),
  startDate: z.string().nullable(),
  tenantId: z.number().nullable(),
});

export const DivisionsSchema = z.array(DivisionSchema);

export type Division = z.infer<typeof DivisionSchema>;
