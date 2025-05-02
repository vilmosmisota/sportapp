"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

// Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormButtons from "@/components/ui/form-buttons";
import { TeamSelector } from "@/components/ui/team-selector";
import { DateTimeRange } from "@/components/ui/date-time-range";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import { Calendar, Clock, MapPin, Users } from "lucide-react";

// Entity Types & Schemas
import { Season } from "@/entities/season/Season.schema";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Training } from "@/entities/training/Training.schema";
import { useUpdateTraining } from "@/entities/training/Training.actions.client";
import { useTrainingLocations } from "@/entities/tenant/hooks/useTrainingLocations";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";

// Form schema
const trainingFormSchema = z.object({
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  locationId: z.string().min(1, "Location is required"),
  teamId: z.string().min(1, "Team is required"),
  note: z.string().optional(),
});

// Form type
type FormValues = z.infer<typeof trainingFormSchema>;

// Props interface
interface Props {
  selectedSeason: Season;
  tenant: Tenant;
  setIsOpen: (open: boolean) => void;
  trainingId: number | null;
  trainingToEdit: Training;
}

export default function EditTrainingForm({
  selectedSeason,
  tenant,
  setIsOpen,
  trainingId,
  trainingToEdit,
}: Props) {
  const locations = useTrainingLocations(tenant);
  const { data: teams = [] } = useGetTeamsByTenantId(tenant.id.toString());
  const updateTraining = useUpdateTraining(
    trainingId || 0,
    tenant.id.toString()
  );
  const [isLoading, setIsLoading] = useState(false);

  // Convert training date to Date object if it's a string
  const trainingDate =
    typeof trainingToEdit.date === "string"
      ? parseISO(trainingToEdit.date)
      : trainingToEdit.date;

  const form = useForm<FormValues>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      date: trainingDate,
      startTime: trainingToEdit.startTime
        ? trainingToEdit.startTime.slice(0, 5)
        : "",
      endTime: trainingToEdit.endTime ? trainingToEdit.endTime.slice(0, 5) : "",
      locationId: trainingToEdit.location?.id || "",
      teamId: trainingToEdit.teamId?.toString() || "",
      note: trainingToEdit.meta?.note || "",
    },
    mode: "onSubmit",
  });

  // Reset form when trainingToEdit changes (important for proper revalidation)
  useEffect(() => {
    if (trainingToEdit) {
      const dateValue =
        typeof trainingToEdit.date === "string"
          ? parseISO(trainingToEdit.date)
          : trainingToEdit.date;

      form.reset({
        date: dateValue,
        startTime: trainingToEdit.startTime
          ? trainingToEdit.startTime.slice(0, 5)
          : "",
        endTime: trainingToEdit.endTime
          ? trainingToEdit.endTime.slice(0, 5)
          : "",
        locationId: trainingToEdit.location?.id || "",
        teamId: trainingToEdit.teamId?.toString() || "",
        note: trainingToEdit.meta?.note || "",
      });
    }
  }, [trainingToEdit, form]);

  // Set end time to 1 hour after the start time
  const setEndTimeFromStartTime = (startTime: string) => {
    if (!startTime) return;

    const [hours, minutes] = startTime.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    const endTimeString = format(endDate, "HH:mm");

    form.setValue("endTime", endTimeString, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  // Handle datetime range change
  const handleDateTimeRangeChange = (isStart: boolean, date?: Date) => {
    if (!date) return;

    if (isStart) {
      // Update the date field
      form.setValue("date", date, {
        shouldDirty: true,
        shouldValidate: false,
      });

      // Format and set the start time
      const timeString = format(date, "HH:mm");
      form.setValue("startTime", timeString, {
        shouldDirty: true,
        shouldValidate: false,
      });

      // Always update the end time to be 1 hour after the start time for better UX
      const endDate = new Date(date);
      endDate.setHours(date.getHours() + 1);
      const endTimeString = format(endDate, "HH:mm");
      form.setValue("endTime", endTimeString, {
        shouldDirty: true,
        shouldValidate: false,
      });
    } else {
      // For end time, we only update the time part, not the date
      const timeString = format(date, "HH:mm");
      form.setValue("endTime", timeString, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!trainingId) {
      toast.error("Cannot update: Missing training ID");
      return;
    }

    setIsLoading(true);

    const location = locations.find((l) => l.id === values.locationId);
    if (!location) {
      toast.error("Selected location not found");
      setIsLoading(false);
      return;
    }

    // Handle teamId - convert to number
    const teamId = parseInt(values.teamId);
    if (isNaN(teamId)) {
      toast.error("Invalid team selected");
      setIsLoading(false);
      return;
    }

    if (!values.date) {
      toast.error("Date is required");
      setIsLoading(false);
      return;
    }

    const formattedDate = format(values.date, "yyyy-MM-dd");

    // Use mutate with callbacks instead of mutateAsync
    updateTraining.mutate(
      {
        date: formattedDate,
        startTime: values.startTime,
        endTime: values.endTime,
        location,
        teamId,
        seasonId: selectedSeason.id,
        meta: values.note ? { note: values.note } : null,
      },
      {
        onSuccess: () => {
          toast.success("Training updated successfully");
          setIsOpen(false);
        },
        onError: (error) => {
          console.error("Failed to update training:", error);
          toast.error(
            error instanceof Error ? error.message : "Failed to update training"
          );
        },
        onSettled: () => {
          setIsLoading(false);
        },
      }
    );
  };

  // Watch for form changes
  const formDate = form.watch("date");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          // Get current form values
          const formValues = form.getValues();

          // Check if we have a validation error for endTime but we do have a startTime
          if (form.formState.errors.endTime && formValues.startTime) {
            // Set a default endTime (1 hour after startTime)
            setEndTimeFromStartTime(formValues.startTime);
            formValues.endTime = form.getValues("endTime");

            // Call onSubmit directly with fixed values
            onSubmit(formValues);
          } else {
            // Regular form submission flow
            form.handleSubmit(onSubmit)(e);
          }
        }}
        className="flex flex-col gap-6 relative h-[calc(100vh-8rem)] md:h-auto"
      >
        {/* Schedule Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => {
                // Create date objects from the form values
                const startDate = field.value
                  ? new Date(field.value)
                  : new Date();
                let endDate;

                if (field.value && startTime) {
                  // Set hours and minutes from startTime
                  const [startHours, startMinutes] = startTime
                    .split(":")
                    .map(Number);
                  if (!isNaN(startHours) && !isNaN(startMinutes)) {
                    startDate.setHours(startHours, startMinutes);
                  }
                }

                // Always calculate endDate as startDate + 1 hour for consistent UX
                endDate = new Date(startDate);
                endDate.setHours(startDate.getHours() + 1);

                // Use the user-selected endTime if available
                if (field.value && endTime) {
                  const [endHours, endMinutes] = endTime.split(":").map(Number);
                  if (!isNaN(endHours) && !isNaN(endMinutes)) {
                    endDate.setHours(endHours, endMinutes);
                  }
                }

                // Also set the endTime in the form if it's not set
                if (!endTime) {
                  const endTimeString = format(endDate, "HH:mm");
                  form.setValue("endTime", endTimeString, {
                    shouldDirty: true,
                    shouldValidate: false,
                  });
                }

                return (
                  <FormItem className="space-y-1">
                    <FormControl>
                      <DateTimeRange
                        startDate={startDate}
                        endDate={
                          endDate ||
                          new Date(startDate.getTime() + 60 * 60 * 1000)
                        }
                        onStartDateChange={(date) =>
                          handleDateTimeRangeChange(true, date)
                        }
                        onEndDateChange={(date) =>
                          handleDateTimeRangeChange(false, date)
                        }
                        showDuration={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Hidden fields to store the time values for form submission */}
            <input type="hidden" {...form.register("startTime")} />
            <input type="hidden" {...form.register("endTime")} />
          </CardContent>
        </Card>

        {/* Location Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Training Location</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location, index) => (
                        <SelectItem
                          key={location.id || `loc-${index}`}
                          value={location.id || `loc-${index}`}
                        >
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamSelector
              teams={teams}
              control={form.control}
              name="teamId"
              label="Team"
              placeholder="Select a team"
            />
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this training..."
                      className="resize-none min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Update Training"
            isLoading={isLoading}
            isDirty={true} // Always allow submission
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </form>
    </Form>
  );
}
