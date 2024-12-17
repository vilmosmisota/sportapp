import { Database } from "@/db/database.types";
import { createBrowserClient } from "@supabase/ssr";
import { TypedClient } from "./type";

let client: TypedClient | undefined;

export function getBrowserClient() {
  if (client) {
    return client;
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
