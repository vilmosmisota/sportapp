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
  groupConnections: z.array(MemberGroupConnectionSchema).optional(),
});

// Class for handling performer data transformation
export class PerformerData {
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly dateOfBirth: string;
  public readonly gender: MemberGender;
  public readonly memberType: MemberType.Performer;
  public readonly userId: string | null;
  public readonly tenantId: number | null;
  public readonly groupConnections: MemberGroupConnection[];

  constructor(formData: PerformerForm) {
    this.firstName = formData.firstName;
    this.lastName = formData.lastName;
    this.dateOfBirth = formData.dateOfBirth;
    this.gender = formData.gender;
    this.memberType = formData.memberType;
    this.userId = formData.userId || null;
    this.tenantId = null; // Will be set by the service
    this.groupConnections = formData.groupConnections || [];
  }

  // Convert to the format expected by the service
  toServiceData(): Omit<Performer, "id" | "createdAt"> {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      memberType: this.memberType,
      userId: this.userId,
      tenantId: this.tenantId,
      groupConnections: this.groupConnections,
    };
  }

  // Static factory method for creating from form data
  static fromFormData(formData: PerformerForm): PerformerData {
    return new PerformerData(formData);
  }
}

// Type exports
export type Group = z.infer<typeof GroupSchema>;
export type MemberGroupConnection = z.infer<typeof MemberGroupConnectionSchema>;
export type Performer = z.infer<typeof PerformerSchema>;
export type Performers = z.infer<typeof PerformersSchema>;
export type PerformerWithGroupIds = z.infer<typeof PerformerWithGroupIdsSchema>;
export type PerformerForm = z.infer<typeof PerformerFormSchema>;
