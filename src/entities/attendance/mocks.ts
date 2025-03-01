import { jest } from "@jest/globals";

// Mock hooks for testing
export const useTenantByDomain = jest.fn();
export const useAttendanceSessionById = jest.fn();
export const useAttendanceRecords = jest.fn();
export const usePlayersByTeamId = jest.fn();
export const useCloseAttendanceSession = jest.fn();
export const useDeleteAttendanceSession = jest.fn();
export const useUpdateAttendanceStatuses = jest.fn();
