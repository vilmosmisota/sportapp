"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { GroupBadge } from "@/components/ui/group-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Group } from "@/entities/group/Group.schema";
import { getAgeFromDateOfBirth } from "@/entities/member/Member.utils";
import {
  MemberGroupConnection,
  Performer,
  PerformerForm,
} from "@/entities/member/Performer.schema";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Plus, UserMinus, Users, X } from "lucide-react";
import { useMemo } from "react";
import {
  Control,
  FieldErrors,
  useFormContext,
  useWatch,
} from "react-hook-form";

interface EditGroupAssignmentTabProps {
  control: Control<PerformerForm>;
  groups: Group[];
  isGroupsLoading: boolean;
  tenant: Tenant;
  singularDisplayName: string;
  errors: FieldErrors<PerformerForm>;
  member: Performer;
}

interface GroupTableProps {
  groups: Group[];
  selectedGroupIds: number[];
  onToggleGroup: (groupId: number) => void;
  onRemoveGroup?: (groupId: number) => void;
  title: string;
  emptyMessage: string;
  variant?: "existing" | "available";
  tenantGroupsConfig?: any;
}

const GroupTable = ({
  groups,
  selectedGroupIds,
  onToggleGroup,
  onRemoveGroup,
  title,
  emptyMessage,
  variant = "available",
  tenantGroupsConfig,
}: GroupTableProps) => {
  const isExisting = variant === "existing";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          {isExisting ? (
            <UserMinus className="h-4 w-4 text-blue-600" />
          ) : (
            <Users className="h-4 w-4" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {!isExisting && <TableHead className="w-12"></TableHead>}
                <TableHead>Group</TableHead>
                <TableHead>Age Range</TableHead>
                <TableHead>Gender</TableHead>
                {isExisting && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  {!isExisting && (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleGroup(group.id)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-600 hover:bg-green-600/10"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                  <TableCell>
                    <GroupBadge
                      group={group}
                      tenantGroupsConfig={tenantGroupsConfig}
                      size="sm"
                      variant="outline"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {group.ageRange}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {group.gender}
                    </Badge>
                  </TableCell>
                  {isExisting && (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveGroup?.(group.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {groups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Helper function to get recommended groups for a member
const getRecommendedGroupsForMember = (
  groups: Group[],
  memberData: { dateOfBirth?: string; gender?: string }
): { recommended: Group[]; others: Group[] } => {
  const recommended: Group[] = [];
  const others: Group[] = [];

  const memberAge = memberData.dateOfBirth
    ? getAgeFromDateOfBirth(memberData.dateOfBirth)
    : null;

  groups.forEach((group) => {
    let isRecommended = false;

    if (memberAge !== null) {
      // Parse age range (e.g., "8-12")
      const [minAge, maxAge] = group.ageRange.split("-").map(Number);
      if (!isNaN(minAge) && !isNaN(maxAge)) {
        const ageMatches = memberAge >= minAge && memberAge <= maxAge;

        // Check gender compatibility
        const genderMatches =
          group.gender.toLowerCase() === "mixed" ||
          group.gender.toLowerCase() === memberData.gender?.toLowerCase();

        isRecommended = ageMatches && genderMatches;
      }
    }

    if (isRecommended) {
      recommended.push(group);
    } else {
      others.push(group);
    }
  });

  return { recommended, others };
};

export default function EditGroupAssignmentTab({
  control,
  groups,
  isGroupsLoading,
  tenant,
  singularDisplayName,
  errors,
  member,
}: EditGroupAssignmentTabProps) {
  const { setValue } = useFormContext<PerformerForm>();

  // Watch form values for real-time updates
  const dateOfBirth = useWatch({ control, name: "dateOfBirth" });
  const gender = useWatch({ control, name: "gender" });
  const groupConnections =
    useWatch({ control, name: "groupConnections" }) || [];

  const tenantGroupsConfig = tenant?.tenantConfigs?.groups;

  // Get selected group IDs
  const selectedGroupIds = useMemo(
    () => groupConnections.map((conn) => conn.groupId),
    [groupConnections]
  );

  // Get selected groups
  const selectedGroups = useMemo(
    () => groups.filter((group) => selectedGroupIds.includes(group.id)),
    [groups, selectedGroupIds]
  );

  // Get recommended and other groups, excluding selected ones
  const { recommendedGroups, otherGroups } = useMemo(() => {
    const availableGroups = groups.filter(
      (group) => !selectedGroupIds.includes(group.id)
    );

    const { recommended, others } = getRecommendedGroupsForMember(
      availableGroups,
      { dateOfBirth, gender }
    );

    return {
      recommendedGroups: recommended,
      otherGroups: others,
    };
  }, [groups, selectedGroupIds, dateOfBirth, gender]);

  const toggleGroup = (groupId: number) => {
    const currentConnections = groupConnections || [];
    const isSelected = selectedGroupIds.includes(groupId);

    let newConnections: MemberGroupConnection[];

    if (isSelected) {
      // Remove the group
      newConnections = currentConnections.filter(
        (conn) => conn.groupId !== groupId
      );
    } else {
      // Add the group
      const newConnection: MemberGroupConnection = {
        id: Date.now(), // Temporary ID for form
        createdAt: new Date().toISOString(),
        groupId,
        memberId: member.id,
        tenantId: Number(tenant?.id || 0),
        group: groups.find((g) => g.id === groupId) || null,
      };
      newConnections = [...currentConnections, newConnection];
    }

    // Update the form field
    setValue("groupConnections", newConnections, { shouldDirty: true });
  };

  const removeGroup = (groupId: number) => {
    toggleGroup(groupId);
  };

  if (isGroupsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading groups...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!groups.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Group Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No Groups Available
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              No groups have been created yet. Create groups first to assign{" "}
              {singularDisplayName.toLowerCase()}s.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormField
      control={control}
      name="groupConnections"
      render={({ field }) => (
        <FormItem>
          <div className="space-y-6">
            {/* Selected Groups */}
            {selectedGroups.length > 0 && (
              <GroupTable
                groups={selectedGroups}
                selectedGroupIds={selectedGroupIds}
                onToggleGroup={toggleGroup}
                onRemoveGroup={removeGroup}
                title="Current Groups"
                emptyMessage="No groups selected"
                variant="existing"
                tenantGroupsConfig={tenantGroupsConfig}
              />
            )}

            {/* Recommended Groups */}
            <GroupTable
              groups={recommendedGroups}
              selectedGroupIds={selectedGroupIds}
              onToggleGroup={toggleGroup}
              title="Recommended Groups"
              emptyMessage="No recommended groups found"
              tenantGroupsConfig={tenantGroupsConfig}
            />

            {/* Other Available Groups */}
            <GroupTable
              groups={otherGroups}
              selectedGroupIds={selectedGroupIds}
              onToggleGroup={toggleGroup}
              title="Other Available Groups"
              emptyMessage="No other groups available"
              tenantGroupsConfig={tenantGroupsConfig}
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
