"use client";

import { useParams } from "next/navigation";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useAttendanceSessionById } from "@/entities/attendance/Attendance.query";
import { usePlayersByTeamId } from "@/entities/team/Team.query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddPinPage() {
  const params = useParams();
  const { data: tenant } = useTenantByDomain(params.domain as string);

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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (playersError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-full">
        <h1 className="text-xl font-semibold text-destructive">
          Error Loading Players
        </h1>
        <p className="text-muted-foreground text-lg">Please try again later</p>
      </div>
    );
  }

  const playersWithoutPin =
    playersConnections?.filter((conn) => !conn.player.pin) ?? [];

  return (
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
              className="w-full h-16 text-lg border rounded-2xl hover:bg-accent/10 active:bg-accent/30 transition-colors duration-200"
              onClick={() => {
                // TODO: Implement PIN creation flow
              }}
            >
              {connection.player.firstName} {connection.player.lastName}
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
