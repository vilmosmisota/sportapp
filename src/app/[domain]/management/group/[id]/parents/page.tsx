"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { createGroupDisplay } from "@/entities/group/Group.utils";
import { useGroupConnections } from "@/entities/group/GroupConnection.query";
import { Mail, Phone, UserCheck, Users } from "lucide-react";

interface GroupParentsPageProps {
  params: {
    domain: string;
    id: string;
  };
}

export default function GroupParentsPage({ params }: GroupParentsPageProps) {
  const { tenant } = useTenantAndUserAccessContext();
  const tenantId = tenant?.id?.toString() || "";
  const groupId = parseInt(params.id);

  const {
    data: groupData,
    error,
    isLoading,
  } = useGroupConnections(tenantId, groupId, !!tenantId && !!groupId);

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="w-full space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (error || !groupData) {
    return (
      <ErrorBoundary>
        <div className="w-full space-y-6">
          <PageHeader
            title="Parents"
            description="Unable to load group parent information"
          />
        </div>
      </ErrorBoundary>
    );
  }

  const { group } = groupData;
  const groupDisplayName = createGroupDisplay(
    group,
    tenant?.tenantConfigs?.groups || undefined
  );

  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
        <PageHeader
          title="Parents & Guardians"
          description={`Manage parent and guardian information for ${groupDisplayName}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Parents Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Active Parents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No parent information available</p>
                <p className="text-xs mt-1">Parent contacts will appear here</p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No emergency contacts</p>
                <p className="text-xs mt-1">
                  Emergency contact information will be listed here
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Communication Preferences Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No communication preferences set</p>
                <p className="text-xs mt-1">
                  Parent communication settings will be shown here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parent Directory Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Parent Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Parent Directory</h3>
              <p className="text-sm">
                A comprehensive list of all parents and guardians will be
                displayed here
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sample Parent Card (for demonstration) */}
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Sample Parent Card (Preview)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-foreground">John Doe</h4>
                    <p className="text-sm text-muted-foreground">
                      Parent of Sarah Doe
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Primary Contact
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Emergency Contact
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>john.doe@email.com</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
