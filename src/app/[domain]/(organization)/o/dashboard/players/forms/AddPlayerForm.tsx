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
import { useAddPlayer } from "@/entities/player/Player.actions.client";
import {
  PlayerForm,
  PlayerGender,
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
  Users,
  UserCog,
  ShieldCheck,
  Shirt,
  X,
} from "lucide-react";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantGroupTypes } from "@/entities/tenant/hooks/useGroupTypes";
import { usePlayers } from "@/entities/player/Player.actions.client";
import { format, differenceInYears, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/libs/tailwind/utils";
import { z } from "zod";
import { DatePicker } from "@/components/ui/date-picker/DatePicker";
import { useMembershipCategories } from "@/entities/membership-category/MembershipCategory.query";
import { useParentUsers } from "@/entities/user/hooks/useParentUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useMemo, useEffect } from "react";
import { Team, Gender } from "@/entities/team/Team.schema";
import { usePlayerUsers } from "@/entities/user/hooks/usePlayerUsers";

type AddPlayerFormProps = {
  tenantId: string;
  domain: string;
  setIsParentModalOpen?: (value: boolean) => void;
};

interface GroupedTeams {
  recommended: Team[];
  available: Team[];
}

// Add this for PIN check
const PinCheckIndicator = ({ isValid }: { isValid: boolean }) => (
  <div className="absolute right-2 top-1/2 -translate-y-1/2">
    {isValid ? (
      <div className="text-green-500 text-sm">✓</div>
    ) : (
      <div className="text-red-500 text-sm">✗</div>
    )}
  </div>
);

// Add helper functions at the top
const parseTeamAge = (teamAge: string | null): number | null => {
  if (!teamAge) return null;
  const match = teamAge.match(/u(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

const isTeamAgeCompatible = (
  playerAge: number,
  teamAge: string | null
): boolean => {
  const parsedTeamAge = parseTeamAge(teamAge);
  if (parsedTeamAge === null) return false;
  return playerAge <= parsedTeamAge;
};

const mapPlayerToTeamGender = (playerGender: PlayerGender): Gender => {
  switch (playerGender) {
    case PlayerGender.Male:
      return Gender.Boys;
    case PlayerGender.Female:
      return Gender.Girls;
    default:
      return Gender.Mixed;
  }
};

export default function AddPlayerForm({
  tenantId,
  domain,
  setIsParentModalOpen,
}: AddPlayerFormProps) {
  const addPlayer = useAddPlayer(tenantId);
  const { data: teams } = useGetTeamsByTenantId(tenantId);
  const { data: existingPlayers } = usePlayers(tenantId);
  const { ageGroups, positions } = useTenantGroupTypes(domain);
  const { data: membershipCategories } = useMembershipCategories(tenantId);
  const { data: parentUsers } = useParentUsers(tenantId);
  const { data: playerUsers } = usePlayerUsers(tenantId);

  const form = useForm<PlayerForm>({
    resolver: zodResolver(createPlayerFormSchema()),
    defaultValues: {
      firstName: "",
      secondName: "",
      dateOfBirth: format(new Date(), "yyyy-MM-dd"),
      pin: "",
      gender: undefined,
      position: undefined,
      joinDate: format(new Date(), "yyyy-MM-dd"),
      membershipCategoryId: undefined,
      teamIds: [],
      parentUserIds: [],
      ownerUserId: undefined,
    },
  });

  const { handleSubmit, watch } = form;
  const { isDirty, isLoading } = form.formState;

  const dateOfBirth = watch("dateOfBirth");
  const firstName = watch("firstName");
  const secondName = watch("secondName");
  const gender = watch("gender");
  const position = watch("position");
  const selectedTeams = watch("teamIds") || [];

  // Calculate player's age
  const playerAge = dateOfBirth
    ? differenceInYears(new Date(), parseISO(dateOfBirth))
    : null;

  // Group teams by age and filter based on player's age
  const groupedTeams = useMemo<GroupedTeams | null>(() => {
    if (!teams || playerAge === null) return null;

    const recommended: Team[] = [];
    const available: Team[] = [];

    // Only process teams if we have all required player details
    const hasRequiredDetails = Boolean(
      firstName && secondName && gender && position
    );

    if (hasRequiredDetails) {
      teams.forEach((team) => {
        // Skip teams without age information
        if (!team.age) {
          available.push(team);
          return;
        }

        if (isTeamAgeCompatible(playerAge, team.age)) {
          // Check gender compatibility if specified
          if (
            team.gender === Gender.Mixed ||
            team.gender === mapPlayerToTeamGender(gender as PlayerGender)
          ) {
            recommended.push(team);
          } else {
            available.push(team);
          }
        } else {
          available.push(team);
        }
      });

      // Sort recommended teams by age (closest to player's age first)
      recommended.sort((a, b) => {
        const ageA = parseTeamAge(a.age) || 0;
        const ageB = parseTeamAge(b.age) || 0;
        return ageA - ageB;
      });
    } else {
      // If required details are missing, all teams go to available
      available.push(...teams);
    }

    return { recommended, available };
  }, [teams, playerAge, firstName, secondName, gender, position]);

  // Generate a random 4-digit PIN
  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    form.setValue("pin", pin);
  };

  // Check if PIN is unique
  const isPinUnique = (pin: string) => {
    return !existingPlayers?.some((player) => player.pin === pin);
  };

  // Add state for PIN validation
  const [isPinValid, setIsPinValid] = useState<boolean>(true);

  // Check if PIN is unique and update validation state
  const validatePin = (pin: string) => {
    if (pin.length === 4) {
      const isUnique = !existingPlayers?.some((player) => player.pin === pin);
      setIsPinValid(isUnique);
      return isUnique;
    }
    setIsPinValid(true);
    return true;
  };

  const onSubmit = async (data: PlayerForm) => {
    if (data.pin && !isPinUnique(data.pin)) {
      toast.error("PIN must be unique");
      return;
    }

    try {
      await addPlayer.mutateAsync(data);
      toast.success("Player added successfully");
      form.reset();
      setIsParentModalOpen?.(false);
    } catch (error: any) {
      console.error("Error adding player:", error);
      toast.error(error.message || "Failed to add player");
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
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="text-sm">
                Player Details
              </TabsTrigger>
              <TabsTrigger value="teams" className="text-sm">
                Team Assignment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Personal Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={
                                field.value ? parseISO(field.value) : undefined
                              }
                              onChange={(date) =>
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : ""
                                )
                              }
                            />
                          </FormControl>
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="">
                            PIN Code
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-auto w-auto ml-2"
                                    onClick={generateRandomPin}
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Generate random PIN
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                maxLength={4}
                                placeholder="4-digit PIN"
                                onChange={(e) => {
                                  field.onChange(e);
                                  validatePin(e.target.value);
                                }}
                              />
                            </FormControl>
                            {field.value?.length === 4 && (
                              <PinCheckIndicator isValid={isPinValid} />
                            )}
                          </div>
                          <FormDescription>
                            Used for player identification
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Membership Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Membership Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="membershipCategoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Membership Category</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
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
                        <FormItem>
                          <FormLabel>Join Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={
                                field.value ? parseISO(field.value) : undefined
                              }
                              onChange={(date) =>
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : ""
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* User Connections */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    User Connections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Parents/Guardians - Multi-select */}
                  <FormField
                    control={form.control}
                    name="parentUserIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parents/Guardians</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const currentValues = new Set(field.value);
                            if (currentValues.has(value)) {
                              currentValues.delete(value);
                            } else {
                              currentValues.add(value);
                            }
                            field.onChange(Array.from(currentValues));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Add parent/guardian" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parentUsers?.map((user) => (
                              <SelectItem
                                key={user.id}
                                value={user.id}
                                disabled={field.value?.includes(user.id)}
                              >
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value?.map((userId) => {
                            const user = parentUsers?.find(
                              (u) => u.id === userId
                            );
                            return (
                              <Badge
                                key={userId}
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => {
                                  field.onChange(
                                    field.value?.filter((id) => id !== userId)
                                  );
                                }}
                              >
                                {user?.firstName} {user?.lastName}
                                <X className="ml-1 h-3 w-3" />
                              </Badge>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Owner - Single select */}
                  <FormField
                    control={form.control}
                    name="ownerUserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player Account</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(
                              value === "none" ? undefined : value
                            );
                          }}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select player account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No account</SelectItem>
                            {playerUsers?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The user account that belongs to this player
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams" className="space-y-6 mt-6">
              {/* Team Assignment */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Shirt className="h-4 w-4" />
                    Team Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="teamIds"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-6">
                          {groupedTeams?.recommended.length ? (
                            <div>
                              <FormLabel>Recommended Teams</FormLabel>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {groupedTeams.recommended.map((team) => (
                                  <Badge
                                    key={team.id}
                                    variant={
                                      field.value?.includes(team.id)
                                        ? "default"
                                        : "outline"
                                    }
                                    className="cursor-pointer hover:bg-primary/90"
                                    onClick={() => {
                                      const value = new Set(field.value);
                                      if (value.has(team.id)) {
                                        value.delete(team.id);
                                      } else {
                                        value.add(team.id);
                                      }
                                      field.onChange(Array.from(value));
                                    }}
                                  >
                                    {team.name} ({team.age} {team.gender}{" "}
                                    {team.skill})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {groupedTeams?.available.length ? (
                            <div>
                              <FormLabel>Other Available Teams</FormLabel>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {groupedTeams.available.map((team) => (
                                  <Badge
                                    key={team.id}
                                    variant={
                                      field.value?.includes(team.id)
                                        ? "default"
                                        : "outline"
                                    }
                                    className="cursor-pointer hover:bg-primary/90"
                                    onClick={() => {
                                      const value = new Set(field.value);
                                      if (value.has(team.id)) {
                                        value.delete(team.id);
                                      } else {
                                        value.add(team.id);
                                      }
                                      field.onChange(Array.from(value));
                                    }}
                                  >
                                    {team.name} ({team.age} {team.gender}{" "}
                                    {team.skill})
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
