"use client";

import { MarsIcon, VenusIcon } from "@/components/icons/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionButton } from "@/composites/auth/PermissionButton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { formatAgeRange, formatGender } from "@/entities/group/Group.utils";
import { useGroupConnections } from "@/entities/group/GroupConnection.query";
import { MemberType } from "@/entities/member/Member.schema";
import { getTenantPerformerName } from "@/entities/member/Member.utils";
import { Permission } from "@/entities/role/Role.permissions";
import { differenceInYears } from "date-fns";
import {
  Calendar,
  Shield,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ManageMembersForm from "./components/forms/ManageMembersForm";

interface GroupPageProps {
  params: {
    domain: string;
    id: string;
  };
}

function GroupDetailsSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberCard({
  connection,
  memberType,
}: {
  connection: any;
  memberType: MemberType;
}) {
  const { member } = connection;
  const age = member.dateOfBirth
    ? differenceInYears(new Date(), new Date(member.dateOfBirth))
    : null;

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "M";
  };

  const getMemberTypeIcon = (type: MemberType) => {
    switch (type) {
      case MemberType.Manager:
        return <Shield className="h-4 w-4" />;
      case MemberType.Guardian:
        return <UserCheck className="h-4 w-4" />;
      case MemberType.Performer:
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getMemberTypeColor = (type: MemberType) => {
    switch (type) {
      case MemberType.Manager:
        return "bg-purple-50 text-purple-700 border-purple-200";
      case MemberType.Guardian:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case MemberType.Performer:
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
              {getInitials(member.firstName, member.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-foreground truncate">
                  {member.firstName && member.lastName
                    ? `${member.firstName} ${member.lastName}`
                    : member.firstName || member.lastName || "Unnamed Member"}
                </h4>

                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getMemberTypeColor(memberType)}`}
                  >
                    <span className="mr-1">
                      {getMemberTypeIcon(memberType)}
                    </span>
                    {memberType}
                  </Badge>

                  {connection.isPrimary && (
                    <Badge variant="secondary" className="text-xs">
                      Primary
                    </Badge>
                  )}

                  {connection.isInstructor && (
                    <Badge variant="default" className="text-xs">
                      Instructor
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {age && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{age} years old</span>
                </div>
              )}

              {member.gender && (
                <div className="flex items-center gap-1">
                  {member.gender.toLowerCase() === "male" ? (
                    <MarsIcon className="h-3 w-3 text-blue-500" />
                  ) : member.gender.toLowerCase() === "female" ? (
                    <VenusIcon className="h-3 w-3 text-pink-500" />
                  ) : null}
                  <span className="capitalize">{member.gender}</span>
                </div>
              )}

              {member.pin && (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                    PIN: {member.pin}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PlayerListItem({ connection }: { connection: any }) {
  const { member } = connection;
  const age = member.dateOfBirth
    ? differenceInYears(new Date(), new Date(member.dateOfBirth))
    : null;

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "P";
  };

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
          {getInitials(member.firstName, member.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">
            {member.firstName && member.lastName
              ? `${member.firstName} ${member.lastName}`
              : member.firstName || member.lastName || "Unnamed Player"}
          </p>
          <div className="flex items-center gap-1">
            {connection.isPrimary && (
              <Badge variant="secondary" className="text-xs">
                Primary
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          {age && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{age} years old</span>
            </div>
          )}
          {member.gender && (
            <div className="flex items-center gap-1">
              {member.gender.toLowerCase() === "male" ? (
                <MarsIcon className="h-3 w-3 text-blue-500" />
              ) : member.gender.toLowerCase() === "female" ? (
                <VenusIcon className="h-3 w-3 text-pink-500" />
              ) : null}
              <span className="capitalize">{member.gender}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InstructorListItem({ connection }: { connection: any }) {
  const { member } = connection;

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "I";
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 text-xs font-semibold">
          {getInitials(member.firstName, member.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {member.firstName && member.lastName
            ? `${member.firstName} ${member.lastName}`
            : member.firstName || member.lastName || "Unnamed Instructor"}
        </p>
        {connection.isPrimary && (
          <p className="text-xs text-muted-foreground">Primary Instructor</p>
        )}
      </div>
    </div>
  );
}

export default function GroupPage({ params }: GroupPageProps) {
  const { tenant } = useTenantAndUserAccessContext();
  const router = useRouter();
  const tenantId = tenant?.id?.toString() || "";
  const groupId = parseInt(params.id);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);

  const {
    data: groupData,
    error,
    isLoading,
  } = useGroupConnections(tenantId, groupId, !!tenantId && !!groupId);

  if (isLoading) {
    return (
      <ErrorBoundary>
        <GroupDetailsSkeleton />
      </ErrorBoundary>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="w-full space-y-6">
          <PageHeader
            title="Group Not Found"
            description="The group you're looking for doesn't exist or you don't have permission to view it."
          />
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-destructive mb-2">
                <Users className="h-8 w-8 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-medium mb-2">Group Not Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error.message}
              </p>
              <Button asChild>
                <Link href={`/${params.domain}/management/groups`}>
                  Return to Groups
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    );
  }

  if (!groupData) {
    return null;
  }

  const { group, memberConnections } = groupData;

  // Get all member connections for the form
  const allMemberConnections = [
    ...memberConnections.performers,
    ...memberConnections.instructors,
  ];

  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
        <PageHeader
          title="Overview"
          description={`Manage members and settings for this group.`}
          actions={
            <PermissionButton
              permission={Permission.MANAGE_MEMBERS}
              className="gap-2"
              onClick={() => setIsManageMembersOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Manage Players
            </PermissionButton>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Group Information Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Group Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Group Details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">
                      Age Range
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold">
                        {formatAgeRange(group.ageRange)}
                      </span>
                      {formatAgeRange(group.ageRange) !== group.ageRange && (
                        <p className="text-xs text-muted-foreground">
                          ({group.ageRange})
                        </p>
                      )}
                    </div>
                  </div>

                  {group.level && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">
                        Level
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {group.level}
                      </Badge>
                    </div>
                  )}

                  {group.gender && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">
                        Gender
                      </span>
                      <div className="flex items-center gap-2">
                        {group.gender.toLowerCase() === "male" ? (
                          <MarsIcon className="h-4 w-4 text-blue-500" />
                        ) : group.gender.toLowerCase() === "female" ? (
                          <VenusIcon className="h-4 w-4 text-pink-500" />
                        ) : group.gender.toLowerCase() === "mixed" ? (
                          <div className="flex items-center gap-1">
                            <MarsIcon className="h-4 w-4 text-blue-500" />
                            <VenusIcon className="h-4 w-4 text-pink-500" />
                          </div>
                        ) : null}
                        <span className="text-sm">
                          {formatGender(group.gender, group.ageRange)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">
                      {tenant ? getTenantPerformerName(tenant) : "Performers"}
                    </span>
                    <Badge variant="secondary" className="text-sm">
                      {memberConnections.performers.length}
                    </Badge>
                  </div>
                </div>

                {/* Instructors Section */}
                {memberConnections.instructors.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Instructors
                    </h4>
                    <div className="space-y-1">
                      {memberConnections.instructors.map((connection) => (
                        <InstructorListItem
                          key={connection.id}
                          connection={connection}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Players List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold capitalize">
                  {tenant ? getTenantPerformerName(tenant) : "Performers"}
                </h3>
              </div>

              {memberConnections.performers.length > 0 ? (
                <div className="space-y-2">
                  {memberConnections.performers.map((connection) => (
                    <PlayerListItem
                      key={connection.id}
                      connection={connection}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mb-4 opacity-50">
                    <Users className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-sm">
                    No{" "}
                    {tenant
                      ? getTenantPerformerName(tenant).toLowerCase()
                      : "performers"}{" "}
                    assigned to this group
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manage Players Modal */}
        <ResponsiveSheet
          isOpen={isManageMembersOpen}
          setIsOpen={setIsManageMembersOpen}
          title="Manage Players"
          description={`Add or remove players from this group`}
        >
          {groupData && (
            <ManageMembersForm
              group={group}
              tenantId={tenantId}
              setIsOpen={setIsManageMembersOpen}
              existingConnections={allMemberConnections}
            />
          )}
        </ResponsiveSheet>
      </div>
    </ErrorBoundary>
  );
}
