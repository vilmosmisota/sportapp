"use client";

import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Session } from "./Session.schema";
import { createMultipleSessions, createSession } from "./Session.services";

/**
 * Hook for creating a single session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async ({
      tenantId,
      sessionData,
    }: {
      tenantId: string;
      sessionData: Omit<Session, "id" | "tenantId">;
    }) => {
      return createSession(supabase, tenantId, sessionData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.list(variables.tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.byGroup(
          variables.tenantId,
          variables.sessionData.groupId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.bySeason(
          variables.tenantId,
          variables.sessionData.seasonId
        ),
      });
    },
    onError: (error: Error) => {
      console.error("Failed to create session:", error);
    },
  });
}

/**
 * Hook for creating multiple sessions in a batch
 */
export function useCreateMultipleSessions() {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async ({
      tenantId,
      sessionsData,
    }: {
      tenantId: string;
      sessionsData: Omit<Session, "id" | "tenantId">[];
    }) => {
      return createMultipleSessions(supabase, tenantId, sessionsData);
    },
    onSuccess: (data, variables) => {
      // Get unique groupIds and seasonIds from the created sessions
      const groupIds = Array.from(
        new Set(variables.sessionsData.map((s) => s.groupId))
      );
      const seasonIds = Array.from(
        new Set(variables.sessionsData.map((s) => s.seasonId))
      );

      // Invalidate relevant queries using proper cache keys
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.list(variables.tenantId),
      });

      groupIds.forEach((groupId) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.session.byGroup(variables.tenantId, groupId),
        });
      });

      seasonIds.forEach((seasonId) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.session.bySeason(variables.tenantId, seasonId),
        });
      });

      variables.sessionsData.forEach((session) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.session.withGroup(
            variables.tenantId,
            session.groupId,
            session.seasonId,
            undefined // Will invalidate all date ranges for this group/season
          ),
        });
      });
    },
    onError: (error: Error) => {
      console.error("Failed to create sessions:", error);
    },
  });
}
