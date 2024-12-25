import { Menu } from "./(components)/Menu";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Menu domain={params.domain} />
      <div className="flex-1 mx-auto w-full max-w-screen-2xl">{children}</div>
    </div>
  );
}
