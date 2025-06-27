import { z } from "zod";
import { MemberType } from "../member/Member.schema";
import { GroupSchema } from "./Group.schema";

export const GroupMemberSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.string().nullable(),
  memberType: z.nativeEnum(MemberType),
  pin: z.number().nullable(),
});

export const MemberGroupConnectionSchema = z.object({
  id: z.number(),
  groupId: z.number(),
  memberId: z.number(),
  tenantId: z.number(),
  isPrimary: z.boolean(),
  isInstructor: z.boolean(),
  member: GroupMemberSchema,
});

export const GroupMembersByTypeSchema = z.object({
  performers: z.array(MemberGroupConnectionSchema),
  instructors: z.array(MemberGroupConnectionSchema),
});

export const GroupConnectionSchema = z.object({
  group: GroupSchema,
  memberConnections: GroupMembersByTypeSchema,
});

// Schema for member assignment data
export const MemberAssignmentSchema = z.object({
  memberId: z.number(),
  isPrimary: z.boolean().default(false),
  isInstructor: z.boolean().default(false),
});

// Schema for member assignment updates (includes connection ID)
export const MemberAssignmentUpdateSchema = z.object({
  connectionId: z.number(),
  memberId: z.number(),
  isPrimary: z.boolean(),
  isInstructor: z.boolean(),
});

// Schema for the diff-based assignment changes
export const AssignMembersToGroupDiffSchema = z.object({
  groupId: z.number(),
  tenantId: z.number(),
  toAdd: z.array(MemberAssignmentSchema),
  toRemove: z.array(z.number()), // Array of member IDs to remove
  toUpdate: z.array(MemberAssignmentUpdateSchema),
});

// Schema for the assignment result
export const GroupMemberAssignmentResultSchema = z.object({
  success: z.boolean(),
  addedCount: z.number(),
  removedCount: z.number(),
  updatedCount: z.number(),
});

// Type exports
export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type MemberGroupConnection = z.infer<typeof MemberGroupConnectionSchema>;
export type GroupMembersByType = z.infer<typeof GroupMembersByTypeSchema>;
export type GroupConnection = z.infer<typeof GroupConnectionSchema>;
export type MemberAssignment = z.infer<typeof MemberAssignmentSchema>;
export type MemberAssignmentUpdate = z.infer<
  typeof MemberAssignmentUpdateSchema
>;
export type AssignMembersToGroupDiff = z.infer<
  typeof AssignMembersToGroupDiffSchema
>;
export type GroupMemberAssignmentResult = z.infer<
  typeof GroupMemberAssignmentResultSchema
>;
