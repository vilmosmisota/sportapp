"use server";

import { getServerClient } from "@/libs/supabase/server";
import { cookies } from "next/headers";
import { TeamTableOnDivisionsSchema } from "./TeamStatistics.schema";

export const getTeamStatisticsOnDivisions = async (domain: string) => {
  const serverClient = getServerClient();

  const { data, error } = await serverClient
    .from("tenants")
    .select(
      `id, divisions ( id, name, age, level, gender, team_statistics (*, teams (organization_id, organizations (name, short_name))) )`
    )
    .eq("domain", `${domain}`)
    .order(`points`, {
      ascending: false,
      referencedTable: "divisions.team_statistics",
    })

    .single();

  if (error) {
    throw new Error(error.message);
  }

  return TeamTableOnDivisionsSchema.parse(data);
};
