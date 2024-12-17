export const queryKeys = {
  user: {
    all: ["user"] as const,
    login: (tenantId: string | undefined) =>
      [...queryKeys.user.all, "login", tenantId] as const,
    logout: () => [...queryKeys.user.all, "logout"] as const,
  },
  tenant: {
    all: ["tenant"] as const,
    detail: (tenantId: string | undefined) =>
      [...queryKeys.tenant.all, tenantId] as const,
  },
  season: {
    all: ["season"] as const,
    detail: (tenantId: string | undefined, seasonId: string | undefined) =>
      [...queryKeys.season.all, tenantId, seasonId] as const,
  },
  team: {
    all: ["team"] as const,
    detail: (tenantId: string | undefined, teamId: string | undefined) =>
      [...queryKeys.team.all, tenantId, teamId] as const,
  },
  playerFeeCategory: {
    all: ["playerFeeCategory"] as const,
    detail: (
      tenantId: string | undefined,
      playerFeeCategoryId: string | undefined
    ) =>
      [
        ...queryKeys.playerFeeCategory.all,
        tenantId,
        playerFeeCategoryId,
      ] as const,
  },
  membershipCategory: {
    all: ["membershipCategory"] as const,
    detail: (
      tenantId: string | undefined,
      membershipCategoryId: string | undefined
    ) =>
      [
        ...queryKeys.membershipCategory.all,
        tenantId,
        membershipCategoryId,
      ] as const,
  },
};
