import { z } from "zod";
import { Permission, RoleDomain } from "./Role.permissions";

// Role schema matching the new database structure
export const RoleSchema = z.object({
  id: z.number(), // Changed from uuid to bigint
  name: z.string(),
  domain: z.nativeEnum(RoleDomain),
  permissions: z.array(z.nativeEnum(Permission)),
  tenantId: z.number().nullable(),
});

// UserRole schema (junction table)
export const UserRoleSchema = z.object({
  id: z.number(),
  roleId: z.number(),
  tenantId: z.number(),
  userId: z.string().uuid(),
  isPrimary: z.boolean().default(false),
  role: RoleSchema.optional(), // For populated role data
});

// Schema for creating/updating roles
export const RoleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.nativeEnum(RoleDomain),
  permissions: z.array(z.nativeEnum(Permission)),
  tenantId: z.number().nullable(),
});

// Types
export type Role = z.infer<typeof RoleSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type RoleForm = z.infer<typeof RoleFormSchema>;

// Extended User type with populated roles
export type UserWithRoles = {
  id: string;
  roles: UserRole[];
};
