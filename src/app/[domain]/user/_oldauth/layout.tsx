import AuthDashboard from "./components/AuthDashboard";

const navItems = [
  {
    section: "Account",
    items: [
      {
        name: "Profile",
        href: "/auth/profile",
        iconName: "UserRound",
        description: "Manage your profile settings",
      },
      {
        name: "Settings",
        href: "/auth/settings",
        iconName: "Settings",
        description: "Manage your account settings",
      },
      {
        name: "Notifications",
        href: "/auth/notifications",
        iconName: "Bell",
        description: "Manage your notification preferences",
      },
      {
        name: "Help & Support",
        href: "/auth/help",
        iconName: "HelpCircle",
        description: "Get help and support",
      },
    ],
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthDashboard items={navItems}>{children}</AuthDashboard>;
}
