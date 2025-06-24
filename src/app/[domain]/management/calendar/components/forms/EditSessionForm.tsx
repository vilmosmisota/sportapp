"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import React, { useState } from "react";
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
import { useUpdateSession } from "@/entities/session/Session.actions.client";
import { Session } from "@/entities/session/Session.schema";
import { Location } from "@/entities/shared/Location.schema";
import { Tenant } from "@/entities/tenant/Tenant.schema";

// Define form schema
const sessionFormSchema = z.object({
  groupId: z.string().min(1, "Group is required"),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  locationId: z.string().min(1, "Location is required"),
});

type EditMode = "single" | "pattern";
type FormValues = z.infer<typeof sessionFormSchema>;

interface Props {
  session: Session;
  selectedSeason: Season;
  tenant: Tenant;
  groups: Group[];
  setIsOpen: (open: boolean) => void;
  locations: Location[];
}

export default function EditSessionForm({
  session,
  selectedSeason,
  tenant,
  groups,
  setIsOpen,
  locations,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>("single");
  const updateSessionMutation = useUpdateSession();

  // Parse session date and times
  const sessionDate = new Date(session.date);
  const [startHours, startMinutes] = session.startTime.split(":").map(Number);
  const [endHours, endMinutes] = session.endTime.split(":").map(Number);

  // Create Date objects with time
  const startDateTime = new Date(sessionDate);
  startDateTime.setHours(startHours || 0, startMinutes || 0, 0, 0);

  const endDateTime = new Date(sessionDate);
  endDateTime.setHours(endHours || 0, endMinutes || 0, 0, 0);

  // Get location ID
  const getLocationId = () => {
    if (session.location?.id) {
      return session.location.id;
    }
    return locations.length > 0 ? locations[0].id || `loc-0` : "";
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      groupId: session.groupId.toString(),
      date: sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      locationId: getLocationId(),
    },
    mode: "onSubmit",
  });

  const handleDateTimeRangeChange = (isStart: boolean, date?: Date) => {
    if (!date) return;

    if (isStart) {
      form.setValue("date", date, {
        shouldDirty: true,
        shouldValidate: false,
      });

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

      if (editMode === "single") {
        await updateSessionMutation.mutateAsync({
          sessionId: session.id,
          tenantId: tenant.id.toString(),
          sessionData: {
            date: format(values.date, "yyyy-MM-dd"),
            startTime: values.startTime,
            endTime: values.endTime,
            location,
            groupId,
            seasonId: session.seasonId,
          },
        });

        toast.success("Session updated successfully");
        setIsOpen(false);
      } else {
        // Pattern editing will be implemented later
        toast.info("Pattern editing is not yet implemented");
      }
    } catch (error) {
      toast.error("Failed to update session");
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
        <div className="mb-6">
          <Tabs
            value={editMode}
            onValueChange={(value) => {
              setEditMode(value as EditMode);
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Edit Session</TabsTrigger>
              <TabsTrigger value="pattern">Edit Pattern</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="py-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <p>Edit this specific session only.</p>
              </div>
            </TabsContent>

            <TabsContent value="pattern" className="py-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Repeat className="h-4 w-4" />
                <p>Edit all sessions that follow the same pattern.</p>
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
                  const [endHours, endMinutes] = endTime.split(":").map(Number);
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
          buttonText="Update Session"
        />
      </form>
    </Form>
  );
}
