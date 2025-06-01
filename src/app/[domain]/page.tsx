"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useCurrentUser } from "../../entities/user/User.query";
import { UserDomain } from "../../entities/user/User.schema";

export default function TenantLandingPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const router = useRouter();

  const userDomain = useMemo(() => {
    if (user?.userDomains?.includes(UserDomain.SYSTEM)) {
      return UserDomain.SYSTEM;
    }
    return user?.userDomains?.[0];
  }, [user?.userDomains]);

  const handleRedirection = useCallback(() => {
    if (userLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (
      userDomain === UserDomain.MANAGEMENT ||
      userDomain === UserDomain.SYSTEM
    ) {
      router.push("/o/dashboard");
      return;
    }

    if (userDomain === UserDomain.PERFORMER) {
      router.push("/p/dashboard");
      return;
    }

    if (userDomain === UserDomain.PARENT) {
      router.push("/f/dashboard");
      return;
    }
  }, [user, userLoading, userDomain, router]);

  useEffect(() => {
    handleRedirection();
  }, [handleRedirection]);

  return <></>;
}
