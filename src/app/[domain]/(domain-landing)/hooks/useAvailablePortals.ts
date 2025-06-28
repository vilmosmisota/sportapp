import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { Access } from "@/entities/role/Role.schema";
import { ClipboardCheck, LucideIcon, Settings, User } from "lucide-react";
import { useMemo } from "react";

export interface Portal {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: "blue" | "green" | "purple" | "gray";
  features: string[];
}

export function useAvailablePortals() {
  const { tenant, tenantUser, isLoading, error } =
    useTenantAndUserAccessContext();

  const availablePortals = useMemo(() => {
    if (!tenant || !tenantUser) return [];

    const portals: Portal[] = [];

    const isSystemAdmin = tenantUser.role?.access?.includes(Access.SYSTEM);

    portals.push({
      id: "user",
      title: "User Portal",
      description:
        "View and manage your profile, schedules, and personal settings.",
      icon: User,
      href: `/user`,
      color: "blue",
      features: [
        "Personal profile management",
        "Schedule viewing",
        "Personal notifications",
      ],
    });

    // Management portal - requires management permissions OR system admin
    const hasManagementAccess =
      isSystemAdmin || tenantUser.role?.access?.includes(Access.MANAGEMENT);

    if (hasManagementAccess) {
      portals.push({
        id: "management",
        title: "Management Portal",
        description: "Comprehensive management tools for your organization.",
        icon: Settings,
        href: `/management`,
        color: "purple",
        features: [
          "Member & group management",
          "Training & schedule management",
          "Analytics & reporting",
        ],
      });
    }

    // Check-in Hub - requires attendance access OR system admin
    const hasAttendanceAccess =
      isSystemAdmin || tenantUser.role?.access?.includes(Access.ATTENDANCE);

    if (hasAttendanceAccess) {
      portals.push({
        id: "checkin",
        title: "Check-in Hub",
        description:
          "Quick and efficient attendance tracking for all activities.",
        icon: ClipboardCheck,
        href: `/attendance`,
        color: "green",
        features: [
          "Self-service check-in",
          "Real-time tracking",
          "Attendance listing",
        ],
      });
    }

    return portals;
  }, [tenant, tenantUser]);

  return {
    availablePortals,
    isLoading,
    error,
  };
}
