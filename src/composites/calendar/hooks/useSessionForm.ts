import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useCreateMultipleSessions } from "@/entities/session/Session.actions.client";

import {
  DEFAULT_RECURRENCE,
  RecurrenceConfig,
  SessionFormData,
  SessionFormProps,
} from "../types/session-form.types";
import {
  generateSessionsFromFormData,
  validateSessionFormData,
} from "../utils/session-form.utils";

// Form validation schema
const sessionFormSchema = z.object({
  groupId: z.string().min(1, "Group is required"),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  locationId: z.string().min(1, "Location is required"),
  recurrence: z.object({
    type: z.enum(["once", "repeat"]),
  }),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof sessionFormSchema>;

export function useSessionForm({
  tenant,
  season,
  locations,
  groupId,
  groups,
  initialDate,
  onSuccess,
  onCancel,
}: Omit<SessionFormProps, "className">) {
  const [isLoading, setIsLoading] = useState(false);
  const createSessionsMutation = useCreateMultipleSessions();

  // Determine if we're in single group mode
  const isSingleGroupMode = Boolean(groupId);

  // Get available groups
  const availableGroups = useMemo(() => {
    if (isSingleGroupMode) {
      // In single group mode, find the specific group
      return groups?.filter((g) => g.id === groupId) || [];
    }
    return groups || [];
  }, [groups, groupId, isSingleGroupMode]);

  // Get available locations
  const availableLocations = useMemo(() => {
    return locations || [];
  }, [locations]);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      groupId: isSingleGroupMode ? groupId?.toString() : "",
      date: initialDate || new Date(),
      startTime: "18:00",
      endTime: "19:00",
      locationId:
        availableLocations.length > 0
          ? availableLocations[0].id || `loc-0`
          : "",
      recurrence: DEFAULT_RECURRENCE,
      note: "",
    },
    mode: "onChange",
  });

  // Watch form values for reactive updates
  const formData: SessionFormData = {
    groupId: form.watch("groupId"),
    date: form.watch("date"),
    startTime: form.watch("startTime"),
    endTime: form.watch("endTime"),
    locationId: form.watch("locationId"),
    recurrence: form.watch("recurrence"),
    note: form.watch("note"),
  };

  // Generate session preview
  const sessionPreview = useMemo(() => {
    if (
      !formData.groupId ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.locationId
    ) {
      return { count: 0, isValid: false };
    }

    const result = generateSessionsFromFormData(
      formData,
      season,
      availableLocations
    );
    return {
      count: result.count,
      isValid: result.isValid,
      validationMessage: result.validationMessage,
    };
  }, [formData, season, availableLocations]);

  // Form validation
  const isValid = useMemo(() => {
    const validation = validateSessionFormData(formData, season);
    return validation.isValid && sessionPreview.isValid;
  }, [formData, season, sessionPreview.isValid]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isValid) {
        toast.error("Please fix form errors before submitting");
        return;
      }

      try {
        setIsLoading(true);

        const result = generateSessionsFromFormData(
          formData,
          season,
          availableLocations
        );

        if (!result.isValid) {
          toast.error(result.validationMessage || "Invalid session data");
          return;
        }

        await createSessionsMutation.mutateAsync({
          tenantId: tenant.id.toString(),
          sessionsData: result.sessions,
        });

        toast.success(
          result.count === 1
            ? "Session created successfully"
            : `${result.count} sessions created successfully`
        );

        onSuccess();
      } catch (error) {
        console.error("Failed to create sessions:", error);
        toast.error("Failed to create sessions");
      } finally {
        setIsLoading(false);
      }
    },
    [
      isValid,
      formData,
      season,
      availableLocations,
      createSessionsMutation,
      tenant.id,
      onSuccess,
    ]
  );

  // Handle recurrence changes
  const handleRecurrenceChange = useCallback(
    (recurrence: RecurrenceConfig) => {
      form.setValue("recurrence", recurrence, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form]
  );

  // Handle time changes
  const handleTimeChange = useCallback(
    (field: "startTime" | "endTime", value: string) => {
      form.setValue(field, value, {
        shouldDirty: true,
        shouldValidate: true,
      });

      // Auto-adjust end time when start time changes
      if (field === "startTime") {
        const [hours, minutes] = value.split(":").map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const endHours = hours + 1;
          const endTime = `${endHours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
          form.setValue("endTime", endTime, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      }
    },
    [form]
  );

  return {
    form,
    isLoading,
    isSingleGroupMode,
    formData,
    sessionPreview,
    availableGroups,
    availableLocations,
    isValid,
    handleSubmit,
    handleRecurrenceChange,
    handleTimeChange,
  };
}
