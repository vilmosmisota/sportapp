"use client";

import { useSupabase } from "@/libs/supabase/useSupabase";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function SupabaseAuthListener({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useSupabase();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED"
      ) {
        queryClient.resetQueries();
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, queryClient]);

  return <>{children}</>;
}
