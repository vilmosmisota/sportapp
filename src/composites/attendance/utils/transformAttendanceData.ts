import {
  AttendanceRecord,
  AttendanceStatus,
  CheckInType,
} from "@/entities/attendance/AttendanceRecord.schema";
import { MemberGroupConnection } from "@/entities/group/GroupConnection.schema";
import { MemberType } from "@/entities/member/Member.schema";

export type PerformerAttendanceRow = {
  id: number; // performer ID
  attendanceRecordId: number | null;
  performerId: number;
  tenantId: number;
  checkInTime: string | null;
  status: AttendanceStatus | null;
  checkInType: CheckInType | null;
  performer: {
    firstName: string;
    lastName: string;
    pin?: number | null;
  };
};

/**
 * Transform group connections and attendance records into PerformerAttendanceRows
 * This combines performer data from group connections with their attendance records
 */
export const transformToPerformerAttendanceRows = (
  groupConnections: MemberGroupConnection[],
  attendanceRecords: AttendanceRecord[]
): PerformerAttendanceRow[] => {
  return groupConnections
    .filter((conn) => conn.member.memberType === MemberType.Performer)
    .map((connection) => {
      const record = attendanceRecords.find(
        (r) => r.memberId === connection.member.id
      );

      return {
        id: connection.member.id,
        attendanceRecordId: record?.id ?? null,
        performerId: connection.member.id,
        tenantId: connection.tenantId,
        checkInTime: record?.checkInTime ?? null,
        status: record?.status ?? null,
        checkInType: record?.checkInType ?? null,
        performer: {
          firstName: connection.member.firstName || "",
          lastName: connection.member.lastName || "",
          pin: connection.member.pin,
        },
      };
    });
};

/**
 * Transform attendance records with performer data into PerformerAttendanceRows
 * This is used when we have records that already include performer data
 */
export const transformAttendanceRecordsToRows = (
  attendanceRecords: (AttendanceRecord & {
    performer?: {
      id: number;
      firstName: string | null;
      lastName: string | null;
      pin: number | null;
    };
  })[]
): PerformerAttendanceRow[] => {
  return attendanceRecords.map((record) => ({
    id: record.memberId,
    attendanceRecordId: record.id,
    performerId: record.memberId,
    tenantId: record.tenantId,
    checkInTime: record.checkInTime,
    status: record.status,
    checkInType: record.checkInType,
    performer: {
      firstName: record.performer?.firstName || "",
      lastName: record.performer?.lastName || "",
      pin: record.performer?.pin,
    },
  }));
};

/**
 * Get performers who haven't checked in from a list of PerformerAttendanceRows
 */
export const getNotCheckedInPerformers = (
  attendanceRows: PerformerAttendanceRow[]
): number[] => {
  return attendanceRows
    .filter((row) => !row.status)
    .map((row) => row.performerId);
};

/**
 * Calculate attendance statistics from PerformerAttendanceRows
 */
export const calculateAttendanceStats = (
  attendanceRows: PerformerAttendanceRow[]
) => {
  const total = attendanceRows.length;
  const present = attendanceRows.filter(
    (row) => row.status === AttendanceStatus.PRESENT
  ).length;
  const late = attendanceRows.filter(
    (row) => row.status === AttendanceStatus.LATE
  ).length;
  const absent = attendanceRows.filter(
    (row) => row.status === AttendanceStatus.ABSENT
  ).length;
  const notCheckedIn = attendanceRows.filter((row) => !row.status).length;

  return {
    total,
    present,
    late,
    absent,
    notCheckedIn,
    checkedIn: present + late,
    attendanceRate:
      total > 0 ? Math.round(((present + late) / total) * 100) : 0,
    onTimeRate: total > 0 ? Math.round((present / total) * 100) : 0,
  };
};
