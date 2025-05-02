"use client";

import { useCurrentUser } from "../../entities/user/User.query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useCallback } from "react";
import { RoleDomain } from "../../entities/role/Role.permissions";

export default function TenantLandingPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const router = useRouter();

  const roleToRedirect = useMemo(
    () => user?.roles?.find((role) => role.isPrimary) ?? user?.roles?.[0],
    [user?.roles]
  );

  const roleDomain = useMemo(
    () => roleToRedirect?.role?.domain,
    [roleToRedirect?.role?.domain]
  );

  const handleRedirection = useCallback(() => {
    if (userLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (
      roleDomain === RoleDomain.MANAGEMENT ||
      roleDomain === RoleDomain.SYSTEM
    ) {
      router.push("/o/dashboard");
      return;
    }

    if (roleDomain === RoleDomain.PLAYER) {
      router.push("/p/dashboard");
      return;
    }

    if (roleDomain === RoleDomain.FAMILY) {
      router.push("/f/dashboard");
      return;
    }
  }, [user, userLoading, roleDomain, router]);

  useEffect(() => {
    handleRedirection();
  }, [handleRedirection]);

  return <></>;
}
