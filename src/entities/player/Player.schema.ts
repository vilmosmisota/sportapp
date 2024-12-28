import { z } from "zod";

export enum PlayerGender {
  Male = "Male",
  Female = "Female",
}

export enum PlayerPosition {
  Forward = "Forward",
  Midfielder = "Midfielder",
  Defender = "Defender",
  Goalkeeper = "Goalkeeper",
}

export const MembershipCategorySchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  tenantId: z.number().nullable(),
});

const TeamSchema = z
  .object({
    id: z.number(),
    age: z.string().nullish(),
    skill: z.string().nullish(),
    gender: z.string().nullish(),
    clubId: z.number().nullish(),
    coachId: z.string().uuid().nullish(),
    tenantId: z.number().nullish(),
  })
  .nullable();

export const PlayerTeamConnectionSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  teamId: z.number(),
  playerId: z.number(),
  tenantId: z.number().nullable(),
  team: TeamSchema,
});

export const PlayerUserConnectionSchema = z.object({
  id: z.number(),
  playerId: z.number(),
  userId: z.string().uuid(),
  isOwner: z.boolean().nullable(),
  isParent: z.boolean().nullable(),
  tenantId: z.number().nullable(),
  user: z
    .object({
      id: z.string().uuid(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      email: z.string().nullable(),
    })
    .nullable(),
});

export const PlayerSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  firstName: z.string().nullable(),
  secondName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  pin: z
    .string()
    .regex(/^\d{4}$/, "PIN must be a 4-digit number")
    .nullable(),
  tenantId: z.number().nullable(),
  gender: z.nativeEnum(PlayerGender).nullable(),
  position: z.nativeEnum(PlayerPosition).nullable(),
  joinDate: z.string().nullable(),
  membershipCategoryId: z.number().nullable(),
  membershipCategory: MembershipCategorySchema.nullable(),
  teamConnections: z.array(PlayerTeamConnectionSchema).optional().default([]),
  userConnections: z.array(PlayerUserConnectionSchema).optional().default([]),
});

export type Player = z.infer<typeof PlayerSchema>;
export type MembershipCategory = z.infer<typeof MembershipCategorySchema>;
export type PlayerTeamConnection = z.infer<typeof PlayerTeamConnectionSchema>;
export type PlayerUserConnection = z.infer<typeof PlayerUserConnectionSchema>;
export type Team = z.infer<typeof TeamSchema>;

export const createPlayerFormSchema = () =>
  z.object({
    firstName: z.string().min(1, "First name is required"),
    secondName: z.string().min(1, "Second name is required"),
    dateOfBirth: z.string(),
    pin: z
      .string()
      .regex(/^\d{4}$/, "PIN must be a 4-digit number")
      .optional(),
    gender: z.nativeEnum(PlayerGender),
    position: z.nativeEnum(PlayerPosition),
    joinDate: z.string().optional(),
    membershipCategoryId: z.number().optional(),
    teamIds: z.array(z.number()).default([]),
    parentUserIds: z.array(z.string().uuid()).default([]),
    ownerUserId: z.string().uuid().optional(),
  });

export type PlayerFormSchema = ReturnType<typeof createPlayerFormSchema>;
export type PlayerForm = z.infer<PlayerFormSchema>;
