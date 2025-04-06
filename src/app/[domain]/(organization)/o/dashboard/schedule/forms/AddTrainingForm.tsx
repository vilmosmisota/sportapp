"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, isWithinInterval } from "date-fns";
import { toast } from "sonner";

// Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Toggle } from "@/components/ui/toggle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

// Icons
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Repeat,
  Calendar as CalendarIcon,
} from "lucide-react";

// Entity Types & Schemas
import { Team } from "@/entities/team/Team.schema";
import { Season } from "@/entities/season/Season.schema";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  useAddTraining,
  useAddTrainingBatch,
} from "@/entities/training/Training.actions.client";
import { useTrainingLocations } from "@/entities/tenant/hooks/useTrainingLocations";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";

const daysOfWeek = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 0, name: "Sunday" },
];

// Common fields for both types of training forms
const commonFields = {
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  locationId: z.string().min(1, "Location is required"),
  teamId: z.string().min(1, "Team is required"),
  note: z.string().optional(),
};

// Combined schema that includes all possible fields
const trainingFormSchema = z.object({
  ...commonFields,
  date: z.date().optional(),
  selectedDays: z.array(z.number()).default([]),
});

// Form mode type
type TrainingMode = "single" | "repeating";

// Combined form type
type FormValues = z.infer<typeof trainingFormSchema>;

// Props interface
interface Props {
  tenantId: string;
  domain: string;
  selectedSeason: Season;
  tenant: Tenant;
  setIsOpen: (open: boolean) => void;
}

export default function AddTrainingForm({
  tenantId,
  domain,
  selectedSeason,
  tenant,
  setIsOpen,
}: Props) {
  const locations = useTrainingLocations(domain);
  const { data: teams = [] } = useGetTeamsByTenantId(tenantId);
  const addTraining = useAddTraining(tenantId);
  const addTrainingBatch = useAddTrainingBatch(tenantId);
  const [isLoading, setIsLoading] = useState(false);
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("single");

  const form = useForm<FormValues>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      date: new Date(),
      startTime: "",
      endTime: "",
      locationId: "",
      teamId: "",
      selectedDays: [],
      note: "",
    },
    mode: "onSubmit",
  });

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
      // Update the date field if in single mode
      if (trainingMode === "single") {
        form.setValue("date", date, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }

      // Format and set the start time
      const timeString = format(date, "HH:mm");
      form.setValue("startTime", timeString, {
        shouldDirty: true,
        shouldValidate: false,
      });

      // If endTime is not set or we want to always update it when start time changes
      // Always update the end time to be 1 hour after the start time for better UX
      const endTime = form.getValues("endTime");
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
    if (!selectedSeason) {
      toast.error("Please select a season first");
      return;
    }

    try {
      setIsLoading(true);

      const location = locations.find((l) => l.id === values.locationId);
      if (!location) {
        toast.error("Selected location not found");
        return;
      }

      // Handle teamId - convert to number
      const teamId = parseInt(values.teamId);

      if (trainingMode === "single") {
        if (!values.date) {
          toast.error("Date is required for single training");
          return;
        }

        // Create a single training
        await addTraining.mutateAsync({
          date: format(values.date, "yyyy-MM-dd"),
          startTime: values.startTime,
          endTime: values.endTime,
          location,
          teamId,
          seasonId: selectedSeason.id,
          meta: values.note ? { note: values.note } : null,
        });

        toast.success("Training created successfully");
      } else {
        // Validate selected days
        if (values.selectedDays.length === 0) {
          toast.error("Please select at least one day for repeating trainings");
          return;
        }

        // Create repeating trainings
        const startDate = new Date(selectedSeason.startDate);
        const endDate = new Date(selectedSeason.endDate);

        // Generate all dates between start and end date that match the selected days
        const dates: string[] = [];
        const currentDate = new Date(startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of today for proper comparison

        while (currentDate <= endDate) {
          if (values.selectedDays.includes(currentDate.getDay())) {
            // Check if the date falls within any break period
            const isBreak = selectedSeason.breaks.some((breakPeriod) =>
              isWithinInterval(currentDate, {
                start: new Date(breakPeriod.from),
                end: new Date(breakPeriod.to),
              })
            );

            // Only add the date if it's not during a break AND is today or in the future
            if (!isBreak && currentDate >= today) {
              dates.push(currentDate.toISOString());
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        if (dates.length === 0) {
          toast.error(
            "No valid future training dates found after excluding break periods"
          );
          return;
        }

        // Create trainings in batch
        await addTrainingBatch.mutateAsync({
          trainings: dates.map((date) => ({
            date,
            startTime: values.startTime,
            endTime: values.endTime,
            location,
            teamId,
            meta: values.note ? { note: values.note } : null,
          })),
          seasonId: selectedSeason.id,
        });

        toast.success(`Created ${dates.length} training sessions successfully`);
      }

      setIsOpen(false);
    } catch (error) {
      toast.error(
        `Failed to create training${trainingMode === "repeating" ? "s" : ""}`
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for form changes
  const formDate = form.watch("date");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const selectedDays = form.watch("selectedDays");

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
        {/* Mode Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Training Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue="single"
              value={trainingMode}
              onValueChange={(value) => setTrainingMode(value as TrainingMode)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="single"
                  id="single"
                  className="peer sr-only"
                />
                <label
                  htmlFor="single"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <CalendarIcon className="mb-3 h-6 w-6" />
                  <p className="text-sm font-medium">Single Training</p>
                  <p className="text-xs text-muted-foreground">
                    Create a one-time training session
                  </p>
                </label>
              </div>

              <div>
                <RadioGroupItem
                  value="repeating"
                  id="repeating"
                  className="peer sr-only"
                />
                <label
                  htmlFor="repeating"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Repeat className="mb-3 h-6 w-6" />
                  <p className="text-sm font-medium">Repeating Schedule</p>
                  <p className="text-xs text-muted-foreground">
                    Create multiple training sessions
                  </p>
                </label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Schedule Section - conditionally rendered based on training mode */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trainingMode === "single" ? (
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
                    const [endHours, endMinutes] = endTime
                      .split(":")
                      .map(Number);
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
            ) : (
              <>
                {/* Selected Season Info */}
                <div className="text-sm text-muted-foreground mb-4">
                  <p>
                    {(() => {
                      const dateRange = `${format(
                        new Date(selectedSeason.startDate),
                        "dd/MM/yyyy"
                      )} - ${format(
                        new Date(selectedSeason.endDate),
                        "dd/MM/yyyy"
                      )}`;

                      return `Trainings will be created for ${
                        selectedSeason.customName
                          ? `${selectedSeason.customName} (${dateRange})`
                          : dateRange
                      }`;
                    })()}
                  </p>
                </div>

                {/* Day Selection */}
                <FormField
                  control={form.control}
                  name="selectedDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Days</FormLabel>
                      <FormDescription>
                        Click on the days when trainings should occur
                      </FormDescription>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <Toggle
                            key={day.id}
                            pressed={selectedDays.includes(day.id)}
                            onPressedChange={(pressed) => {
                              const current = [...selectedDays];
                              if (pressed) {
                                field.onChange([...current, day.id]);
                              } else {
                                field.onChange(
                                  current.filter((d) => d !== day.id)
                                );
                              }
                            }}
                            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:bg-muted data-[state=off]:hover:bg-muted/80 border border-input min-w-[90px] justify-center"
                            variant="outline"
                          >
                            {day.name}
                          </Toggle>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Time Range */}
                <div className="space-y-4 mt-4">
                  <FormLabel>Training Time</FormLabel>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="time"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);

                                  // If endTime is not set, automatically set it to 1 hour after start time
                                  const endTime = form.getValues("endTime");
                                  if (!endTime && e.target.value) {
                                    setEndTimeFromStartTime(e.target.value);
                                  }
                                  // Always set the end time for better UX
                                  const [hours, minutes] = e.target.value
                                    .split(":")
                                    .map(Number);
                                  if (!isNaN(hours) && !isNaN(minutes)) {
                                    const startDate = new Date();
                                    startDate.setHours(hours, minutes, 0, 0);
                                    const endDate = new Date(startDate);
                                    endDate.setHours(endDate.getHours() + 1);
                                    const endTimeString = format(
                                      endDate,
                                      "HH:mm"
                                    );
                                    form.setValue("endTime", endTimeString, {
                                      shouldDirty: true,
                                      shouldValidate: false,
                                    });
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <span className="text-center">to</span>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="time"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Hidden fields to store the time values for form submission if not already rendered in repeating mode */}
        {trainingMode === "single" && (
          <>
            <input type="hidden" {...form.register("startTime")} />
            <input type="hidden" {...form.register("endTime")} />
          </>
        )}

        {/* Section 2: Location */}
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

        {/* Section 3: Team */}
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
            buttonText={
              trainingMode === "single"
                ? "Create Training"
                : "Create Training Schedule"
            }
            isLoading={isLoading}
            isDirty={true} // Always allow submission
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </form>
    </Form>
  );
}
