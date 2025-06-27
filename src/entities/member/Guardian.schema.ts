import { z } from "zod";
import { MemberGender, MemberType } from "./Member.schema";

// Schema for performer member data from the join (simplified)
export const PerformerMemberSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
});

// Schema for performer connection data from the join
export const PerformerConnectionSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  parentId: z.number(),
  performerId: z.number(),
  relationship: z.string().nullable(),
  performerMember: PerformerMemberSchema.nullable(),
});

// Schema for guardian with connections from the raw query result
export const GuardianWithConnectionSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.enum([MemberGender.Male, MemberGender.Female]).nullable(),
  memberType: z.literal(MemberType.Guardian),
  tenantId: z.number(),
  createdAt: z.string(),
  performerConnections: z.array(PerformerConnectionSchema),
});

export const GuardiansWithConnectionSchema = z.array(
  GuardianWithConnectionSchema
);

// Base Guardian schema
export const GuardianSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.enum([MemberGender.Male, MemberGender.Female]).nullable(),
  memberType: z.literal(MemberType.Guardian),
  tenantId: z.number(),
});

export const GuardiansSchema = z.array(GuardianSchema);

// Form schema for creating/editing guardians
export const GuardianFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().optional(),
  gender: z.enum([MemberGender.Male, MemberGender.Female]).optional(),
  memberType: z.literal(MemberType.Guardian),
  tenantId: z.number().nullable().optional(),
});

// Type exports
export type PerformerMember = z.infer<typeof PerformerMemberSchema>;
export type PerformerConnection = z.infer<typeof PerformerConnectionSchema>;
export type GuardianWithConnection = z.infer<
  typeof GuardianWithConnectionSchema
>;
export type GuardiansWithConnection = z.infer<
  typeof GuardiansWithConnectionSchema
>;
export type Guardian = z.infer<typeof GuardianSchema>;
export type Guardians = z.infer<typeof GuardiansSchema>;
export type GuardianForm = z.infer<typeof GuardianFormSchema>;
