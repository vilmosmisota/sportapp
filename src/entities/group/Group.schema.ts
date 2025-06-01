import { z } from "zod";
import {
  CustomFieldSchema,
  CustomFieldValueSchema,
} from "../custom-field/CustomFieldSchema";
import { AppearanceSchema } from "../shared/Appearance.schema";

export enum GroupGender {
  Male = "Male",
  Female = "Female",
  Mixed = "Mixed",
}

export enum MemberType {
  Parent = "parent",
  Performer = "performer",
}

export const BaseMemberSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.string().nullable(),
  memberType: z.nativeEnum(MemberType).nullable(),
  userId: z.string().uuid().nullable(),
});

export const MemberGroupConnectionSchema = z.object({
  id: z.number(),
  groupId: z.number(),
  memberId: z.number(),
  tenantId: z.number(),
  member: BaseMemberSchema,
});

export const GroupInstructorSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});

export const CustomFieldWithValueSchema = z.object({
  field: CustomFieldSchema,
  value: CustomFieldValueSchema,
});

// Base group schema without relations
export const BaseGroupSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  age: z.string().nullable(),
  gender: z.nativeEnum(GroupGender).nullable(),
  skill: z.string().nullable(),
  memberCount: z.number().nullable().optional(),
  tenantId: z.number(),
  opponentId: z.number().nullable().optional(),
  instructorId: z.number().nullable(),
  appearance: AppearanceSchema.nullable().optional(),
});

// Full group schema with all relations
export const GroupSchema = BaseGroupSchema.extend({
  instructor: GroupInstructorSchema.nullable().optional(),
  performers: z.array(BaseMemberSchema).optional(),
  parents: z.array(BaseMemberSchema).optional(),
  customFields: z.array(CustomFieldWithValueSchema).optional(),
});

export type Group = z.infer<typeof GroupSchema>;

export const createGroupFormSchema = (
  ageGroups: string[],
  skillLevels: string[]
) =>
  z.object({
    age: z.enum([...ageGroups] as [string, ...string[]]),
    gender: z.nativeEnum(GroupGender),
    skill: z.enum([...skillLevels] as [string, ...string[]]),
    instructorId: z.number().nullable().optional(),
    appearance: AppearanceSchema.nullable().optional(),
    opponentId: z.number().nullable().optional(),
    performerIds: z.array(z.number()).optional(),
    parentIds: z.array(z.number()).optional(),
    customFieldValues: z.array(CustomFieldValueSchema).optional(),
  });

export type GroupFormSchema = ReturnType<typeof createGroupFormSchema>;
export type GroupForm = z.infer<GroupFormSchema>;
