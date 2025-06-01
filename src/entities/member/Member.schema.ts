import { z } from "zod";
import {
  CustomFieldSchema,
  CustomFieldValueSchema,
} from "../custom-field/CustomFieldSchema";
import { UserSchema } from "../user/User.schema";

export enum MemberGender {
  Male = "Male",
  Female = "Female",
}

export enum MemberType {
  Parent = "parent",
  Performer = "performer",
  Manager = "manager",
}

export const MemberGroupConnectionSchema = z.object({
  id: z.number(),
  createdAt: z.string().optional(),
  groupId: z.number(),
  memberId: z.number(),
  tenantId: z.number(),
});

export const MemberUserConnectionSchema = z.object({
  id: z.number(),
  memberId: z.number().nullable(),
  userId: z.string().uuid().nullable(),
  tenantId: z.number().nullable(),
  isParent: z.boolean().default(false),
  isOwner: z.boolean().default(false),
  user: z.lazy(() => UserSchema).nullable(),
});

export const MemberConnectionSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  parentId: z.number(),
  performerId: z.number(),
});

export const FamilyMemberConnectionSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  parentId: z.number(),
  performerId: z.number(),
});

export const CustomFieldWithValueSchema = z.object({
  field: CustomFieldSchema,
  value: CustomFieldValueSchema,
});

// Group schema for relations
export const GroupSchema = z.object({
  id: z.number(),
  ageRange: z.string(),
  level: z.string().nullable(),
  gender: z.string().nullable(),
});

// Group connection with group data
export const MemberGroupConnectionWithGroupSchema =
  MemberGroupConnectionSchema.extend({
    group: GroupSchema.nullable(),
  });

// Family connection with member data
export const FamilyMemberConnectionWithMemberSchema =
  FamilyMemberConnectionSchema.extend({
    parent: z.lazy(() => BaseMemberSchema).nullable(),
    performer: z.lazy(() => BaseMemberSchema).nullable(),
  });

// Simplified member schema for nested relations (only required fields from query)
export const NestedMemberSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  memberType: z.nativeEnum(MemberType).nullable(),
  gender: z.nativeEnum(MemberGender).nullable(),
});

// Family connection with simplified member data for parent connections
export const ParentConnectionSchema = FamilyMemberConnectionSchema.extend({
  performer: NestedMemberSchema.nullable(),
});

// Family connection with simplified member data for performer connections
export const PerformerConnectionSchema = FamilyMemberConnectionSchema.extend({
  parent: NestedMemberSchema.nullable(),
});

export const BaseMemberSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.nativeEnum(MemberGender).nullable(),
  memberType: z.nativeEnum(MemberType).nullable(),
  userId: z.string().uuid().nullable(),
  tenantId: z.number().nullable(),
});

export const MemberSchema = BaseMemberSchema.extend({
  customFields: z.array(CustomFieldWithValueSchema).optional(),
  user: z
    .lazy(() => UserSchema)
    .nullable()
    .optional(),
});

// Member with simple relations (only groups) - matches MEMBER_QUERY_SIMPLE
export const MemberWithSimpleRelationsSchema = MemberSchema.extend({
  groupConnections: z.array(MemberGroupConnectionWithGroupSchema).optional(),
});

// Member with full relations from Supabase query - matches MEMBER_QUERY_WITH_RELATIONS
export const MemberWithRelationsSchema = MemberSchema.extend({
  groupConnections: z.array(MemberGroupConnectionWithGroupSchema).optional(),
  users: z
    .lazy(() => UserSchema)
    .nullable()
    .optional(), // Direct user relation via userId
  // Family connections where this member is the parent
  parentConnections: z.array(ParentConnectionSchema).optional(),
  // Family connections where this member is the performer (child)
  performerConnections: z.array(PerformerConnectionSchema).optional(),
});

export type Member = z.infer<typeof MemberSchema>;
export type MemberWithSimpleRelations = z.infer<
  typeof MemberWithSimpleRelationsSchema
>;
export type MemberWithRelations = z.infer<typeof MemberWithRelationsSchema>;
export type MemberGroupConnection = z.infer<typeof MemberGroupConnectionSchema>;
export type MemberUserConnection = z.infer<typeof MemberUserConnectionSchema>;
export type MemberConnection = z.infer<typeof MemberConnectionSchema>;
export type FamilyMemberConnection = z.infer<
  typeof FamilyMemberConnectionSchema
>;
export type FamilyMemberConnectionWithMember = z.infer<
  typeof FamilyMemberConnectionWithMemberSchema
>;
export type NestedMember = z.infer<typeof NestedMemberSchema>;
export type ParentConnection = z.infer<typeof ParentConnectionSchema>;
export type PerformerConnection = z.infer<typeof PerformerConnectionSchema>;
export type Group = z.infer<typeof GroupSchema>;

export const createMemberFormSchema = () =>
  z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.nativeEnum(MemberGender, {
      required_error: "Gender is required",
    }),
    memberType: z.nativeEnum(MemberType, {
      required_error: "Member type is required",
    }),
    userId: z.string().uuid().optional(),
    groupIds: z.array(z.number()).default([]),
    customFieldValues: z.array(CustomFieldValueSchema).optional(),
  });

export type MemberFormSchema = ReturnType<typeof createMemberFormSchema>;
export type MemberForm = z.infer<MemberFormSchema>;
