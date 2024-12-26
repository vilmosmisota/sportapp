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
  tenantId: z.number(),
  gender: z.nativeEnum(PlayerGender).nullable(),
  position: z.nativeEnum(PlayerPosition).nullable(),
  playerTeamConnections: z
    .array(
      z.object({
        id: z.number(),
        teamId: z.number(),
        team: z
          .object({
            id: z.number(),
            age: z.string().nullable(),
            gender: z.string().nullable(),
            skill: z.string().nullable(),
          })
          .nullable(),
      })
    )
    .optional(),
  membership: z
    .object({
      id: z.number(),
      createdAt: z.string(),
      playerId: z.number(),
      seasonId: z.number(),
      memberhsipCategoryId: z.number(),
      joinDate: z.string(),
      season: z
        .object({
          id: z.number(),
          name: z.string(),
        })
        .nullable(),
      membershipCategory: z
        .object({
          id: z.number(),
          name: z.string(),
        })
        .nullable(),
    })
    .nullable(),
  parentEntityId: z.number().nullable(),
  parent: z
    .object({
      id: z.string().uuid(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      email: z.string().email().nullable(),
    })
    .nullable(),
});

export type Player = z.infer<typeof PlayerSchema>;

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
    parentId: z.string().uuid().optional(),
  });

export type PlayerFormSchema = ReturnType<typeof createPlayerFormSchema>;
export type PlayerForm = z.infer<PlayerFormSchema>;
