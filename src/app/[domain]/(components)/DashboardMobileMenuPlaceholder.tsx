"use client";

import { useCurrentUser } from "@/entities/user/User.query";
import { usePathname } from "next/navigation";

export default function DashboardMobileMenuPlaceholder() {
  const { data: user } = useCurrentUser();

  const pathname = usePathname();

  // Check if the current URL path contains "dashboard"
  const isDashboardPath = pathname.includes("dashboard");

  if (!user || !isDashboardPath) return null;

  return <div className="md:hidden block h-10 w-10 "></div>;
}
