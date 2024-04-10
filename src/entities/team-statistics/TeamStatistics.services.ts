"use server";

import { getServerClient } from "@/libs/supabase/server";
import { cookies } from "next/headers";
import { TeamStatisticsSchema } from "./TeamStatistics.schema";

export const getTeamStatisticsByDivisionId = async (
  divisionId: string,
  domain: string
) => {
  const cookieStore = cookies();
  const serverClient = getServerClient(cookieStore);

  const { data, error } = await serverClient
    .from("tenants")
    .select(
      `id, divisions ( id, name, team_statistics (*, teams (organization_id, organizations (name, short_name))) )`
    )
    .eq("domain", `${domain}`)
    .eq("divisions.id", `${divisionId}`)
    .order(`points`, {
      ascending: false,
      referencedTable: "divisions.team_statistics",
    })
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return TeamStatisticsSchema.parse(data);
};
