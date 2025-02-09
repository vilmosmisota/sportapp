"use client";

import { usePathname } from "next/navigation";

interface SiteMenuWrapperProps {
  children: React.ReactNode;
}

export function SiteMenuWrapper({ children }: SiteMenuWrapperProps) {
  const pathname = usePathname();
  const showChildren =
    !pathname.includes("/dashboard") && !pathname.includes("/auth");

  return <>{showChildren && children}</>;
}
