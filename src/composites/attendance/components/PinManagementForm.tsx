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
import { Input } from "@/components/ui/input";
import { useUpdatePerformer } from "@/entities/member/Performer.actions.client";
import { usePerformers } from "@/entities/member/Performer.query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PerformerAttendanceRow } from "../utils/transformAttendanceData";

// Zod schema for form validation
const pinManagementSchema = z.object({
  performerPins: z.record(
    z.string(),
    z.object({
      pin: z.string().optional(),
      hasError: z.boolean().optional(),
      errorMessage: z.string().optional(),
      isValidating: z.boolean().optional(),
    })
  ),
});

type PinManagementFormData = z.infer<typeof pinManagementSchema>;

type PinManagementFormProps = {
  attendanceRecords: PerformerAttendanceRow[];
  tenantId: string;
  setIsOpen: (isOpen: boolean) => void;
};

type PerformerPinUpdate = {
  performerId: number;
  currentPin: number | null;
  newPin: string;
  hasError: boolean;
  errorMessage: string;
  isValidating: boolean;
};

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function PinManagementForm({
  attendanceRecords,
  tenantId,
  setIsOpen,
}: PinManagementFormProps) {
  const [performerPins, setPerformerPins] = useState<
    Record<number, PerformerPinUpdate>
  >({});
  const [pendingValidations, setPendingValidations] = useState<Set<number>>(
    new Set()
  );

  const updatePerformer = useUpdatePerformer(tenantId);
  const { data: allPerformers } = usePerformers(tenantId);

  // Initialize form
  const form = useForm<PinManagementFormData>({
    resolver: zodResolver(pinManagementSchema),
    defaultValues: {
      performerPins: attendanceRecords.reduce((acc, record) => {
        acc[record.performerId.toString()] = {
          pin: record.performer.pin?.toString() || "",
          hasError: false,
          errorMessage: "",
          isValidating: false,
        };
        return acc;
      }, {} as Record<string, any>),
    },
  });

  const { handleSubmit: formHandleSubmit, watch, setValue } = form;
  const { isDirty } = form.formState;

  // Debounce validation triggers
  const validationTrigger = useRef<Record<number, number>>({});
  const debouncedValidationTrigger = useDebounce(
    validationTrigger.current,
    300
  );

  // Memoize initial state to prevent unnecessary re-renders
  const initialPerformerPins = useMemo(() => {
    return attendanceRecords.reduce((acc, record) => {
      acc[record.performerId] = {
        performerId: record.performerId,
        currentPin: record.performer.pin || null,
        newPin: record.performer.pin?.toString() || "",
        hasError: false,
        errorMessage: "",
        isValidating: false,
      };
      return acc;
    }, {} as Record<number, PerformerPinUpdate>);
  }, [attendanceRecords]);

  // Initialize performer pins state only once
  useEffect(() => {
    setPerformerPins(initialPerformerPins);
  }, [initialPerformerPins]);

  // Memoize existing PINs for fast lookup
  const existingPins = useMemo(() => {
    if (!allPerformers) return new Map<number, number>();

    const pinMap = new Map<number, number>();
    allPerformers.forEach((performer) => {
      if (performer.pin) {
        pinMap.set(performer.pin, performer.id);
      }
    });
    return pinMap;
  }, [allPerformers]);

  // Optimized validation function with memoization
  const validatePin = useCallback(
    (pin: string, performerId: number): { isValid: boolean; error: string } => {
      if (!pin) {
        return { isValid: true, error: "" }; // Empty PIN is valid (removes PIN)
      }

      // Check if it's a 4-digit number
      const pinNumber = parseInt(pin, 10);
      if (
        isNaN(pinNumber) ||
        pin.length !== 4 ||
        pinNumber < 1000 ||
        pinNumber > 9999
      ) {
        return { isValid: false, error: "PIN must be exactly 4 digits" };
      }

      // Check for uniqueness using memoized map
      const existingPerformerId = existingPins.get(pinNumber);
      if (existingPerformerId && existingPerformerId !== performerId) {
        return { isValid: false, error: "This PIN is already in use" };
      }

      return { isValid: true, error: "" };
    },
    [existingPins]
  );

  // Debounced validation effect
  useEffect(() => {
    const performersToValidate = Object.keys(debouncedValidationTrigger);

    if (performersToValidate.length === 0) return;

    performersToValidate.forEach((performerIdStr) => {
      const performerId = parseInt(performerIdStr, 10);
      const pinUpdate = performerPins[performerId];

      if (!pinUpdate || !pendingValidations.has(performerId)) return;

      const validation = validatePin(pinUpdate.newPin, performerId);

      setPerformerPins((prev) => ({
        ...prev,
        [performerId]: {
          ...prev[performerId],
          hasError: !validation.isValid,
          errorMessage: validation.error,
          isValidating: false,
        },
      }));

      // Update form state
      setValue(`performerPins.${performerId}.hasError`, !validation.isValid);
      setValue(`performerPins.${performerId}.errorMessage`, validation.error);
      setValue(`performerPins.${performerId}.isValidating`, false);

      setPendingValidations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(performerId);
        return newSet;
      });
    });

    // Clear validation trigger
    validationTrigger.current = {};
  }, [
    debouncedValidationTrigger,
    performerPins,
    validatePin,
    pendingValidations,
    setValue,
  ]);

  // Optimized pin change handler
  const handlePinChange = useCallback(
    (performerId: number, newPin: string) => {
      // Only allow numeric input and limit to 4 digits
      const numericPin = newPin.replace(/\D/g, "").slice(0, 4);

      // Update the pin immediately for UI responsiveness
      setPerformerPins((prev) => ({
        ...prev,
        [performerId]: {
          ...prev[performerId],
          newPin: numericPin,
          isValidating: numericPin.length > 0,
          hasError: false, // Clear error while validating
          errorMessage: "",
        },
      }));

      // Update form state
      setValue(`performerPins.${performerId}.pin`, numericPin, {
        shouldDirty: true,
      });
      setValue(
        `performerPins.${performerId}.isValidating`,
        numericPin.length > 0
      );
      setValue(`performerPins.${performerId}.hasError`, false);
      setValue(`performerPins.${performerId}.errorMessage`, "");

      // Trigger debounced validation
      if (numericPin.length > 0) {
        setPendingValidations((prev) => new Set(prev).add(performerId));
        validationTrigger.current = {
          ...validationTrigger.current,
          [performerId]: Date.now(),
        };
      }
    },
    [setValue]
  );

  // Memoize updates to prevent unnecessary recalculations
  const updatesCount = useMemo(() => {
    return Object.values(performerPins).filter((update) => {
      const originalPin =
        attendanceRecords
          .find((r) => r.performerId === update.performerId)
          ?.performer.pin?.toString() || "";
      return update.newPin !== originalPin && !update.hasError;
    }).length;
  }, [performerPins, attendanceRecords]);

  const hasErrors = useMemo(() => {
    return Object.values(performerPins).some((update) => update.hasError);
  }, [performerPins]);

  const hasValidating = useMemo(() => {
    return pendingValidations.size > 0;
  }, [pendingValidations]);

  const onSubmit = useCallback(
    async (data: PinManagementFormData) => {
      try {
        const updates = Object.values(performerPins).filter((update) => {
          const originalPin =
            attendanceRecords
              .find((r) => r.performerId === update.performerId)
              ?.performer.pin?.toString() || "";
          return update.newPin !== originalPin && !update.hasError;
        });

        if (updates.length === 0) {
          toast.info("No changes to save");
          setIsOpen(false);
          return;
        }

        // Update each performer's PIN
        await Promise.all(
          updates.map(async (update) => {
            const pinValue = update.newPin
              ? parseInt(update.newPin, 10)
              : undefined;

            return updatePerformer.mutateAsync({
              performerId: update.performerId,
              options: {
                memberData: { pin: pinValue },
              },
            });
          })
        );

        toast.success(`Successfully updated ${updates.length} PIN(s)`);
        setIsOpen(false);
      } catch (error) {
        console.error("Error updating PINs:", error);
        toast.error("Failed to update PINs. Please try again.");
      }
    },
    [performerPins, attendanceRecords, updatePerformer, setIsOpen]
  );

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  // Memoize individual performer components
  const PerformerPinRow = useCallback(
    ({ record }: { record: PerformerAttendanceRow }) => {
      const pinUpdate = performerPins[record.performerId];
      if (!pinUpdate) return null;

      return (
        <FormField
          key={record.performerId}
          control={form.control}
          name={`performerPins.${record.performerId}.pin`}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <div className="flex-1">
                  <FormLabel className="text-base font-medium">
                    {record.performer.firstName} {record.performer.lastName}
                  </FormLabel>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      Current PIN:
                    </span>
                    {pinUpdate.currentPin ? (
                      <Badge variant="outline" className="font-mono">
                        {pinUpdate.currentPin.toString().padStart(4, "0")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No PIN</Badge>
                    )}
                  </div>
                </div>
                <div className="w-32">
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="1234"
                      value={pinUpdate.newPin}
                      onChange={(e) =>
                        handlePinChange(record.performerId, e.target.value)
                      }
                      className={`font-mono text-center ${
                        pinUpdate.hasError ? "border-destructive" : ""
                      } ${
                        pinUpdate.isValidating ? "border-muted-foreground" : ""
                      }`}
                      maxLength={4}
                    />
                  </FormControl>
                  {pinUpdate.isValidating && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Checking...
                    </p>
                  )}
                  {pinUpdate.hasError && !pinUpdate.isValidating && (
                    <p className="text-xs text-destructive mt-1">
                      {pinUpdate.errorMessage}
                    </p>
                  )}
                  <FormMessage />
                </div>
              </div>
            </FormItem>
          )}
        />
      );
    },
    [performerPins, handlePinChange, form.control]
  );

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={formHandleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">PIN Management</CardTitle>
              </div>
              <CardDescription>
                Update PINs for performers. Enter a 4-digit number or leave
                empty to remove PIN.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {attendanceRecords.map((record) => (
                <PerformerPinRow key={record.performerId} record={record} />
              ))}
            </CardContent>
          </Card>

          <FormButtons
            buttonText={`Save Changes${
              updatesCount > 0 ? ` (${updatesCount})` : ""
            }`}
            isLoading={updatePerformer.isPending || hasValidating}
            isDirty={isDirty && !hasErrors && !hasValidating}
            onCancel={handleCancel}
          />
        </form>
      </Form>
    </div>
  );
}
