"use client";

import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Session } from "./Session.schema";
import {
  createMultipleSessions,
  createSession,
  deleteSession,
  updateSession,
} from "./Session.services";

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

/**
 * Hook for updating a session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async ({
      sessionId,
      tenantId,
      sessionData,
    }: {
      sessionId: number;
      tenantId: string;
      sessionData: Partial<Omit<Session, "id" | "tenantId">>;
    }) => {
      return updateSession(supabase, sessionId, tenantId, sessionData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.list(variables.tenantId),
      });

      if (data.groupId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.session.byGroup(variables.tenantId, data.groupId),
        });
      }

      if (data.seasonId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.session.bySeason(
            variables.tenantId,
            data.seasonId
          ),
        });
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.session.detail(
          variables.tenantId,
          variables.sessionId.toString()
        ),
      });

      if (data.groupId && data.seasonId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.session.withGroup(
            variables.tenantId,
            data.groupId,
            data.seasonId,
            undefined
          ),
        });
      }
    },
    onError: (error: Error) => {
      console.error("Failed to update session:", error);
    },
  });
}

/**
 * Hook for deleting a session
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async ({
      sessionId,
      tenantId,
      groupId,
      seasonId,
    }: {
      sessionId: number;
      tenantId: string;
      groupId?: number;
      seasonId?: number;
    }) => {
      return deleteSession(supabase, sessionId, tenantId);
    },
    onSuccess: (_, variables) => {
      // Invalidate all session queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.all,
      });

      // Invalidate tenant-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.list(variables.tenantId),
      });

      // Invalidate session detail query
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.detail(
          variables.tenantId,
          variables.sessionId.toString()
        ),
      });

      // Invalidate group-specific queries if groupId is provided
      if (variables.groupId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.session.byGroup(
            variables.tenantId,
            variables.groupId
          ),
        });
      }

      // Invalidate season-specific queries if seasonId is provided
      if (variables.seasonId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.session.bySeason(
            variables.tenantId,
            variables.seasonId
          ),
        });
      }

      // Invalidate group-season specific queries if both are provided
      if (variables.groupId && variables.seasonId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.session.withGroup(
            variables.tenantId,
            variables.groupId,
            variables.seasonId,
            undefined
          ),
        });
      }
    },
    onError: (error: Error) => {
      console.error("Failed to delete session:", error);
    },
  });
}
