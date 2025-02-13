import { z } from "zod";

// Domain enum (used in both Role and UserDomain)
export enum Domain {
  MANAGEMENT = "management",
  FAMILY = "family",
  SYSTEM = "system",
}

// Tenant type enum
export enum TenantType {
  ORGANIZATION = "organization",
  LEAGUE = "league",
}

// Role schema
export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  domain: z.nativeEnum(Domain),
  tenantType: z.nativeEnum(TenantType).nullable(),
  permissions: z.array(z.string()),
});

// UserDomain schema
export const UserDomainSchema = z.object({
  id: z.number(),
  userId: z.string().uuid(),
  tenantId: z.number(),
  domain: z.nativeEnum(Domain),
  isPrimary: z.boolean().default(false),
  teamId: z.number().nullable(),
});

// UserDomainRole schema (junction table)
export const UserDomainRoleSchema = z.object({
  id: z.number(),
  userDomainId: z.number(),
  roleId: z.string().uuid(),
});

// Schema for creating/updating roles
export const RoleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.nativeEnum(Domain),
  tenantType: z.nativeEnum(TenantType).nullable(),
  permissions: z.array(z.string()),
});

// Types
export type Role = z.infer<typeof RoleSchema>;
export type UserDomain = z.infer<typeof UserDomainSchema>;
export type UserDomainRole = z.infer<typeof UserDomainRoleSchema>;
export type RoleForm = z.infer<typeof RoleFormSchema>;

// Extended UserDomain type with populated roles
export type UserDomainWithRoles = UserDomain & {
  roles: Role[];
};
