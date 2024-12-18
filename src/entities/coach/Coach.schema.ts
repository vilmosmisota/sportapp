import { z } from "zod";

export const CoachSchema = z.object({
  id: z.number(),
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  tenantId: z.number(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export type Coach = z.infer<typeof CoachSchema>;

export const CoachFormSchema = CoachSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export type CoachForm = z.infer<typeof CoachFormSchema>;