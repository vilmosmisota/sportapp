import { z } from "zod";

export enum MemberGender {
  Male = "Male",
  Female = "Female",
}

export enum MemberType {
  Guardian = "guardian",
  Performer = "performer",
  Manager = "manager",
}

export const MemberSchema = z.object({
  id: z.number(),
  gender: z.nativeEnum(MemberGender).nullable(),
  tenantUserId: z.number().nullable(),
  lastName: z.string().nullable(),
  tenantId: z.number(),
  createdAt: z.string(),
  firstName: z.string().nullable(),
  memberType: z.nativeEnum(MemberType),
  dateOfBirth: z.string().nullable(),
});

export type Member = z.infer<typeof MemberSchema>;
