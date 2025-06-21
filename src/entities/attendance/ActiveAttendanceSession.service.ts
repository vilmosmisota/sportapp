import { TypedClient } from "@/libs/supabase/type";
import {
  ActiveAttendanceSession,
  ActiveAttendanceSessionSchema,
} from "./ActiveAttendanceSession.schema";

/**
 * Get all active attendance sessions with their session details
 */
export const getActiveAttendanceSessions = async (
  client: TypedClient,
  tenantId: string | number
): Promise<ActiveAttendanceSession[]> => {
  const { data, error } = await client
    .from("activeAttendanceSession")
    .select(
      `
      *,
      session:sessions(
        *,
        group:groups(*)
      )
    `
    )
    .eq("tenantId", Number(tenantId));

  if (error) throw error;

  if (!data) return [];

  try {
    const validatedData = data.map((item) =>
      ActiveAttendanceSessionSchema.parse(item)
    );
    return validatedData;
  } catch (validationError) {
    console.error(
      "Active attendance session data validation failed:",
      validationError
    );
    throw new Error(
      "Invalid active attendance session data received from database"
    );
  }
};

/**
 * Create a new active attendance session
 */
export const createActiveAttendanceSession = async (
  client: TypedClient,
  data: {
    sessionId: number;
    seasonId: number;
    tenantId: number | string;
  }
): Promise<ActiveAttendanceSession> => {
  try {
    const { data: newSession, error } = await client
      .from("activeAttendanceSession")
      .insert({
        sessionId: data.sessionId,
        seasonId: data.seasonId,
        tenantId: Number(data.tenantId),
      })
      .select(
        `
        *,
        session:sessions(
          *,
          group:groups(*)
        )
      `
      )
      .single();

    if (error) {
      console.error("Error creating active attendance session:", error);
      throw error;
    }

    if (!newSession) {
      throw new Error("Failed to create active attendance session");
    }

    // Validate the returned data
    return ActiveAttendanceSessionSchema.parse(newSession);
  } catch (error) {
    console.error("Error in createActiveAttendanceSession:", error);
    throw error;
  }
};

/**
 * Close an active attendance session
 */
export const closeActiveAttendanceSession = async (
  client: TypedClient,
  sessionId: number,
  tenantId: number | string
): Promise<boolean> => {
  try {
    // Delete the active attendance session
    const { error } = await client
      .from("activeAttendanceSession")
      .delete()
      .eq("id", sessionId)
      .eq("tenantId", Number(tenantId));

    if (error) {
      console.error("Error closing active attendance session:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in closeActiveAttendanceSession:", error);
    throw error;
  }
};

/**
 * Delete an active attendance session and all its records
 */
export const deleteActiveAttendanceSession = async (
  client: TypedClient,
  sessionId: number,
  tenantId: number | string
): Promise<boolean> => {
  try {
    // First delete all attendance records for this session
    const { error: recordsError } = await client
      .from("attendanceRecords")
      .delete()
      .eq("activeAttendanceSessionId", sessionId)
      .eq("tenantId", Number(tenantId));

    if (recordsError) {
      console.error("Error deleting attendance records:", recordsError);
      throw recordsError;
    }

    // Then delete the active attendance session
    const { error: sessionError } = await client
      .from("activeAttendanceSession")
      .delete()
      .eq("id", sessionId)
      .eq("tenantId", Number(tenantId));

    if (sessionError) {
      console.error("Error deleting active attendance session:", sessionError);
      throw sessionError;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteActiveAttendanceSession:", error);
    throw error;
  }
};
