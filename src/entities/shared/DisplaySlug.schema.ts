import { z } from "zod";

export const DisplaySlugSchema = z.object({
  /**
   * User-facing plural name for the section (e.g. "Squads", "Players").
   */
  displayName: z.string().optional(),
  /**
   * URL-friendly slug (e.g. "squads", "players").
   * Must be lowercase, alphanumeric, and may include dashes.
   */
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be URL-friendly")
    .optional(),
});
