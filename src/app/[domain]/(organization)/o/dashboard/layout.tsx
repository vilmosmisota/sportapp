import ManagementDashboard from "@/app/[domain]/(components)/ManagementDashboard";
import ProtectedLayout from "@/composites/auth/ProtectedLayout";

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
