export const queryKeys = {
  user: {
    all: ["user"] as const,
    current: ["user", "current"] as const,
    list: (tenantId: string | undefined) => ["user", "list", tenantId] as const,
    login: (tenantId: string | undefined) =>
      [...queryKeys.user.all, "login", tenantId] as const,
    logout: () => [...queryKeys.user.all, "logout"] as const,
  },
  tenant: {
    all: ["tenant"] as const,
    detail: (domain: string | undefined) =>
      ["tenant", "detail", domain] as const,
    capabilities: (tenantId: number | undefined) =>
      ["tenant", "capabilities", tenantId] as const,
  },
  season: {
    all: ["season"] as const,
    detail: (tenantId: string | undefined, seasonId: string | undefined) =>
      ["season", "detail", tenantId, seasonId] as const,
  },
  member: {
    all: ["member"] as const,
    list: (tenantId: string | undefined) =>
      ["member", "list", tenantId] as const,
    detail: (tenantId: string | undefined, memberId: string | undefined) =>
      ["member", "detail", tenantId, memberId] as const,
    byType: (tenantId: string | undefined, memberType: string | undefined) =>
      ["member", "byType", tenantId, memberType] as const,
    byGroup: (tenantId: string | undefined, groupId: number | undefined) =>
      ["member", "byGroup", tenantId, groupId] as const,
    familyConnections: (tenantId: string | undefined) =>
      ["member", "familyConnections", tenantId] as const,
  },
  training: {
    all: ["training"] as const,
    grouped: ["training", "grouped"] as const,
    detail: (tenantId?: string, trainingId?: string) =>
      ["training", tenantId, trainingId] as const,
    byDayRange: (days: number) => ["training", "byDayRange", days] as const,
    byDateRange: (
      tenantId?: string,
      startDate?: string,
      endDate?: string,
      seasonId?: number
    ) =>
      [
        "training",
        "byDateRange",
        tenantId,
        startDate,
        endDate,
        seasonId,
      ] as const,
    byPattern: ["training", "byPattern"] as const,
    calendarEvents: (tenantId?: string, month?: string, seasonId?: number) =>
      ["trainingCalendarEvents", tenantId, month, seasonId] as const,
    allCalendarEvents: (tenantId?: string) =>
      ["trainingCalendarEvents", tenantId] as const,
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
  role: {
    all: ["role"] as const,
    list: ["role", "list"] as const,
    userRoles: ["role", "userRoles"] as const,
    detail: (tenantId: string | undefined, roleId: string | undefined) =>
      ["role", "detail", tenantId, roleId] as const,
  },
  group: {
    all: ["group"] as const,
    list: (tenantId: string | undefined) =>
      ["group", "list", tenantId] as const,
    detail: (tenantId: string | undefined, groupId: string | undefined) =>
      ["group", "detail", tenantId, groupId] as const,
    connections: (tenantId: string | undefined, groupId: string | undefined) =>
      ["group", "connections", tenantId, groupId] as const,
  },
  session: {
    all: ["session"] as const,
    list: (tenantId: string | undefined) =>
      ["session", "list", tenantId] as const,
    detail: (tenantId: string | undefined, sessionId: string | undefined) =>
      ["session", "detail", tenantId, sessionId] as const,
    byGroup: (tenantId: string | undefined, groupId: number | undefined) =>
      ["session", "byGroup", tenantId, groupId] as const,
    bySeason: (tenantId: string | undefined, seasonId: number | undefined) =>
      ["session", "bySeason", tenantId, seasonId] as const,
    withGroup: (
      tenantId: string | undefined,
      groupId: number | undefined,
      seasonId: number | undefined,
      monthKey: string | undefined
    ) =>
      ["session", "withGroup", tenantId, groupId, seasonId, monthKey] as const,
  },
} as const;
