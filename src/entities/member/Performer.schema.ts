import { z } from "zod";
import { MemberGender, MemberType } from "./Member.schema";

export const GroupSchema = z.object({
  id: z.number(),
  ageRange: z.string(),
  level: z.string().nullable(),
  gender: z.string().nullable(),
});

export const MemberGroupConnectionSchema = z.object({
  id: z.number(),
  createdAt: z.string().optional(),
  groupId: z.number(),
  memberId: z.number(),
  tenantId: z.number(),
  group: GroupSchema.nullable(),
});

export const PerformerSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.enum([MemberGender.Male, MemberGender.Female]).nullable(),
  memberType: z.literal(MemberType.Performer),
  userId: z.string().uuid().nullable(),
  tenantId: z.number().nullable(),
  pin: z.number().nullable(),

  // Relations from query
  groupConnections: z.array(MemberGroupConnectionSchema).optional(),
});

export const PerformersSchema = z.array(PerformerSchema);

export const PerformerWithGroupIdsSchema = PerformerSchema.extend({
  groupIds: z.array(z.number()),
});

// Form schema for creating/editing performers
export const PerformerFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum([MemberGender.Male, MemberGender.Female]),
  memberType: z.literal(MemberType.Performer),
  userId: z.string().uuid().nullable().optional(),
  tenantId: z.number().nullable().optional(),
  pin: z
    .number()
    .min(1000, "PIN must be exactly 4 digits")
    .max(9999, "PIN must be exactly 4 digits")
    .optional(),
  groupConnections: z.array(MemberGroupConnectionSchema).optional(),
});

// Type exports
export type Group = z.infer<typeof GroupSchema>;
export type MemberGroupConnection = z.infer<typeof MemberGroupConnectionSchema>;
export type Performer = z.infer<typeof PerformerSchema>;
export type Performers = z.infer<typeof PerformersSchema>;
export type PerformerWithGroupIds = z.infer<typeof PerformerWithGroupIdsSchema>;
export type PerformerForm = z.infer<typeof PerformerFormSchema>;
