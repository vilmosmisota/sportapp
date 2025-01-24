import Dashboard from "@/app/[domain]/(components)/Dashboard";

const navItems = [
  {
    section: "League Management",
    items: [
      {
        name: "League",
        href: "/l/dashboard/league",
        iconName: "Building",
      },
      {
        name: "Clubs",
        href: "/l/dashboard/clubs",
        iconName: "Store",
      },
      {
        name: "Divisions",
        href: "/l/dashboard/divisions",
        iconName: "Medal",
      },
      {
        name: "Games",
        href: "/l/dashboard/games",
        iconName: "Shield",
      },
    ],
  },
];

export default function LeagueDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Dashboard items={navItems}>{children}</Dashboard>;
}
