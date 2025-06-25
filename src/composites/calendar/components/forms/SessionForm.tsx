"use client";

import { Calendar, Clock, MapPin, Users } from "lucide-react";

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
import { cn } from "@/lib/utils";

import { Group } from "@/entities/group/Group.schema";
import { Location } from "@/entities/shared/Location.schema";

import { useSessionForm } from "../..";
import {
  RecurrenceConfig,
  SessionFormProps,
} from "../../types/session-form.types";
import { RecurrenceSelector } from "./RecurrenceSelector";

export function SessionForm({
  tenant,
  season,
  locations,
  groupId,
  groups,
  initialDate,
  onSuccess,
  onCancel,
  className,
}: SessionFormProps) {
  const {
    form,
    isLoading,
    isSingleGroupMode,
    formData,
    sessionPreview,
    handleSubmit,
    handleRecurrenceChange,
    handleTimeChange,
    availableGroups,
    availableLocations,
    isValid,
  } = useSessionForm({
    tenant,
    season,
    locations,
    groupId,
    groups,
    initialDate,
    onSuccess,
    onCancel,
  });

  const handleDateTimeRangeChange = (isStart: boolean, date?: Date) => {
    if (!date) return;

    if (isStart) {
      // Update the date
      form.setValue("date", date, {
        shouldDirty: true,
        shouldValidate: true,
      });

      // Update start time
      const timeString = date.toTimeString().slice(0, 5); // HH:MM format
      handleTimeChange("startTime", timeString);
    } else {
      // Update end time
      const timeString = date.toTimeString().slice(0, 5); // HH:MM format
      handleTimeChange("endTime", timeString);
    }
  };

  // Create date objects for DateTimeRange component
  const getDateTimeForRange = () => {
    const baseDate = formData.date || new Date();

    const startDate = new Date(baseDate);
    if (formData.startTime) {
      const [hours, minutes] = formData.startTime.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        startDate.setHours(hours, minutes, 0, 0);
      }
    }

    const endDate = new Date(baseDate);
    if (formData.endTime) {
      const [hours, minutes] = formData.endTime.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        endDate.setHours(hours, minutes, 0, 0);
      }
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateTimeForRange();

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className={cn("flex flex-col gap-6 pb-4", className)}
      >
        {/* Group Selection (only for multi-group mode) */}
        {!isSingleGroupMode && (
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
                  const selectedGroup = availableGroups.find(
                    (group: Group) => group.id.toString() === field.value
                  );

                  return (
                    <FormItem>
                      <FormLabel>Select Group</FormLabel>
                      <FormControl>
                        <GroupSelector
                          groups={availableGroups}
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
        )}

        {/* Date & Time Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="date"
              render={() => (
                <FormItem className="space-y-1">
                  <FormLabel>Session Date & Time</FormLabel>
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
                      showDuration={true}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose the date and time for your session
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Location Selection */}
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
                      {availableLocations.map(
                        (location: Location, index: number) => (
                          <SelectItem
                            key={location.id || `loc-${index}`}
                            value={location.id || `loc-${index}`}
                          >
                            {location.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Where will this session take place?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Recurrence Settings */}
        <FormField
          control={form.control}
          name="recurrence"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RecurrenceSelector
                  value={field.value}
                  onChange={(recurrence: RecurrenceConfig) => {
                    field.onChange(recurrence);
                    handleRecurrenceChange(recurrence);
                  }}
                  season={season}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Session Preview */}
        {sessionPreview.count > 1 && (
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {sessionPreview.count} sessions will be created
                </p>
                <p className="text-muted-foreground">
                  From{" "}
                  {formData.date
                    ? formData.date.toLocaleDateString()
                    : "selected date"}
                  {formData.recurrence.type === "repeat"
                    ? " until end of season"
                    : ""}
                </p>
                {season.breaks.length > 0 && (
                  <p className="text-muted-foreground text-xs">
                    * Break periods will be automatically excluded
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <FormButtons
          isLoading={isLoading}
          isDirty={form.formState.isDirty && isValid}
          onCancel={onCancel}
          buttonText={
            sessionPreview.count > 1
              ? `Create ${sessionPreview.count} Sessions`
              : "Create Session"
          }
        />
      </form>
    </Form>
  );
}
