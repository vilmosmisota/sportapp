import { z } from "zod";
import { RoleSchema } from "../role/Role.schema";

// Original schemas for login
export const UserLoginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address " }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;

// Schema for user roles (junction table)
export const UserRoleSchema = z.object({
  id: z.number(),
  roleId: z.number(),
  tenantId: z.number(),
  role: RoleSchema.optional(), // For populated role data
});

// Schema for tenant users (junction table)
export const TenantUserSchema = z.object({
  id: z.number(),
  tenantId: z.number(),
  // Make userId optional since it might not be included in some queries
  userId: z.string().uuid().optional(),
});

// Schema for users
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  roles: z.array(UserRoleSchema).optional(),
  tenantUsers: z.array(TenantUserSchema).optional(),
});

// Schema for creating/updating users
export const UserFormSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleIds: z.array(z.number()).optional(),
});

// Add a separate schema for updates
export const UserUpdateFormSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleIds: z.array(z.number()).optional(),
});

// Types
export type User = z.infer<typeof UserSchema>;
export type UserForm = z.infer<typeof UserFormSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserUpdateForm = z.infer<typeof UserUpdateFormSchema>;
