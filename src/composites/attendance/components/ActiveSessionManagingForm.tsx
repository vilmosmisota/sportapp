"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendanceStatus } from "@/entities/attendance/AttendanceRecord.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardEdit } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PerformerAttendanceRow } from "../utils/transformAttendanceData";

// Zod schema for form validation
const manageAttendanceSchema = z.object({
  attendanceRecords: z.record(
    z.string(),
    z.nativeEnum(AttendanceStatus).nullable()
  ),
});

type ManageAttendanceFormData = z.infer<typeof manageAttendanceSchema>;

type ManageAttendanceFormProps = {
  attendanceRecords: PerformerAttendanceRow[];
  session: any;
  tenantId: string;
  sessionId: number;
  setIsOpen: (isOpen: boolean) => void;
  onUpdateAttendance: (
    records: { performerId: number; status: AttendanceStatus | null }[]
  ) => Promise<void>;
  isPending: boolean;
};

export function ManageAttendanceForm({
  attendanceRecords,
  session,
  tenantId,
  sessionId,
  setIsOpen,
  onUpdateAttendance,
  isPending,
}: ManageAttendanceFormProps) {
  const form = useForm<ManageAttendanceFormData>({
    resolver: zodResolver(manageAttendanceSchema),
    defaultValues: {
      attendanceRecords: attendanceRecords.reduce((acc, record) => {
        acc[record.id.toString()] = record.status;
        return acc;
      }, {} as Record<string, AttendanceStatus | null>),
    },
  });

  const { handleSubmit, watch, reset } = form;
  const { isDirty } = form.formState;

  // Reset form when attendance records change
  useEffect(() => {
    const initialValues = attendanceRecords.reduce((acc, record) => {
      acc[record.id.toString()] = record.status;
      return acc;
    }, {} as Record<string, AttendanceStatus | null>);

    reset({ attendanceRecords: initialValues });
  }, [attendanceRecords, reset]);

  // Special handling for "not checked in" status
  const NOT_CHECKED_IN = "not_checked_in";

  const getSelectValue = (status: AttendanceStatus | null): string => {
    return status === null ? NOT_CHECKED_IN : status;
  };

  const handleStatusChange = (performerId: string, value: string) => {
    const status =
      value === NOT_CHECKED_IN ? null : (value as AttendanceStatus);
    form.setValue(`attendanceRecords.${performerId}`, status, {
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: ManageAttendanceFormData) => {
    try {
      // Convert the form data to the expected format
      const recordsToUpdate = Object.entries(data.attendanceRecords).map(
        ([performerIdStr, status]) => ({
          performerId: Number(performerIdStr),
          status,
        })
      );

      await onUpdateAttendance(recordsToUpdate);
      toast.success("Attendance records updated successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating attendance records:", error);
      toast.error("Failed to update attendance records");
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <ClipboardEdit className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">
                  Attendance Management
                </CardTitle>
              </div>
              <CardDescription>
                Update attendance status for performers who forgot to check in
                or need adjustment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {attendanceRecords.map((record) => (
                <FormField
                  key={record.id}
                  control={form.control}
                  name={`attendanceRecords.${record.id}`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between border-b pb-4 last:border-b-0">
                        <div className="flex-1">
                          <FormLabel className="text-base font-medium">
                            {record.performer?.firstName}{" "}
                            {record.performer?.lastName}
                          </FormLabel>
                          <div className="text-sm text-muted-foreground mt-1">
                            {record.status && (
                              <span className="flex items-center gap-2">
                                Current status:&nbsp;
                                {record.status === AttendanceStatus.PRESENT && (
                                  <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                    Present
                                  </Badge>
                                )}
                                {record.status === AttendanceStatus.LATE && (
                                  <Badge className="bg-amber-500 hover:bg-amber-600">
                                    Late
                                  </Badge>
                                )}
                                {record.status === AttendanceStatus.ABSENT && (
                                  <Badge variant="destructive">Absent</Badge>
                                )}
                              </span>
                            )}
                            {!record.status && "Not checked in"}
                          </div>
                        </div>
                        <div className="w-[140px]">
                          <FormControl>
                            <Select
                              value={getSelectValue(field.value)}
                              onValueChange={(value) =>
                                handleStatusChange(record.id.toString(), value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={NOT_CHECKED_IN}>
                                  Not checked in
                                </SelectItem>
                                <SelectItem value={AttendanceStatus.PRESENT}>
                                  Present
                                </SelectItem>
                                <SelectItem value={AttendanceStatus.LATE}>
                                  Late
                                </SelectItem>
                                <SelectItem value={AttendanceStatus.ABSENT}>
                                  Absent
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          <FormButtons
            buttonText="Save Changes"
            isLoading={isPending}
            isDirty={isDirty}
            onCancel={handleCancel}
          />
        </form>
      </Form>
    </div>
  );
}
