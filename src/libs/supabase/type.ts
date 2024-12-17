import { Database } from "@/db/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

export type TypedClient = SupabaseClient<Database>;
