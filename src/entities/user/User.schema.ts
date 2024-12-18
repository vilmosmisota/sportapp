import { z } from "zod";

export enum UserRole {
  SUPER_ADMIN = "super-admin",
  ADMIN = "admin",
  PARENT = "parent",
  COACH = "coach",
  PLAYER = "player",
}

// Original schemas for login
export const UserLoginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address " }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;

// Base user schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  entities: z
    .array(
      z.object({
        id: z.number(),
        createdAt: z.string(),
        entityName: z.string().nullable(),
        role: z.nativeEnum(UserRole),
        tenantId: z.number().nullable(),
        clubId: z.number().nullable(),
        divisionId: z.number().nullable(),
        teamId: z.number().nullable(),
      })
    )
    .optional(),
});

// Schema for user entity
export const UserEntitySchema = z.object({
  role: z.nativeEnum(UserRole),
  entityName: z.string().optional(),
  clubId: z.number().optional(),
  divisionId: z.number().optional(),
  teamId: z.number().optional(),
});

// Schema for creating/updating users
export const UserFormSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
  entities: z.array(UserEntitySchema).min(1, "At least one role is required"),
});

export type User = z.infer<typeof UserSchema>;
export type UserForm = z.infer<typeof UserFormSchema>;
export type UserEntity = z.infer<typeof UserEntitySchema>;
