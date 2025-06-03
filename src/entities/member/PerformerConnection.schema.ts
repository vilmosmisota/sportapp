import { z } from "zod";

// Schema for the user data from the join (for performers only)
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
});

// Schema for parent member data from the join (simplified - no user object)
export const ParentMemberSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  userId: z.string().uuid().nullable(),
});

// Schema for parent connection data from the join
export const ParentConnectionSchema = z.object({
  parentMember: ParentMemberSchema.nullable(),
});

// Schema for performer with connections from the raw query result
export const PerformerWithConnectionSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  userId: z.string().uuid().nullable(),
  user: UserSchema.nullable(), // Only performers have full user details
  parentConnections: z.array(ParentConnectionSchema),
});

export const PerformersWithConnectionSchema = z.array(
  PerformerWithConnectionSchema
);

// Type exports
export type User = z.infer<typeof UserSchema>;
export type ParentMember = z.infer<typeof ParentMemberSchema>;
export type ParentConnection = z.infer<typeof ParentConnectionSchema>;
export type PerformerWithConnection = z.infer<
  typeof PerformerWithConnectionSchema
>;
export type PerformersWithConnection = z.infer<
  typeof PerformersWithConnectionSchema
>;
