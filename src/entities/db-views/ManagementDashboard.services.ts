import { TypedClient } from "@/libs/supabase/type";
import {
  ManagementDashboard,
  ManagementDashboardSchema,
} from "./ManagementDashboard.schema";

export const getManagementDashboard = async (
  client: TypedClient,
  tenantId: string
): Promise<ManagementDashboard | null> => {
  const { data, error } = await client
    .from("management_dashboard")
    .select("*")
    .eq("tenantId", Number(tenantId))
    .single();

  if (error) {
    // If no data found, return null instead of throwing
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return ManagementDashboardSchema.parse(data);
};
