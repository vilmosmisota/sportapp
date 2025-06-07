import { z } from "zod";

export enum Access {
  MANAGEMENT = "management",
  SYSTEM = "system",
  KIOSK = "kiosk",
}

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  permissions: z.array(z.string()),
  tenantId: z.number(),
  access: z.array(z.nativeEnum(Access)).default([]),
});

// Schema for creating/updating roles
export const RoleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  permissions: z.array(z.string()),
  tenantId: z.number(),
  access: z.array(z.nativeEnum(Access)).default([]),
});

// Types
export type Role = z.infer<typeof RoleSchema>;
export type RoleForm = z.infer<typeof RoleFormSchema>;
