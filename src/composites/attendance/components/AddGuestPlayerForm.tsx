"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { AttendanceStatus } from "@/entities/attendance/AttendanceRecord.schema";
import { usePerformers } from "@/entities/member/Performer.query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Zod schema for form validation
const addGuestPlayerSchema = z.object({
  selectedPlayerId: z.number({
    required_error: "Please select a player",
  }),
  selectedStatus: z.nativeEnum(AttendanceStatus),
});

type AddGuestPlayerFormData = z.infer<typeof addGuestPlayerSchema>;

interface AddGuestPlayerFormProps {
  tenantId: string;
  currentGroupId: number;
  sessionId: number;
  setIsOpen: (open: boolean) => void;
  onAddGuestPlayer: (
    playerId: number,
    status: AttendanceStatus
  ) => Promise<void>;
  isPending?: boolean;
}

export function AddGuestPlayerForm({
  tenantId,
  currentGroupId,
  sessionId,
  setIsOpen,
  onAddGuestPlayer,
  isPending = false,
}: AddGuestPlayerFormProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<AddGuestPlayerFormData>({
    resolver: zodResolver(addGuestPlayerSchema),
    defaultValues: {
      selectedStatus: AttendanceStatus.PRESENT,
    },
  });

  const { handleSubmit, watch, setValue } = form;
  const { isDirty } = form.formState;

  // Fetch all performers in the organization
  const { data: allPerformers, isLoading } = usePerformers(tenantId);

  // Filter and search performers
  const availableGuestPlayers = useMemo(() => {
    return (
      allPerformers?.filter((performer) => {
        // Apply search filter
        const matchesSearch =
          searchTerm === "" ||
          `${performer.firstName} ${performer.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchesSearch;
      }) || []
    );
  }, [allPerformers, searchTerm]);

  const selectedPlayerId = watch("selectedPlayerId");
  const selectedPlayer = availableGuestPlayers.find(
    (p) => p.id === selectedPlayerId
  );

  const handlePlayerSelect = (playerId: number) => {
    setValue("selectedPlayerId", playerId, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: AddGuestPlayerFormData) => {
    try {
      await onAddGuestPlayer(data.selectedPlayerId, data.selectedStatus);
      toast.success("Guest player added successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding guest player:", error);
      toast.error("Failed to add guest player");
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Attendance Status */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Initial Status</CardTitle>
              </div>
              <CardDescription>
                Set the initial attendance status for this player
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="selectedStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Attendance Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={AttendanceStatus.PRESENT}>
                            Present
                          </SelectItem>
                          <SelectItem value={AttendanceStatus.LATE}>
                            Late
                          </SelectItem>
                          <SelectItem value={AttendanceStatus.ABSENT}>
                            Absent
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Player Search and Selection */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Player Selection</CardTitle>
              </div>
              <CardDescription>
                Search and select a player to add to this session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search input */}
              <div className="space-y-2">
                <FormLabel htmlFor="search">Search Players</FormLabel>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Player list */}
              <FormField
                control={form.control}
                name="selectedPlayerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Players</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : availableGuestPlayers.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            {searchTerm
                              ? "No players found matching your search"
                              : "No players available"}
                          </div>
                        ) : (
                          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                            {availableGuestPlayers.map((player) => (
                              <div
                                key={player.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                  selectedPlayerId === player.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:bg-muted/50"
                                }`}
                                onClick={() => handlePlayerSelect(player.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">
                                      {player.firstName} {player.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      ID: {player.id}
                                    </div>
                                  </div>
                                  {player.pin && (
                                    <Badge
                                      variant="outline"
                                      className="font-mono"
                                    >
                                      PIN: {player.pin}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Selected player summary */}
              {selectedPlayer && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="font-medium">Selected Player</span>
                  </div>
                  <div className="text-sm">
                    <div>
                      {selectedPlayer.firstName} {selectedPlayer.lastName}
                    </div>
                    <div className="text-muted-foreground">
                      Player ID: {selectedPlayer.id}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <FormButtons
            buttonText="Add Guest Player"
            isLoading={isPending}
            isDirty={isDirty}
            onCancel={handleCancel}
          />
        </form>
      </Form>
    </div>
  );
}
