import { TypedClient } from "@/libs/supabase/type";
import {
  AttendanceSession,
  AttendanceRecord,
  attendanceSessionSchema,
  attendanceRecordSchema,
  CreateAttendanceSession,
  CreateAttendanceRecord,
  UpdateAttendanceSession,
  UpdateAttendanceRecord,
  TeamAttendanceStats,
  PlayerAttendanceStats,
  teamAttendanceStatsSchema,
  playerAttendanceStatsSchema,
  AttendanceStatus,
} from "./Attendance.schema";

const ATTENDANCE_SESSION_QUERY_WITH_RELATIONS = `
  *,
  training:trainings (
    id,
    date,
    startTime,
    endTime,
    teamId
  ),
  season:seasons (
    id
  )
`;

const ATTENDANCE_RECORD_QUERY_WITH_RELATIONS = `
  *,
  player:players (
    id,
    firstName,
    lastName
  ),
  attendanceSession:attendanceSession (
    id,
    startTime,
    endTime
  )
`;

// Domain logic for calculating attendance status
export const calculateAttendanceStatus = (
  trainingStartTime: string,
  checkInTime: string,
  lateThresholdMinutes: number
): AttendanceStatus => {
  // Parse training start time and check-in time
  const [trainingHours, trainingMinutes] = trainingStartTime
    .split(":")
    .map(Number);
  const [checkInHours, checkInMinutes] = checkInTime.split(":").map(Number);

  // Calculate minutes difference
  const trainingTimeInMinutes = trainingHours * 60 + trainingMinutes;
  const checkInTimeInMinutes = checkInHours * 60 + checkInMinutes;
  const minutesDifference = checkInTimeInMinutes - trainingTimeInMinutes;

  return minutesDifference <= lateThresholdMinutes
    ? AttendanceStatus.PRESENT
    : AttendanceStatus.LATE;
};

// AttendanceSession Services
export const getAttendanceSessions = async (
  client: TypedClient,
  tenantId: string
) => {
  try {
    const { data, error } = await client
      .from("attendanceSession")
      .select(ATTENDANCE_SESSION_QUERY_WITH_RELATIONS)
      .eq("tenantId", tenantId)
      .order("startTime", { ascending: true });

    if (error) throw error;
    return data.map((session) => attendanceSessionSchema.parse(session));
  } catch (error) {
    console.error("Error in getAttendanceSessions:", error);
    throw error;
  }
};

export const getAttendanceSessionById = async (
  client: TypedClient,
  sessionId: number,
  tenantId: string
) => {
  try {
    const { data, error } = await client
      .from("attendanceSession")
      .select(ATTENDANCE_SESSION_QUERY_WITH_RELATIONS)
      .eq("id", sessionId)
      .eq("tenantId", tenantId)
      .single();

    if (error) throw error;
    return attendanceSessionSchema.parse(data);
  } catch (error) {
    console.error("Error in getAttendanceSessionById:", error);
    throw error;
  }
};

export const createAttendanceSession = async (
  client: TypedClient,
  data: CreateAttendanceSession,
  tenantId: string
) => {
  try {
    const { data: newSession, error } = await client
      .from("attendanceSession")
      .insert({
        ...data,
        tenantId: Number(tenantId),
      })
      .select(ATTENDANCE_SESSION_QUERY_WITH_RELATIONS)
      .single();

    if (error) throw error;
    return attendanceSessionSchema.parse(newSession);
  } catch (error) {
    console.error("Error in createAttendanceSession:", error);
    throw error;
  }
};

export const updateAttendanceSession = async (
  client: TypedClient,
  sessionId: number,
  data: UpdateAttendanceSession,
  tenantId: string
) => {
  try {
    const { data: updatedSession, error } = await client
      .from("attendanceSession")
      .update(data)
      .eq("id", sessionId)
      .eq("tenantId", tenantId)
      .select(ATTENDANCE_SESSION_QUERY_WITH_RELATIONS)
      .single();

    if (error) throw error;
    return attendanceSessionSchema.parse(updatedSession);
  } catch (error) {
    console.error("Error in updateAttendanceSession:", error);
    throw error;
  }
};

export const deleteAttendanceSession = async (
  client: TypedClient,
  sessionId: number,
  tenantId: string
) => {
  try {
    const { error } = await client
      .from("attendanceSession")
      .delete()
      .eq("id", sessionId)
      .eq("tenantId", tenantId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error in deleteAttendanceSession:", error);
    throw error;
  }
};

export const getActiveAttendanceSessions = async (
  client: TypedClient,
  tenantId: string
) => {
  try {
    const { data, error } = await client
      .from("attendanceSession")
      .select(ATTENDANCE_SESSION_QUERY_WITH_RELATIONS)
      .eq("tenantId", tenantId)
      .eq("isActive", true)
      .order("startTime", { ascending: true });

    if (error) throw error;
    return data.map((session) => attendanceSessionSchema.parse(session));
  } catch (error) {
    console.error("Error in getActiveAttendanceSessions:", error);
    throw error;
  }
};

// AttendanceRecord Services
export const getAttendanceRecords = async (
  client: TypedClient,
  sessionId: number,
  tenantId: string
) => {
  try {
    const { data, error } = await client
      .from("attendanceRecords")
      .select(ATTENDANCE_RECORD_QUERY_WITH_RELATIONS)
      .eq("attendanceSessionId", sessionId)
      .eq("tenantId", tenantId)
      .order("checkInTime", { ascending: true });

    if (error) throw error;
    return data.map((record) => attendanceRecordSchema.parse(record));
  } catch (error) {
    console.error("Error in getAttendanceRecords:", error);
    throw error;
  }
};

export const createAttendanceRecord = async (
  client: TypedClient,
  data: CreateAttendanceRecord,
  tenantId: string
) => {
  try {
    // First verify that the player belongs to this tenant
    const { data: playerData, error: playerError } = await client
      .from("players")
      .select("id")
      .eq("id", data.playerId)
      .eq("tenantId", Number(tenantId))
      .single();

    if (playerError || !playerData) {
      throw new Error("Invalid player or unauthorized access");
    }

    // Then check if record already exists
    const { data: existingRecord } = await client
      .from("attendanceRecords")
      .select(ATTENDANCE_RECORD_QUERY_WITH_RELATIONS)
      .eq("attendanceSessionId", data.attendanceSessionId)
      .eq("playerId", data.playerId)
      .eq("tenantId", Number(tenantId))
      .maybeSingle();

    if (existingRecord) {
      // Return the existing record but with a specific error
      const error = new Error("Player is already checked in for this session");
      error.name = "DuplicateCheckInError";
      // @ts-ignore - adding custom property
      error.record = existingRecord;
      throw error;
    }

    // Create new record
    const { data: newRecord, error: insertError } = await client
      .from("attendanceRecords")
      .insert({
        ...data,
        tenantId: Number(tenantId),
        checkInTime: new Date().toLocaleTimeString("en-GB", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      })
      .select(ATTENDANCE_RECORD_QUERY_WITH_RELATIONS)
      .single();

    if (insertError) {
      // If we get a unique constraint violation, it means there was a race condition
      if (insertError.code === "23505") {
        const { data: racedRecord } = await client
          .from("attendanceRecords")
          .select(ATTENDANCE_RECORD_QUERY_WITH_RELATIONS)
          .eq("attendanceSessionId", data.attendanceSessionId)
          .eq("playerId", data.playerId)
          .eq("tenantId", Number(tenantId))
          .maybeSingle();

        if (racedRecord) {
          // Return the existing record but with a specific error
          const error = new Error(
            "Player is already checked in for this session"
          );
          error.name = "DuplicateCheckInError";
          // @ts-ignore - adding custom property
          error.record = racedRecord;
          throw error;
        }
      }
      throw insertError;
    }

    return attendanceRecordSchema.parse(newRecord);
  } catch (error) {
    console.error("Error in createAttendanceRecord:", error);
    throw error;
  }
};

export const updateAttendanceRecord = async (
  client: TypedClient,
  recordId: number,
  data: UpdateAttendanceRecord,
  tenantId: string
) => {
  try {
    const { data: updatedRecord, error } = await client
      .from("attendanceRecords")
      .update(data)
      .eq("id", recordId)
      .eq("tenantId", tenantId)
      .select(ATTENDANCE_RECORD_QUERY_WITH_RELATIONS)
      .single();

    if (error) throw error;
    return attendanceRecordSchema.parse(updatedRecord);
  } catch (error) {
    console.error("Error in updateAttendanceRecord:", error);
    throw error;
  }
};

// New function to update or create multiple attendance records in batch
export const updateOrCreateAttendanceRecords = async (
  client: TypedClient,
  sessionId: number,
  records: { playerId: number; status: AttendanceStatus | null }[],
  tenantId: string
) => {
  try {
    // Get existing records for this session
    const { data: existingRecords, error: fetchError } = await client
      .from("attendanceRecords")
      .select("id, playerId, status")
      .eq("attendanceSessionId", sessionId)
      .eq("tenantId", tenantId);

    if (fetchError) throw fetchError;

    // Group records by whether they exist or not
    const recordsToUpdate: { id: number; status: AttendanceStatus }[] = [];
    const recordsToCreate: {
      attendanceSessionId: number;
      playerId: number;
      tenantId: number;
      status: AttendanceStatus;
      checkInTime: string;
    }[] = [];

    // Current time for new records
    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Organize records
    records.forEach((record) => {
      if (!record.status) return; // Skip null status (no change)

      const existingRecord = existingRecords?.find(
        (er) => er.playerId === record.playerId
      );

      if (existingRecord) {
        // Only update if status is different
        if (existingRecord.status !== record.status) {
          recordsToUpdate.push({
            id: existingRecord.id,
            status: record.status,
          });
        }
      } else {
        // Create new record
        recordsToCreate.push({
          attendanceSessionId: sessionId,
          playerId: record.playerId,
          tenantId: Number(tenantId),
          status: record.status,
          checkInTime: currentTime,
        });
      }
    });

    // Process updates in batches if needed
    if (recordsToUpdate.length > 0) {
      for (const record of recordsToUpdate) {
        const { error } = await client
          .from("attendanceRecords")
          .update({ status: record.status })
          .eq("id", record.id)
          .eq("tenantId", tenantId);

        if (error) throw error;
      }
    }

    // Process creates in a single batch
    if (recordsToCreate.length > 0) {
      const { error } = await client
        .from("attendanceRecords")
        .insert(recordsToCreate);

      if (error) throw error;
    }

    return {
      updated: recordsToUpdate.length,
      created: recordsToCreate.length,
    };
  } catch (error) {
    console.error("Error in updateOrCreateAttendanceRecords:", error);
    throw error;
  }
};

export const deleteAttendanceRecord = async (
  client: TypedClient,
  recordId: number,
  tenantId: string
) => {
  try {
    const { error } = await client
      .from("attendanceRecords")
      .delete()
      .eq("id", recordId)
      .eq("tenantId", tenantId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error in deleteAttendanceRecord:", error);
    throw error;
  }
};

export const createAbsentRecords = async (
  client: TypedClient,
  sessionId: number,
  notCheckedInPlayerIds: number[],
  tenantId: string
) => {
  try {
    // Verify that all players belong to this tenant
    if (notCheckedInPlayerIds.length > 0) {
      const { data: validPlayers, error: playerError } = await client
        .from("players")
        .select("id")
        .in("id", notCheckedInPlayerIds)
        .eq("tenantId", Number(tenantId));

      if (playerError) throw playerError;

      // Filter to only include players that belong to this tenant
      const validPlayerIds = validPlayers.map((player) => player.id);

      // Create absent records for players who haven't checked in and belong to the tenant
      if (validPlayerIds.length > 0) {
        const { error: insertError } = await client
          .from("attendanceRecords")
          .insert(
            validPlayerIds.map((playerId) => ({
              attendanceSessionId: sessionId,
              playerId,
              tenantId: Number(tenantId),
              status: "absent",
            }))
          );

        if (insertError) throw insertError;
      }
    }

    return true;
  } catch (error) {
    console.error("Error in createAbsentRecords:", error);
    throw error;
  }
};

export const closeAttendanceSession = async (
  client: TypedClient,
  sessionId: number,
  tenantId: string,
  notCheckedInPlayerIds: number[]
) => {
  try {
    // First update the session to mark it as inactive
    const { error: updateError } = await client
      .from("attendanceSession")
      .update({ isActive: false })
      .eq("id", sessionId)
      .eq("tenantId", tenantId);

    if (updateError) throw updateError;

    // Call the new function which will aggregate data and clean up records
    const { data, error: aggregateError } = await client.rpc(
      "aggregate_and_cleanup_attendance",
      {
        session_id: sessionId,
        tenant_id: Number(tenantId),
        not_checked_in_player_ids: notCheckedInPlayerIds,
      }
    );

    if (aggregateError) throw aggregateError;

    // If the function returns false, it means something went wrong
    if (!data) {
      throw new Error("Failed to aggregate and clean up attendance data");
    }

    return true;
  } catch (error) {
    console.error("Error in closeAttendanceSession:", error);
    throw error;
  }
};

export const getTeamAttendanceAggregates = async (
  client: TypedClient,
  teamId: number,
  seasonId: number,
  tenantId: string
) => {
  try {
    const { data, error } = await client
      .from("attendanceSessionAggregates")
      .select("*")
      .eq("teamId", teamId)
      .eq("seasonId", seasonId)
      .eq("tenantId", tenantId)
      .single();

    if (error) {
      // Handle the specific case where no data is found
      if (error.code === "PGRST116") {
        return {
          totalSessions: 0,
          totalOnTime: 0,
          totalLate: 0,
          totalAbsent: 0,
          averageAttendanceRate: 0,
          sessions: [],
          aggregatedAt: null,
        };
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error in getTeamAttendanceAggregates:", error);
    throw error;
  }
};

export const getPlayerAttendanceAggregates = async (
  client: TypedClient,
  playerId: number,
  teamId: number,
  seasonId: number,
  tenantId: string
) => {
  try {
    const { data, error } = await client
      .from("attendanceRecordAggregates")
      .select("*")
      .eq("playerId", playerId)
      .eq("teamId", teamId)
      .eq("seasonId", seasonId)
      .eq("tenantId", tenantId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error in getPlayerAttendanceAggregates:", error);
    throw error;
  }
};

export const getAllTeamPlayerAttendanceAggregates = async (
  client: TypedClient,
  teamId: number,
  seasonId: number,
  tenantId: string
) => {
  try {
    const { data, error } = await client
      .from("attendanceRecordAggregates")
      .select("*")
      .eq("teamId", teamId)
      .eq("seasonId", seasonId)
      .eq("tenantId", tenantId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error in getAllTeamPlayerAttendanceAggregates:", error);
    throw error;
  }
};
