import { Card, CardContent } from "../../../../components/ui/card";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Users, UsersRound } from "lucide-react";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { usePlayers } from "@/entities/player/Player.actions.client";

interface TeamPlayerStatsBlockProps {
  tenantId: string;
  isLoading?: boolean;
}

export function TeamPlayerStatsBlock({
  tenantId,
  isLoading: isTenantLoading = false,
}: TeamPlayerStatsBlockProps) {
  const { data: teams, isLoading: isTeamsLoading } =
    useGetTeamsByTenantId(tenantId);
  const { data: players, isLoading: isPlayersLoading } = usePlayers(tenantId);

  const isLoading = isTenantLoading || isTeamsLoading || isPlayersLoading;

  if (isLoading) {
    return <TeamPlayerStatsSkeleton />;
  }

  const teamsCount = teams?.length || 0;
  const playersCount = players?.length || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <StatCard
        icon={<UsersRound className="h-5 w-5 text-blue-500" />}
        label="Total Teams"
        value={teamsCount}
      />
      <StatCard
        icon={<Users className="h-5 w-5 text-green-500" />}
        label="Total Players"
        value={playersCount}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamPlayerStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
