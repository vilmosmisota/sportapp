"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import FormButtons from "@/components/ui/form-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { GroupedTraining } from "@/entities/training/Training.schema";
import { useTrainingLocations } from "@/entities/tenant/hooks/useTrainingLocations";
import { useUpdateTrainingPattern } from "@/entities/training/Training.actions.client";
import { formatTeamName } from "../utils";

const formSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  locationId: z.string().min(1, "Location is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  training: GroupedTraining;
  setIsOpen: (open: boolean) => void;
  domain: string;
  tenantId: number;
  seasonId: number;
}

export default function EditTrainingForm({
  training,
  setIsOpen,
  domain,
  tenantId,
  seasonId,
}: Props) {
  const locations = useTrainingLocations(domain);
  const updatePattern = useUpdateTrainingPattern(tenantId.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: training.startTime,
      endTime: training.endTime,
      locationId: training.location.id,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const location = locations.find((l) => l.id === values.locationId);
      if (!location) return;

      await updatePattern.mutateAsync({
        tenantId,
        patternId: `${training.teamId}-${training.startTime}-${training.endTime}`,
        updates: {
          startTime: values.startTime,
          endTime: values.endTime,
          location,
          seasonId,
          originalStartTime: training.startTime,
          originalEndTime: training.endTime,
          fromDate: training.firstDate,
        },
      });

      toast.success("Training schedule updated successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update training schedule");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Schedule Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                From {format(new Date(training.firstDate), "dd/MM/yyyy")}
                {" to "}
                {format(new Date(training.lastDate), "dd/MM/yyyy")}
                <br />
                Total sessions: {training.trainingCount}
              </p>
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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

          {/* Team Info */}
          {training.teamName && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{formatTeamName(training.teamName)}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Update Schedule"
            isLoading={isSubmitting}
            isDirty={form.formState.isDirty}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </form>
    </Form>
  );
}
