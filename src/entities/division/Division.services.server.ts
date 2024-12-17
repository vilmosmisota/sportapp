"use server";

import { getServerClient } from "@/libs/supabase/server";
import { DivisionsSchema } from "./Division.schema";

export const getDivisions = async (domain: string) => {
  const serverClient = getServerClient();

  const { data, error } = await serverClient
    .from("tenants")
    .select(
      `id, divisions ( *, team_statistics (teams (id, clubs (name, short_name))) )`
    )
    .eq("domain", `${domain}`)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const divisions = data.divisions;

  return DivisionsSchema.parse(divisions);
};
