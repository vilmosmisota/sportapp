"use client";

import { useParams, useRouter } from "next/navigation";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useAttendanceSessionById } from "@/entities/attendance/Attendance.query";
import { usePlayersByTeamId } from "@/entities/team/Team.query";
import { Loader2, ArrowLeft, UserCheck, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Player } from "@/entities/player/Player.schema";
import { useUpdatePlayerPin } from "@/entities/player/Player.actions.client";
import { toast } from "sonner";
import { PlayerGender } from "@/entities/player/Player.schema";
import { cn } from "@/libs/tailwind/utils";
import { useQueryClient } from "@tanstack/react-query";

import { BackConfirmationDialog } from "../../components/BackConfirmationDialog";

function NumericKeypad({
  onKeyPress,
  onDelete,
  onSubmit,
  pin,
  isPinValid,
  error,
}: {
  onKeyPress: (num: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  pin: string;
  isPinValid: boolean;
  error: string | null;
}) {
  const [showPin, setShowPin] = useState(true);
  const numbers = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "delete",
    "0",
    "submit",
  ];

  const handleKeyPress = (key: string) => {
    if (key === "delete") {
      onDelete();
    } else if (key === "submit") {
      onSubmit();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto py-4">
      {/* PIN Display and Messages */}
      <div className="mb-6">
        <div className="flex justify-center gap-3 mb-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={cn(
                "w-5 h-5 rounded-full border-2 relative transition-colors duration-200",
                pin[index]
                  ? "bg-primary border-primary"
                  : "border-muted-foreground"
              )}
            >
              {showPin && pin[index] && (
                <span className="absolute inset-0 flex items-center justify-center text-primary-foreground text-xs">
                  {pin[index]}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="h-4 flex justify-center mt-4">
          {pin.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-sm hover:bg-accent/50 h-4 px-2 -mt-1"
              onClick={() => setShowPin(!showPin)}
            >
              {showPin ? "Hide PIN" : "Show PIN"}
            </Button>
          )}
        </div>
        <div className="h-4 flex justify-center mt-1">
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
      </div>

      {/* Keypad */}
      <div className="w-[320px] p-6 border border-border rounded-3xl">
        <div className="grid grid-cols-3 place-items-center gap-4 mb-4">
          {numbers.slice(0, 9).map((num) => (
            <Button
              key={num}
              variant="outline"
              className="w-16 h-16 text-2xl rounded-full border hover:bg-accent/10 active:bg-accent/30 transition-colors duration-200"
              onClick={() => handleKeyPress(num)}
            >
              {num}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-3 place-items-center gap-4">
          <Button
            variant="outline"
            className="w-16 h-16 rounded-full border hover:bg-accent/10 active:bg-accent/30 transition-colors duration-200"
            onClick={() => handleKeyPress("delete")}
          >
            <Delete className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            className="w-16 h-16 text-2xl rounded-full border hover:bg-accent/10 active:bg-accent/30 transition-colors duration-200"
            onClick={() => handleKeyPress("0")}
          >
            0
          </Button>
          <div className="w-16 h-16" /> {/* Spacer */}
        </div>
        <div className="mt-4">
          <Button
            variant="default"
            disabled={!isPinValid || pin.length !== 4}
            className="w-full h-12 text-lg rounded-full bg-primary hover:bg-primary/90 transition-colors duration-200"
            onClick={() => handleKeyPress("submit")}
          >
            Create PIN
          </Button>
        </div>
      </div>
    </div>
  );
}

function CreatePinDialog({
  player,
  isOpen,
  onOpenChange,
  tenantId,
  teamId,
}: {
  player: Player;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  teamId: number;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPinValid, setIsPinValid] = useState(true);
  const updatePlayerPin = useUpdatePlayerPin(tenantId);
  const queryClient = useQueryClient();

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(null);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
    setIsPinValid(true);
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    try {
      await updatePlayerPin.mutateAsync({
        playerId: player.id,
        pin,
      });

      // Invalidate the usePlayersByTeamId query
      queryClient.invalidateQueries({
        queryKey: ["team", "players", teamId, tenantId],
      });

      toast.success("Successfully created PIN!");
      onOpenChange(false);
      setPin("");
    } catch (error) {
      toast.error("Failed to create PIN");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPin("");
      setError(null);
      setIsPinValid(true);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl w-[95vw] p-8">
        <DialogHeader className="mb-12">
          <DialogTitle className="text-2xl font-normal text-center">
            Create PIN for {player.firstName} {player.lastName}
          </DialogTitle>
        </DialogHeader>

        <NumericKeypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          pin={pin}
          isPinValid={isPinValid}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
}

export default function AddPinPage() {
  const params = useParams();
  const router = useRouter();
  const { data: tenant } = useTenantByDomain(params.domain as string);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);

  const { data: session, isLoading: isSessionLoading } =
    useAttendanceSessionById(params.id as string, tenant?.id?.toString() ?? "");

  const {
    data: playersConnections,
    isLoading: isPlayersLoading,
    error: playersError,
  } = usePlayersByTeamId(
    session?.training?.teamId ?? 0,
    tenant?.id?.toString() ?? ""
  );

  const isLoading = isSessionLoading || isPlayersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (playersError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-semibold text-destructive">
          Error Loading Players
        </h1>
        <p className="text-muted-foreground text-lg">Please try again later</p>
      </div>
    );
  }

  const playersWithoutPin =
    playersConnections?.filter((conn) => !conn.player.pin) ?? [];

  const handleBackNavigation = () => {
    setShowBackConfirmation(true);
  };

  const handleConfirmedBack = () => {
    router.push(`/o/dashboard/training-attendance/${params.id}`);
  };

  return (
    <div className="w-screen h-screen bg-background fixed top-0 left-0 flex flex-col z-50">
      {/* Navigation */}
      <div className="flex justify-between items-center border-b border-border px-4 h-14 shrink-0">
        <Button variant="ghost" className="p-2" onClick={handleBackNavigation}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() =>
            router.push(
              `/o/dashboard/training-attendance/${params.id}/check-in`
            )
          }
        >
          <UserCheck className="h-4 w-4" />
          Check In
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center max-w-md mx-auto pt-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-1">Create PIN</h1>
            <p className="text-xl text-muted-foreground">
              Select a player to create their PIN
            </p>
          </div>

          {/* Players List */}
          <div className="w-[320px] space-y-3">
            {playersWithoutPin.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xl text-muted-foreground">
                  All players have PINs set
                </p>
              </div>
            ) : (
              playersWithoutPin.map((connection) => (
                <Button
                  key={connection.id}
                  variant="outline"
                  disabled={
                    isDialogOpen && selectedPlayer?.id === connection.player.id
                  }
                  className="w-full h-16 text-lg border rounded-2xl hover:bg-accent/10 active:bg-accent/30 transition-colors duration-200"
                  onClick={() => {
                    // Create a full Player object with required fields
                    const fullPlayer = {
                      ...connection.player,
                      createdAt: new Date().toISOString(),
                      tenantId: tenant?.id ?? null,
                      joinDate: null,
                      membershipCategoryId: null,
                      membershipCategory: null,
                      teamConnections: [],
                      userConnections: [],
                      gender: connection.player.gender as PlayerGender,
                    };
                    setSelectedPlayer(fullPlayer);
                    setIsDialogOpen(true);
                  }}
                >
                  {connection.player.firstName} {connection.player.lastName}
                </Button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create PIN Dialog */}
      {selectedPlayer && (
        <CreatePinDialog
          player={selectedPlayer}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          tenantId={tenant?.id?.toString() ?? ""}
          teamId={session?.training?.teamId ?? 0}
        />
      )}

      <BackConfirmationDialog
        isOpen={showBackConfirmation}
        onOpenChange={setShowBackConfirmation}
        onConfirm={handleConfirmedBack}
      />
    </div>
  );
}
