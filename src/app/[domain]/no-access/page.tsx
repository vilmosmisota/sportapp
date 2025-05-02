"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccessDenialReason } from "@/entities/auth/useTenantAndUserAccess";

interface NoAccessMessages {
  title: string;
  description: string;
  additionalInfo?: string;
}

const messages: Record<AccessDenialReason, NoAccessMessages> = {
  NO_USER: {
    title: "Authentication Required",
    description:
      "You're trying to access a protected page that requires authentication. Please log in to continue.",
  },
  NO_TENANT_ACCESS: {
    title: "No Organization Access",
    description:
      "You're trying to access a protected organization page that you don't have access to.",
    additionalInfo:
      "If you believe this is a mistake, please contact the organization administrator to request access.",
  },
  NO_DOMAIN_ROLE_ACCESS: {
    title: "Insufficient Permissions",
    description:
      "You're trying to access a protected page that requires specific role permissions.",
    additionalInfo:
      "Since you're a member of this organization but don't have the required role, please contact your organization's management team or administrators to request the necessary permissions.",
  },
};

export default function NoAccessPage({
  searchParams,
}: {
  searchParams: { reason: AccessDenialReason; domain: string };
}) {
  const message = messages[searchParams.reason] || messages.NO_TENANT_ACCESS;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <AlertCircle className="h-6 w-6 text-destructive" />
            Access Denied
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>{message.title}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{message.description}</p>
              {searchParams.domain && (
                <p className="text-sm opacity-90">
                  Organization: <strong>{searchParams.domain}</strong>
                </p>
              )}
              {message.additionalInfo && (
                <p className="text-sm border-l-2 border-destructive/50 pl-2 mt-4 italic">
                  {message.additionalInfo}
                </p>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
