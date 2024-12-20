import { Menu } from "./(components)/Menu";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  return (
    <>
      <Menu domain={params.domain} />
      <div className="mx-auto max-w-screen-2xl">{children}</div>
    </>
  );
}
