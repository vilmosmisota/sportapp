import { z } from "zod";
import { TenantUserStatus } from "../user/User.schema";

// Schema for the user data from the join (for performers only)
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
});

// Schema for tenant user data from the join
export const TenantUserSchema = z.object({
  status: z.nativeEnum(TenantUserStatus).default(TenantUserStatus.PENDING),
  user: UserSchema.nullable(),
});

// Schema for parent member data from the join (simplified - no user object)
export const ParentMemberSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});

// Schema for parent connection data from the join
export const ParentConnectionSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  parentId: z.number(),
  performerId: z.number(),
  relationship: z.string().nullable(),
  parentMember: ParentMemberSchema.nullable(),
});

// Schema for performer with connections from the raw query result
export const PerformerWithConnectionSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  tenantUser: z
    .array(TenantUserSchema)
    .nullable()
    .transform((tenantUsers) => tenantUsers?.[0] || null), // Take first tenantUser or null
  parentConnections: z.array(ParentConnectionSchema),
});

export const PerformersWithConnectionSchema = z.array(
  PerformerWithConnectionSchema
);

// Type exports
export type User = z.infer<typeof UserSchema>;
export type TenantUser = z.infer<typeof TenantUserSchema>;
export type ParentMember = z.infer<typeof ParentMemberSchema>;
export type ParentConnection = z.infer<typeof ParentConnectionSchema>;
export type PerformerWithConnection = z.infer<
  typeof PerformerWithConnectionSchema
>;
export type PerformersWithConnection = z.infer<
  typeof PerformersWithConnectionSchema
>;
