import { Player } from "@/entities/player/Player.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ConnectedUsersDialogProps {
  player: Player | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ConnectedUsersDialog({
  player,
  isOpen,
  setIsOpen,
}: ConnectedUsersDialogProps) {
  if (!player) return null;

  const connectedUsers = player.userConnections || [];

  const getRoleLabel = (connection: any) => {
    if (connection.isParent) return "Parent/Guardian";
    if (connection.isOwner) return "Player Account";
    return "No role";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connected Users</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Player</h3>
            <p className="text-sm text-muted-foreground">
              {player.firstName} {player.lastName}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            {connectedUsers.length > 0 ? (
              connectedUsers.map((connection) => (
                <div key={connection.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {connection.user?.firstName} {connection.user?.lastName}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getRoleLabel(connection)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {connection.user?.email}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No connected users
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
