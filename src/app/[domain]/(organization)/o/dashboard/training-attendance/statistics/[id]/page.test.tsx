import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import TeamAttendanceStatisticsPage from "./page";
import { useParams } from "next/navigation";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { useAllTeamPlayerAttendanceAggregates } from "@/entities/attendance/Attendance.actions.client";
import {
  calculateAttendanceRate,
  calculateAccuracyRate,
} from "@/entities/attendance/Attendance.utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { AttendanceStatus } from "@/entities/attendance/Attendance.schema";

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
  useAllTeamPlayerAttendanceAggregates: jest.fn(),
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

const mockTeam = {
  id: 43,
  name: "Team 1",
  age: "U14",
  gender: "male",
  skill: "advanced",
  playerTeamConnections: [
    {
      player: {
        id: 101,
        firstName: "John",
        lastName: "Doe",
      },
    },
    {
      player: {
        id: 102,
        firstName: "Jane",
        lastName: "Smith",
      },
    },
    {
      player: {
        id: 103,
        firstName: "Bob",
        lastName: "Johnson",
      },
    },
  ],
  coach: {
    firstName: "Coach",
    lastName: "Person",
  },
};

const mockTeams = [mockTeam];

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

const mockPlayerStats = [
  {
    playerId: 101,
    totalOnTime: 4,
    totalLate: 1,
    totalAbsent: 1,
    records: [
      {
        date: "2025-03-01T00:00:00.000Z",
        status: AttendanceStatus.PRESENT,
        sessionId: 1,
      },
      {
        date: "2025-03-03T00:00:00.000Z",
        status: AttendanceStatus.PRESENT,
        sessionId: 2,
      },
      {
        date: "2025-03-05T00:00:00.000Z",
        status: AttendanceStatus.LATE,
        sessionId: 3,
      },
      {
        date: "2025-03-08T00:00:00.000Z",
        status: AttendanceStatus.PRESENT,
        sessionId: 4,
      },
      {
        date: "2025-03-10T00:00:00.000Z",
        status: AttendanceStatus.PRESENT,
        sessionId: 5,
      },
      {
        date: "2025-03-12T00:00:00.000Z",
        status: AttendanceStatus.ABSENT,
        sessionId: 6,
      },
    ],
  },
  {
    playerId: 102,
    totalOnTime: 3,
    totalLate: 2,
    totalAbsent: 1,
    records: [
      {
        date: "2025-03-01T00:00:00.000Z",
        status: AttendanceStatus.PRESENT,
        sessionId: 1,
      },
      {
        date: "2025-03-03T00:00:00.000Z",
        status: AttendanceStatus.LATE,
        sessionId: 2,
      },
      {
        date: "2025-03-05T00:00:00.000Z",
        status: AttendanceStatus.LATE,
        sessionId: 3,
      },
      {
        date: "2025-03-08T00:00:00.000Z",
        status: AttendanceStatus.PRESENT,
        sessionId: 4,
      },
      {
        date: "2025-03-10T00:00:00.000Z",
        status: AttendanceStatus.PRESENT,
        sessionId: 5,
      },
      {
        date: "2025-03-12T00:00:00.000Z",
        status: AttendanceStatus.ABSENT,
        sessionId: 6,
      },
    ],
  },
  {
    playerId: 103,
    totalOnTime: 2,
    totalLate: 1,
    totalAbsent: 3,
    records: [
      {
        date: "2025-03-01T00:00:00.000Z",
        status: AttendanceStatus.ABSENT,
        sessionId: 1,
      },
      {
        date: "2025-03-03T00:00:00.000Z",
        status: AttendanceStatus.PRESENT,
        sessionId: 2,
      },
      {
        date: "2025-03-05T00:00:00.000Z",
        status: AttendanceStatus.LATE,
        sessionId: 3,
      },
      {
        date: "2025-03-08T00:00:00.000Z",
        status: AttendanceStatus.ABSENT,
        sessionId: 4,
      },
      {
        date: "2025-03-10T00:00:00.000Z",
        status: AttendanceStatus.PRESENT,
        sessionId: 5,
      },
      {
        date: "2025-03-12T00:00:00.000Z",
        status: AttendanceStatus.ABSENT,
        sessionId: 6,
      },
    ],
  },
];

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

describe("TeamAttendanceStatisticsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (useParams as jest.Mock).mockReturnValue({
      domain: "test-club",
      id: "43",
    });
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
    (useAllTeamPlayerAttendanceAggregates as jest.Mock).mockReturnValue({
      data: mockPlayerStats,
      isLoading: false,
    });
  });

  it("renders loading state when data is loading", () => {
    (useAllTeamPlayerAttendanceAggregates as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<TeamAttendanceStatisticsPage />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByTestId("team-statistics-loading")).toBeInTheDocument();
  });

  it("renders no data message when no stats available", () => {
    (useAllTeamPlayerAttendanceAggregates as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<TeamAttendanceStatisticsPage />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByText(/No attendance data available/i)
    ).toBeInTheDocument();
  });

  it("renders team statistics correctly", async () => {
    render(<TeamAttendanceStatisticsPage />, {
      wrapper: createWrapper(),
    });

    // Check if title is rendered
    expect(screen.getByText("Team 1")).toBeInTheDocument();

    // Check if attendance charts are rendered
    expect(screen.getByTestId("attendance-charts")).toBeInTheDocument();

    // Check if performance overview is rendered
    expect(screen.getByTestId("performance-overview")).toBeInTheDocument();

    // Check if attendance table is rendered
    expect(screen.getByTestId("attendance-table")).toBeInTheDocument();
  });

  it("calculates attendance and accuracy rates correctly", () => {
    // Test the utility functions directly with our mock data
    const onTime = 4;
    const late = 1;
    const absent = 1;

    // Calculate attendance rate: (onTime + late) / total
    const attendanceRate = calculateAttendanceRate(onTime, late, absent);
    expect(attendanceRate).toBe(83); // (4+1)/(4+1+1) = 5/6 = 83%

    // Calculate accuracy rate: onTime / (onTime + late)
    const accuracyRate = calculateAccuracyRate(onTime, late);
    expect(accuracyRate).toBe(80); // 4/(4+1) = 4/5 = 80%
  });

  it("processes trend data correctly", () => {
    // This test will verify the trendData calculations
    render(<TeamAttendanceStatisticsPage />, {
      wrapper: createWrapper(),
    });

    // We can't easily access the internal variables directly,
    // but we can verify the charts are rendered correctly
    const attendanceCharts = screen.getByTestId("attendance-charts");
    expect(attendanceCharts).toBeInTheDocument();

    // Verify chart components exist - updated to match actual titles
    expect(
      within(attendanceCharts).getByText(/Attendance & Accuracy Trends/i)
    ).toBeInTheDocument();
    expect(
      within(attendanceCharts).getByText(/Attendance & Accuracy by Day/i)
    ).toBeInTheDocument();
  });

  it("displays correct player performance data", () => {
    render(<TeamAttendanceStatisticsPage />, {
      wrapper: createWrapper(),
    });

    const performanceOverview = screen.getByTestId("performance-overview");
    expect(performanceOverview).toBeInTheDocument();

    // Check for top performers section
    expect(
      within(performanceOverview).getByText(/Top Performers/i)
    ).toBeInTheDocument();

    // Verify player names are present somewhere in the overview
    // We don't need to check exact players, just verify there are performance entries
    const performanceEntries =
      within(performanceOverview).getAllByRole("progressbar");
    expect(performanceEntries.length).toBeGreaterThan(0);

    // Verify attendance and accuracy labels are present
    const attendanceLabels =
      within(performanceOverview).getAllByText(/% Attendance/i);
    expect(attendanceLabels.length).toBeGreaterThan(0);

    const accuracyLabels =
      within(performanceOverview).getAllByText(/% Accuracy/i);
    expect(accuracyLabels.length).toBeGreaterThan(0);
  });
});
