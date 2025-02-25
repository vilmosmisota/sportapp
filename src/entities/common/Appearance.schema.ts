import { z } from "zod";

export const AppearanceSchema = z.object({
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .optional(),
  icon: z.string().url().optional(),
  banner: z.string().url().optional(),
  avatar: z.string().url().optional(),
  customCss: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional().default(true),
  metadata: z.record(z.unknown()).optional(),
});

export type Appearance = z.infer<typeof AppearanceSchema>;
