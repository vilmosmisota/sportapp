import { z } from "zod";
import { MemberGender, MemberType } from "../member/Member.schema";
import { RoleSchema } from "../role/Role.schema";

export enum UserDomain {
  MANAGEMENT = "MANAGEMENT",
  SYSTEM = "SYSTEM",
  PARENT = "PARENT",
  PERFORMER = "PERFORMER",
}

export const UserLoginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address " }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;

export const TenantUserSchema = z.object({
  id: z.number(),
  tenantId: z.number(),
  userId: z.string().uuid(),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  roleId: z.number().nullable(),
  userDomains: z.array(z.nativeEnum(UserDomain)).default([]),
  role: RoleSchema.nullable().optional(),
  tenantUsers: z.array(TenantUserSchema).default([]),
});

export const UserMemberSchema = UserSchema.extend({
  member: z
    .lazy(() => {
      const { MemberSchema } = require("../member/Member.schema");
      return MemberSchema;
    })
    .nullable()
    .optional(),
});

const UserFormBaseSchema = z.object({
  // User fields
  email: z.string().email(),
  roleId: z.number().optional(),
  userDomains: z.array(z.nativeEnum(UserDomain)).optional(),

  // Member fields
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  memberType: z.nativeEnum(MemberType).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.nativeEnum(MemberGender).optional(),
});

export const UserFormSchema = UserFormBaseSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
}).refine(
  (data) => {
    if (data.memberType === MemberType.Performer) {
      return !!data.dateOfBirth && !!data.gender;
    }
    return true;
  },
  {
    message: "Date of birth and gender are required for performers",
    path: ["memberType"],
  }
);

export const UserUpdateFormSchema = UserFormBaseSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
}).refine(
  (data) => {
    if (data.memberType === MemberType.Performer) {
      return !!data.dateOfBirth && !!data.gender;
    }
    return true;
  },
  {
    message: "Date of birth and gender are required for performers",
    path: ["memberType"],
  }
);

// Types
export type User = z.infer<typeof UserSchema>;
export type UserForm = z.infer<typeof UserFormSchema>;
export type UserMember = z.infer<typeof UserMemberSchema>;
export type UserUpdateForm = z.infer<typeof UserUpdateFormSchema>;
