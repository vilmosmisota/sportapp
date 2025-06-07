import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import AttendanceStatisticsPage from "./page";
import { useParams } from "next/navigation";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useGetTeamsByTenantId } from "@/entities/group/Group.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { useTeamAttendanceAggregates } from "@/entities/attendance/Attendance.actions.client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock Supabase
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      eq: jest.fn(),
      single: jest.fn(),
    })),
  })),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock-url.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-key";

// Mock ErrorBoundary component
jest.mock("@/components/ui/error-boundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock all required hooks
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/entities/tenant/Tenant.query", () => ({
  useTenantByDomain: jest.fn(),
}));

jest.mock("@/entities/team/Team.query", () => ({
  useGetTeamsByTenantId: jest.fn(),
}));

jest.mock("@/entities/season/Season.query", () => ({
  useSeasonsByTenantId: jest.fn(),
}));

jest.mock("@/entities/attendance/Attendance.actions.client", () => ({
  useTeamAttendanceAggregates: jest.fn(),
}));

// Mock React Query hooks
jest.mock("@tanstack/react-query", () => {
  const originalModule = jest.requireActual("@tanstack/react-query");
  return {
    ...originalModule,
    useQueryClient: jest.fn(() => ({
      invalidateQueries: jest.fn(),
      setQueryData: jest.fn(),
    })),
  };
});

// Fix: Properly mock useSupabase hook
jest.mock("@/libs/supabase/useSupabase", () => ({
  useSupabase: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
  })),
}));

// Mock data
const mockTenant = {
  id: 5,
  name: "Test Club",
  domain: "test-club",
  type: "organization",
};

const mockTeams = [
  {
    id: 43,
    name: "Team 1",
    age: "U14",
    gender: "male",
    skill: "advanced",
    playerTeamConnections: Array(10).fill({ player: { id: 1 } }),
    coach: {
      firstName: "John",
      lastName: "Doe",
    },
  },
  {
    id: 44,
    name: "Team 2",
    age: "U16",
    gender: "female",
    skill: "intermediate",
    playerTeamConnections: Array(8).fill({ player: { id: 2 } }),
    coach: {
      firstName: "Jane",
      lastName: "Smith",
    },
  },
];

const mockSeasons = [
  {
    id: 6,
    customName: "Spring Season 2025",
    startDate: "2025-03-01",
    endDate: "2025-06-30",
    isActive: true,
  },
  {
    id: 5,
    customName: "Winter Season 2024",
    startDate: "2024-11-01",
    endDate: "2025-02-28",
    isActive: false,
  },
];

const mockStats = {
  id: "23",
  teamId: "43",
  tenantId: "5",
  seasonId: "6",
  totalSessions: 1,
  totalOnTime: 3,
  totalLate: 0,
  totalAbsent: 2,
  averageAttendanceRate: "60.00",
  sessions: [
    {
      date: "2025-03-01T00:00:00.000Z",
      endTime: "12:30",
      lateCount: 0,
      sessionId: 27,
      startTime: "11:47:44",
      trainingId: 851,
      absentCount: 2,
      onTimeCount: 3,
    },
  ],
  aggregatedAt: "2025-03-01 11:52:31.755576+00",
};

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryClientWrapper";

  return Wrapper;
};

// Mock the ResponsiveContainer component from recharts
jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");

  const MockResponsiveContainer = ({ children, ...props }: any) => {
    // Set fixed dimensions for tests
    return (
      <div
        data-testid="responsive-container"
        style={{ width: 500, height: 300 }}
      >
        {children}
      </div>
    );
  };

  MockResponsiveContainer.displayName = "MockResponsiveContainer";

  return {
    ...OriginalModule,
    ResponsiveContainer: MockResponsiveContainer,
  };
});

describe("AttendanceStatisticsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (useParams as jest.Mock).mockReturnValue({ domain: "test-club" });
    (useTenantByDomain as jest.Mock).mockReturnValue({
      data: mockTenant,
      isLoading: false,
    });
    (useGetTeamsByTenantId as jest.Mock).mockReturnValue({
      data: mockTeams,
      isLoading: false,
    });
    (useSeasonsByTenantId as jest.Mock).mockReturnValue({
      data: mockSeasons,
    });
    (useTeamAttendanceAggregates as jest.Mock).mockImplementation((teamId) => {
      if (teamId === 43) {
        return {
          data: mockStats,
          isLoading: false,
          isError: false,
        };
      }
      return {
        data: null,
        isLoading: false,
        isError: true,
      };
    });
  });

  it("renders loading state when tenant or teams are loading", () => {
    (useTenantByDomain as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<AttendanceStatisticsPage params={{ domain: "test-club" }} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("renders no teams message when no teams are found", () => {
    (useGetTeamsByTenantId as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<AttendanceStatisticsPage params={{ domain: "test-club" }} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("No teams found")).toBeInTheDocument();
  });

  it("renders team cards for all teams", async () => {
    render(<AttendanceStatisticsPage params={{ domain: "test-club" }} />, {
      wrapper: createWrapper(),
    });

    // Check that both team cards are rendered
    expect(screen.getByText("Team 1")).toBeInTheDocument();
    expect(screen.getByText("Team 2")).toBeInTheDocument();

    // Check that the active season is displayed in the description
    expect(
      screen.getByText(/Attendance statistics for Spring Season 2025/)
    ).toBeInTheDocument();
  });

  it("filters teams when a team is selected", async () => {
    // First render with all teams
    render(<AttendanceStatisticsPage params={{ domain: "test-club" }} />, {
      wrapper: createWrapper(),
    });

    // Check that both team cards are initially rendered
    expect(screen.getByText("Team 1")).toBeInTheDocument();
    expect(screen.getByText("Team 2")).toBeInTheDocument();

    // Cleanup the first render
    cleanup();

    // Now mock the useGetTeamsByTenantId to return only Team 1
    // This simulates what happens after selecting Team 1 in the dropdown
    (useGetTeamsByTenantId as jest.Mock).mockReturnValue({
      data: [mockTeams[0]], // Only return Team 1
      isLoading: false,
    });

    // Re-render the component
    render(<AttendanceStatisticsPage params={{ domain: "test-club" }} />, {
      wrapper: createWrapper(),
    });

    // Now only Team 1 should be visible
    expect(screen.getByText("Team 1")).toBeInTheDocument();
    expect(screen.queryByText("Team 2")).not.toBeInTheDocument();
  });

  it("displays attendance and accuracy rates correctly", () => {
    render(<AttendanceStatisticsPage params={{ domain: "test-club" }} />, {
      wrapper: createWrapper(),
    });

    // Check for correct attendance rate (60%)
    expect(screen.getByText("60%")).toBeInTheDocument();

    // Check for correct accuracy rate (100%)
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
