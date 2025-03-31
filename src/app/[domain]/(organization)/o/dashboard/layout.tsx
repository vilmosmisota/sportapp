"use client";

import ManagementDashboard from "@/app/[domain]/(components)/ManagementDashboard";

export default function OrgDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ManagementDashboard>{children}</ManagementDashboard>;
}
