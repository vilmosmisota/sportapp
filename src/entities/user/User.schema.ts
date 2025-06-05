import { z } from "zod";
import { RoleSchema } from "../role/Role.schema";

export const UserLoginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address " }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.number().positive("Valid roleId is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  memberType: z.string().optional(),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  roleId: z.number().positive("Valid roleId is required").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  memberType: z.string().optional(),
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export const UserSchema = z.object({
  id: z.number(),
  tenantId: z.number(),
  userId: z.string().uuid(),
  role: RoleSchema.nullable().optional(),
  user: z
    .object({
      id: z.string().uuid(),
      email: z.string().email().nullable(),
    })
    .nullable()
    .optional(),
});

export const UserMemberSchema = z.object({
  id: z.number(),
  tenantId: z.number(),
  userId: z.string().uuid(),
  role: RoleSchema.nullable().optional(),
  user: z
    .object({
      id: z.string().uuid(),
      email: z.string().email().nullable(),
    })
    .nullable()
    .optional(),
  member: z
    .lazy(() => {
      const { MemberSchema } = require("../member/Member.schema");
      return MemberSchema;
    })
    .nullable()
    .optional(),
});

// Types
export type User = z.infer<typeof UserSchema>;
export type UserMember = z.infer<typeof UserMemberSchema>;
