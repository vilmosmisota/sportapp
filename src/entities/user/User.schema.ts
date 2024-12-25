import { z } from "zod";

export enum AdminRole {
  ADMIN = "admin",
  EDITOR = "editor",
  MEMBER = "member",
}

export enum DomainRole {
  COACH = "coach",
  // PLAYER = "player",
  PARENT = "parent",
}

// Original schemas for login
export const UserLoginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address " }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;

// Schema for user entity (single entity per user)
export const UserEntitySchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  adminRole: z.nativeEnum(AdminRole).nullable(),
  domainRole: z.nativeEnum(DomainRole).nullable(),
  tenantId: z.number().nullable(),
  clubId: z.number().nullable(),
  divisionId: z.number().nullable(),
  teamId: z.number().nullable(),
});

// Base user schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  entity: UserEntitySchema.nullable(), // Changed from entities array to single entity
});

// Schema for creating/updating users
export const UserFormSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
  adminRole: z.nativeEnum(AdminRole).nullable(),
  domainRole: z.nativeEnum(DomainRole).nullable(),
  clubId: z.number().optional(),
  divisionId: z.number().optional(),
  teamId: z.number().optional(),
});

// Add a separate schema for updates
export const UserUpdateFormSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  // Password is optional for updates
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  adminRole: z.nativeEnum(AdminRole).nullable(),
  domainRole: z.nativeEnum(DomainRole).nullable(),
  clubId: z.number().optional(),
  divisionId: z.number().optional(),
  teamId: z.number().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserForm = z.infer<typeof UserFormSchema>;
export type UserEntity = z.infer<typeof UserEntitySchema>;
export type UserUpdateForm = z.infer<typeof UserUpdateFormSchema>;
