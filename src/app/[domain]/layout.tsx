"use client";

import TenantAndUserAccessProvider from "@/composites/auth/TenantAndUserAccessProvider";
import BaseDashboard from "@/composites/dashboard/BaseDashboard";
import { usePathname } from "next/navigation";

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
  const url = usePathname();

  if (url.includes("auth")) {
    return children;
  }

  return (
    <TenantAndUserAccessProvider domain={params.domain}>
      <SimpleDashboardLayout>{children}</SimpleDashboardLayout>
    </TenantAndUserAccessProvider>
  );
}
