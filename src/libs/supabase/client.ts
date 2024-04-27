import { Database } from "@/db/database.types";
import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

export type TypedBrowserClient = SupabaseClient<Database>;
let client: TypedBrowserClient | undefined;

export function getBrowserClient() {
  if (client) {
    return client;
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
