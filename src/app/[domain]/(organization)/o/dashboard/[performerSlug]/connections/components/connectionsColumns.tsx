"use client";

import { Badge } from "@/components/ui/badge";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PermissionDropdownMenu } from "@/composites/auth/PermissionDropdownMenu";
import { PerformerWithConnection } from "@/entities/member/PerformerConnection.schema";
import { Permission } from "@/entities/role/Role.permissions";
import { ColumnDef } from "@tanstack/react-table";
import { Info, Settings } from "lucide-react";
import { isEligibleForUserAccount } from "../../../../../../../../entities/member/Member.utils";

const ParentsCell = ({ performer }: { performer: PerformerWithConnection }) => {
  if (!performer.parentConnections?.length) {
    return "-";
  }

  const parents = performer.parentConnections
    .map((c) => c.parentMember)
    .filter((parent) => parent !== null);

  if (!parents.length) {
    return "-";
  }

  return (
    <div className="flex flex-wrap gap-1">
      {parents.map((parent, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {parent.firstName} {parent.lastName}
        </Badge>
      ))}
    </div>
  );
};

const UserAccountCell = ({
  performer,
}: {
  performer: PerformerWithConnection;
}) => {
  const user = performer.user;

  if (!user?.email) {
    if (!isEligibleForUserAccount(performer.dateOfBirth || "")) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">-</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Must be at least 13 years old to have a user account</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <span className="text-sm">{user.email}</span>
      </div>
      {!isEligibleForUserAccount(performer.dateOfBirth || "") && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-amber-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Under 13 years old - account managed by parent/guardian</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

interface ConnectionsTableColumnsProps {
  domain: string;
  displayName: string;
  tenantId: string;
  onManageConnections: (performer: PerformerWithConnection) => void;
}

interface ConnectionsTableActionsProps {
  performer: PerformerWithConnection;
  domain: string;
  displayName: string;
  tenantId: string;
  onManageConnections: (performer: PerformerWithConnection) => void;
}

const ConnectionsTableActions = ({
  performer,
  domain,
  displayName,
  tenantId,
  onManageConnections,
}: ConnectionsTableActionsProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <PermissionDropdownMenu
        actions={[
          {
            label: "Manage Connections",
            onClick: () => onManageConnections(performer),
            icon: <Settings className="h-4 w-4" />,
            permission: Permission.MANAGE_MEMBERS,
          },
        ]}
      />
    </div>
  );
};

export const connectionsColumns = ({
  domain,
  displayName,
  tenantId,
  onManageConnections,
}: ConnectionsTableColumnsProps): ColumnDef<PerformerWithConnection>[] => [
  {
    id: "actions",
    cell: ({ row }) => (
      <ConnectionsTableActions
        performer={row.original}
        domain={domain}
        displayName={displayName}
        tenantId={tenantId}
        onManageConnections={onManageConnections}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium">
            {firstName} {lastName}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
    minSize: 150,
    size: 200,
    maxSize: 300,
    filterFn: (row, id, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const firstName = (row.original.firstName || "").toLowerCase();
      const lastName = (row.original.lastName || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.toLowerCase();

      return (
        fullName.includes(searchValue) ||
        firstName.includes(searchValue) ||
        lastName.includes(searchValue)
      );
    },
  },
  {
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Account" />
    ),
    cell: ({ row }) => <UserAccountCell performer={row.original} />,
    enableSorting: false,
    filterFn: (row, id, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const email = (row.original.user?.email || "").toLowerCase();
      return email.includes(searchValue);
    },
  },
  {
    accessorKey: "parents",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Parents/Guardians" />
    ),
    cell: ({ row }) => <ParentsCell performer={row.original} />,
    enableSorting: false,
    filterFn: (row, id, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const parents = row.original.parentConnections
        ?.map((c) => c.parentMember)
        .filter((parent) => parent !== null);

      if (!parents?.length) return false;

      return parents.some((parent) => {
        const firstName = (parent.firstName || "").toLowerCase();
        const lastName = (parent.lastName || "").toLowerCase();
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const userId = (parent.userId || "").toLowerCase();
        return (
          fullName.includes(searchValue) ||
          firstName.includes(searchValue) ||
          lastName.includes(searchValue) ||
          userId.includes(searchValue)
        );
      });
    },
  },
];
