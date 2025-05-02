import { usePathname } from "next/navigation";
import { RoleDomain } from "../../role/Role.permissions";

export default function useCurrentRoleDomain() {
  const pathname = usePathname();

  if (pathname.includes("/o/")) return RoleDomain.MANAGEMENT;
  if (pathname.includes("/f/")) return RoleDomain.FAMILY;
  if (pathname.includes("/p/")) return RoleDomain.PLAYER;

  return null;
}
