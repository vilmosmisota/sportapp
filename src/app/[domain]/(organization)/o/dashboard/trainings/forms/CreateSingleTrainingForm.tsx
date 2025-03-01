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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Team } from "@/entities/team/Team.schema";
import { Season } from "@/entities/season/Season.schema";
import { useAddTraining } from "@/entities/training/Training.actions.client";
import { TrainingLocation } from "@/entities/tenant/Tenant.schema";
import { useTrainingLocations } from "@/entities/tenant/hooks/useTrainingLocations";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import FormButtons from "@/components/ui/form-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { TeamBadge } from "@/components/ui/team-badge";
import { TeamSelector } from "@/components/ui/team-selector";
import {
  getDisplayGender,
  getDisplayAgeGroup,
} from "@/entities/team/Team.schema";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  locationId: z.string().min(1, "Location is required"),
  teamId: z.string().min(1, "Team is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  tenantId: string;
  domain: string;
  selectedSeason: Season | null;
  teams: Team[];
  setIsOpen: (open: boolean) => void;
}

export default function CreateSingleTrainingForm({
  tenantId,
  domain,
  selectedSeason,
  teams,
  setIsOpen,
}: Props) {
  const locations = useTrainingLocations(domain);
  const addTraining = useAddTraining(tenantId);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "",
      endTime: "",
      locationId: "",
      teamId: "",
    },
  });

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

      // Create a single training
      await addTraining.mutateAsync({
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        location,
        teamId,
        seasonIds: [selectedSeason.id],
      });

      toast.success("Training created successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create training");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Season Info */}
          {selectedSeason && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Selected Season
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {selectedSeason.customName ??
                    `${format(
                      new Date(selectedSeason.startDate),
                      "dd/MM/yyyy"
                    )} - ${format(
                      new Date(selectedSeason.endDate),
                      "dd/MM/yyyy"
                    )}`}
                  {selectedSeason.isActive && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Active
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Training Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Training Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

          {/* Location & Team */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location & Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}, {location.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TeamSelector
                teams={teams}
                control={form.control}
                name="teamId"
                label="Team"
                placeholder="Select a team"
              />
            </CardContent>
          </Card>
        </div>

        <FormButtons
          buttonText="Create Training"
          isLoading={isLoading}
          isDirty={true}
          onCancel={() => setIsOpen(false)}
        />
      </form>
    </Form>
  );
}
