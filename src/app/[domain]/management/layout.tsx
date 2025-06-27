"use client";

import useLayoutAccess from "@/entities/auth/useLayoutAccess";
import { Access } from "@/entities/role/Role.schema";

export default function OrgDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasFullAccess, isLoading } = useLayoutAccess({
    requiredAccess: [Access.MANAGEMENT],
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasFullAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-8 bg-destructive/10 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Management Access Required
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            You need management permissions to access this area. Please contact
            your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
