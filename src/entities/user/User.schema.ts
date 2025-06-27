import { z } from "zod";
import { MemberGender, MemberType } from "../member/Member.schema";
import { RoleSchema } from "../role/Role.schema";

export enum TenantUserStatus {
  PENDING = "pending",
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

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

// Form schema for AddUserForm
export const UserFormSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  roleId: z.number().optional(),
  memberType: z.nativeEnum(MemberType).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.nativeEnum(MemberGender).optional(),
});

export type UserForm = z.infer<typeof UserFormSchema>;

// Form schema for EditUserForm
export const UserUpdateFormSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  roleId: z.number().optional(),
  memberType: z.nativeEnum(MemberType).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.nativeEnum(MemberGender).optional(),
});

export type UserUpdateForm = z.infer<typeof UserUpdateFormSchema>;

export const UserSchema = z.object({
  id: z.number(),
  tenantId: z.number(),
  userId: z.string().uuid(),
  roleId: z.number().nullable(),
  memberId: z.number(),
  status: z.nativeEnum(TenantUserStatus).default(TenantUserStatus.PENDING),
  role: RoleSchema.nullable().optional(),
  user: z
    .object({
      id: z.string().uuid(),
      email: z.string().email().nullable(),
    })
    .nullable()
    .optional(),
  member: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    memberType: z.nativeEnum(MemberType),
  }),
});

export const UserMemberSchema = z.object({
  id: z.number(),
  tenantId: z.number(),
  userId: z.string().uuid(),
  roleId: z.number().nullable(),
  memberId: z.number(),
  status: z.nativeEnum(TenantUserStatus).default(TenantUserStatus.PENDING),
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
