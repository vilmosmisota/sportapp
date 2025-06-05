import ProtectedLayout from "@/composites/auth/ProtectedLayout";
import ManagementDashboard from "@/composites/dashboard/ManagementDashboard";

export default function OrgDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  return (
    <ProtectedLayout domain={params.domain}>
      <ManagementDashboard>{children}</ManagementDashboard>
    </ProtectedLayout>
  );
}
