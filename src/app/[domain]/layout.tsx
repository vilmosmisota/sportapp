"use client";

import TenantAndUserAccessProvider from "@/composites/auth/TenantAndUserAccessProvider";
import BaseDashboard from "@/composites/dashboard/BaseDashboard";

function SimpleDashboardLayout({ children }: { children: React.ReactNode }) {
  return <BaseDashboard>{children}</BaseDashboard>;
}

export default function PlatformLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  if (params.domain.includes("login") || params.domain.includes("no-access")) {
    return children;
  }

  return (
    <TenantAndUserAccessProvider domain={params.domain}>
      <SimpleDashboardLayout>{children}</SimpleDashboardLayout>
    </TenantAndUserAccessProvider>
  );
}
