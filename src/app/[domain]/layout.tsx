import { Menu } from "./components/Menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Menu />
      <div className="mx-auto max-w-screen-2xl   ">{children}</div>
    </>
  );
}
