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
    secondName
  ),
  attendanceSession:attendanceSession (
    id,
    startTime,
    endTime
  )
`;

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
    const { data: newRecord, error } = await client
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
        isLate: false, // TODO: Calculate based on training start time
      })
      .select(ATTENDANCE_RECORD_QUERY_WITH_RELATIONS)
      .single();

    if (error) throw error;
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
