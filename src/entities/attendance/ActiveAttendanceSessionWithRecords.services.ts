import { TypedClient } from "@/libs/supabase/type";
import {
  ActiveAttendanceSessionWithRecords,
  ActiveAttendanceSessionWithRecordsSchema,
} from "./ActiveAttendanceSessionWithRecords.schema";
import {
  AttendanceRecord,
  AttendanceStatus,
  CheckInType,
} from "./AttendanceRecord.schema";

/**
 * Get active attendance session with all records and performer details
 */
export const getActiveAttendanceSessionWithRecords = async (
  client: TypedClient,
  sessionId: number,
  tenantId: string
): Promise<ActiveAttendanceSessionWithRecords> => {
  const { data, error } = await client
    .from("activeAttendanceSession")
    .select(
      `
      *,
      session:sessions(
        *,
        group:groups(*)
      ),
      records:activeAttendanceRecords(
        *,
        performer:members!activeAttendanceRecords_memberId_fkey(
          id,
          firstName,
          lastName,
          pin
        )
      )
    `
    )
    .eq("id", sessionId)
    .eq("tenantId", Number(tenantId))
    .single();

  if (error) throw error;
  if (!data) throw new Error("Active attendance session not found");

  try {
    const validatedData = ActiveAttendanceSessionWithRecordsSchema.parse(data);
    return validatedData;
  } catch (validationError) {
    console.error(
      "Active attendance session with records data validation failed:",
      validationError
    );
    throw new Error(
      "Invalid active attendance session with records data received from database"
    );
  }
};

/**
 * Get attendance records for a session with performer details
 */
export const getAttendanceRecordsBySession = async (
  client: TypedClient,
  sessionId: number,
  tenantId: string
): Promise<AttendanceRecord[]> => {
  const { data, error } = await client
    .from("activeAttendanceRecords")
    .select(
      `
      *,
      performer:members!activeAttendanceRecords_memberId_fkey(
        id,
        firstName,
        lastName,
        pin
      )
    `
    )
    .eq("activeAttendanceSessionId", sessionId)
    .eq("tenantId", Number(tenantId));

  if (error) throw error;

  return data || [];
};

/**
 * Create a new attendance record
 */
export const createAttendanceRecord = async (
  client: TypedClient,
  data: {
    activeAttendanceSessionId: number;
    performerId: number;
    status: AttendanceStatus;
    checkInTime?: string;
    checkInType?: CheckInType;
    tenantId: string;
  }
): Promise<AttendanceRecord> => {
  const now = new Date().toISOString();
  const checkInTime = data.checkInTime || now.split("T")[1].split(".")[0]; // Extract time part
  const checkInType = data.checkInType || CheckInType.INSTRUCTOR; // Default to instructor

  const { data: newRecord, error } = await client
    .from("activeAttendanceRecords")
    .insert({
      activeAttendanceSessionId: data.activeAttendanceSessionId,
      memberId: data.performerId,
      tenantId: Number(data.tenantId),
      status: data.status,
      checkInTime,
      checkInType,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating attendance record:", error);
    throw error;
  }

  if (!newRecord) {
    throw new Error("Failed to create attendance record");
  }

  return newRecord as AttendanceRecord;
};

/**
 * Update an attendance record
 */
export const updateAttendanceRecord = async (
  client: TypedClient,
  recordId: number,
  updates: {
    status?: AttendanceStatus;
    checkInTime?: string;
    checkInType?: CheckInType;
  },
  tenantId: string
): Promise<AttendanceRecord> => {
  // If updating status and no checkInType is provided, default to instructor
  if (updates.status && !updates.checkInType) {
    updates.checkInType = CheckInType.INSTRUCTOR;
  }

  const { data: updatedRecord, error } = await client
    .from("activeAttendanceRecords")
    .update(updates)
    .eq("id", recordId)
    .eq("tenantId", Number(tenantId))
    .select()
    .single();

  if (error) {
    console.error("Error updating attendance record:", error);
    throw error;
  }

  if (!updatedRecord) {
    throw new Error("Failed to update attendance record");
  }

  return updatedRecord as AttendanceRecord;
};

/**
 * Bulk update or create attendance records
 */
export const updateOrCreateAttendanceRecords = async (
  client: TypedClient,
  sessionId: number,
  records: { performerId: number; status: AttendanceStatus | null }[],
  tenantId: string
): Promise<AttendanceRecord[]> => {
  console.log("updateOrCreateAttendanceRecords called with:", {
    sessionId,
    records,
    tenantId,
  });

  const results: AttendanceRecord[] = [];

  for (const record of records) {
    try {
      console.log(
        `Processing record for performer ${record.performerId}:`,
        record
      );

      // First, try to find existing record
      const { data: existingRecord, error: findError } = await client
        .from("activeAttendanceRecords")
        .select("id")
        .eq("activeAttendanceSessionId", sessionId)
        .eq("memberId", record.performerId)
        .eq("tenantId", Number(tenantId))
        .single();

      if (findError && findError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected if no record exists
        console.error("Error finding existing record:", findError);
        throw findError;
      }

      if (existingRecord && record.status !== null) {
        // Update existing record
        console.log(
          `Updating existing record ${existingRecord.id} with status:`,
          record.status
        );
        const updated = await updateAttendanceRecord(
          client,
          existingRecord.id,
          {
            status: record.status,
            checkInType: CheckInType.INSTRUCTOR, // Always instructor when updating from manager
          },
          tenantId
        );
        console.log("Updated record:", updated);
        results.push(updated);
      } else if (!existingRecord && record.status !== null) {
        // Create new record
        console.log(
          `Creating new record for performer ${record.performerId} with status:`,
          record.status
        );
        const created = await createAttendanceRecord(client, {
          activeAttendanceSessionId: sessionId,
          performerId: record.performerId,
          status: record.status,
          checkInType: CheckInType.INSTRUCTOR,
          tenantId,
        });
        console.log("Created record:", created);
        results.push(created);
      } else if (existingRecord && record.status === null) {
        const { error: deleteError } = await client
          .from("activeAttendanceRecords")
          .delete()
          .eq("id", existingRecord.id)
          .eq("tenantId", Number(tenantId));

        if (deleteError) {
          console.error("Error deleting record:", deleteError);
          throw deleteError;
        }
        console.log(
          `Successfully deleted record for performer ${record.performerId}`
        );
      } else {
        console.log(
          `No action needed for performer ${record.performerId} (status is null and no existing record)`
        );
      }
    } catch (error) {
      console.error(
        `Error processing attendance record for performer ${record.performerId}:`,
        error
      );
      // Continue with other records even if one fails
    }
  }

  console.log("Final results:", results);
  return results;
};

/**
 * Delete an attendance record
 */
export const deleteAttendanceRecord = async (
  client: TypedClient,
  recordId: number,
  tenantId: string
): Promise<boolean> => {
  const { error } = await client
    .from("activeAttendanceRecords")
    .delete()
    .eq("id", recordId)
    .eq("tenantId", Number(tenantId));

  if (error) {
    console.error("Error deleting attendance record:", error);
    throw error;
  }

  return true;
};

/**
 * Aggregate and cleanup attendance session using PostgreSQL function
 */
export const aggregateAndCleanupAttendanceSession = async (
  client: TypedClient,
  sessionId: number,
  tenantId: string,
  notCheckedInMemberIds: number[] = []
): Promise<boolean> => {
  try {
    const { data, error } = await client.rpc(
      "aggregate_and_cleanup_attendance",
      {
        session_id: sessionId,
        tenant_id: Number(tenantId),
        not_checked_in_player_ids: notCheckedInMemberIds,
      }
    );

    if (error) {
      console.error("Error calling aggregate_and_cleanup_attendance:", error);
      throw error;
    }

    return data as boolean;
  } catch (error) {
    console.error("Error in aggregateAndCleanupAttendanceSession:", error);
    throw error;
  }
};
