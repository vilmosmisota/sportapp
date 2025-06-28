"use client";

import { queryKeys } from "@/cacheKeys/cacheKeys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpdatePerformer } from "@/entities/member/Performer.actions.client";
import { usePerformers } from "@/entities/member/Performer.query";
import { useQueryClient } from "@tanstack/react-query";
import { Key, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { PerformerAttendanceRow } from "../utils/transformAttendanceData";

type PinManagementFormProps = {
  attendanceRecords: PerformerAttendanceRow[];
  tenantId: string;
  groupId?: number;
  setIsOpen: (isOpen: boolean) => void;
};

export function PinManagementForm({
  attendanceRecords,
  tenantId,
  groupId,
  setIsOpen,
}: PinManagementFormProps) {
  const [pinValues, setPinValues] = useState<Record<number, string>>(() => {
    return attendanceRecords.reduce((acc, record) => {
      acc[record.performerId] = record.performer.pin?.toString() || "";
      return acc;
    }, {} as Record<number, string>);
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<number, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updatePerformer = useUpdatePerformer(tenantId);
  const { data: allPerformers } = usePerformers(tenantId);
  const queryClient = useQueryClient();

  // Memoize existing PINs for validation
  const existingPins = useMemo(() => {
    if (!allPerformers) return new Set<number>();
    return new Set(allPerformers.map((p) => p.pin).filter(Boolean) as number[]);
  }, [allPerformers]);

  // Validate PIN
  const validatePin = useCallback(
    (pin: string, performerId: number): string => {
      if (!pin) return ""; // Empty is valid (removes PIN)

      const pinNumber = parseInt(pin, 10);

      if (
        isNaN(pinNumber) ||
        pin.length !== 4 ||
        pinNumber < 1000 ||
        pinNumber > 9999
      ) {
        return "PIN must be exactly 4 digits";
      }

      // Check if PIN is already in use by another performer
      const currentPerformer = attendanceRecords.find(
        (r) => r.performerId === performerId
      );
      const currentPin = currentPerformer?.performer.pin;

      if (existingPins.has(pinNumber) && currentPin !== pinNumber) {
        return "This PIN is already in use";
      }

      return "";
    },
    [existingPins, attendanceRecords]
  );

  // Handle PIN input change
  const handlePinChange = useCallback(
    (performerId: number, value: string) => {
      // Only allow numeric input and limit to 4 digits
      const numericValue = value.replace(/\D/g, "").slice(0, 4);

      setPinValues((prev) => ({
        ...prev,
        [performerId]: numericValue,
      }));

      // Validate and set error
      const error = validatePin(numericValue, performerId);
      setValidationErrors((prev) => ({
        ...prev,
        [performerId]: error,
      }));
    },
    [validatePin]
  );

  // Check if there are changes
  const hasChanges = useMemo(() => {
    return attendanceRecords.some((record) => {
      const originalPin = record.performer.pin?.toString() || "";
      const currentPin = pinValues[record.performerId] || "";
      return originalPin !== currentPin;
    });
  }, [attendanceRecords, pinValues]);

  // Check if there are validation errors
  const hasErrors = useMemo(() => {
    return Object.values(validationErrors).some((error) => error !== "");
  }, [validationErrors]);

  // Handle form submission
  const handleSubmit = async () => {
    if (hasErrors) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    if (!hasChanges) {
      toast.info("No changes to save");
      setIsOpen(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const updates = attendanceRecords
        .filter((record) => {
          const originalPin = record.performer.pin?.toString() || "";
          const currentPin = pinValues[record.performerId] || "";
          return originalPin !== currentPin;
        })
        .map((record) => ({
          performerId: record.performerId,
          pin: pinValues[record.performerId]
            ? parseInt(pinValues[record.performerId], 10)
            : null,
        }));

      // Update each performer's PIN
      await Promise.all(
        updates.map((update) =>
          updatePerformer.mutateAsync({
            performerId: update.performerId,
            options: {
              memberData: { pin: update.pin },
            },
          })
        )
      );

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });

      // Invalidate group-specific queries if groupId is available
      if (groupId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.member.byGroup(tenantId, groupId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.group.connections(tenantId, groupId.toString()),
        });
      }

      // Also invalidate the attendance session queries to refresh the table
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions(tenantId),
      });

      toast.success(`Successfully updated ${updates.length} PIN(s)`);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating PINs:", error);
      toast.error("Failed to update PINs. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">PIN Management</CardTitle>
          </div>
          <CardDescription>
            Update PINs for performers. Enter a 4-digit number or leave empty to
            remove PIN.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {attendanceRecords.map((record) => {
            const currentPin = pinValues[record.performerId] || "";
            const error = validationErrors[record.performerId] || "";
            const originalPin = record.performer.pin?.toString() || "";
            const hasChanged = currentPin !== originalPin;

            return (
              <div
                key={record.performerId}
                className="flex items-center justify-between border-b pb-4 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="text-base font-medium">
                    {record.performer.firstName} {record.performer.lastName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      Current PIN:
                    </span>
                    {record.performer.pin ? (
                      <Badge variant="outline" className="font-mono">
                        {record.performer.pin.toString().padStart(4, "0")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No PIN</Badge>
                    )}
                    {hasChanged && (
                      <Badge variant="outline" className="text-xs">
                        Modified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="w-32">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="1234"
                    value={currentPin}
                    onChange={(e) =>
                      handlePinChange(record.performerId, e.target.value)
                    }
                    className={`font-mono text-center ${
                      error ? "border-destructive" : ""
                    }`}
                    maxLength={4}
                  />
                  {error && (
                    <p className="text-xs text-destructive mt-1">{error}</p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end mt-6">
        <Button
          variant="outline"
          onClick={() => setIsOpen(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!hasChanges || hasErrors || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            `Save Changes${
              hasChanges
                ? ` (${
                    attendanceRecords.filter((record) => {
                      const originalPin =
                        record.performer.pin?.toString() || "";
                      const currentPin = pinValues[record.performerId] || "";
                      return originalPin !== currentPin;
                    }).length
                  })`
                : ""
            }`
          )}
        </Button>
      </div>
    </div>
  );
}
