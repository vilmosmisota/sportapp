"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PerformerWithConnection } from "@/entities/member/PerformerConnection.schema";
import { Mail, User, UserPlus } from "lucide-react";

interface ConnectedUsersDialogProps {
  member: PerformerWithConnection;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  displayName: string;
}

export default function ConnectedUsersDialog({
  member,
  isOpen,
  setIsOpen,
  displayName,
}: ConnectedUsersDialogProps) {
  const connectedUser = member.tenantUser?.user;
  const parentConnections = member.parentConnections || [];

  const hasAnyConnections = connectedUser || parentConnections.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Connections - {member.firstName} {member.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Connection */}
          {connectedUser && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                User Account
              </h4>
              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {connectedUser.email}
                    </span>
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    Connected User
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Parent Connections */}
          {parentConnections.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Parents/Guardians
              </h4>
              {parentConnections.map(
                (connection) =>
                  connection.parentMember && (
                    <div
                      key={connection.id}
                      className="flex items-center space-x-3 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <UserPlus className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          {connection.parentMember.firstName}{" "}
                          {connection.parentMember.lastName}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">
                            {connection.relationship || "Parent"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>
          )}

          {/* No Connections */}
          {!hasAnyConnections && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                No Connections
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                This {displayName.slice(0, -1).toLowerCase()} doesn&apos;t have
                any connected users or family members.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
