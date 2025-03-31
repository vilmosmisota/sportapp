"use client";

import React, { useState } from "react";
import { usePathname, useParams } from "next/navigation";
import { Cog, UserRound } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { cn } from "../../../../../lib/utils";
import { NavSection } from "../constants";
import { useTenantByDomain } from "../../../../../entities/tenant/Tenant.query";
import { getIcon } from "../constants";
import { Sidebar } from "../Sidebar";
import { MobileNavigation } from "../MobileNavigation";
import DashboardTopRightNav from "./DashboardTopRightNav";
import { DashboardMainFrame } from "./DashboardMainFrame";

interface DashboardProps {
  items: NavSection[];
  children: React.ReactNode;
}

export default function Dashboard({ items, children }: DashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);

  const pathname = usePathname();
  const params = useParams();
  const domain = params.domain as string;

  const { data: tenant, isLoading: isTenantLoading } =
    useTenantByDomain(domain);

  return (
    <div className="flex min-h-screen relative">
      <div className="absolute flex flex-col h-12 top-0 left-0 z-50 pt-4">
        <div className="flex h-full items-center justify-end gap-2 px-4 relative">
          {/* Pinned menu items will come here with smIcon buttons form */}
        </div>
      </div>

      <DashboardTopRightNav
        buttons={[
          <Button key="settings" variant="ghost" size="smIcon">
            <Cog className="h-4 w-4" />
          </Button>,
          <Button key="user" variant="ghost" size="smIcon">
            <UserRound className="h-4 w-4" />
          </Button>,
        ]}
      />

      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        openSections={openSections}
        setOpenSections={setOpenSections}
        navItems={items}
        pathname={pathname}
        getIcon={getIcon}
        domain={domain}
        tenant={tenant}
        tenantId={tenant?.id}
        isTenantLoading={isTenantLoading}
      />

      {/* Main content */}
      <DashboardMainFrame isCollapsed={isCollapsed}>
        {children}
      </DashboardMainFrame>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        navItems={items}
        getIcon={getIcon}
        pathname={pathname}
      />
    </div>
  );
}
