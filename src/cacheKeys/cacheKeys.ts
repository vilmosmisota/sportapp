export const queryKeys = {
  user: {
    all: ["user"] as const,
    current: ["user", "current"] as const,
    list: ["user", "list"] as const,
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
    coaches: (tenantId: string | undefined) =>
      [...queryKeys.team.all, tenantId] as const,
    detail: (tenantId: string | undefined, teamId: string | undefined) =>
      [...queryKeys.team.all, tenantId, teamId] as const,
    players: (tenantId: string | undefined, teamId: number | undefined) =>
      [...queryKeys.team.all, "players", tenantId, teamId] as const,
  },
  player: {
    all: ["player"] as const,
    detail: (tenantId: string | undefined, playerId: string | undefined) =>
      [...queryKeys.player.all, tenantId, playerId] as const,
  },
  playerTeam: {
    all: ["playerTeam"] as const,
    detail: (tenantId: string | undefined, connectionId: string | undefined) =>
      [...queryKeys.playerTeam.all, tenantId, connectionId] as const,
  },
  playerMembership: {
    all: ["playerMembership"] as const,
    detail: (tenantId: string | undefined, membershipId: string | undefined) =>
      [...queryKeys.playerMembership.all, tenantId, membershipId] as const,
  },
  seasonMembershipPrice: {
    all: ["seasonMembershipPrice"] as const,
    detail: (
      tenantId: string | undefined,
      seasonId: string | undefined,
      membershipCategoryId: string | undefined
    ) =>
      [
        ...queryKeys.seasonMembershipPrice.all,
        tenantId,
        seasonId,
        membershipCategoryId,
      ] as const,
  },
  training: {
    all: ["training"] as const,
    grouped: ["training", "grouped"] as const,
    detail: (tenantId: string | undefined, trainingId: string | undefined) =>
      ["training", tenantId, trainingId] as const,
    byDayRange: (days: number) => ["training", "byDayRange", days] as const,
  },
  trainingSeasonConnection: {
    all: ["trainingSeasonConnection"] as const,
    detail: (tenantId: string | undefined, connectionId: string | undefined) =>
      [
        ...queryKeys.trainingSeasonConnection.all,
        tenantId,
        connectionId,
      ] as const,
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
  coach: {
    all: "coaches",
  },
  users: {
    all: "users",
  },
  attendance: {
    all: ["attendance"] as const,
    sessions: ["attendance", "sessions"] as const,
    activeSessions: ["attendance", "activeSessions"] as const,
    records: ["attendance", "records"] as const,
    detail: (tenantId?: string, sessionId?: string) =>
      ["attendance", "detail", tenantId, sessionId] as const,
    stats: (tenantId?: string, teamId?: number) =>
      ["attendance", "stats", tenantId, teamId] as const,
    teamStats: (tenantId?: string, teamId?: number) =>
      ["attendance", "teamStats", tenantId, teamId] as const,
    aggregates: ["attendance", "aggregates"] as const,
  },
} as const;
