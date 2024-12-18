import { useCurrentUser } from "@/entities/user/User.query";
import { UserRole } from "@/entities/user/User.schema";

export const useUserRoles = () => {
  const { data: user } = useCurrentUser();

  // Add some debugging
  console.log("Current user:", user);
  console.log(
    "User roles:",
    user?.entities?.map((entity) => entity.role)
  );

  return user?.entities?.map((entity) => entity.role) ?? [];
};
