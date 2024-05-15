import Link from "next/link";

export default function NavBar() {
  return (
    <aside className="fixed inset-y-0 left-0 top-12 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link href="/dashboard/games">Games</Link>
      </nav>
    </aside>
  );
}
