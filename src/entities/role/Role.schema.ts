import { z } from "zod";

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  permissions: z.array(z.string()),
  tenantId: z.number(),
  isInstructor: z.boolean().default(false),
});

// Schema for creating/updating roles
export const RoleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  permissions: z.array(z.string()),
  tenantId: z.number(),
  isInstructor: z.boolean().default(false),
});

// Types
export type Role = z.infer<typeof RoleSchema>;
export type RoleForm = z.infer<typeof RoleFormSchema>;
