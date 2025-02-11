"use client";

import { usePathname } from "next/navigation";

interface SiteMenuWrapperProps {
  children: React.ReactNode;
}

export function SiteMenuWrapper({ children }: SiteMenuWrapperProps) {
  const pathname = usePathname();
  const hideMenu =
    pathname.includes("/dashboard") ||
    pathname.includes("/auth") ||
    pathname.includes("/login");

  return <>{!hideMenu && children}</>;
}
