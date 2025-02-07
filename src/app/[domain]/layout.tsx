import { SiteMenu } from "./(components)/SiteMenu";
import { SiteMenuWrapper } from "./(components)/SiteMenuWrapper";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SiteMenuWrapper>
        <SiteMenu domain={params.domain} />
      </SiteMenuWrapper>
      {children}
    </div>
  );
}
