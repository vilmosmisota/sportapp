"use client";

import ManagementDashboard from "@/composites/dashboard/ManagementDashboard";
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

  return (
    <ManagementDashboard>
      {isLoading || !hasFullAccess ? null : children}
    </ManagementDashboard>
  );
}
