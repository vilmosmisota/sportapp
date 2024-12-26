import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PlayerMembershipForm,
  SeasonMembershipPriceForm,
} from "./PlayerMembership.schema";
import {
  addPlayerMembership,
  deletePlayerMembership,
  getPlayerMembershipsByTenantId,
  updatePlayerMembership,
  addSeasonMembershipPrice,
  getSeasonMembershipPricesByTenantId,
} from "./PlayerMembership.services";

// Player Memberships
export const usePlayerMemberships = (
  tenantId: string,
  filters?: { playerId?: number; seasonId?: number }
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: [queryKeys.playerMembership.all, tenantId, filters],
    queryFn: () => getPlayerMembershipsByTenantId(client, tenantId, filters),
  });
};

export const useAddPlayerMembership = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlayerMembershipForm) =>
      addPlayerMembership(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.playerMembership.all],
      });
    },
  });
};

export const useUpdatePlayerMembership = (id: number) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlayerMembershipForm) =>
      updatePlayerMembership(client, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.playerMembership.all],
      });
    },
  });
};

export const useDeletePlayerMembership = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePlayerMembership(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.playerMembership.all],
      });
    },
  });
};

// Season Membership Prices
export const useSeasonMembershipPrices = (
  tenantId: string,
  filters?: { seasonId?: number; membershipCategoryId?: number }
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: [queryKeys.seasonMembershipPrice.all, tenantId, filters],
    queryFn: () =>
      getSeasonMembershipPricesByTenantId(client, tenantId, filters),
  });
};

export const useAddSeasonMembershipPrice = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SeasonMembershipPriceForm) =>
      addSeasonMembershipPrice(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.seasonMembershipPrice.all],
      });
    },
  });
};
