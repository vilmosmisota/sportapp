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
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        {children}
      </div>
    </ProtectedLayout>
  );
}
