"use client";

import { queryKeys } from "@/cacheKeys/cacheKeys";
import { KioskLoadingSkeleton } from "@/components/loader-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActiveAttendanceSessionWithRecords } from "@/entities/attendance/ActiveAttendanceSessionWithRecords.query";
import { createAttendanceRecord } from "@/entities/attendance/ActiveAttendanceSessionWithRecords.services";
import {
  AttendanceStatus,
  CheckInType,
} from "@/entities/attendance/AttendanceRecord.schema";
import { usePerformersByGroupId } from "@/entities/group/GroupConnection.query";
import { useUpdatePerformer } from "@/entities/member/Performer.actions.client";
import { usePerformers } from "@/entities/member/Performer.query";
import { Performer } from "@/entities/member/Performer.schema";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { cn } from "@/libs/tailwind/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Delete,
  Key,
  Loader2,
  UserCheck,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

// Import proper types
import { ActiveAttendanceSessionWithRecords } from "@/entities/attendance/ActiveAttendanceSessionWithRecords.schema";
import { AttendanceRecord } from "@/entities/attendance/AttendanceRecord.schema";
import {
  GroupMember,
  MemberGroupConnection,
} from "@/entities/group/GroupConnection.schema";

// Types
type KioskMode = "checkin" | "pinmanagement";

type PinStatus = "idle" | "valid" | "invalid";

interface CheckInConfirmation {
  performer: GroupMember;
  status: AttendanceStatus;
}

// Utility function to calculate attendance status
const calculateAttendanceStatus = (
  sessionStartTime: string,
  checkInTime: string,
  lateThresholdMinutes: number
): AttendanceStatus => {
  const sessionStart = new Date(`1970-01-01T${sessionStartTime}`);
  const checkIn = new Date(`1970-01-01T${checkInTime}`);
  const diffMinutes =
    (checkIn.getTime() - sessionStart.getTime()) / (1000 * 60);

  return diffMinutes <= lateThresholdMinutes
    ? AttendanceStatus.PRESENT
    : AttendanceStatus.LATE;
};

// Large Numeric Keypad Component
function NumericKeypad({
  onKeyPress,
  onDelete,
  onSubmit,
  pin,
  error,
  pinStatus,
  isSubmitDisabled,
  submitText = "Submit",
}: {
  onKeyPress: (num: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  pin: string;
  error: string | null;
  pinStatus: PinStatus;
  isSubmitDisabled: boolean;
  submitText?: string;
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
    <div className="flex flex-col items-center">
      {/* PIN Display */}
      <div className="">
        <div className="flex justify-center gap-4 mb-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={cn(
                "w-6 h-6 rounded-full border-2 relative transition-colors duration-200",
                pin[index]
                  ? "bg-primary border-primary"
                  : "border-muted-foreground"
              )}
            >
              {showPin && pin[index] && (
                <span className="absolute inset-0 flex items-center justify-center text-primary-foreground text-sm">
                  {pin[index]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Show/Hide PIN toggle */}
        <div className="flex justify-center h-6">
          {pin.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:bg-accent/50 px-1 text-sm h-6 -mt-1"
              onClick={() => setShowPin(!showPin)}
            >
              {showPin ? "Hide" : "Show"}
            </Button>
          )}
        </div>

        {/* Status Messages */}
        <div className="flex justify-center mt-1 h-6">
          {error && <p className="text-destructive text-sm">{error}</p>}
          {!error && pin.length === 4 && (
            <div className="flex items-center gap-1">
              {pinStatus === "valid" ? (
                <>
                  <CheckCircle2 className="text-green-500 h-4 w-4" />
                  <p className="text-green-500 text-sm">Unique</p>
                </>
              ) : pinStatus === "invalid" ? (
                <>
                  <AlertCircle className="text-destructive h-4 w-4" />
                  <p className="text-destructive text-sm">In use</p>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Keypad */}
      <div className="w-[400px] p-8 border border-border rounded-2xl">
        <div className="grid grid-cols-3 place-items-center gap-6 mb-6">
          {numbers.slice(0, 9).map((num) => (
            <Button
              key={num}
              variant="outline"
              className="w-20 h-20 text-3xl rounded-full border hover:bg-accent/10 active:bg-accent/30 transition-colors duration-200"
              onClick={() => handleKeyPress(num)}
            >
              {num}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-3 place-items-center gap-6 mb-6">
          <Button
            variant="outline"
            className="w-20 h-20 rounded-full border hover:bg-accent/10 active:bg-accent/30 transition-colors duration-200"
            onClick={() => handleKeyPress("delete")}
          >
            <Delete className="h-8 w-8" />
          </Button>
          <Button
            variant="outline"
            className="w-20 h-20 text-3xl rounded-full border hover:bg-accent/10 active:bg-accent/30 transition-colors duration-200"
            onClick={() => handleKeyPress("0")}
          >
            0
          </Button>
          <div className="w-20 h-20" /> {/* Spacer */}
        </div>
        <Button
          variant="default"
          disabled={isSubmitDisabled}
          className="w-full h-16 text-xl rounded-full bg-primary hover:bg-primary/90 transition-colors duration-200"
          onClick={() => handleKeyPress("submit")}
        >
          {submitText}
        </Button>
      </div>
    </div>
  );
}

// Check-in Mode Component - iPad Optimized Layout
function CheckInMode({
  session,
  tenantId,
  sessionId,
  performers,
  existingRecords,
}: {
  session: ActiveAttendanceSessionWithRecords;
  tenantId: string;
  sessionId: number;
  performers: MemberGroupConnection[];
  existingRecords: AttendanceRecord[];
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [checkInConfirmation, setCheckInConfirmation] =
    useState<CheckInConfirmation | null>(null);
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);

  const { data: tenant } = useTenantByDomain(useParams().domain as string);
  const client = useSupabase();
  const queryClient = useQueryClient();

  // Check if performer is already checked in
  const isPerformerCheckedIn = useCallback(
    (performerId: number) => {
      return existingRecords.some((record) => record.memberId === performerId);
    },
    [existingRecords]
  );

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
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    // Find performer by PIN
    const performer = performers.find(
      (p) => p.member.pin === parseInt(pin, 10)
    );

    if (!performer) {
      setError("Invalid PIN");
      setPin("");
      return;
    }

    // Check if already checked in
    if (isPerformerCheckedIn(performer.member.id)) {
      toast.info(
        `${performer.member.firstName} ${performer.member.lastName} is already checked in`
      );
      setPin("");
      return;
    }

    // Calculate status
    const now = new Date();
    const checkInTime = now.toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const status = calculateAttendanceStatus(
      session.session.startTime,
      checkInTime,
      tenant?.tenantConfigs?.development?.lateThreshold || 15
    );

    setCheckInConfirmation({
      performer: performer.member,
      status,
    });
    setShowConfirmation(true);
  };

  const handleConfirmCheckIn = async () => {
    if (!checkInConfirmation) return;

    try {
      setIsCreatingRecord(true);

      await createAttendanceRecord(client, {
        activeAttendanceSessionId: sessionId,
        performerId: checkInConfirmation.performer.id,
        status: checkInConfirmation.status,
        checkInType: CheckInType.SELF,
        tenantId,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.sessionWithRecords(
          tenantId,
          sessionId.toString()
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.records(tenantId, sessionId.toString()),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions(tenantId),
      });

      toast.success(
        `${checkInConfirmation.performer.firstName} ${checkInConfirmation.performer.lastName} checked in successfully!`
      );

      setShowConfirmation(false);
      setPin("");
      setCheckInConfirmation(null);
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("Failed to check in. Please try again.");
      setShowConfirmation(false);
      setPin("");
      setCheckInConfirmation(null);
    } finally {
      setIsCreatingRecord(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Session Info */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-2">Check-In</h2>
        <div className="flex items-center justify-center gap-4 text-sm mb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">
              {new Date(session.session.date).toLocaleDateString("en-GB")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">
              {session.session.startTime} - {session.session.endTime}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Enter your 4-digit PIN</p>
      </div>

      {/* Centered Keypad - Full Height */}
      <div className="flex-1 flex items-center justify-center">
        <NumericKeypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          pin={pin}
          error={error}
          pinStatus="idle"
          isSubmitDisabled={pin.length !== 4}
          submitText="Check In"
        />
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl w-[95vw] p-8">
          <DialogHeader className="mb-12">
            <DialogTitle className="text-2xl font-normal text-center">
              Check-in Confirmation
            </DialogTitle>
          </DialogHeader>

          {checkInConfirmation && (
            <div className="space-y-12">
              <p className="text-4xl font-bold text-center">
                {checkInConfirmation.performer.firstName}{" "}
                {checkInConfirmation.performer.lastName}
              </p>

              <div className="text-center">
                <Badge
                  variant={
                    checkInConfirmation.status === AttendanceStatus.PRESENT
                      ? "default"
                      : "destructive"
                  }
                  className="text-xl px-4 py-2"
                >
                  {checkInConfirmation.status === AttendanceStatus.PRESENT
                    ? "On Time"
                    : "Late"}
                </Badge>
              </div>

              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-xl text-muted-foreground mb-2">
                    Session Time
                  </p>
                  <p className="text-4xl">
                    {session.session.startTime} - {session.session.endTime}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xl text-muted-foreground mb-2">Date</p>
                  <p className="text-4xl">
                    {new Date(session.session.date).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false);
                    setPin("");
                    setCheckInConfirmation(null);
                  }}
                  className="flex-1 text-xl py-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmCheckIn}
                  disabled={isCreatingRecord}
                  className="flex-1 text-xl py-6 bg-primary"
                >
                  {isCreatingRecord ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Confirm Check-in"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// PIN Management Mode Component - iPad Optimized
function PinManagementMode({
  tenantId,
  performers,
  allPerformers,
  session,
}: {
  tenantId: string;
  performers: MemberGroupConnection[];
  allPerformers: Performer[];
  session: ActiveAttendanceSessionWithRecords;
}) {
  const [selectedPerformer, setSelectedPerformer] =
    useState<GroupMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pinStatus, setPinStatus] = useState<PinStatus>("idle");

  const updatePerformer = useUpdatePerformer(tenantId);
  const queryClient = useQueryClient();

  // Get performers without PINs from the session group
  const performersWithoutPin = useMemo(() => {
    return performers.filter((p) => !p.member.pin);
  }, [performers]);

  const validatePinUniqueness = useCallback(
    (pinValue: string) => {
      if (pinValue.length === 4) {
        const isPinUnique = !allPerformers?.some(
          (p) => p.pin === parseInt(pinValue, 10)
        );
        setPinStatus(isPinUnique ? "valid" : "invalid");
        return isPinUnique;
      }
      setPinStatus("idle");
      return true;
    },
    [allPerformers]
  );

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(null);
      if (newPin.length === 4) {
        validatePinUniqueness(newPin);
      } else {
        setPinStatus("idle");
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
    setPinStatus("idle");
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    const isPinUnique = validatePinUniqueness(pin);
    if (!isPinUnique) {
      setError("This PIN is already in use");
      return;
    }

    if (!selectedPerformer) return;

    try {
      await updatePerformer.mutateAsync({
        performerId: selectedPerformer.id,
        options: {
          memberData: { pin: parseInt(pin, 10) },
        },
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byGroup(tenantId, session?.session?.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.group.connections(
          tenantId,
          session?.session?.groupId?.toString()
        ),
      });

      toast.success("Successfully created PIN!");
      setIsDialogOpen(false);
      setPin("");
      setPinStatus("idle");
      setSelectedPerformer(null);
    } catch (error) {
      toast.error("Failed to create PIN");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPin("");
      setError(null);
      setPinStatus("idle");
    }
    setIsDialogOpen(open);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-1">Create PIN</h2>
        <p className="text-sm text-muted-foreground">
          Select a member to create their PIN
        </p>
      </div>

      {/* Member List */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md space-y-2">
          {performersWithoutPin.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                All members have PINs set
              </p>
            </div>
          ) : (
            performersWithoutPin.map((connection) => (
              <Button
                key={connection.id}
                variant="outline"
                disabled={
                  isDialogOpen && selectedPerformer?.id === connection.member.id
                }
                className="w-full h-12 text-sm border rounded-xl hover:bg-accent/10 active:bg-accent/30 transition-colors duration-200"
                onClick={() => {
                  setSelectedPerformer(connection.member);
                  setIsDialogOpen(true);
                }}
              >
                {connection.member.firstName} {connection.member.lastName}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* Create PIN Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl w-[95vw] p-8">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-normal text-center">
              Create PIN for {selectedPerformer?.firstName}{" "}
              {selectedPerformer?.lastName}
            </DialogTitle>
          </DialogHeader>

          <NumericKeypad
            onKeyPress={handleKeyPress}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            pin={pin}
            error={error}
            pinStatus={pinStatus}
            isSubmitDisabled={
              pin.length !== 4 ||
              pinStatus === "invalid" ||
              updatePerformer.isPending
            }
            submitText={
              updatePerformer.isPending ? "Creating..." : "Create PIN"
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main KioskPage Component
export default function KioskPage() {
  const params = useParams();
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<KioskMode>("checkin");
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);

  const { data: tenant } = useTenantByDomain(params.domain as string);
  const tenantId = tenant?.id?.toString() ?? "";
  const sessionId = parseInt(params.id as string, 10);

  // Fetch session data
  const { data: session, isLoading: isSessionLoading } =
    useActiveAttendanceSessionWithRecords(sessionId, tenantId);

  // Fetch group performers
  const { data: performers, isLoading: isPerformersLoading } =
    usePerformersByGroupId(
      tenantId,
      session?.session?.groupId || 0,
      !!session?.session?.groupId
    );

  // Fetch all performers for PIN validation
  const { data: allPerformers } = usePerformers(tenantId);

  // Include tenant loading in overall loading state
  const isLoading =
    isSessionLoading || isPerformersLoading || !tenant || !tenantId;
  const existingRecords = session?.records || [];

  const handleBackNavigation = () => {
    setShowBackConfirmation(true);
  };

  const handleConfirmedBack = () => {
    router.push(`/attendance/live-sessions`);
  };

  // Show loading skeleton while any data is loading or tenant is not ready
  if (isLoading) {
    return <KioskLoadingSkeleton />;
  }

  // Only show "Session Not Found" if we have tenant and we're not loading and session is actually null
  if (tenant && tenantId && !isSessionLoading && !session) {
    return (
      <div className="w-screen h-screen bg-background fixed top-0 left-0 flex flex-col z-50">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="text-xl font-semibold text-destructive">
            Session Not Found
          </h1>
          <p className="text-muted-foreground text-lg">
            Please check the session ID and try again
          </p>
        </div>
      </div>
    );
  }

  // If we somehow get here without a session, show loading
  if (!session) {
    return <KioskLoadingSkeleton />;
  }

  return (
    <div className="w-screen h-screen bg-background fixed top-0 left-0 flex flex-col z-50">
      {/* Navigation */}
      <div className="flex justify-between items-center border-b border-border px-4 h-12 shrink-0">
        <Button variant="ghost" className="p-2" onClick={handleBackNavigation}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Mode Buttons in Navigation */}
        <div className="flex gap-2">
          <Button
            variant={currentMode === "checkin" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2 text-xs px-3 h-8"
            onClick={() => setCurrentMode("checkin")}
          >
            <UserCheck className="h-3 w-3" />
            Check-In
          </Button>
          <Button
            variant={currentMode === "pinmanagement" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2 text-xs px-3 h-8"
            onClick={() => setCurrentMode("pinmanagement")}
          >
            <Key className="h-3 w-3" />
            Manage PINs
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="max-w-6xl mx-auto h-full">
          {/* Tab Content */}
          {currentMode === "checkin" && (
            <CheckInMode
              session={session}
              tenantId={tenantId}
              sessionId={sessionId}
              performers={performers || []}
              existingRecords={existingRecords}
            />
          )}

          {currentMode === "pinmanagement" && (
            <PinManagementMode
              tenantId={tenantId}
              performers={performers || []}
              allPerformers={allPerformers || []}
              session={session}
            />
          )}
        </div>
      </div>

      {/* Back Confirmation Dialog */}
      <Dialog
        open={showBackConfirmation}
        onOpenChange={setShowBackConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Kiosk?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mb-6">
            Are you sure you want to exit the kiosk? Any unsaved changes will be
            lost.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowBackConfirmation(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmedBack}>Exit Kiosk</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
