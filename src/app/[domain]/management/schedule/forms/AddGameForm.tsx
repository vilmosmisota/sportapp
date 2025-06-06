"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { addDays, addHours, set, format } from "date-fns";

// UI Components
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormButtons from "@/components/ui/form-buttons";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker/DatePicker";
import { TeamSelector } from "@/components/ui/team-selector";
import { OpponentTeamSelector } from "@/components/ui/opponent-team-selector";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ColorPicker } from "@/components/ui/color-picker";
import { DateTimeRange } from "@/components/ui/date-time-range";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Tag,
  CircleAlert,
  FileText,
  Home,
  ExternalLink,
  Trophy,
  Repeat,
  PlusCircle,
} from "lucide-react";

// Entity Types & Schemas
import {
  GameForm,
  GameFormSchema,
  GameStatus,
  getCompetitionColor,
  getCompetitionName,
} from "@/entities/game/Game.schema";
import { Team } from "@/entities/group/Group.schema";
import { Season } from "@/entities/season/Season.schema";
import { Tenant, CompetitionType } from "@/entities/tenant/Tenant.schema";
import { LocationSchema } from "@/entities/shared/Location.schema";
import { Opponent } from "@/entities/opponent/Opponent.schema";

// Queries & Actions
import { useCreateGame } from "@/entities/game/Game.actions.client";
import { useGetTeamsByTenantId } from "@/entities/group/Group.query";
import { useOpponents } from "@/entities/opponent/Opponent.query";

// Location type
enum GameLocationType {
  OrganizationHome = "home",
  OpponentVenue = "away",
}

// Create a required field label component
const RequiredLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children} <span className="text-destructive font-bold">*</span>
    </>
  );
};

// Props interface
interface Props {
  selectedSeason: Season;
  tenant: Tenant;
  setIsOpen: (open: boolean) => void;
  initialDate?: Date | null;
}

const formatCompetitionType = (name: string, color?: string): string => {
  const cleanName = name.replace(/#/g, "");
  const cleanColor = color?.replace(/#/g, "") || "";

  return cleanColor ? `${cleanName}#${cleanColor}` : cleanName;
};

export default function AddGameForm({
  selectedSeason,
  tenant,
  setIsOpen,
  initialDate,
}: Props) {
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for organization's role (home/away)
  const [gameLocation, setGameLocation] = useState<GameLocationType>(
    GameLocationType.OrganizationHome
  );

  const competitionTypes = tenant.competitionTypes || [];

  const { data: teams = [] } = useGetTeamsByTenantId(tenant.id.toString());
  const { data: opponents = [] } = useOpponents(tenant.id.toString());

  const createGame = useCreateGame(tenant.id.toString());

  const form = useForm<GameForm>({
    resolver: zodResolver(GameFormSchema),
    defaultValues: {
      status: GameStatus.Scheduled,
      date: initialDate || new Date(),
      startTime: format(
        set(initialDate || new Date(), { hours: 13, minutes: 0 }),
        "HH:mm"
      ),
      endTime: format(
        set(initialDate || new Date(), { hours: 14, minutes: 0 }),
        "HH:mm"
      ),
      homeTeamId: 0,
      awayTeamId: 0,
      location: null,
      competitionType: "",
      seasonId: selectedSeason.id,
      meta: {
        note: "",
      },
      homeScore: null,
      awayScore: null,
    },
  });

  // Watch for specific form values needed for conditional logic
  const homeTeamId = form.watch("homeTeamId");
  const awayTeamId = form.watch("awayTeamId");
  const currentCompetitionType = form.watch("competitionType");
  const formDate = form.watch("date");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  const competitionName = useMemo(() => {
    return getCompetitionName(currentCompetitionType).replace(/#/g, "");
  }, [currentCompetitionType]);

  useEffect(() => {
    form.setValue("homeTeamId", 0, { shouldDirty: true });
    form.setValue("awayTeamId", 0, { shouldDirty: true });
  }, [gameLocation]);

  const processFormData = (data: GameForm) => {
    let fixedCompetitionType = data.competitionType;

    if (fixedCompetitionType && fixedCompetitionType.includes("##")) {
      const parts = fixedCompetitionType.split("#");
      fixedCompetitionType = formatCompetitionType(
        parts[0],
        parts.slice(1).join("")
      );
    }

    // TIMEZONE FIX: Create a date at noon to avoid timezone boundary issues
    // Extract the year, month, and day from the original date
    const userSelectedDate = data.date;
    const year = userSelectedDate.getFullYear();
    const month = userSelectedDate.getMonth();
    const day = userSelectedDate.getDate();

    // Set time to noon to prevent timezone-related date changes
    const fixedDate = set(new Date(year, month, day), {
      hours: 12,
      minutes: 0,
      seconds: 0,
    });

    // Prepare the data with fixed values and timezone-safe date
    return {
      ...data,
      date: fixedDate,
      competitionType: fixedCompetitionType,
      endTime: data.endTime || null,
      meta: {
        note: data.meta?.note || null,
      },
    };
  };

  // Handle datetime range change
  const handleDateTimeRangeChange = (isStart: boolean, date?: Date) => {
    if (!date) return;

    if (isStart) {
      // Update the date field
      form.setValue("date", date, { shouldDirty: true });

      // Format and set the start time
      const timeString = format(date, "HH:mm");
      form.setValue("startTime", timeString, { shouldDirty: true });
    } else {
      // For end time, we only update the time part, not the date
      const timeString = format(date, "HH:mm");
      form.setValue("endTime", timeString, { shouldDirty: true });
    }
  };

  // Handle competition type selection from dropdown - fixed missing setValue
  const handleCompetitionTypeSelect = (competitionType: CompetitionType) => {
    // Use the helper function to format properly
    const formattedType = formatCompetitionType(
      competitionType.name,
      competitionType.color || undefined
    );

    // Actually set the value in the form (this was missing before)
    form.setValue("competitionType", formattedType, { shouldDirty: true });
  };

  // Handle team selection based on home/away choice
  const handleTeamChange = (isHome: boolean, value: string) => {
    const teamId = parseInt(value);
    if (isHome) {
      form.setValue("homeTeamId", teamId, { shouldDirty: true });
      // Reset away team if it's the same as home
      if (form.getValues("awayTeamId") === teamId) {
        form.setValue("awayTeamId", 0, { shouldDirty: true });
      }
    } else {
      form.setValue("awayTeamId", teamId, { shouldDirty: true });
      // Reset home team if it's the same as away
      if (form.getValues("homeTeamId") === teamId) {
        form.setValue("homeTeamId", 0, { shouldDirty: true });
      }
    }
  };

  // Handle submitting the form and adding another game
  const onSubmitAndAddAnother = async (data: GameForm) => {
    setIsSubmitting(true);

    try {
      const formData = processFormData(data);

      // Get a reference to date before we modify anything
      const gameDate = formData.date ? new Date(formData.date) : new Date();
      const formattedDate = format(gameDate, "MMM d, yyyy");

      // Get team names for the success message
      const homeTeam =
        formData.homeTeamId > 0
          ? teams.find((t) => t.id === formData.homeTeamId)?.name ||
            opponents.find((o) => o.id === formData.homeTeamId)?.name ||
            "Home Team"
          : "Home Team";

      const awayTeam =
        formData.awayTeamId > 0
          ? teams.find((t) => t.id === formData.awayTeamId)?.name ||
            opponents.find((o) => o.id === formData.awayTeamId)?.name ||
            "Away Team"
          : "Away Team";

      // Create the game with the validated data
      await createGame.mutateAsync(formData);

      // Show success message with team names and date
      toast.success(
        `Game created: ${homeTeam} vs ${awayTeam} on ${formattedDate}`
      );

      // Define the reset values more clearly
      const resetValues = {
        status: GameStatus.Scheduled,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        location: data.location,
        competitionType: formData.competitionType,
        seasonId: selectedSeason.id,
        meta: { note: "" },
        homeScore: null,
        awayScore: null,
      };

      // Reset the form with a clean approach
      form.reset(resetValues, {
        keepErrors: false,
        keepDirty: true, // Keep dirty state to allow additional submissions
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });

      // Clear any errors
      form.clearErrors();
    } catch (error) {
      console.error("Failed to create game:", error);

      // Get more detailed error message if available
      let errorMessage = "Failed to create game";
      if (error instanceof Error) {
        errorMessage = `Failed to create game: ${error.message}`;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission and close
  const onSubmit = async (data: GameForm) => {
    setIsSubmitting(true);

    try {
      const formData = processFormData(data);

      const gameDate = data.date ? new Date(data.date) : new Date();
      const formattedDate = format(gameDate, "MMM d, yyyy");

      // Create the game with the validated data
      await createGame.mutateAsync(formData);

      // Show success message with team names and date
      toast.success(`Game created on ${formattedDate}`);

      // Close the modal
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create game:", error);
      toast.error("Failed to create game");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form and close modal
  const onCancel = () => {
    // Clear any errors first
    form.clearErrors();

    // Full form reset with clean options
    form.reset(
      {
        status: GameStatus.Scheduled,
        date: initialDate || new Date(),
        startTime: format(
          set(initialDate || new Date(), { hours: 13, minutes: 0 }),
          "HH:mm"
        ),
        endTime: format(
          set(initialDate || new Date(), { hours: 14, minutes: 0 }),
          "HH:mm"
        ),
        homeTeamId: 0,
        awayTeamId: 0,
        location: null,
        competitionType: "",
        seasonId: selectedSeason.id,
        meta: {
          note: "",
        },
        homeScore: null,
        awayScore: null,
      },
      {
        keepDirty: false,
        keepErrors: false,
        keepIsSubmitted: false,
        keepTouched: false,
      }
    );

    // Close the modal
    setIsOpen(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 relative h-[calc(100vh-8rem)] md:h-auto"
      >
        {/* Hidden field for season ID */}
        <input
          type="hidden"
          {...form.register("seasonId")}
          value={selectedSeason.id}
        />

        {/* Section 1: Teams */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Game Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Home/Away Selection */}
            <div className="space-y-2">
              <FormLabel>Where is the game being played?</FormLabel>
              <RadioGroup
                defaultValue={GameLocationType.OrganizationHome}
                className="grid grid-cols-2 gap-4"
                onValueChange={(value) =>
                  setGameLocation(value as GameLocationType)
                }
              >
                <div>
                  <RadioGroupItem
                    value={GameLocationType.OrganizationHome}
                    id="home"
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="home"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Home className="mb-3 h-6 w-6" />
                    <p className="text-sm font-medium">Home Game</p>
                    <p className="text-xs text-muted-foreground">
                      We are the home team
                    </p>
                  </label>
                </div>

                <div>
                  <RadioGroupItem
                    value={GameLocationType.OpponentVenue}
                    id="away"
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="away"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <ExternalLink className="mb-3 h-6 w-6" />
                    <p className="text-sm font-medium">Away Game</p>
                    <p className="text-xs text-muted-foreground">
                      We are the away team
                    </p>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Team Selection */}
            <div className="space-y-4">
              {gameLocation === GameLocationType.OrganizationHome ? (
                <>
                  {/* Home: Organization Team */}
                  <div className="space-y-4">
                    <FormLabel>
                      <RequiredLabel>
                        Home Team (Your Organization)
                      </RequiredLabel>
                    </FormLabel>
                    <TeamSelector
                      teams={teams}
                      control={form.control}
                      name="homeTeamId"
                      placeholder="Select your team"
                      onChange={(value) => handleTeamChange(true, value)}
                      key="home-team-selector"
                    />
                  </div>

                  {/* Away: Opponent Team */}
                  {homeTeamId > 0 && (
                    <div className="space-y-4">
                      <FormLabel>
                        <RequiredLabel>Away Team (Opponent)</RequiredLabel>
                      </FormLabel>
                      <OpponentTeamSelector
                        opponents={opponents}
                        control={form.control}
                        name="awayTeamId"
                        placeholder="Select opponent team"
                        onChange={(value) => handleTeamChange(false, value)}
                        key="away-team-selector"
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Home: Opponent Team */}
                  <div className="space-y-4">
                    <FormLabel>
                      <RequiredLabel>Home Team (Opponent)</RequiredLabel>
                    </FormLabel>
                    <OpponentTeamSelector
                      opponents={opponents}
                      control={form.control}
                      name="homeTeamId"
                      placeholder="Select opponent's home team"
                      onChange={(value) => handleTeamChange(true, value)}
                      key="home-opponent-selector"
                    />
                  </div>

                  {/* Away: Organization Team */}
                  {homeTeamId > 0 && (
                    <div className="space-y-4">
                      <FormLabel>
                        <RequiredLabel>
                          Away Team (Your Organization)
                        </RequiredLabel>
                      </FormLabel>
                      <TeamSelector
                        teams={teams}
                        control={form.control}
                        name="awayTeamId"
                        placeholder="Select your team"
                        onChange={(value) => handleTeamChange(false, value)}
                        key="away-org-selector"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Scheduling */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* DateTimeRange Component */}
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
                    // Create a clean copy of the date to avoid timezone issues
                    const dateWithoutTime = new Date(
                      startDate.getFullYear(),
                      startDate.getMonth(),
                      startDate.getDate()
                    );
                    // Then set the time parts
                    dateWithoutTime.setHours(startHours, startMinutes);
                    // Use this as our start date
                    startDate.setHours(startHours, startMinutes);
                  }
                }

                if (field.value && endTime) {
                  // Create end date with same date but different time
                  // Create a clean copy of the date first
                  endDate = new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate()
                  );
                  const [endHours, endMinutes] = endTime.split(":").map(Number);
                  if (!isNaN(endHours) && !isNaN(endMinutes)) {
                    endDate.setHours(endHours, endMinutes);
                  }
                } else if (field.value) {
                  // Default to start date + 1 hour if no end time
                  endDate = addHours(startDate, 1);
                }

                return (
                  <FormItem className="space-y-1">
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

        {/* Section 3: Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Game Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel>Location</RequiredLabel>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const selectedLocation = tenant.gameLocations?.find(
                        (loc) => loc.id === value
                      );
                      field.onChange(selectedLocation || null);
                    }}
                    value={field.value?.id || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenant.gameLocations?.map((location) => (
                        <SelectItem key={location.id} value={location.id || ""}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Competition Type */}
            <FormField
              control={form.control}
              name="competitionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competition Type</FormLabel>

                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-1 mt-2">
                      <Select
                        onValueChange={(value) => {
                          const selected = competitionTypes.find(
                            (type) => type.name === value
                          );
                          if (selected) {
                            handleCompetitionTypeSelect(selected);
                          }
                        }}
                        value={competitionName}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select competition type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {competitionTypes.map((type) => (
                            <SelectItem key={type.name} value={type.name}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor: type.color || "",
                                  }}
                                />
                                {type.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 4: Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="meta.note"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this game..."
                      className="resize-none min-h-[100px]"
                      {...field}
                      value={typeof field.value === "string" ? field.value : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="bg-background sticky h-[100px] flex items-center justify-between bottom-0 left-0 right-0 border-t">
          <div className="pl-4">
            <Button
              type="button"
              onClick={() => form.handleSubmit(onSubmitAndAddAnother)()}
              disabled={isSubmitting}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </div>
          <FormButtons
            buttonText="Add and close"
            isLoading={isSubmitting}
            isDirty={form.formState.isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}
