import { useCurrentUser } from "../User.query";

export const useUserRoles = () => {
  const { data: user } = useCurrentUser();
  return user?.roles ?? [];
};
