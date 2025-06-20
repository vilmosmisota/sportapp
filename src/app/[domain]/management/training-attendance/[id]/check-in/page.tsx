"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlayersByTeamId } from "@/entities/group/Group.query";
import { Player } from "@/entities/member/Member.schema";
import { usePlayers } from "@/entities/member/Player.actions.client";
import { useCreateAttendanceRecord } from "@/entities/old-attendance/Attendance.actions.client";
import {
  useAttendanceRecords,
  useAttendanceSessionById,
} from "@/entities/old-attendance/Attendance.query";
import { calculateAttendanceStatus } from "@/entities/old-attendance/Attendance.services";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { cn } from "@/libs/tailwind/utils";
import { ArrowLeft, Delete, Key, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { BackConfirmationDialog } from "../../components/BackConfirmationDialog";

function NumericKeypad({
  onKeyPress,
  onDelete,
  onSubmit,
  pin,
  isPinValid,
  isCreatingPin,
  error,
  sessionTime,
}: {
  onKeyPress: (num: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  pin: string;
  isPinValid: boolean;
  isCreatingPin: boolean;
  error: string | null;
  sessionTime: string;
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
    <div className="flex flex-col items-center max-w-md mx-auto py-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-1">Check-In</h1>
        <p className="text-xl text-muted-foreground">{sessionTime}</p>
      </div>

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
        <div className="h-4 flex justify-center">
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
            Check In
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const { data: tenant } = useTenantByDomain(params.domain as string);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPinValid, setIsPinValid] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [matchedPlayer, setMatchedPlayer] = useState<Player | null>(null);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);

  const { data: session, isLoading: isSessionLoading } =
    useAttendanceSessionById(params.id as string, tenant?.id?.toString() ?? "");

  const { data: existingPlayers } = usePlayers(tenant?.id?.toString() ?? "");
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

    // Find player by PIN
    const player = existingPlayers?.find((p) => p.pin === pin);

    if (!player) {
      setError("Invalid PIN");
      setPin("");
      return;
    }

    // Check if player belongs to the team
    const playerConnection = playersConnections?.find(
      (conn) => conn.player.id === player.id
    );

    if (!playerConnection) {
      setError("You are not part of this team's session");
      setPin("");
      return;
    }

    // Check if already checked in
    if (isPlayerCheckedIn(player.id)) {
      toast.info(
        `${player.firstName} ${player.lastName} is already checked in for this session`
      );
      setPin("");
      return;
    }

    setMatchedPlayer(player);
    setShowConfirmation(true);
  };

  const handleConfirmCheckIn = async () => {
    if (
      !matchedPlayer ||
      !session?.training?.startTime ||
      !tenant?.lateThresholdMinutes
    )
      return;

    try {
      const now = new Date();
      const checkInTime = now.toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const status = calculateAttendanceStatus(
        session.training.startTime,
        checkInTime,
        tenant.lateThresholdMinutes
      );

      const result = await createAttendanceRecord.mutateAsync({
        playerId: matchedPlayer.id,
        status,
      });

      toast.success(
        `${matchedPlayer.firstName} ${matchedPlayer.lastName} checked in successfully!`
      );
      setShowConfirmation(false);
      setPin("");
      setMatchedPlayer(null);
    } catch (error) {
      console.error("Check-in error:", error);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.name === "DuplicateCheckInError") {
          toast.info(
            `${matchedPlayer.firstName} ${matchedPlayer.lastName} is already checked in for this session`
          );
        } else {
          toast.error(`Check-in failed: ${error.message}`);
        }
      } else {
        toast.error("Failed to check in. Please try again.");
      }

      setShowConfirmation(false);
      setPin("");
      setMatchedPlayer(null);
    }
  };

  const handleBackNavigation = () => {
    setShowBackConfirmation(true);
  };

  const handleConfirmedBack = () => {
    router.push(`/o/dashboard/training-attendance/${params.id}`);
  };

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

  return (
    <div className="w-screen h-screen bg-background fixed top-0 left-0 flex flex-col z-50 ">
      {/* Navigation */}
      <div className="flex justify-between items-center border-b border-border px-4 h-14 shrink-0">
        <Button variant="ghost" className="p-2" onClick={handleBackNavigation}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() =>
            router.push(`/o/dashboard/training-attendance/${params.id}/add-pin`)
          }
        >
          <Key className="h-4 w-4" />
          Create PIN
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <NumericKeypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          pin={pin}
          isPinValid={isPinValid}
          isCreatingPin={false}
          error={error}
          sessionTime={`${session?.training?.startTime} - ${session?.training?.endTime}`}
        />

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-xl md:max-w-2xl w-[95vw] p-8">
            <DialogHeader className="mb-12">
              <DialogTitle className="text-2xl font-normal text-center">
                Check-in Confirmation
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-12">
              <p className="text-4xl font-bold text-center">
                {matchedPlayer
                  ? `${matchedPlayer.firstName} ${matchedPlayer.lastName}`
                  : ""}
              </p>

              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-xl text-muted-foreground mb-2">
                    Session Time
                  </p>
                  <p className="text-4xl">
                    {session?.training?.startTime} -{" "}
                    {session?.training?.endTime}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xl text-muted-foreground mb-2">Date</p>
                  <p className="text-4xl">
                    {new Date(session?.training?.date ?? "").toLocaleDateString(
                      "en-GB"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-12">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false);
                  setPin("");
                  setMatchedPlayer(null);
                }}
                className="flex-1 text-xl py-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCheckIn}
                className="flex-1 text-xl py-6 bg-primary"
              >
                Confirm Check-in
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <BackConfirmationDialog
        isOpen={showBackConfirmation}
        onOpenChange={setShowBackConfirmation}
        onConfirm={handleConfirmedBack}
      />
    </div>
  );
}
