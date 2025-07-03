import { z } from "zod";

export const ManagementDashboardSchema = z.object({
  tenantId: z.number(),
  totalPerformers: z.number(),
  malePerformers: z.number(),
  femalePerformers: z.number(),
  totalGroups: z.number(),
  totalInstructors: z.number(),
});

export type ManagementDashboard = z.infer<typeof ManagementDashboardSchema>;
