import { GroupSchema } from "@/entities/group/Group.schema";
import { LocationSchema } from "@/entities/shared/Location.schema";
import { z } from "zod";

// Input schemas for querying sessions
export const SessionDateRangeSchema = z.object({
  from: z.string(), // ISO date string (YYYY-MM-DD)
  to: z.string(), // ISO date string (YYYY-MM-DD)
});

export const SessionQueryParamsSchema = z.object({
  tenantId: z.number(),
  groupId: z.number(),
  seasonId: z.number(),
  dateRange: SessionDateRangeSchema.optional(),
});

// Base session schema (database structure)
export const SessionSchema = z.object({
  id: z.number(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: LocationSchema.nullable(),
  tenantId: z.number(),
  groupId: z.number(),
  seasonId: z.number(),
  isAggregated: z.boolean().default(false),
});

// Session with group data (what gets returned)
export const SessionWithGroupSchema = SessionSchema.extend({
  group: GroupSchema,
});

// Type exports
export type SessionDateRange = z.infer<typeof SessionDateRangeSchema>;
export type SessionQueryParams = z.infer<typeof SessionQueryParamsSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type SessionWithGroup = z.infer<typeof SessionWithGroupSchema>;
