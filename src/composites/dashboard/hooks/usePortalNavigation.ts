import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useMemo } from "react";
import {
  BaseNavSection,
  PortalType,
  UsePortalNavigationReturn,
} from "../types/baseDashboard.types";
import { getPortalConfig } from "../types/portalConfigs";

export function usePortalNavigation(
  portalType: PortalType,
  getNavSections: (tenant?: any) => BaseNavSection[],
  getTopRightNavConfig?: (tenant?: any) => any
): UsePortalNavigationReturn {
  const { tenant, tenantUser } = useTenantAndUserAccessContext();

  const portalConfig = useMemo(() => {
    return getPortalConfig(portalType);
  }, [portalType]);

  const rawNavSections = useMemo(() => {
    return getNavSections(tenant);
  }, [tenant, getNavSections]);

  const navSections = useMemo(() => {
    const userPermissions = tenantUser?.role?.permissions;

    return rawNavSections;
  }, [rawNavSections, tenantUser?.role?.permissions]);

  const topRightNavConfig = useMemo(() => {
    if (getTopRightNavConfig) {
      return getTopRightNavConfig(tenant);
    }
    return undefined;
  }, [tenant, getTopRightNavConfig]);

  return {
    navSections,
    portalConfig,
    topRightNavConfig,
  };
}

export function createPortalNavigationHook(
  portalType: PortalType,
  getNavSections: (tenant?: any) => BaseNavSection[],
  getTopRightNavConfig?: (tenant?: any) => any
) {
  return function usePortalNavigationHook(tenant?: any) {
    return usePortalNavigation(
      portalType,
      getNavSections,
      getTopRightNavConfig
    );
  };
}

// Generic hook that can determine portal type from current path
export function useCurrentPortalNavigation(pathname: string) {
  const portalType = useMemo(() => {
    if (pathname.includes("/management")) return PortalType.MANAGEMENT;
    if (pathname.includes("/attendance")) return PortalType.ATTENDANCE;
    if (pathname.includes("/members")) return PortalType.MEMBERS;
    return null; // No portal type for home page
  }, [pathname]);

  const portalConfig = useMemo(() => {
    return portalType ? getPortalConfig(portalType) : null;
  }, [portalType]);

  return {
    portalType,
    portalConfig,
  };
}
