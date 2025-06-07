import TenantAndUserAccessProvider from "@/composites/auth/TenantAndUserAccessProvider";

export default function PlatformLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  return (
    <TenantAndUserAccessProvider domain={params.domain}>
      <div className="flex flex-col min-h-dvh">{children}</div>
    </TenantAndUserAccessProvider>
  );
}
