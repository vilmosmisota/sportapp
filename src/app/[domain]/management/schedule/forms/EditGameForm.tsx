"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, set } from "date-fns";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimeRange } from "@/components/ui/date-time-range";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { OpponentTeamSelector } from "@/components/ui/opponent-team-selector";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamSelector } from "@/components/ui/team-selector";
import { Textarea } from "@/components/ui/textarea";

// Icons
import {
  Calendar,
  ExternalLink,
  FileText,
  Home,
  MapPin,
  Trophy,
} from "lucide-react";

// Entity Types & Schemas
import {
  GameForm,
  GameFormSchema,
  GameStatus,
} from "@/entities/game/Game.schema";
import { Season } from "@/entities/season/Season.schema";
import { Location as BaseLocation } from "@/entities/shared/Location.schema";
import { CompetitionType, Tenant } from "@/entities/tenant/Tenant.schema";

// Queries & Actions
import { GameWithViewDetails } from "@/components/calendar/hooks/useGamesCalendarEvents";
import { GameData } from "@/components/calendar/types";
import { useUpdateGame } from "@/entities/game/Game.actions.client";
import { useGetTeamsByTenantId } from "@/entities/group/Group.query";
import { useOpponents } from "@/entities/opponent/Opponent.query";

// Location type
enum GameLocationType {
  OrganizationHome = "home",
  OpponentVenue = "away",
}

// Extend the base Location type with game-specific type field
type GameLocation = BaseLocation & {
  type?: GameLocationType;
};

interface ExtendedGameWithViewDetails extends GameWithViewDetails {
  displayDetails?: GameData["displayDetails"];
}

// Create a required field label component
const RequiredLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children} <span className="text-destructive font-bold">*</span>
    </>
  );
};

interface Props {
  selectedSeason: Season;
  tenant: Tenant;
  game: ExtendedGameWithViewDetails;
  setIsOpen: (open: boolean) => void;
}

const formatCompetitionType = (name: string, color?: string): string => {
  const cleanName = name.replace(/#/g, "");
  const cleanColor = color?.replace(/#/g, "") || "";
  return cleanColor ? `${cleanName}#${cleanColor}` : cleanName;
};

export default function EditGameForm({
  selectedSeason,
  tenant,
  game,
  setIsOpen,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const tenantId = tenant.id.toString();

  // State for organization's role (home/away)
  const [gameLocation, setGameLocation] = useState<GameLocationType>(() => {
    if (game.homeTeam && game.awayTeam) {
      return game.homeTeam.tenantId === parseInt(tenantId) &&
        !game.homeTeam.opponentId
        ? GameLocationType.OrganizationHome
        : GameLocationType.OpponentVenue;
    } else if (game.tenantTeam) {
      return game.tenantTeam.isHomeTeam
        ? GameLocationType.OrganizationHome
        : GameLocationType.OpponentVenue;
    }

    const location = game.location as GameLocation;
    return location?.type || GameLocationType.OrganizationHome;
  });

  const competitionTypes = tenant.competitionTypes || [];

  const { data: teams = [] } = useGetTeamsByTenantId(tenantId);
  const { data: opponents = [] } = useOpponents(tenantId);

  const updateGame = useUpdateGame(tenantId);

  // Determine initial team IDs based on the actual home and away teams
  const initialHomeTeamId = useMemo(() => {
    if (game.homeTeam) return String(game.homeTeam.id);
    if (game.tenantTeam?.isHomeTeam) return String(game.tenantTeam.id);
    if (game.opponentTeam?.isHomeTeam) return String(game.opponentTeam.id);
    return String(game.homeTeamId);
  }, [game]);

  const initialAwayTeamId = useMemo(() => {
    if (game.awayTeam) return String(game.awayTeam.id);
    if (game.tenantTeam && !game.tenantTeam.isHomeTeam)
      return String(game.tenantTeam.id);
    if (game.opponentTeam && !game.opponentTeam.isHomeTeam)
      return String(game.opponentTeam.id);
    return String(game.awayTeamId);
  }, [game]);

  // Initialize form with the complete game data
  const form = useForm<GameForm>({
    resolver: zodResolver(GameFormSchema),
    defaultValues: {
      status: game.status || GameStatus.Scheduled,
      date: new Date(game.date),
      startTime: game.startTime,
      endTime: game.endTime,
      homeTeamId: parseInt(initialHomeTeamId),
      awayTeamId: parseInt(initialAwayTeamId),
      location: game.location,
      competitionType: game.competitionType,
      seasonId: game.seasonId,
      meta: {
        note: game.meta?.note || "",
      },
    },
  });

  // Create start and end dates for DateTimeRange
  const startDateTime = useMemo(() => {
    const date = new Date(game.date);
    const [hours, minutes] = game.startTime.split(":");
    return set(date, { hours: parseInt(hours), minutes: parseInt(minutes) });
  }, [game.date, game.startTime]);

  const endDateTime = useMemo(() => {
    const date = new Date(game.date);
    if (game.endTime) {
      const [hours, minutes] = game.endTime.split(":");
      return set(date, { hours: parseInt(hours), minutes: parseInt(minutes) });
    }
    // Default to 2 hours after start time
    const [startHours, startMinutes] = game.startTime.split(":");
    return set(date, {
      hours: parseInt(startHours) + 2,
      minutes: parseInt(startMinutes),
    });
  }, [game.date, game.endTime, game.startTime]);

  // Watch for form changes to set form as dirty
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle datetime range change
  const handleDateTimeRangeChange = (isStart: boolean, date?: Date) => {
    if (!date) return;

    if (isStart) {
      form.setValue("date", date);
      form.setValue("startTime", format(date, "HH:mm"));
    } else {
      form.setValue("endTime", format(date, "HH:mm"));
    }

    setIsDirty(true);
  };

  // Extract form values for conditional logic
  const homeTeamId = String(form.watch("homeTeamId") || initialHomeTeamId);
  const awayTeamId = String(form.watch("awayTeamId") || initialAwayTeamId);
  const currentCompetitionType = form.watch("competitionType");
  const formDate = form.watch("date");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  // Handle team selection changes
  const handleTeamChange = (isHome: boolean, value: string) => {
    const field = isHome ? "homeTeamId" : "awayTeamId";
    form.setValue(field, parseInt(value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (teams.length === 0 || opponents.length === 0) return;

    if (game.homeTeam && game.awayTeam) {
      form.setValue("homeTeamId", game.homeTeam.id, { shouldValidate: true });
      form.setValue("awayTeamId", game.awayTeam.id, { shouldValidate: true });

      const homeIsOur =
        game.homeTeam.tenantId === parseInt(tenantId) &&
        !game.homeTeam.opponentId;
      setGameLocation(
        homeIsOur
          ? GameLocationType.OrganizationHome
          : GameLocationType.OpponentVenue
      );
    } else if (game.tenantTeam && game.opponentTeam) {
      if (game.tenantTeam.isHomeTeam) {
        form.setValue("homeTeamId", game.tenantTeam.id, {
          shouldValidate: true,
        });
        form.setValue("awayTeamId", game.opponentTeam.id, {
          shouldValidate: true,
        });
      } else {
        form.setValue("homeTeamId", game.opponentTeam.id, {
          shouldValidate: true,
        });
        form.setValue("awayTeamId", game.tenantTeam.id, {
          shouldValidate: true,
        });
      }
    } else if (game.homeTeamId && game.awayTeamId) {
      form.setValue("homeTeamId", game.homeTeamId, { shouldValidate: true });
      form.setValue("awayTeamId", game.awayTeamId, { shouldValidate: true });
    }
  }, [game, form, tenantId, teams, opponents]);

  const handleCompetitionTypeSelect = (competitionType: CompetitionType) => {
    const formattedType = formatCompetitionType(
      competitionType.name,
      competitionType.color
    );
    form.setValue("competitionType", formattedType, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: GameForm) => {
    try {
      setIsSubmitting(true);

      // Prepare location data based on game location type
      const awayTeamId = form.getValues().awayTeamId;
      const awayTeam = opponents.find((o) => o.id === awayTeamId);

      const locationData = {
        name:
          gameLocation === GameLocationType.OrganizationHome
            ? form.getValues().location?.name || ""
            : awayTeam?.name || "",
        postcode:
          gameLocation === GameLocationType.OrganizationHome
            ? form.getValues().location?.postcode || ""
            : "",
        streetAddress:
          gameLocation === GameLocationType.OrganizationHome
            ? form.getValues().location?.streetAddress || ""
            : "",
        city:
          gameLocation === GameLocationType.OrganizationHome
            ? form.getValues().location?.city || ""
            : "",
        mapLink:
          gameLocation === GameLocationType.OrganizationHome
            ? form.getValues().location?.mapLink || ""
            : "",
      };

      // Convert location data to Location type
      const location: GameLocation = {
        ...locationData,
        type: gameLocation,
      };

      // Update the game
      await updateGame.mutateAsync({
        gameId: game.id,
        data: {
          ...data,
          location: location,
        },
      });

      toast.success("Game updated successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating game:", error);
      toast.error("Failed to update game");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCancel = () => {
    if (isDirty) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to cancel?"
        )
      ) {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
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
                value={gameLocation}
                onValueChange={(value: GameLocationType) => {
                  setGameLocation(value);
                  // Swap teams if location changes
                  if (value === GameLocationType.OrganizationHome) {
                    if (game.tenantTeam && !game.tenantTeam.isHomeTeam) {
                      form.setValue("homeTeamId", game.tenantTeam.id, {
                        shouldValidate: true,
                      });
                      form.setValue("awayTeamId", game.opponentTeam?.id || 0, {
                        shouldValidate: true,
                      });
                    }
                  } else {
                    if (game.tenantTeam?.isHomeTeam) {
                      form.setValue("awayTeamId", game.tenantTeam.id, {
                        shouldValidate: true,
                      });
                      form.setValue("homeTeamId", game.opponentTeam?.id || 0, {
                        shouldValidate: true,
                      });
                    }
                  }
                }}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value={GameLocationType.OrganizationHome}
                    id="home"
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="home"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Home className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">Home Game</span>
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <ExternalLink className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">Away Game</span>
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
                      defaultValue={String(homeTeamId)}
                      key="home-team-selector"
                    />
                  </div>

                  {/* Away: Opponent Team */}
                  {parseInt(homeTeamId) > 0 && (
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
                        defaultValue={String(awayTeamId)}
                        key="away-team-selector"
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Away: Organization Team */}
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
                      defaultValue={String(awayTeamId)}
                      key="away-team-selector"
                    />
                  </div>

                  {/* Home: Opponent Team */}
                  {parseInt(awayTeamId) > 0 && (
                    <div className="space-y-4">
                      <FormLabel>
                        <RequiredLabel>Home Team (Opponent)</RequiredLabel>
                      </FormLabel>
                      <OpponentTeamSelector
                        opponents={opponents}
                        control={form.control}
                        name="homeTeamId"
                        placeholder="Select opponent team"
                        onChange={(value) => handleTeamChange(true, value)}
                        defaultValue={String(homeTeamId)}
                        key="home-team-selector"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Date & Time */}
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
              render={({ field }) => (
                <FormItem>
                  <DateTimeRange
                    startDate={startDateTime}
                    onStartDateChange={(date) =>
                      handleDateTimeRangeChange(true, date)
                    }
                    endDate={endDateTime}
                    onEndDateChange={(date) =>
                      handleDateTimeRangeChange(false, date)
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 3: Location & Competition */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location & Competition
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
                  <div className="space-y-4">
                    {competitionTypes.map((type) => (
                      <div
                        key={type.name}
                        className="flex items-center space-x-2"
                      >
                        <Button
                          type="button"
                          variant={
                            currentCompetitionType ===
                            formatCompetitionType(type.name, type.color)
                              ? "default"
                              : "outline"
                          }
                          className="w-full justify-start"
                          onClick={() => handleCompetitionTypeSelect(type)}
                        >
                          <div
                            className="h-4 w-4 rounded-full mr-2"
                            style={{ backgroundColor: type.color }}
                          />
                          {type.name}
                        </Button>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 5: Notes */}
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
            onCancel={() => setIsOpen(false)}
            isLoading={isSubmitting}
            isDirty={isDirty}
            buttonText="Save Changes"
          />
        </div>
      </form>
    </Form>
  );
}
