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
import { GroupSelector } from "@/components/ui/group-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";

// Icons
import {
  Calendar,
  Calendar as CalendarIcon,
  MapPin,
  Repeat,
  Users,
} from "lucide-react";

// Entity Types & Schemas
import { Group } from "@/entities/group/Group.schema";
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

const sessionFormSchema = z.object({
  groupId: z.string().min(1, "Group is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  locationId: z.string().min(1, "Location is required"),
  note: z.string().optional(),
  date: z.date().optional(),
  selectedDays: z.array(z.number()).default([]),
});

type SessionMode = "single" | "repeating";
type FormValues = z.infer<typeof sessionFormSchema>;

interface Props {
  selectedSeason: Season;
  tenant: Tenant;
  groups: Group[];
  setIsOpen: (open: boolean) => void;
  initialDate?: Date | null;
  locations: Location[];
}

export default function AddSessionForm({
  selectedSeason,
  tenant,
  groups,
  setIsOpen,
  initialDate,
  locations,
}: Props) {
  const createSession = useCreateSession();
  const createMultipleSessions = useCreateMultipleSessions();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionMode, setSessionMode] = useState<SessionMode>("single");

  const form = useForm<FormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      groupId: "",
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

      const location = locations.find(
        (l) =>
          (l.id && l.id === values.locationId) ||
          (!l.id && values.locationId === `loc-${locations.indexOf(l)}`)
      );
      if (!location) {
        toast.error("Selected location not found");
        return;
      }

      const groupId = parseInt(values.groupId);
      if (isNaN(groupId)) {
        toast.error("Invalid group selection");
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
        if (!values.date) {
          toast.error("Start date is required for repeating sessions");
          return;
        }

        if (values.selectedDays.length === 0) {
          toast.error("Please select at least one day for repeating sessions");
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
          },
          values.selectedDays
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

  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 pb-4">
        {/* Session Mode Tabs */}
        <div className="mb-6">
          <Tabs
            value={sessionMode}
            onValueChange={(value) => {
              const newMode = value as SessionMode;
              setSessionMode(newMode);

              if (newMode === "repeating") {
                const currentDate =
                  form.getValues("date") || initialDate || new Date();
                const dayOfWeek = currentDate.getDay();
                form.setValue("selectedDays", [dayOfWeek], {
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

        {/* Group Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => {
                const selectedGroup = groups.find(
                  (group) => group.id.toString() === field.value
                );

                return (
                  <FormItem>
                    <FormLabel>Select Group</FormLabel>
                    <FormControl>
                      <GroupSelector
                        groups={groups}
                        selectedGroup={selectedGroup}
                        onGroupChange={field.onChange}
                        placeholder="Choose a group for this session"
                        tenantGroupsConfig={
                          tenant.tenantConfigs?.groups || undefined
                        }
                        width="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Select which group this session is for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </CardContent>
        </Card>

        {/* Schedule Section */}
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
                  const startDate = field.value
                    ? new Date(field.value)
                    : new Date();
                  let endDate = new Date(startDate);

                  if (field.value && startTime) {
                    const [startHours, startMinutes] = startTime
                      .split(":")
                      .map(Number);
                    if (!isNaN(startHours) && !isNaN(startMinutes)) {
                      startDate.setHours(startHours, startMinutes);
                    }
                  }

                  endDate = new Date(startDate);
                  endDate.setHours(startDate.getHours() + 1);

                  if (field.value && endTime) {
                    const [endHours, endMinutes] = endTime
                      .split(":")
                      .map(Number);
                    if (!isNaN(endHours) && !isNaN(endMinutes)) {
                      endDate.setHours(endHours, endMinutes);
                    }
                  }

                  return (
                    <FormItem className="space-y-1">
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <DateTimeRange
                          startDate={startDate}
                          endDate={endDate}
                          onStartDateChange={(date) =>
                            handleDateTimeRangeChange(true, date)
                          }
                          onEndDateChange={(date) =>
                            handleDateTimeRangeChange(false, date)
                          }
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => {
                    const startDate = field.value
                      ? new Date(field.value)
                      : new Date();
                    let endDate = new Date(startDate);

                    if (field.value && startTime) {
                      const [startHours, startMinutes] = startTime
                        .split(":")
                        .map(Number);
                      if (!isNaN(startHours) && !isNaN(startMinutes)) {
                        startDate.setHours(startHours, startMinutes);
                      }
                    }

                    endDate = new Date(startDate);
                    endDate.setHours(startDate.getHours() + 1);

                    if (field.value && endTime) {
                      const [endHours, endMinutes] = endTime
                        .split(":")
                        .map(Number);
                      if (!isNaN(endHours) && !isNaN(endMinutes)) {
                        endDate.setHours(endHours, endMinutes);
                      }
                    }

                    return (
                      <FormItem className="space-y-1">
                        <FormLabel>Start Date & Time</FormLabel>
                        <FormControl>
                          <DateTimeRange
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={(date) =>
                              handleDateTimeRangeChange(true, date)
                            }
                            onEndDateChange={(date) =>
                              handleDateTimeRangeChange(false, date)
                            }
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription>
                          Choose the first day and time for the recurring
                          sessions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="selectedDays"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Repeat on Days</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          {daysOfWeek.map((day) => (
                            <Toggle
                              key={day.id}
                              pressed={field.value.includes(day.id)}
                              onPressedChange={(pressed) => {
                                const updatedDays = pressed
                                  ? [...field.value, day.id]
                                  : field.value.filter((d) => d !== day.id);
                                field.onChange(updatedDays);
                              }}
                              className="text-sm"
                            >
                              {day.name}
                            </Toggle>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select which days of the week to repeat the session
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
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
                        <SelectValue placeholder="Select location" />
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

        <FormButtons
          isLoading={isLoading}
          isDirty={form.formState.isDirty}
          onCancel={() => setIsOpen(false)}
          buttonText={`Create Session${sessionMode === "repeating" ? "s" : ""}`}
        />
      </form>
    </Form>
  );
}
