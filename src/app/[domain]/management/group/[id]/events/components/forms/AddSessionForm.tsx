"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, set } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimeRange } from "@/components/ui/date-time-range";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";

// Icons
import {
  Calendar,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Repeat,
} from "lucide-react";

// Entity Types & Schemas
import { Season } from "@/entities/season/Season.schema";
import {
  useCreateMultipleSessions,
  useCreateSession,
} from "@/entities/session/Session.actions.client";
import { generateRecurringSessionsFromStartDate } from "@/entities/session/Session.utils";
import { Location } from "@/entities/shared/Location.schema";
import { Tenant } from "@/entities/tenant/Tenant.schema";

const daysOfWeek = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 0, name: "Sunday" },
];

const commonFields = {
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  locationId: z.string().min(1, "Location is required"),
  note: z.string().optional(),
};

const sessionFormSchema = z.object({
  ...commonFields,
  date: z.date().optional(),
  selectedDays: z.array(z.number()).default([]),
});

type SessionMode = "single" | "repeating";

type FormValues = z.infer<typeof sessionFormSchema>;

interface Props {
  selectedSeason: Season;
  tenant: Tenant;
  groupId: number;
  setIsOpen: (open: boolean) => void;
  initialDate?: Date | null;
  locations: Location[];
}

export default function AddSessionForm({
  selectedSeason,
  tenant,
  groupId,
  setIsOpen,
  initialDate,
  locations,
}: Props) {
  const createSession = useCreateSession();
  const createMultipleSessions = useCreateMultipleSessions();
  const [isLoading, setIsLoading] = useState(false);

  // Always default to single session mode
  const [sessionMode, setSessionMode] = useState<SessionMode>("single");

  const form = useForm<FormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      date: initialDate || new Date(),
      startTime: format(
        set(initialDate || new Date(), { hours: 13, minutes: 0 }),
        "HH:mm"
      ),
      endTime: format(
        set(initialDate || new Date(), { hours: 14, minutes: 0 }),
        "HH:mm"
      ),
      locationId: "",
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

  const handleDateTimeRangeChange = (isStart: boolean, date?: Date) => {
    if (!date) return;

    if (isStart) {
      if (sessionMode === "single") {
        form.setValue("date", date, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }

      const timeString = format(date, "HH:mm");
      form.setValue("startTime", timeString, {
        shouldDirty: true,
        shouldValidate: false,
      });

      const endDate = new Date(date);
      endDate.setHours(date.getHours() + 1);
      const endTimeString = format(endDate, "HH:mm");
      form.setValue("endTime", endTimeString, {
        shouldDirty: true,
        shouldValidate: false,
      });
    } else {
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

      console.log("Debug location values:", {
        selectedLocationId: values.locationId,
        availableLocations: locations.map((l) => ({ id: l.id, name: l.name })),
      });

      const location = locations.find(
        (l) =>
          // Try to match by ID first
          (l.id && l.id === values.locationId) ||
          // Fallback to using the index-based ID if no real ID exists
          (!l.id && values.locationId === `loc-${locations.indexOf(l)}`)
      );
      if (!location) {
        toast.error("Selected location not found");
        return;
      }

      if (sessionMode === "single") {
        if (!values.date) {
          toast.error("Date is required for single session");
          return;
        }

        await createSession.mutateAsync({
          tenantId: tenant.id.toString(),
          sessionData: {
            date: format(values.date, "yyyy-MM-dd"),
            startTime: values.startTime,
            endTime: values.endTime,
            location,
            groupId,
            seasonId: selectedSeason.id,
            isAggregated: false,
          },
        });

        toast.success("Session created successfully");
      } else {
        // For repeating sessions, use the utility function
        if (!values.date) {
          toast.error("Start date is required for repeating sessions");
          return;
        }

        const result = generateRecurringSessionsFromStartDate(
          values.date,
          selectedSeason,
          {
            startTime: values.startTime,
            endTime: values.endTime,
            location,
            groupId,
            seasonId: selectedSeason.id,
          }
        );

        if (!result.isStartDateValid) {
          toast.error(result.validationMessage || "Invalid start date");
          return;
        }

        if (result.sessions.length === 0) {
          toast.error(
            "No sessions could be generated with the given parameters"
          );
          return;
        }

        await createMultipleSessions.mutateAsync({
          tenantId: tenant.id.toString(),
          sessionsData: result.sessions,
        });

        toast.success(
          `Created ${result.sessions.length} sessions successfully`
        );
      }

      setIsOpen(false);
    } catch (error) {
      toast.error(
        `Failed to create session${sessionMode === "repeating" ? "s" : ""}`
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  const formDate = form.watch("date");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const selectedDays = form.watch("selectedDays");

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 pb-4">
        <div className="mb-6">
          <Tabs
            value={sessionMode}
            onValueChange={(value) => {
              const newMode = value as SessionMode;
              setSessionMode(newMode);

              if (newMode === "repeating") {
                // When switching to repeating mode, always pre-select the day of the week
                // from either the current form date or initialDate
                const currentDate =
                  form.getValues("date") || initialDate || new Date();
                const dayOfWeek = currentDate.getDay();

                // Always set the day, replacing any previous selection
                form.setValue("selectedDays", [dayOfWeek], {
                  shouldDirty: true,
                  shouldValidate: false,
                });
              } else if (
                newMode === "single" &&
                initialDate &&
                !form.getValues("date")
              ) {
                // When switching to single mode, ensure date is set from initialDate if available
                form.setValue("date", initialDate, {
                  shouldDirty: true,
                  shouldValidate: false,
                });
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Session</TabsTrigger>
              <TabsTrigger value="repeating">Repeating Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="py-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <p>Create a one-time session with a specific date and time.</p>
              </div>
            </TabsContent>

            <TabsContent value="repeating" className="py-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Repeat className="h-4 w-4" />
                <p>
                  Create multiple sessions that repeat on the same day of the
                  week throughout the season.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Schedule Section - conditionally rendered based on session mode */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionMode === "single" ? (
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

                      // If we have an initialDate, highlight it in the description
                      let description = `Sessions will be created for ${
                        selectedSeason.customName
                          ? `${selectedSeason.customName} (${dateRange})`
                          : dateRange
                      }`;

                      // Check for either initialDate or the current form date
                      const referenceDate =
                        form.getValues("date") || initialDate;
                      if (referenceDate) {
                        const dayName = daysOfWeek.find(
                          (day) => day.id === referenceDate.getDay()
                        )?.name;
                        if (dayName) {
                          description += `, starting on ${format(
                            referenceDate,
                            "dd/MM/yyyy"
                          )} (${dayName})`;
                        }
                      }

                      return description;
                    })()}
                  </p>
                </div>

                {/* Start Date Selection for Repeating Sessions */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormDescription>
                        Select the first date of the recurring sessions
                      </FormDescription>
                      <FormControl>
                        <input
                          type="date"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={
                            field.value ? format(field.value, "yyyy-MM-dd") : ""
                          }
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : null;
                            field.onChange(date);
                            if (date) {
                              // Update selected days to match the day of week of the selected date
                              const dayOfWeek = date.getDay();
                              form.setValue("selectedDays", [dayOfWeek], {
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

                {/* Day Selection */}
                <FormField
                  control={form.control}
                  name="selectedDays"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Select Days</FormLabel>
                      <FormDescription>
                        Sessions will be created on these days throughout the
                        season
                      </FormDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
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
                  <FormLabel>Session Time</FormLabel>
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
                                  if (e.target.value) {
                                    setEndTimeFromStartTime(e.target.value);
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
        {sessionMode === "single" && (
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
                  <FormLabel>Session Location</FormLabel>
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
                      placeholder="Add any additional notes about this session..."
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
        <FormButtons
          buttonText={
            sessionMode === "single"
              ? "Create Session"
              : "Create Session Schedule"
          }
          isLoading={isLoading}
          isDirty={true} // Always allow submission
          onCancel={() => setIsOpen(false)}
          className="mt-8"
        />
      </form>
    </Form>
  );
}
