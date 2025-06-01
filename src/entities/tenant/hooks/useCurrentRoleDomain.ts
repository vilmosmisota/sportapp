import { usePathname } from "next/navigation";
import { UserDomain } from "../../user/User.schema";

export default function useCurrentUserDomain() {
  const pathname = usePathname();

  if (pathname.includes("/o/")) return UserDomain.MANAGEMENT;
  if (pathname.includes("/f/")) return UserDomain.PARENT;
  if (pathname.includes("/p/")) return UserDomain.PERFORMER;

  return null;
}
