"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddPlayerToTenant } from "@/entities/player/Player.actions.client";
import {
  PlayerForm,
  PlayerGender,
  PlayerPosition,
  createPlayerFormSchema,
} from "@/entities/player/Player.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantGroupTypes } from "@/entities/tenant/hooks/useGroupTypes";
import { usePlayers } from "@/entities/player/Player.actions.client";
import { useAddPlayerToTeam } from "@/entities/player/PlayerTeam.actions.client";
import { format, differenceInYears } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/libs/tailwind/utils";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker/DatePicker";
import { useMembershipCategories } from "@/entities/membership-category/MembershipCategory.query";
import { useAddPlayerMembership } from "@/entities/player/PlayerMembership.actions.client";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { useParentUsers } from "@/entities/user/hooks/useParentUsers";

type AddPlayerFormProps = {
  tenantId: string;
  domain: string;
  setIsParentModalOpen?: (value: boolean) => void;
};

export default function AddPlayerForm({
  tenantId,
  domain,
  setIsParentModalOpen,
}: AddPlayerFormProps) {
  const addPlayer = useAddPlayerToTenant(tenantId);
  const addPlayerToTeam = useAddPlayerToTeam(tenantId);
  const { data: teams } = useGetTeamsByTenantId(tenantId);
  const { data: existingPlayers } = usePlayers(tenantId);
  const { ageGroups } = useTenantGroupTypes(domain);
  const { data: seasons } = useSeasonsByTenantId(tenantId);
  const { data: membershipCategories } = useMembershipCategories(tenantId);
  const addPlayerMembership = useAddPlayerMembership();
  const { data: parentUsers } = useParentUsers(tenantId);

  const form = useForm<
    PlayerForm & {
      teams: number[];
      membershipCategoryId?: number;
      joinDate?: string;
      parentId?: string;
    }
  >({
    resolver: zodResolver(
      createPlayerFormSchema().extend({
        teams: z.array(z.number()).optional(),
        membershipCategoryId: z.number().optional(),
        joinDate: z.string().optional(),
        parentId: z.string().optional(),
      })
    ),
    defaultValues: {
      firstName: "",
      secondName: "",
      dateOfBirth: format(new Date(), "yyyy-MM-dd"),
      pin: "",
      gender: undefined,
      position: undefined,
      teams: [],
      membershipCategoryId: undefined,
      joinDate: format(new Date(), "yyyy-MM-dd"),
      parentId: undefined,
    },
  });

  const { handleSubmit, watch } = form;
  const { isDirty, isLoading } = form.formState;

  const dateOfBirth = watch("dateOfBirth");
  const selectedTeams = watch("teams") || [];

  // Calculate player's age
  const playerAge = differenceInYears(new Date(), new Date(dateOfBirth));

  // Generate a random 4-digit PIN
  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    form.setValue("pin", pin);
  };

  // Check if PIN is unique
  const isPinUnique = (pin: string) => {
    return !existingPlayers?.some((player) => player.pin === pin);
  };

  // Group teams by age and filter based on player's age
  const groupedTeams = teams?.reduce(
    (acc, team) => {
      const teamAge = parseInt(team.age?.replace(/u/i, "") || "0", 10);
      const isRecommended = teamAge >= playerAge;

      if (isRecommended) {
        acc.recommended.push(team);
      } else {
        acc.others.push(team);
      }

      return acc;
    },
    { recommended: [], others: [] } as {
      recommended: typeof teams;
      others: typeof teams;
    }
  );

  // Get current season
  const currentSeason = seasons?.find((season) => {
    const now = new Date();
    return new Date(season.startDate) <= now && new Date(season.endDate) >= now;
  });

  const onSubmit = async (
    data: PlayerForm & {
      teams: number[];
      membershipCategoryId?: number;
      joinDate?: string;
      parentId?: string;
    }
  ) => {
    // Validate PIN uniqueness
    if (data.pin && !isPinUnique(data.pin)) {
      toast.error("PIN must be unique");
      return;
    }

    try {
      // Extract teams and membership data before sending to addPlayer
      const { teams, membershipCategoryId, joinDate, parentId, ...playerData } =
        data;

      // Add player
      const player = await addPlayer.mutateAsync(playerData);

      // Add player to selected teams
      if (teams?.length) {
        await Promise.all(
          teams.map((teamId) =>
            addPlayerToTeam.mutateAsync({
              playerId: player.id,
              teamId,
            })
          )
        );
      }

      // Add player membership if selected
      if (membershipCategoryId && joinDate && currentSeason) {
        await addPlayerMembership.mutateAsync({
          playerId: player.id,
          seasonId: currentSeason.id,
          memberhsipCategoryId: membershipCategoryId,
          joinDate,
        });
      }

      toast.success("Player added successfully");
      form.reset();
      setIsParentModalOpen?.(false);
    } catch (error) {
      toast.error("Failed to add player");
    }
  };

  const onCancel = () => {
    form.reset();
    setIsParentModalOpen?.(false);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Personal Information
              </h4>
            </div>

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Second Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Player must be at least {new Date().getFullYear() - 2010}{" "}
                    years old
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PlayerGender).map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PlayerPosition).map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          maxLength={4}
                          placeholder="4-digit PIN"
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value.length === 4) {
                              if (!isPinUnique(e.target.value)) {
                                form.setError("pin", {
                                  type: "manual",
                                  message: "This PIN is already in use",
                                });
                              } else {
                                form.clearErrors("pin");
                              }
                            }
                          }}
                        />
                        {field.value?.length === 4 && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {isPinUnique(field.value) ? (
                              <div className="text-green-500 text-sm">✓</div>
                            ) : (
                              <div className="text-red-500 text-sm">✗</div>
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generateRandomPin}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    A unique 4-digit PIN for player identification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Parent Assignment */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Parent Assignment
              </h4>
            </div>

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parentUsers?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Team Assignment */}
          {teams && teams.length > 0 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Team Assignment
                </h4>
              </div>

              <FormField
                control={form.control}
                name="teams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teams</FormLabel>
                    <div className="space-y-4">
                      {/* Recommended Teams */}
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Recommended Teams
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {groupedTeams?.recommended.map((team) => (
                            <Badge
                              key={team.id}
                              variant={
                                field.value?.includes(team.id)
                                  ? "default"
                                  : "outline"
                              }
                              className={cn(
                                "cursor-pointer hover:bg-primary/90 transition-colors",
                                field.value?.includes(team.id) &&
                                  "bg-primary text-primary-foreground"
                              )}
                              onClick={() => {
                                const newValue = field.value?.includes(team.id)
                                  ? field.value.filter((id) => id !== team.id)
                                  : [...(field.value || []), team.id];
                                field.onChange(newValue);
                              }}
                            >
                              {team.age} {team.gender} {team.skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Other Teams */}
                      {groupedTeams?.others.length ? (
                        <div>
                          <Separator className="my-4" />
                          <div className="text-sm font-medium mb-2">
                            Other Teams
                          </div>
                          <Alert variant="destructive" className="mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              These teams are below the player&apos;s age group
                            </AlertDescription>
                          </Alert>
                          <div className="flex flex-wrap gap-2">
                            {groupedTeams.others.map((team) => (
                              <Badge
                                key={team.id}
                                variant={
                                  field.value?.includes(team.id)
                                    ? "default"
                                    : "outline"
                                }
                                className={cn(
                                  "cursor-pointer hover:bg-primary/90 transition-colors",
                                  field.value?.includes(team.id) &&
                                    "bg-primary text-primary-foreground"
                                )}
                                onClick={() => {
                                  const newValue = field.value?.includes(
                                    team.id
                                  )
                                    ? field.value.filter((id) => id !== team.id)
                                    : [...(field.value || []), team.id];
                                  field.onChange(newValue);
                                }}
                              >
                                {team.age} {team.gender} {team.skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Membership Assignment */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Membership Assignment
              </h4>
            </div>

            <FormField
              control={form.control}
              name="membershipCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership Category</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {membershipCategories?.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="joinDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Join Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Add"
            isLoading={isLoading}
            isDirty={isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}
