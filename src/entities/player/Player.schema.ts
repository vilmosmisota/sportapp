import { z } from "zod";
import { UserSchema } from "../user/User.schema";
import { AppearanceSchema } from "../common/Appearance.schema";

export enum PlayerGender {
  Male = "Male",
  Female = "Female",
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
    appearance: AppearanceSchema.nullable().optional(),
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
  playerId: z.number().nullable(),
  userId: z.string().uuid().nullable(),
  tenantId: z.number().nullable(),
  isParent: z.boolean().default(false),
  isOwner: z.boolean().default(false),
  user: UserSchema.nullable(),
});

export const PlayerSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  pin: z.union([
    z.string().regex(/^\d{4}$/, "If provided, PIN must be a 4-digit number"),
    z.string().max(0),
    z.null(),
    z.undefined(),
  ]),
  tenantId: z.number().nullable(),
  gender: z.nativeEnum(PlayerGender).nullable(),
  position: z.string().nullable(),
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
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    pin: z.union([
      z.string().regex(/^\d{4}$/, "If provided, PIN must be a 4-digit number"),
      z.string().max(0),
      z.null(),
      z.undefined(),
    ]),
    gender: z.nativeEnum(PlayerGender, {
      required_error: "Gender is required",
    }),
    position: z.string().optional().nullable(),
    teamIds: z.array(z.number()).default([]),
    parentUserIds: z.array(z.string().uuid()).default([]),
    ownerUserId: z.string().uuid().optional(),
  });

export type PlayerFormSchema = ReturnType<typeof createPlayerFormSchema>;
export type PlayerForm = z.infer<PlayerFormSchema>;
