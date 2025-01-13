"use client";

import { useParams, useRouter } from "next/navigation";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import {
  useAttendanceSessionById,
  useAttendanceRecords,
} from "@/entities/attendance/Attendance.query";
import { usePlayersByTeamId } from "@/entities/team/Team.query";
import { Loader2, ArrowLeft, X, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { cn } from "@/libs/tailwind/utils";
import {
  usePlayers,
  useUpdatePlayerPin,
} from "@/entities/player/Player.actions.client";
import { useCreateAttendanceRecord } from "@/entities/attendance/Attendance.actions.client";

import { toast } from "sonner";

function NumericKeypad({
  onKeyPress,
  onDelete,
  onSubmit,
  pin,
  isPinValid,
  isCreatingPin,
}: {
  onKeyPress: (num: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  pin: string;
  isPinValid: boolean;
  isCreatingPin: boolean;
}) {
  const [showPin, setShowPin] = useState(false);
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
    <div className="space-y-12">
      {/* PIN Display */}
      <div className="flex flex-col items-center gap-4 min-h-[80px]">
        <div className="flex flex-col items-center gap-2">
          {isCreatingPin && (
            <p className="text-muted-foreground text-sm mb-2">
              Create your PIN
            </p>
          )}
          <div className="flex justify-center gap-4">
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
        </div>
        <div className="h-8 flex items-center">
          {pin.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-sm hover:bg-accent/50"
              onClick={() => setShowPin(!showPin)}
            >
              {showPin ? "Hide PIN" : "Show PIN"}
            </Button>
          )}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-6 px-4">
        {numbers.map((num) => {
          if (num === "submit") {
            return (
              <Button
                key={num}
                variant="default"
                disabled={!isPinValid || pin.length !== 4}
                className="col-span-3 h-14 text-xl font-medium rounded-full bg-primary hover:bg-primary/90 active:bg-primary/70 transition-all duration-200"
                onClick={() => handleKeyPress(num)}
              >
                {isCreatingPin ? "Set PIN" : "Check In"}
              </Button>
            );
          }

          return (
            <Button
              key={num}
              variant="outline"
              className={cn(
                "w-20 h-20 text-3xl font-medium rounded-full flex items-center justify-center hover:bg-accent/10 active:bg-accent/30 transition-all duration-200",
                num === "delete" && "text-muted-foreground"
              )}
              onClick={() => handleKeyPress(num)}
            >
              {num === "delete" ? <Delete className="h-8 w-8" /> : num}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default function AttendanceSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: tenant } = useTenantByDomain(params.domain as string);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [isPinValid, setIsPinValid] = useState(true);

  const { data: session, isLoading: isSessionLoading } =
    useAttendanceSessionById(params.id as string, tenant?.id?.toString() ?? "");

  const { data: existingPlayers } = usePlayers(tenant?.id?.toString() ?? "");
  const updatePlayerPin = useUpdatePlayerPin(tenant?.id?.toString() ?? "");
  const createAttendanceRecord = useCreateAttendanceRecord(
    Number(params.id),
    tenant?.id?.toString() ?? ""
  );

  const { data: attendanceRecords, isLoading: isRecordsLoading } =
    useAttendanceRecords(Number(params.id), tenant?.id?.toString() ?? "");

  const {
    data: playersConnections,
    isLoading: isPlayersLoading,
    error: playersError,
  } = usePlayersByTeamId(
    session?.training?.teamId ?? 0,
    tenant?.id?.toString() ?? ""
  );

  const isLoading = isSessionLoading || isPlayersLoading || isRecordsLoading;

  // Check if player is already checked in
  const isPlayerCheckedIn = (playerId: number) => {
    return (
      attendanceRecords?.some((record) => record.playerId === playerId) ?? false
    );
  };

  // Check if PIN is unique
  const validatePin = (pin: string) => {
    if (pin.length === 4 && isCreatingPin) {
      const isUnique = !existingPlayers?.some((player) => player.pin === pin);
      setIsPinValid(isUnique);
      if (!isUnique) {
        setError("This PIN is already taken");
      } else {
        setError(null);
      }
      return isUnique;
    }
    setIsPinValid(true);
    setError(null);
    return true;
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4 && isCreatingPin) {
        validatePin(newPin);
      } else {
        setError(null);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
    setIsPinValid(true);
  };

  const selectedPlayer = playersConnections?.find(
    (conn) => conn.player.id === selectedPlayerId
  )?.player;

  // Check if selected player has a PIN
  useEffect(() => {
    if (selectedPlayer) {
      setIsCreatingPin(!selectedPlayer.pin);
      setPin("");
      setError(null);
      setIsPinValid(true);
    }
  }, [selectedPlayer]);

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    if (isCreatingPin) {
      if (!isPinValid) {
        setError("This PIN is already taken");
        return;
      }

      try {
        await updatePlayerPin.mutateAsync({
          playerId: selectedPlayerId!,
          pin,
        });
        toast.success("PIN created successfully");
        // Reset the form for check-in
        setIsCreatingPin(false);
        setPin("");
        setError(null);
      } catch (error) {
        console.error("Error setting PIN:", error);
        toast.error("Failed to set PIN");
        setPin("");
      }
      return;
    }

    // Verify PIN
    const selectedPlayer = playersConnections?.find(
      (conn) => conn.player.id === selectedPlayerId
    )?.player;

    if (!selectedPlayer?.pin) {
      setError("Player does not have a PIN set");
      setPin("");
      return;
    }

    if (selectedPlayer.pin !== pin) {
      setError("Incorrect PIN. Please try again.");
      setPin("");
      return;
    }

    try {
      await createAttendanceRecord.mutateAsync({
        playerId: selectedPlayerId!,
      });
      toast.success("Check-in successful");
      setSelectedPlayerId(null);
      setPin("");
      setError(null);
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("Failed to check in");
      setPin("");
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-background absolute top-0 left-0 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (playersError) {
    return (
      <div className="w-screen h-screen bg-background absolute top-0 left-0 flex flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-semibold text-destructive">
          Error Loading Players
        </h1>
        <p className="text-muted-foreground text-lg">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-background absolute top-0 left-0">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 p-2"
        onClick={() => router.push("/o/dashboard/attendance")}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto h-full px-4 py-8 flex flex-col">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center">Check-In</h1>
          <p className="text-muted-foreground text-center mt-2 text-xl">
            {session?.training?.startTime} - {session?.training?.endTime}
          </p>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto space-y-3 px-4">
          {playersConnections?.map((connection) => {
            const isCheckedIn = isPlayerCheckedIn(connection.player.id);
            return (
              <Button
                key={connection.id}
                variant="outline"
                disabled={isCheckedIn}
                className={cn(
                  "w-full py-8 flex items-center justify-between",
                  isCheckedIn
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-accent"
                )}
                onClick={() => {
                  if (!isCheckedIn) {
                    setSelectedPlayerId(connection.player.id);
                    setPin("");
                    setError(null);
                  }
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-xl">
                    {connection.player.firstName} {connection.player.secondName}
                  </span>
                  {isCheckedIn && (
                    <span className="text-sm text-muted-foreground">
                      Checked In
                    </span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Check-in Dialog */}
      <Dialog
        open={!!selectedPlayerId}
        onOpenChange={() => {
          setSelectedPlayerId(null);
          setPin("");
          setError(null);
          setIsCreatingPin(false);
          setIsPinValid(true);
        }}
      >
        <DialogContent className="sm:max-w-[440px] p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl text-center">
              {selectedPlayer
                ? `${selectedPlayer.firstName} ${selectedPlayer.secondName}`
                : "Check-In Player"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <NumericKeypad
              onKeyPress={handleKeyPress}
              onDelete={handleDelete}
              onSubmit={handleSubmit}
              pin={pin}
              isPinValid={isPinValid}
              isCreatingPin={isCreatingPin}
            />
            {error && (
              <p className="text-destructive text-center mt-8 text-base">
                {error}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
